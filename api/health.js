// Diagnostic de déploiement : ouvrez /api/health dans le navigateur.
// Indique si les réglages serveur sont présents et si la base de données répond.
// N'affiche jamais la valeur d'une clé, seulement le nom de celles qui manquent.
const REQUIRED = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const missing = REQUIRED.filter((key) => !process.env[key]);
  let database = 'non testée';
  if (!missing.length) {
    try {
      const { default: supabase } = await import('./db-client.js');
      const { error } = await supabase.from('settings').select('key').limit(1);
      database = error ? 'erreur' : 'ok';
    } catch (err) {
      console.error('Health check error:', err);
      database = 'erreur';
    }
  }

  const ok = !missing.length && database === 'ok';
  return res.status(ok ? 200 : 503).json({
    ok,
    variables_manquantes: missing,
    base_de_donnees: database,
    aide: ok
      ? 'Le serveur de la boutique fonctionne.'
      : missing.length
        ? 'Ajoutez les variables manquantes dans Vercel (Settings → Environment Variables), puis redéployez.'
        : 'Les variables sont présentes mais la base de données ne répond pas : vérifiez leurs valeurs ou réessayez dans quelques minutes.',
  });
}
