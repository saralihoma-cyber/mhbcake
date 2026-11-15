import supabase from './db-client.js';
import { applyCors, readBody, clean, EMAIL_RE, httpError, sendError } from './_utils.js';

export default async function handler(req, res) {
  if (applyCors(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const body = readBody(req);
    const name = clean(body.name, 120);
    const email = clean(body.email, 160).toLowerCase();
    const subject = clean(body.subject, 160);
    const message = clean(body.message, 4000);
    const order_number = clean(body.order_number, 20).toUpperCase();

    const fields = {};
    if (name.length < 2) fields.name = 'Merci d’indiquer votre nom.';
    if (!EMAIL_RE.test(email)) fields.email = 'Merci de saisir une adresse e-mail valide.';
    if (!subject) fields.subject = 'Merci de choisir un sujet.';
    if (message.length < 10) fields.message = 'Votre message est un peu court (10 caractères minimum).';
    if (Object.keys(fields).length) throw httpError(400, 'Certains champs sont à corriger.', fields);

    const { error } = await supabase.from('messages').insert({
      name,
      email,
      subject,
      message,
      order_number: order_number || null,
      is_read: false,
      created_at: new Date().toISOString(),
    });
    if (error) throw error;
    return res.status(201).json({ ok: true });
  } catch (err) {
    sendError(res, err);
  }
}
