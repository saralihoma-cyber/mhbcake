import supabase from './db-client.js';
import { applyCors, httpError, sendError, slugify } from './_utils.js';

// Délivre un lien de téléchargement signé et temporaire, uniquement pour une commande payée.
export default async function handler(req, res) {
  if (applyCors(req, res, 'GET, OPTIONS')) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Méthode non autorisée' });

  try {
    const token = String(req.query.token || '');
    const productId = Number(req.query.product);
    if (!/^[a-f0-9]{64}$/.test(token) || !Number.isInteger(productId)) throw httpError(404, 'Lien de téléchargement invalide.');

    const { data: order, error } = await supabase.from('orders').select('*').eq('token', token).maybeSingle();
    if (error) throw error;
    if (!order) throw httpError(404, 'Commande introuvable.');
    if (order.status === 'pending') throw httpError(403, 'Le téléchargement sera disponible dès la confirmation de votre paiement.');
    if (order.status !== 'paid') throw httpError(403, 'Les téléchargements liés à cette commande ne sont plus disponibles.');

    const entitled = (order.entitlements || []).some((e) => e.id === productId);
    if (!entitled) throw httpError(403, 'Cet ebook ne fait pas partie de votre commande.');

    const { data: product, error: pError } = await supabase
      .from('products')
      .select('id, title, slug, file_path')
      .eq('id', productId)
      .maybeSingle();
    if (pError) throw pError;
    if (!product?.file_path) {
      throw httpError(409, 'Le fichier de cet ebook n’est pas encore en ligne. Merci de contacter notre service client.');
    }

    const fileName = `${slugify(product.title) || product.slug || 'ebook'}-mhb-cake-design.pdf`;
    const { data: signed, error: sError } = await supabase.storage
      .from('ebooks')
      .createSignedUrl(product.file_path, 300, { download: fileName });
    if (sError || !signed?.signedUrl) throw httpError(502, 'Le fichier est momentanément indisponible. Merci de réessayer dans un instant.');

    await supabase
      .from('orders')
      .update({ download_count: (order.download_count || 0) + 1, last_download_at: new Date().toISOString() })
      .eq('id', order.id);

    return res.status(200).json({ url: signed.signedUrl, file_name: fileName });
  } catch (err) {
    sendError(res, err);
  }
}
