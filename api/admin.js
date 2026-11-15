import crypto from 'node:crypto';
import supabase from './db-client.js';
import {
  applyCors, readBody, clean, slugify, httpError, sendError, loadSettings, requireAdmin, adjustSales, SETTING_KEYS, EMAIL_RE,
} from './_utils.js';

const ORDER_STATUSES = ['pending', 'paid', 'refunded', 'cancelled'];

const toInt = (v) => {
  if (v === null || v === undefined || v === '') return null;
  const n = Math.round(Number(v));
  return Number.isFinite(n) ? n : null;
};

async function overview(user) {
  const [products, orders, messages, faqs, settings] = await Promise.all([
    supabase.from('products').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
    supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(500),
    supabase.from('messages').select('*').order('created_at', { ascending: false }).limit(300),
    supabase.from('faqs').select('*').order('sort_order', { ascending: true }).order('id', { ascending: true }),
    loadSettings(),
  ]);
  for (const r of [products, orders, messages, faqs]) if (r.error) throw r.error;
  return {
    admin_email: user.email,
    products: products.data || [],
    orders: orders.data || [],
    messages: messages.data || [],
    faqs: faqs.data || [],
    settings,
  };
}

async function saveProduct(input) {
  const p = input || {};
  const id = toInt(p.id);
  const type = p.type === 'pack' ? 'pack' : 'ebook';
  const title = clean(p.title, 200);
  const price = toInt(p.price_cents);
  const compare = toInt(p.compare_at_cents);
  const fields = {};
  if (title.length < 2) fields.title = 'Le titre est obligatoire.';
  if (price === null || price < 0) fields.price = 'Indiquez un prix valide (0 ou plus).';
  if (compare !== null && price !== null && compare <= price) fields.compare = 'Le prix barré doit être supérieur au prix de vente.';
  const included = type === 'pack'
    ? [...new Set((Array.isArray(p.included_ids) ? p.included_ids : []).map(Number).filter(Number.isInteger))]
    : [];
  if (type === 'pack' && included.length < 2) fields.included = 'Sélectionnez au moins deux ebooks pour composer le pack.';
  if (Object.keys(fields).length) throw httpError(400, 'Certains champs sont à corriger.', fields);

  let existing = null;
  if (id) {
    const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) throw httpError(404, 'Cet ebook est introuvable.');
    existing = data;
  }

  // Adresse (slug) unique
  const base = slugify(p.slug) || slugify(title) || 'ebook';
  let slug = base;
  for (let i = 2; i < 50; i += 1) {
    const { data, error } = await supabase.from('products').select('id').eq('slug', slug).maybeSingle();
    if (error) throw error;
    if (!data || data.id === id) break;
    slug = `${base}-${i}`;
  }

  const row = {
    slug,
    type,
    title,
    subtitle: clean(p.subtitle, 300) || null,
    short_description: clean(p.short_description, 1200) || null,
    description: clean(p.description, 10000) || null,
    highlights: (Array.isArray(p.highlights) ? p.highlights : []).map((h) => clean(h, 300)).filter(Boolean).slice(0, 20),
    pages: type === 'pack' ? null : toInt(p.pages),
    price_cents: price,
    compare_at_cents: compare,
    badge: clean(p.badge, 60) || null,
    is_new: !!p.is_new,
    is_active: p.is_active !== false,
    sort_order: toInt(p.sort_order) ?? 0,
    cover_url: clean(p.cover_url, 600) || null,
    file_path: type === 'pack' ? null : clean(p.file_path, 400) || null,
    file_name: type === 'pack' ? null : clean(p.file_name, 200) || null,
    file_size: type === 'pack' ? null : toInt(p.file_size),
    included_ids: included,
  };

  if (existing) {
    const { data, error } = await supabase.from('products').update(row).eq('id', id).select().single();
    if (error) throw error;
    if (existing.file_path && existing.file_path !== row.file_path) {
      await supabase.storage.from('ebooks').remove([existing.file_path]);
    }
    return data;
  }
  const { data, error } = await supabase
    .from('products')
    .insert({ ...row, sales_count: 0, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function deleteProduct(rawId) {
  const id = toInt(rawId);
  if (!id) throw httpError(400, 'Identifiant manquant.');
  const { data: product, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!product) return { ok: true };
  const { error: delError } = await supabase.from('products').delete().eq('id', id);
  if (delError) throw delError;
  if (product.file_path) await supabase.storage.from('ebooks').remove([product.file_path]);

  // Retire l'ebook supprimé des packs qui le contenaient.
  const { data: packs } = await supabase.from('products').select('id, included_ids').eq('type', 'pack');
  for (const pack of packs || []) {
    const ids = Array.isArray(pack.included_ids) ? pack.included_ids : [];
    if (ids.includes(id)) {
      await supabase.from('products').update({ included_ids: ids.filter((x) => x !== id) }).eq('id', pack.id);
    }
  }
  return { ok: true };
}

async function signUpload(body) {
  const kind = body.kind === 'cover' ? 'cover' : 'pdf';
  const original = clean(body.file_name, 200) || (kind === 'pdf' ? 'ebook.pdf' : 'couverture.jpg');
  const ext = (original.split('.').pop() || '').toLowerCase();
  const allowed = kind === 'pdf' ? ['pdf'] : ['jpg', 'jpeg', 'png', 'webp'];
  if (!allowed.includes(ext)) {
    throw httpError(400, kind === 'pdf' ? 'Le fichier doit être au format PDF.' : 'L’image doit être au format JPG, PNG ou WebP.');
  }
  const bucket = kind === 'pdf' ? 'ebooks' : 'covers';
  const base = slugify(original.replace(/\.[^.]+$/, '')) || 'fichier';
  const path = `${crypto.randomUUID()}-${base}.${ext}`;
  const { data, error } = await supabase.storage.from(bucket).createSignedUploadUrl(path);
  if (error || !data?.signedUrl) throw httpError(502, 'Impossible de préparer l’envoi du fichier. Merci de réessayer.');
  const public_url = kind === 'cover' ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
  return { signed_url: data.signedUrl, path, public_url };
}

async function previewFile(rawId) {
  const id = toInt(rawId);
  const { data: product, error } = await supabase.from('products').select('file_path, file_name').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!product?.file_path) throw httpError(404, 'Aucun PDF n’est associé à cet ebook.');
  const { data, error: sError } = await supabase.storage.from('ebooks').createSignedUrl(product.file_path, 120);
  if (sError || !data?.signedUrl) throw httpError(502, 'Le fichier est momentanément indisponible.');
  return { url: data.signedUrl };
}

async function updateOrder(body) {
  const id = toInt(body.id);
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!order) throw httpError(404, 'Commande introuvable.');

  const patch = {};
  if (body.admin_note !== undefined) patch.admin_note = clean(body.admin_note, 2000) || null;
  if (body.status !== undefined) {
    if (!ORDER_STATUSES.includes(body.status)) throw httpError(400, 'Statut inconnu.');
    patch.status = body.status;
    if (body.status === 'paid' && order.status !== 'paid') patch.paid_at = new Date().toISOString();
  }
  const { data, error: upError } = await supabase.from('orders').update(patch).eq('id', id).select().single();
  if (upError) throw upError;

  if (patch.status && patch.status !== order.status) {
    if (patch.status === 'paid') await adjustSales(order, 1);
    else if (order.status === 'paid') await adjustSales(order, -1);
  }
  return data;
}

async function deleteOrder(rawId) {
  const id = toInt(rawId);
  const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  if (!order) return { ok: true };
  if (!order.is_test) throw httpError(400, 'Seules les commandes de test peuvent être supprimées. Les commandes réelles sont conservées pour votre comptabilité.');
  const { error: delError } = await supabase.from('orders').delete().eq('id', id);
  if (delError) throw delError;
  return { ok: true };
}

async function saveFaq(input) {
  const f = input || {};
  const id = toInt(f.id);
  const row = {
    question: clean(f.question, 300),
    answer: clean(f.answer, 3000),
    category: clean(f.category, 80) || 'Questions fréquentes',
    sort_order: toInt(f.sort_order) ?? 0,
  };
  if (row.question.length < 3 || row.answer.length < 3) throw httpError(400, 'La question et la réponse sont obligatoires.');
  const query = id
    ? supabase.from('faqs').update(row).eq('id', id)
    : supabase.from('faqs').insert(row);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data;
}

async function saveSettings(values) {
  const rows = [];
  for (const key of SETTING_KEYS) {
    if (values && values[key] !== undefined) {
      let value = clean(values[key], 3000);
      if (key === 'checkout_mode') value = value === 'manual' ? 'manual' : 'test';
      rows.push({ key, value });
    }
  }
  if (rows.length) {
    const { error } = await supabase.from('settings').upsert(rows, { onConflict: 'key' });
    if (error) throw error;
  }
  return loadSettings();
}

async function updateAccount(user, body) {
  const email = clean(body.email, 160).toLowerCase();
  const password = String(body.password || '');
  const attrs = {};
  if (email && email !== user.email.toLowerCase()) {
    if (!EMAIL_RE.test(email)) throw httpError(400, 'Adresse e-mail invalide.');
    attrs.email = email;
    attrs.email_confirm = true;
  }
  if (password) {
    if (password.length < 8) throw httpError(400, 'Le mot de passe doit contenir au moins 8 caractères.');
    attrs.password = password;
  }
  if (!Object.keys(attrs).length) throw httpError(400, 'Aucune modification à enregistrer.');
  const { error } = await supabase.auth.admin.updateUserById(user.id, attrs);
  if (error) throw httpError(400, 'La mise à jour du compte a échoué. Cette adresse est peut-être déjà utilisée.');
  return { email: attrs.email || user.email };
}

export default async function handler(req, res) {
  if (applyCors(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const user = await requireAdmin(req);
    const body = readBody(req);

    switch (body.action) {
      case 'overview':
        return res.status(200).json(await overview(user));
      case 'product.save':
        return res.status(200).json(await saveProduct(body.product));
      case 'product.delete':
        return res.status(200).json(await deleteProduct(body.id));
      case 'upload.sign':
        return res.status(200).json(await signUpload(body));
      case 'file.preview':
        return res.status(200).json(await previewFile(body.id));
      case 'order.update':
        return res.status(200).json(await updateOrder(body));
      case 'order.delete':
        return res.status(200).json(await deleteOrder(body.id));
      case 'message.update': {
        const { data, error } = await supabase.from('messages').update({ is_read: !!body.is_read }).eq('id', toInt(body.id)).select().single();
        if (error) throw error;
        return res.status(200).json(data);
      }
      case 'message.delete': {
        const { error } = await supabase.from('messages').delete().eq('id', toInt(body.id));
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      case 'faq.save':
        return res.status(200).json(await saveFaq(body.faq));
      case 'faq.delete': {
        const { error } = await supabase.from('faqs').delete().eq('id', toInt(body.id));
        if (error) throw error;
        return res.status(200).json({ ok: true });
      }
      case 'settings.save':
        return res.status(200).json(await saveSettings(body.values));
      case 'account.update':
        return res.status(200).json(await updateAccount(user, body));
      default:
        throw httpError(400, 'Action inconnue.');
    }
  } catch (err) {
    sendError(res, err);
  }
}
