import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, FlaskConical, Lock, ShoppingBag, Sparkles, Trash2 } from 'lucide-react';
import { ApiError, EMAIL_RE, euro, postJson, productPath } from '../lib/api';
import { useCart, useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import { BookCover, ErrorNotice, FieldError, InlinePrice, PackCover, PageLoader, PaymentMarks, Spinner } from '../components/ui';

export default function Checkout() {
  const { settings, loading, error, reload } = useShop();
  const { items, total, remove, clear, offer, add } = useCart();
  const navigate = useNavigate();
  useSeo('Commander – Paiement sécurisé');

  const manual = settings.checkout_mode === 'manual';
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '' });
  const [method, setMethod] = useState<'card' | 'paypal'>('card');
  const [cgv, setCgv] = useState(false);
  const [waiver, setWaiver] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState('');
  const [sending, setSending] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.first_name.trim().length < 2) next.first_name = 'Merci d’indiquer votre prénom.';
    if (form.last_name.trim().length < 2) next.last_name = 'Merci d’indiquer votre nom.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Merci de saisir une adresse e-mail valide.';
    if (!cgv) next.accept_cgv = 'Vous devez accepter les conditions générales de vente.';
    if (!waiver) next.accept_waiver = 'Ce consentement est nécessaire pour accéder immédiatement à un contenu numérique.';
    setErrors(next);
    setFailure('');
    if (Object.keys(next).length) {
      const first = document.querySelector('[aria-invalid="true"]') as HTMLElement | null;
      first?.focus();
      return;
    }

    setSending(true);
    try {
      const res = await postJson<{ token: string }>('/api/orders', {
        customer: form,
        product_ids: items.map((p) => p.id),
        payment_method: method,
        accept_cgv: cgv,
        accept_waiver: waiver,
      });
      navigate(`/commande/${res.token}`, { replace: true });
      clear();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields || {});
        setFailure(err.message);
        if (err.status === 409) reload();
      } else setFailure('La commande n’a pas pu être enregistrée. Merci de réessayer.');
      setSending(false);
    }
  };

  if (loading) return <PageLoader label="Préparation de votre commande…" />;
  if (error) return <div className="px-5 py-20"><ErrorNotice message={error} onRetry={reload} /></div>;

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <ShoppingBag className="h-11 w-11 text-gold" strokeWidth={1} />
        <h1 className="mt-6 font-display text-3xl text-ink">Votre panier est vide</h1>
        <p className="mt-3 font-light text-ink-soft">Ajoutez un ebook à votre panier pour passer commande.</p>
        <Link to="/boutique" className="btn-gold mt-8">Découvrir nos ebooks</Link>
      </div>
    );
  }

  const methodCard = (value: 'card' | 'paypal', title: string, hint: string) => (
    <label
      className={`flex cursor-pointer items-center gap-4 border p-4 transition-colors ${
        method === value ? 'border-gold bg-gold-light/30' : 'border-line bg-white/70 hover:border-gold/60'
      }`}
    >
      <input type="radio" name="payment" value={value} checked={method === value} onChange={() => setMethod(value)} className="h-4 w-4 accent-[#86621f]" />
      <span className="flex-1">
        <span className="block text-ink">{title}</span>
        <span className="block text-sm font-light text-ink-soft">{hint}</span>
      </span>
    </label>
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-10 sm:px-8 lg:py-16">
      <div className="text-center">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.34em] text-gold-deep">Finaliser ma commande</p>
        <h1 className="mt-3 font-display text-[2.2rem] leading-tight text-ink sm:text-[3rem]">Commande</h1>
      </div>

      <form onSubmit={submit} noValidate className="mt-10 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
        <div className="space-y-10">
          <fieldset>
            <legend className="font-display text-[1.5rem] text-ink">1. Vos coordonnées</legend>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="o-first" className="label">Prénom</label>
                <input id="o-first" className="field" autoComplete="given-name" value={form.first_name} onChange={set('first_name')} aria-invalid={!!errors.first_name} />
                <FieldError message={errors.first_name} />
              </div>
              <div>
                <label htmlFor="o-last" className="label">Nom</label>
                <input id="o-last" className="field" autoComplete="family-name" value={form.last_name} onChange={set('last_name')} aria-invalid={!!errors.last_name} />
                <FieldError message={errors.last_name} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="o-email" className="label">Adresse e-mail</label>
                <input id="o-email" type="email" inputMode="email" className="field" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} />
                <FieldError message={errors.email} />
                <p className="mt-1.5 text-sm font-light text-ink-soft">
                  Elle vous permettra de retrouver votre commande et vos téléchargements à tout moment.
                </p>
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="font-display text-[1.5rem] text-ink">2. Paiement</legend>
            {manual ? (
              <div className="mt-5 border border-line bg-white/70 p-5">
                <p className="flex items-center gap-2.5 text-ink">
                  <CreditCard className="h-5 w-5 text-gold-deep" strokeWidth={1.4} /> Règlement de votre commande
                </p>
                <p className="mt-3 whitespace-pre-line font-light leading-relaxed text-ink-soft">
                  {settings.payment_instructions ||
                    'Après validation, votre commande est enregistrée et les modalités de règlement vous sont indiquées sur la page suivante.'}
                </p>
                <p className="mt-3 font-light leading-relaxed text-ink-soft">
                  Vos ebooks sont disponibles au téléchargement dès la confirmation de votre paiement par notre équipe.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {methodCard('card', 'Carte bancaire', 'CB, Visa, Mastercard')}
                  {methodCard('paypal', 'PayPal', 'Compte PayPal')}
                </div>
                <div className="mt-4 flex items-start gap-3 border border-gold/50 bg-gold-light/30 p-4" role="note">
                  <FlaskConical className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.4} />
                  <p className="text-[0.95rem] leading-relaxed text-ink">
                    <strong className="font-medium">Boutique en mode test.</strong> Le paiement en ligne n’est pas encore relié à un
                    prestataire bancaire : aucune donnée de carte n’est demandée et aucun montant ne sera débité. La commande est
                    validée immédiatement.
                  </p>
                </div>
              </>
            )}
          </fieldset>

          <fieldset>
            <legend className="font-display text-[1.5rem] text-ink">3. Validation</legend>
            <div className="mt-5 space-y-4">
              <div>
                <label className="flex cursor-pointer items-start gap-3.5 py-1">
                  <input
                    type="checkbox"
                    checked={cgv}
                    onChange={(e) => { setCgv(e.target.checked); setErrors((er) => ({ ...er, accept_cgv: '' })); }}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#86621f]"
                    aria-invalid={!!errors.accept_cgv}
                  />
                  <span className="leading-relaxed text-ink">
                    J’ai lu et j’accepte les{' '}
                    <Link to="/cgv" target="_blank" className="underline decoration-gold underline-offset-4 hover:text-gold-deep">conditions générales de vente</Link>.
                  </span>
                </label>
                <FieldError message={errors.accept_cgv} />
              </div>
              <div>
                <label className="flex cursor-pointer items-start gap-3.5 py-1">
                  <input
                    type="checkbox"
                    checked={waiver}
                    onChange={(e) => { setWaiver(e.target.checked); setErrors((er) => ({ ...er, accept_waiver: '' })); }}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#86621f]"
                    aria-invalid={!!errors.accept_waiver}
                  />
                  <span className="leading-relaxed text-ink">
                    Je demande l’accès immédiat à mon contenu numérique et je reconnais renoncer expressément à mon droit de
                    rétractation (<Link to="/remboursement" target="_blank" className="underline decoration-gold underline-offset-4 hover:text-gold-deep">en savoir plus</Link>).
                  </span>
                </label>
                <FieldError message={errors.accept_waiver} />
              </div>
            </div>
          </fieldset>
        </div>

        <aside className="lg:sticky lg:top-32 lg:self-start">
          <div className="border border-line bg-white/80 p-6 shadow-[0_30px_60px_-45px_rgba(92,62,20,0.55)] sm:p-8">
            <h2 className="font-display text-[1.5rem] text-ink">Récapitulatif</h2>
            <ul className="mt-4 divide-y divide-line border-y border-line">
              {items.map((p) => (
                <li key={p.id} className="flex items-center gap-4 py-4">
                  <Link to={productPath(p)} className="w-16 shrink-0">
                    {p.type === 'pack' ? <PackCover product={p} /> : <BookCover product={p} flat />}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[1.05rem] leading-snug text-ink">{p.title}</p>
                    <p className="mt-0.5 text-sm font-light text-ink-soft">{p.type === 'pack' ? `${p.included_ids.length} ebooks numériques PDF` : 'Ebook numérique · PDF'}</p>
                    <p className="mt-1 text-ink"><InlinePrice product={p} /></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => remove(p.id)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-soft hover:bg-rose-soft hover:text-danger"
                    aria-label={`Retirer ${p.title} de la commande`}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>

            {offer && (
              <div className="mt-5 border border-gold/40 bg-ivory p-4">
                <p className="flex items-start gap-2 text-sm leading-relaxed text-ink">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <span>
                    {offer.complete
                      ? `Ces ebooks existent en pack : économisez ${euro(offer.savings)}.`
                      : offer.delta > 0
                        ? `Le pack complet pour seulement ${euro(offer.delta)} de plus.`
                        : 'Le pack complet vous revient moins cher que cet ebook seul.'}
                  </span>
                </p>
                <button type="button" onClick={() => add(offer.pack.id, { silent: true })} className="btn-outline btn-sm mt-3 w-full">
                  Passer au pack
                </button>
              </div>
            )}

            <div className="mt-6 flex items-baseline justify-between">
              <span className="text-[0.74rem] uppercase tracking-[0.22em] text-ink-soft">Total à régler</span>
              <span className="font-display text-[2.1rem] leading-none text-ink">{euro(total)}</span>
            </div>
            {settings.vat_mention && <p className="mt-1 text-right text-sm font-light text-ink-soft">{settings.vat_mention}</p>}

            {failure && <p className="mt-5 border border-rose bg-rose-soft px-4 py-3 text-danger" role="alert">{failure}</p>}

            <button type="submit" className="btn-gold mt-6 w-full !min-h-[3.75rem]" disabled={sending}>
              {sending ? (
                <><Spinner className="h-4 w-4" /> Validation en cours…</>
              ) : manual ? (
                <><Lock className="h-4 w-4" strokeWidth={1.6} /> Valider ma commande</>
              ) : (
                <><Lock className="h-4 w-4" strokeWidth={1.6} /> Valider la commande (test)</>
              )}
            </button>
            <div className="mt-5 flex flex-col items-center gap-3">
              <PaymentMarks />
              <p className="text-center text-sm font-light text-ink-soft">Livraison numérique : aucun frais de port.</p>
            </div>
          </div>
        </aside>
      </form>
    </section>
  );
}
