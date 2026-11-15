import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Check, CheckCircle2, Clock, Copy, Download, FlaskConical, RefreshCw, XCircle } from 'lucide-react';
import { api, ApiError, euro, formatDate, formatSize, type OrderView } from '../lib/api';
import { useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import { BookCover, Ornament, PageLoader, Spinner } from '../components/ui';

const METHOD_LABEL: Record<string, string> = { card: 'Carte bancaire', paypal: 'PayPal', manual: 'Règlement à réception des instructions' };

export default function OrderPage() {
  const { token = '' } = useParams();
  const { settings } = useShop();
  const [order, setOrder] = useState<OrderView | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<number | null>(null);
  const [dlError, setDlError] = useState('');
  const [copied, setCopied] = useState(false);
  useSeo(order ? `Commande ${order.order_number}` : 'Votre commande');

  const load = useCallback(async () => {
    try {
      setError('');
      setOrder(await api<OrderView>(`/api/orders?token=${encodeURIComponent(token)}`));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Commande introuvable.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useEffect(() => {
    load();
  }, [load]);

  const download = async (productId: number) => {
    setBusy(productId);
    setDlError('');
    try {
      const { url } = await api<{ url: string }>(`/api/download?token=${encodeURIComponent(token)}&product=${productId}`);
      const link = document.createElement('a');
      link.href = url;
      link.rel = 'noopener';
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      setDlError(err instanceof ApiError ? err.message : 'Le téléchargement a échoué. Merci de réessayer.');
    } finally {
      setBusy(null);
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  if (loading) return <PageLoader label="Chargement de votre commande…" />;
  if (error || !order) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <XCircle className="h-11 w-11 text-rose-deep" strokeWidth={1} />
        <h1 className="mt-6 font-display text-3xl text-ink">Commande introuvable</h1>
        <p className="mt-3 font-light text-ink-soft">{error || 'Ce lien n’est pas valide.'}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link to="/mes-telechargements" className="btn-gold">Retrouver ma commande</Link>
          <Link to="/contact" className="btn-outline">Nous contacter</Link>
        </div>
      </div>
    );
  }

  const paid = order.status === 'paid';
  const pending = order.status === 'pending';
  const ready = order.downloads.some((d) => d.available);
  const paypalBase = (settings.paypal_me_url || '').replace(/\/+$/, '');
  const paypalUrl = paypalBase ? `${paypalBase}/${(order.total_cents / 100).toFixed(2)}EUR` : '';

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-8 lg:py-16">
      <div className="text-center">
        {paid ? (
          <CheckCircle2 className="mx-auto h-14 w-14 text-success" strokeWidth={1.1} />
        ) : pending ? (
          <Clock className="mx-auto h-14 w-14 text-gold" strokeWidth={1.1} />
        ) : (
          <XCircle className="mx-auto h-14 w-14 text-rose-deep" strokeWidth={1.1} />
        )}
        <p className="mt-5 text-[0.7rem] font-medium uppercase tracking-[0.34em] text-gold-deep">Commande {order.order_number}</p>
        <h1 className="mt-3 text-balance font-display text-[2.1rem] leading-tight text-ink sm:text-[3rem]">
          {paid
            ? `Merci ${order.first_name}, votre commande est confirmée`
            : pending
              ? `Merci ${order.first_name}, votre commande est enregistrée`
              : order.status === 'refunded'
                ? 'Cette commande a été remboursée'
                : 'Cette commande a été annulée'}
        </h1>
        <Ornament className="mt-6 justify-center" />
        <p className="mx-auto mt-6 max-w-2xl text-[1.05rem] font-light leading-relaxed text-ink-soft">
          {paid
            ? ready
              ? 'Vos ebooks sont prêts : téléchargez-les ci-dessous grâce à votre lien sécurisé.'
              : 'Votre paiement est confirmé. Vos fichiers apparaîtront ci-dessous dès leur mise en ligne.'
            : pending
              ? 'Vos ebooks seront disponibles au téléchargement sur cette page dès la confirmation de votre paiement.'
              : 'Les téléchargements liés à cette commande ne sont plus disponibles. Pour toute question, contactez notre service client.'}
        </p>
        {order.is_test && (
          <p className="mx-auto mt-5 inline-flex items-center gap-2 border border-gold/50 bg-gold-light/30 px-4 py-2 text-sm text-ink">
            <FlaskConical className="h-4 w-4 text-gold-deep" strokeWidth={1.5} /> Commande de test — aucun paiement n’a été débité.
          </p>
        )}
      </div>

      {pending && (
        <div className="mt-10 border border-gold/50 bg-white/80 p-6 sm:p-8">
          <h2 className="font-display text-[1.5rem] text-ink">Régler ma commande</h2>
          <p className="mt-3 whitespace-pre-line font-light leading-relaxed text-ink-soft">
            {settings.payment_instructions ||
              'Notre équipe vous contacte à l’adresse e-mail indiquée pour finaliser le règlement de votre commande.'}
          </p>
          <p className="mt-3 text-ink">
            Montant à régler : <strong className="font-medium">{euro(order.total_cents)}</strong> — référence à rappeler :{' '}
            <strong className="font-medium">{order.order_number}</strong>
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {paypalUrl && (
              <a href={paypalUrl} target="_blank" rel="noreferrer" className="btn-gold">
                Payer avec PayPal
              </a>
            )}
            <button type="button" onClick={() => { setRefreshing(true); load(); }} className="btn-outline" disabled={refreshing}>
              {refreshing ? <Spinner className="h-4 w-4" /> : <RefreshCw className="h-4 w-4" strokeWidth={1.5} />} Actualiser le statut
            </button>
          </div>
        </div>
      )}

      {(paid || pending) && (
        <div className="mt-10">
          <h2 className="font-display text-[1.6rem] text-ink">{paid ? 'Vos téléchargements' : 'Vos ebooks'}</h2>
          {dlError && <p className="mt-4 border border-rose bg-rose-soft px-4 py-3 text-danger" role="alert">{dlError}</p>}
          <ul className="mt-5 space-y-4">
            {order.downloads.map((d) => (
              <li key={d.product_id} className="flex flex-col gap-5 border border-line bg-white/80 p-5 sm:flex-row sm:items-center sm:p-6">
                <div className="flex flex-1 items-center gap-5">
                  <span className="w-16 shrink-0 sm:w-20"><BookCover product={d} flat /></span>
                  <div className="min-w-0">
                    <p className="font-display text-[1.2rem] leading-snug text-ink">{d.title}</p>
                    <p className="mt-1 text-sm font-light text-ink-soft">
                      PDF{d.pages ? ` · ${d.pages} pages` : ''}{d.file_size ? ` · ${formatSize(d.file_size)}` : ''}
                    </p>
                    {paid && !d.available && (
                      <p className="mt-2 text-sm leading-relaxed text-rose-deep">
                        Le fichier de cet ebook est en cours de mise en ligne. Il apparaîtra ici dès qu’il sera disponible ; en cas de
                        besoin, <Link to="/contact" className="underline underline-offset-4">contactez-nous</Link>.
                      </p>
                    )}
                  </div>
                </div>
                {paid && d.available && (
                  <button type="button" onClick={() => download(d.product_id)} disabled={busy !== null} className="btn-gold shrink-0">
                    {busy === d.product_id ? <Spinner className="h-4 w-4" /> : <Download className="h-4 w-4" strokeWidth={1.6} />}
                    Télécharger le PDF
                  </button>
                )}
                {pending && (
                  <span className="shrink-0 text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft">En attente du paiement</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="border border-line bg-white/70 p-6">
          <h2 className="font-display text-[1.3rem] text-ink">Détail de la commande</h2>
          <dl className="mt-4 space-y-2.5 text-[0.98rem]">
            <div className="flex justify-between gap-4"><dt className="font-light text-ink-soft">Numéro</dt><dd className="text-ink">{order.order_number}</dd></div>
            <div className="flex justify-between gap-4"><dt className="font-light text-ink-soft">Date</dt><dd className="text-right text-ink">{formatDate(order.created_at, true)}</dd></div>
            <div className="flex justify-between gap-4"><dt className="font-light text-ink-soft">E-mail</dt><dd className="break-all text-right text-ink">{order.email}</dd></div>
            {!order.is_test && (
              <div className="flex justify-between gap-4"><dt className="font-light text-ink-soft">Règlement</dt><dd className="text-right text-ink">{METHOD_LABEL[order.payment_method] || order.payment_method}</dd></div>
            )}
          </dl>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {order.items.map((i) => (
              <li key={i.product_id} className="flex justify-between gap-4 py-3">
                <span className="text-ink">{i.title}</span>
                <span className="shrink-0 text-ink">{euro(i.price_cents)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 flex items-baseline justify-between">
            <span className="text-[0.72rem] uppercase tracking-[0.22em] text-ink-soft">Total</span>
            <span className="font-display text-2xl text-ink">{euro(order.total_cents)}</span>
          </p>
        </div>

        <div className="border border-line bg-white/70 p-6">
          <h2 className="font-display text-[1.3rem] text-ink">Conservez cette page</h2>
          <p className="mt-3 font-light leading-relaxed text-ink-soft">
            Cette page est votre accès personnel à vos ebooks. Ajoutez-la à vos favoris ou copiez son lien : vous pourrez y revenir
            quand vous le souhaitez.
          </p>
          <button type="button" onClick={copyLink} className="btn-outline btn-sm mt-5">
            {copied ? <><Check className="h-4 w-4" strokeWidth={1.6} /> Lien copié</> : <><Copy className="h-4 w-4" strokeWidth={1.5} /> Copier le lien de ma commande</>}
          </button>
          <p className="mt-5 font-light leading-relaxed text-ink-soft">
            Lien égaré ? Retrouvez votre commande depuis{' '}
            <Link to="/mes-telechargements" className="text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep">Mes téléchargements</Link>{' '}
            avec votre e-mail et votre numéro de commande <strong className="font-medium text-ink">{order.order_number}</strong>.
          </p>
        </div>
      </div>

      <div className="mt-10 text-center">
        <Link to="/boutique" className="py-2 text-[0.74rem] uppercase tracking-[0.22em] text-gold-deep underline-offset-8 hover:underline">
          Retour à la boutique
        </Link>
      </div>
    </section>
  );
}
