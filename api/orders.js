import crypto from 'node:crypto';
import supabase from './db-client.js';
import { applyCors, readBody, clean, EMAIL_RE, httpError, sendError, loadSettings, adjustSales } from './_utils.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function orderNumber() {
  const bytes = crypto.randomBytes(8);
  let out = '';
  for (let i = 0; i < 8; i += 1) out += ALPHABET[bytes[i] % ALPHABET.length];
  return `MHB-${out}`;
}

async function createOrder(body) {
  const customer = body.customer || {};
  const first_name = clean(customer.first_name, 80);
  const last_name = clean(customer.last_name, 80);
  const email = clean(customer.email, 160).toLowerCase();
  const fields = {};
  if (first_name.length < 2) fields.first_name = 'Merci d’indiquer votre prénom.';
  if (last_name.length < 2) fields.last_name = 'Merci d’indiquer votre nom.';
  if (!EMAIL_RE.test(email)) fields.email = 'Merci de saisir une adresse e-mail valide.';
  if (!body.accept_cgv) fields.accept_cgv = 'Vous devez accepter les conditions générales de vente.';
  if (!body.accept_waiver) fields.accept_waiver = 'Ce consentement est nécessaire pour accéder immédiatement à un contenu numérique.';
  if (Object.keys(fields).length) throw httpError(400, 'Certains champs sont à corriger.', fields);

  const ids = [...new Set((Array.isArray(body.product_ids) ? body.product_ids : []).map(Number).filter(Number.isInteger))];
  if (!ids.length) throw httpError(400, 'Votre panier est vide.');

  const { data: selected, error } = await supabase.from('products').select('*').in('id', ids).eq('is_active', true);
  if (error) throw error;
  if (!selected || selected.length !== ids.length) {
    throw httpError(409, 'Un article de votre panier n’est plus disponible. Merci d’actualiser votre panier.');
  }

  // Un ebook déjà inclus dans un pack du panier n'est jamais facturé deux fois.
  const covered = new Set();
  for (const p of selected) if (p.type === 'pack') for (const id of p.included_ids || []) covered.add(id);
  const finalItems = selected
    .filter((p) => p.type === 'pack' || !covered.has(p.id))
    .sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

  const entitlementIds = new Set();
  for (const p of finalItems) {
    if (p.type === 'pack') for (const id of p.included_ids || []) entitlementIds.add(id);
    else entitlementIds.add(p.id);
  }
  const { data: entProducts, error: entError } = await supabase
    .from('products')
    .select('id, title')
    .in('id', [...entitlementIds]);
  if (entError) throw entError;
  if (!entProducts?.length) throw httpError(409, 'Cette offre ne contient aucun ebook disponible pour le moment.');

  const settings = await loadSettings();
  const manual = settings.checkout_mode === 'manual';
  const total = finalItems.reduce((sum, p) => sum + (p.price_cents || 0), 0);
  const now = new Date().toISOString();
  const paidNow = !manual || total === 0;
  const method = manual
    ? (settings.paypal_me_url ? 'paypal' : 'manual')
    : (body.payment_method === 'paypal' ? 'paypal' : 'card');

  const row = {
    token: crypto.randomBytes(32).toString('hex'),
    first_name,
    last_name,
    email,
    items: finalItems.map((p) => ({
      product_id: p.id,
      title: p.title,
      type: p.type === 'pack' ? 'pack' : 'ebook',
      price_cents: p.price_cents || 0,
      included_ids: p.type === 'pack' ? p.included_ids || [] : [],
    })),
    entitlements: entProducts.map((p) => ({ id: p.id, title: p.title })),
    total_cents: total,
    payment_method: method,
    status: paidNow ? 'paid' : 'pending',
    is_test: !manual,
    consent_cgv_at: now,
    consent_waiver_at: now,
    paid_at: paidNow ? now : null,
    download_count: 0,
    created_at: now,
  };

  let created = null;
  for (let attempt = 0; attempt < 3 && !created; attempt += 1) {
    const { data, error: insertError } = await supabase
      .from('orders')
      .insert({ ...row, order_number: orderNumber() })
      .select()
      .single();
    if (!insertError) created = data;
    else if (insertError.code !== '23505') throw insertError;
  }
  if (!created) throw httpError(500, 'La commande n’a pas pu être enregistrée. Merci de réessayer.');

  if (created.status === 'paid') await adjustSales(created, 1);
  return { token: created.token, order_number: created.order_number, status: created.status };
}

async function lookupOrder(body) {
  const email = clean(body.email, 160).toLowerCase();
  const number = clean(body.order_number, 20).toUpperCase().replace(/\s+/g, '');
  if (!EMAIL_RE.test(email) || number.length < 6) {
    throw httpError(400, 'Merci de saisir l’e-mail utilisé lors de l’achat et votre numéro de commande.');
  }
  const { data, error } = await supabase
    .from('orders')
    .select('token')
    .eq('email', email)
    .eq('order_number', number.startsWith('MHB-') ? number : `MHB-${number}`)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw httpError(404, 'Aucune commande ne correspond à ces informations. Vérifiez l’e-mail et le numéro saisis.');
  return { token: data.token };
}

async function viewOrder(token) {
  if (!/^[a-f0-9]{64}$/.test(token || '')) throw httpError(404, 'Commande introuvable.');
  const { data: order, error } = await supabase.from('orders').select('*').eq('token', token).maybeSingle();
  if (error) throw error;
  if (!order) throw httpError(404, 'Commande introuvable.');

  const ents = Array.isArray(order.entitlements) ? order.entitlements : [];
  const { data: products, error: pError } = await supabase
    .from('products')
    .select('id, slug, title, subtitle, cover_url, pages, file_path, file_size')
    .in('id', ents.map((e) => e.id).concat(-1));
  if (pError) throw pError;

  const downloads = ents.map((e) => {
    const p = (products || []).find((x) => x.id === e.id);
    return {
      product_id: e.id,
      title: p?.title || e.title,
      subtitle: p?.subtitle || null,
      cover_url: p?.cover_url || null,
      pages: p?.pages || null,
      file_size: p?.file_size || null,
      available: !!p?.file_path,
    };
  });

  return {
    order_number: order.order_number,
    status: order.status,
    is_test: !!order.is_test,
    created_at: order.created_at,
    paid_at: order.paid_at,
    first_name: order.first_name,
    email: order.email,
    items: (order.items || []).map((i) => ({ product_id: i.product_id, title: i.title, type: i.type, price_cents: i.price_cents })),
    total_cents: order.total_cents,
    payment_method: order.payment_method,
    downloads,
  };
}

export default async function handler(req, res) {
  if (applyCors(req, res, 'GET, POST, OPTIONS')) return;
  try {
    if (req.method === 'GET') {
      return res.status(200).json(await viewOrder(String(req.query.token || '')));
    }
    if (req.method === 'POST') {
      const body = readBody(req);
      if (body.action === 'lookup') return res.status(200).json(await lookupOrder(body));
      return res.status(201).json(await createOrder(body));
    }
    return res.status(405).json({ error: 'Méthode non autorisée' });
  } catch (err) {
    sendError(res, err);
  }
}
