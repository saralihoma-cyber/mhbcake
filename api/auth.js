import { createClient } from '@supabase/supabase-js';
import { applyCors, readBody, clean, httpError, sendError, isAdminUser } from './_utils.js';

// Client dédié à l'authentification : aucune session n'est conservée côté serveur.
function authClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } }
  );
}

function assertAdmin(user) {
  if (!isAdminUser(user)) throw httpError(403, 'Ce compte n’a pas accès à l’espace administrateur.');
}

function sessionPayload(session) {
  return {
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    expires_at: session.expires_at,
    email: session.user?.email || '',
  };
}

export default async function handler(req, res) {
  if (applyCors(req, res, 'POST, OPTIONS')) return;
  if (req.method !== 'POST') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const body = readBody(req);

    if (body.action === 'refresh') {
      const refresh_token = clean(body.refresh_token, 400);
      if (!refresh_token) throw httpError(401, 'Session expirée. Merci de vous reconnecter.');
      const { data, error } = await authClient().auth.refreshSession({ refresh_token });
      if (error || !data?.session) throw httpError(401, 'Session expirée. Merci de vous reconnecter.');
      assertAdmin(data.session.user);
      return res.status(200).json(sessionPayload(data.session));
    }

    const email = clean(body.email, 160).toLowerCase();
    const password = String(body.password || '');
    if (!email || !password) throw httpError(400, 'Merci de saisir votre e-mail et votre mot de passe.');
    const { data, error } = await authClient().auth.signInWithPassword({ email, password });
    if (error || !data?.session) throw httpError(401, 'E-mail ou mot de passe incorrect.');
    assertAdmin(data.session.user);
    return res.status(200).json(sessionPayload(data.session));
  } catch (err) {
    sendError(res, err);
  }
}
