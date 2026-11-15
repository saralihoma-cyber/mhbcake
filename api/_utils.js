import supabase from './db-client.js';

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const SETTING_KEYS = [
  'contact_email', 'contact_phone', 'contact_address', 'instagram_url', 'facebook_url', 'tiktok_url',
  'checkout_mode', 'payment_instructions', 'paypal_me_url',
  'legal_name', 'legal_status', 'siret', 'legal_address', 'publication_director', 'vat_mention', 'mediator',
];

export function applyCors(req, res, methods = 'GET, POST, OPTIONS') {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

export function readBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export function clean(value, max = 500) {
  if (value === null || value === undefined) return '';
  return String(value).trim().slice(0, max);
}

export function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function httpError(status, message, fields) {
  const err = new Error(message);
  err.status = status;
  if (fields) err.fields = fields;
  return err;
}

export function sendError(res, err) {
  if (!err.status) console.error('API error:', err);
  const payload = { error: err.status ? err.message : 'Une erreur est survenue. Merci de réessayer dans un instant.' };
  if (err.fields) payload.fields = err.fields;
  res.status(err.status || 500).json(payload);
}

export async function loadSettings() {
  const { data, error } = await supabase.from('settings').select('key, value');
  if (error) throw error;
  const out = {};
  for (const row of data || []) out[row.key] = row.value ?? '';
  return out;
}

// Comptes autorisés à administrer la boutique. L'identifiant d'un compte est attribué par
// Supabase Auth et ne peut pas être modifié ; le rôle app_metadata ne peut être défini
// qu'avec la clé de service. Aucune table publique n'intervient dans ce contrôle.
const ADMIN_USER_IDS = ['94e33c5a-8fe0-4965-9143-09c1a94b98db'];

export function isAdminUser(user) {
  return !!user && (ADMIN_USER_IDS.includes(user.id) || user.app_metadata?.role === 'admin');
}

export async function requireAdmin(req) {
  const token = String(req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) throw httpError(401, 'Session expirée. Merci de vous reconnecter.');
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) throw httpError(401, 'Session expirée. Merci de vous reconnecter.');
  if (!isAdminUser(data.user)) throw httpError(403, 'Ce compte n’a pas accès à l’espace administrateur.');
  return data.user;
}

// Compteur de ventes réelles (les commandes de test ne sont jamais comptées).
export async function adjustSales(order, delta) {
  if (!order || order.is_test) return;
  const ids = new Set();
  for (const item of order.items || []) ids.add(item.product_id);
  for (const ent of order.entitlements || []) ids.add(ent.id);
  const list = [...ids].filter((id) => Number.isInteger(id));
  if (!list.length) return;
  const { data, error } = await supabase.from('products').select('id, sales_count').in('id', list);
  if (error) throw error;
  for (const p of data || []) {
    const next = Math.max(0, (p.sales_count || 0) + delta);
    const { error: upErr } = await supabase.from('products').update({ sales_count: next }).eq('id', p.id);
    if (upErr) throw upErr;
  }
}
