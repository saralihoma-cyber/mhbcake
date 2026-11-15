import { useId, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, CheckCircle2, PenLine, Quote, Star } from 'lucide-react';
import { ApiError, EMAIL_RE, formatDate, postJson } from '../lib/api';
import { useShop } from '../lib/store';
import { REVIEWS, type Review } from '../data/avis';
import { FieldError, Ornament, Reveal, SectionHeading, Spinner } from './ui';

const RATING_LABELS = ['', 'Décevant', 'Moyen', 'Bien', 'Très bien', 'Excellent'];
const oneDecimal = (n: number) => n.toFixed(1).replace('.', ',');

function Stars({ value, size = 'h-4 w-4', outlineOnly = false }: { value: number; size?: string; outlineOnly?: boolean }) {
  const row = (tone: string) => (
    <span className="flex gap-1">
      {[0, 1, 2, 3, 4].map((i) => (
        <Star key={i} className={`${size} shrink-0 ${tone}`} strokeWidth={1.3} aria-hidden="true" />
      ))}
    </span>
  );
  if (outlineOnly) return <span aria-hidden="true">{row('text-gold')}</span>;
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className="relative inline-block w-fit self-start align-middle" role="img" aria-label={`Note : ${oneDecimal(value)} sur 5`}>
      {row('text-sand')}
      <span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row('fill-gold text-gold')}
      </span>
    </span>
  );
}

function ReviewCard({ review, productTitle }: { review: Review; productTitle?: string }) {
  const [expanded, setExpanded] = useState(false);
  const long = review.text.length > 260;
  return (
    <figure className="relative flex h-full flex-col border border-line bg-white/80 p-7 shadow-[0_30px_60px_-45px_rgba(92,62,20,0.55)] sm:p-8">
      <Quote className="pointer-events-none absolute right-6 top-6 h-9 w-9 text-champagne sm:right-7 sm:top-7" strokeWidth={1.1} aria-hidden="true" />
      <Stars value={review.rating} size="h-[1.15rem] w-[1.15rem]" />
      {review.title && <p className="mt-4 pr-10 font-display text-[1.25rem] leading-snug text-ink">{review.title}</p>}
      <blockquote className="mt-4 flex-1">
        <p className={`whitespace-pre-line font-light leading-relaxed text-ink-soft ${long && !expanded ? 'line-clamp-6' : ''}`}>{review.text}</p>
        {long && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="mt-1 py-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-gold-deep underline-offset-4 hover:underline"
          >
            {expanded ? 'Réduire' : 'Lire la suite'}
          </button>
        )}
      </blockquote>
      <div className="hairline my-5 opacity-60" />
      <figcaption>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <span className="font-display text-[1.1rem] text-ink">{review.name}</span>
          {review.verified && (
            <span className="inline-flex items-center gap-1 text-[0.64rem] font-medium uppercase tracking-[0.16em] text-success">
              <BadgeCheck className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" /> Achat vérifié
            </span>
          )}
        </div>
        <p className="mt-1 text-sm font-light text-ink-soft">
          {formatDate(review.date)}
          {productTitle ? ` · ${productTitle}` : ''}
        </p>
      </figcaption>
    </figure>
  );
}

function ReviewForm({ defaultProductId, onClose }: { defaultProductId?: number; onClose: () => void }) {
  const { products } = useShop();
  const uid = useId();
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', product: defaultProductId ? String(defaultProductId) : '', order_number: '', text: '' });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!rating) next.rating = 'Merci de choisir une note de 1 à 5 étoiles.';
    if (form.name.trim().length < 2) next.name = 'Merci d’indiquer le nom à afficher avec votre avis.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Merci de saisir une adresse e-mail valide.';
    if (!form.product) next.product = 'Merci de choisir l’ebook concerné.';
    if (form.text.trim().length < 20) next.text = 'Votre avis est un peu court (20 caractères minimum).';
    if (!consent) next.consent = 'Votre accord est nécessaire pour publier votre avis.';
    setErrors(next);
    setFailure('');
    if (Object.keys(next).length) return;

    const productTitle = products.find((p) => String(p.id) === form.product)?.title || 'Non précisé';
    setSending(true);
    try {
      await postJson('/api/contact', {
        name: form.name,
        email: form.email,
        subject: 'Avis client',
        order_number: form.order_number,
        message: `Note : ${rating}/5\nEbook : ${productTitle}\nNom à afficher : ${form.name.trim()}\n\n${form.text.trim()}`,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiError) {
        const f = err.fields || {};
        setErrors({ ...(f.name ? { name: f.name } : {}), ...(f.email ? { email: f.email } : {}), ...(f.message ? { text: f.message } : {}) });
        setFailure(err.message);
      } else setFailure('Votre avis n’a pas pu être envoyé. Merci de réessayer.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <div className="mx-auto mt-10 flex max-w-2xl flex-col items-center border border-line bg-white/80 px-6 py-10 text-center" role="status">
        <CheckCircle2 className="h-11 w-11 text-success" strokeWidth={1.2} aria-hidden="true" />
        <p className="mt-4 font-display text-[1.6rem] text-ink">Merci pour votre avis</p>
        <p className="mt-2 max-w-md font-light leading-relaxed text-ink-soft">
          Il a bien été transmis. Il sera publié sur le site après relecture par notre équipe.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="mx-auto mt-10 max-w-2xl border border-line bg-white/80 p-6 text-left shadow-[0_30px_60px_-45px_rgba(92,62,20,0.55)] sm:p-9">
      <h3 className="font-display text-[1.5rem] text-ink">Donner mon avis</h3>
      <p className="mt-1 font-light text-ink-soft">Quelques mots suffisent. Votre adresse e-mail n’est jamais publiée.</p>

      <fieldset className="mt-6">
        <legend className="label">Votre note</legend>
        <div className="flex flex-wrap items-center gap-x-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              onMouseEnter={() => setHover(n)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-gold"
            >
              <input
                type="radio"
                name={`${uid}-rating`}
                value={n}
                checked={rating === n}
                onChange={() => {
                  setRating(n);
                  setErrors((er) => ({ ...er, rating: '' }));
                }}
                className="sr-only"
              />
              <Star className={`h-7 w-7 transition-colors ${n <= (hover || rating) ? 'fill-gold text-gold' : 'text-sand'}`} strokeWidth={1.3} aria-hidden="true" />
              <span className="sr-only">
                {n} étoile{n > 1 ? 's' : ''} sur 5
              </span>
            </label>
          ))}
          <span className="ml-3 text-sm text-ink-soft" aria-live="polite">
            {rating ? `${rating}/5 · ${RATING_LABELS[rating]}` : 'Sélectionnez une note'}
          </span>
        </div>
        <FieldError message={errors.rating} />
      </fieldset>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor={`${uid}-name`} className="label">Nom affiché</label>
          <input id={`${uid}-name`} className="field" placeholder="Ex. : Camille D." autoComplete="given-name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
          <FieldError message={errors.name} />
        </div>
        <div>
          <label htmlFor={`${uid}-email`} className="label">Adresse e-mail <span className="normal-case tracking-normal">(non publiée)</span></label>
          <input id={`${uid}-email`} type="email" inputMode="email" className="field" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} />
          <FieldError message={errors.email} />
        </div>
        <div>
          <label htmlFor={`${uid}-product`} className="label">Ebook concerné</label>
          <select id={`${uid}-product`} className="field" value={form.product} onChange={set('product')} aria-invalid={!!errors.product}>
            <option value="">Choisir…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          <FieldError message={errors.product} />
        </div>
        <div>
          <label htmlFor={`${uid}-order`} className="label">N° de commande <span className="normal-case tracking-normal">(facultatif)</span></label>
          <input id={`${uid}-order`} className="field" maxLength={20} value={form.order_number} onChange={set('order_number')} />
          <p className="mt-1.5 text-sm font-light text-ink-soft">Il nous permet d’afficher la mention « Achat vérifié ».</p>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${uid}-text`} className="label">Votre avis</label>
          <textarea id={`${uid}-text`} rows={5} maxLength={1500} className="field resize-y" value={form.text} onChange={set('text')} aria-invalid={!!errors.text} />
          <FieldError message={errors.text} />
        </div>
      </div>

      <div className="mt-5">
        <label className="flex cursor-pointer items-start gap-3.5 py-1">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => {
              setConsent(e.target.checked);
              setErrors((er) => ({ ...er, consent: '' }));
            }}
            className="mt-1 h-5 w-5 shrink-0 accent-[#86621f]"
            aria-invalid={!!errors.consent}
          />
          <span className="leading-relaxed text-ink">
            J’accepte que mon avis soit publié sur ce site avec le nom indiqué ci-dessus (
            <Link to="/confidentialite" className="underline decoration-gold underline-offset-4 hover:text-gold-deep">politique de confidentialité</Link>).
          </span>
        </label>
        <FieldError message={errors.consent} />
      </div>

      {failure && <p className="mt-5 border border-rose bg-rose-soft px-4 py-3 text-danger" role="alert">{failure}</p>}

      <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="btn-outline">Annuler</button>
        <button type="submit" className="btn-gold" disabled={sending}>
          {sending ? <><Spinner className="h-4 w-4" /> Envoi en cours…</> : 'Envoyer mon avis'}
        </button>
      </div>
    </form>
  );
}

/**
 * Section « Avis clients ».
 * - Sans `productIds` : tous les avis (page d'accueil).
 * - Avec `productIds` : uniquement les avis des produits indiqués (fiche ebook, page du pack).
 */
export default function Reviews({
  productIds,
  subject,
  limit = 3,
}: {
  productIds?: number[];
  subject?: 'cet ebook' | 'le pack';
  limit?: number;
}) {
  const { byId } = useShop();
  const [showAll, setShowAll] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const list = REVIEWS.filter((r) => !productIds || (r.product_id !== undefined && productIds.includes(r.product_id))).sort((a, b) =>
    b.date.localeCompare(a.date),
  );
  const count = list.length;
  const average = count ? list.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  const visible = showAll ? list : list.slice(0, limit);
  const scoped = !!productIds;

  const title = count
    ? scoped
      ? `Les avis sur ${subject || 'cet ebook'}`
      : 'Vos avis sur nos ebooks'
    : scoped
      ? `Donnez votre avis sur ${subject || 'cet ebook'}`
      : 'Votre avis nous est précieux';

  const grid = count === 1 ? 'mx-auto max-w-xl' : count === 2 ? 'mx-auto grid max-w-4xl gap-6 md:grid-cols-2' : 'grid gap-6 md:grid-cols-2 xl:grid-cols-3';

  return (
    <section
      id="avis"
      className={scoped ? 'mx-auto max-w-6xl px-5 pt-16 sm:px-8 lg:pt-24' : 'bg-gradient-to-b from-transparent via-cream/70 to-transparent px-5 py-16 sm:px-8 lg:py-24'}
      aria-label="Avis clients"
    >
      <div className={scoped ? '' : 'mx-auto max-w-6xl'}>
        <Reveal>
          <SectionHeading eyebrow="Avis clients" title={title} />
        </Reveal>

        {count > 0 ? (
          <>
            <Reveal delay={0.05}>
              <div className="mt-9 flex flex-col items-center gap-3 text-center sm:flex-row sm:justify-center sm:gap-7 sm:text-left">
                <p className="font-display text-[4rem] leading-none text-ink">
                  {oneDecimal(average)}
                  <span className="text-[1.4rem] text-ink-soft"> / 5</span>
                </p>
                <div>
                  <Stars value={average} size="h-6 w-6" />
                  <p className="mt-1.5 font-light text-ink-soft">
                    Note moyenne sur {count} avis
                  </p>
                </div>
              </div>
            </Reveal>

            <ul className={`mt-10 ${grid}`}>
              {visible.map((r, i) => (
                <li key={r.id} className="h-full list-none">
                  <Reveal delay={Math.min(i, 5) * 0.08} className="h-full">
                    <ReviewCard review={r} productTitle={r.product_id ? byId(r.product_id)?.title : undefined} />
                  </Reveal>
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              {count > limit && (
                <button type="button" onClick={() => setShowAll((v) => !v)} className="btn-outline w-full sm:w-auto" aria-expanded={showAll}>
                  {showAll ? 'Afficher moins d’avis' : `Afficher les ${count} avis`}
                </button>
              )}
              {!formOpen && (
                <button type="button" onClick={() => setFormOpen(true)} className="btn-gold w-full sm:w-auto">
                  <PenLine className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" /> Donner mon avis
                </button>
              )}
            </div>
          </>
        ) : (
          <Reveal delay={0.05}>
            <div className="relative mx-auto mt-10 max-w-2xl border border-gold/50 bg-gradient-to-br from-cream via-ivory to-rose-soft px-6 py-10 text-center sm:px-12 sm:py-12">
              <span className="pointer-events-none absolute inset-2 border border-gold/25" aria-hidden="true" />
              <div className="relative flex flex-col items-center">
                <Stars value={0} size="h-7 w-7" outlineOnly />
                <p className="mt-5 font-display text-[1.45rem] italic leading-snug text-ink">Les premiers avis seront publiés ici.</p>
                <Ornament className="mt-5" />
                <p className="mt-5 max-w-md font-light leading-relaxed text-ink-soft">
                  Vous avez acheté {scoped ? subject || 'cet ebook' : 'l’un de nos ebooks'} ? Partagez votre expérience : votre témoignage aidera
                  d’autres passionnés à faire leur choix.
                </p>
                {!formOpen && (
                  <button type="button" onClick={() => setFormOpen(true)} className="btn-gold mt-7">
                    <PenLine className="h-4 w-4" strokeWidth={1.6} aria-hidden="true" /> Donner mon avis
                  </button>
                )}
              </div>
            </div>
          </Reveal>
        )}

        {formOpen && <ReviewForm defaultProductId={productIds?.[0]} onClose={() => setFormOpen(false)} />}

        <p className="mx-auto mt-8 max-w-2xl text-center text-sm font-light leading-relaxed text-ink-soft">
          Les avis sont relus avant publication et affichés du plus récent au plus ancien. La mention « Achat vérifié » signale un avis
          rattaché à une commande retrouvée.
        </p>
      </div>
    </section>
  );
}
