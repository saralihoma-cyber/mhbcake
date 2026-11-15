import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Download, Gift, Headset, Loader2, ShieldCheck, Tablet } from 'lucide-react';
import { euro, type Product } from '../lib/api';
import { useShop } from '../lib/store';

export function Ornament({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} aria-hidden="true">
      <span className="h-px w-12 bg-gradient-to-r from-transparent to-gold sm:w-16" />
      <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
      <span className="h-px w-12 bg-gradient-to-l from-transparent to-gold sm:w-16" />
    </div>
  );
}

export function Eyebrow({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <p className={`text-[0.7rem] font-medium uppercase tracking-[0.34em] text-gold-deep ${className}`}>{children}</p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'center',
}: {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: 'center' | 'left';
}) {
  const centered = align === 'center';
  return (
    <div className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-4 text-balance font-display text-[2rem] leading-[1.12] text-ink sm:text-[2.6rem]">{title}</h2>
      <Ornament className={`mt-6 ${centered ? 'justify-center' : ''}`} />
      {intro && <p className="mt-6 text-[1.05rem] font-light leading-relaxed text-ink-soft">{intro}</p>}
    </div>
  );
}

export function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.85, delay, ease: [0.2, 0.7, 0.2, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function Logo({ className = '', small = false }: { className?: string; small?: boolean }) {
  return (
    <img
      src={small ? '/images/logo-mhb-sm.webp' : '/images/logo-mhb.webp'}
      alt="MHB Cake Design – Pâtissier"
      width={small ? 240 : 640}
      height={small ? 240 : 640}
      className={`rounded-full mix-blend-multiply ${className}`}
    />
  );
}

export function BookCover({
  product,
  className = '',
  flat = false,
  eager = false,
}: {
  product: Pick<Product, 'title' | 'cover_url'>;
  className?: string;
  flat?: boolean;
  eager?: boolean;
}) {
  return (
    <span className={`book ${flat ? 'book-flat' : ''} ${className}`}>
      {product.cover_url ? (
        <img
          src={product.cover_url}
          alt={`Couverture de l’ebook ${product.title}`}
          width={900}
          height={1350}
          loading={eager ? 'eager' : 'lazy'}
          className="aspect-[2/3] object-cover"
        />
      ) : (
        <span className="flex aspect-[2/3] flex-col items-center justify-center gap-3 rounded-[inherit] border border-gold/50 bg-gradient-to-b from-cream to-rose-soft p-[10%] text-center">
          <span className="block h-1.5 w-1.5 rotate-45 bg-gold" />
          <span className="font-display text-[clamp(0.7rem,2.2vw,1.25rem)] leading-tight text-ink">{product.title}</span>
          <span className="text-[0.55rem] uppercase tracking-[0.3em] text-gold-deep">MHB</span>
        </span>
      )}
    </span>
  );
}

export function PackCover({ product, className = '' }: { product: Product; className?: string }) {
  const { byId } = useShop();
  const books = product.included_ids.map(byId).filter((p): p is Product => !!p).slice(0, 3);
  if (product.cover_url) {
    return (
      <span className={`block overflow-hidden rounded-[3px] shadow-[0_26px_44px_-24px_rgba(92,62,20,0.6)] ring-1 ring-gold/40 ${className}`}>
        <img
          src={product.cover_url}
          alt={`${product.title} : les ebooks réunis`}
          width={1000}
          height={1333}
          loading="lazy"
          className="block h-auto w-full"
        />
      </span>
    );
  }
  if (books.length < 2) return <BookCover product={product} className={className} />;
  const n = books.length;
  const width = n === 2 ? 56 : 46;
  return (
    <div className={`relative ${className}`} style={{ aspectRatio: n === 2 ? '1 / 0.92' : '1 / 0.8' }}>
      {books.map((book, i) => {
        const t = n === 1 ? 0 : i / (n - 1);
        return (
          <div
            key={book.id}
            className="absolute top-1/2 transition-transform duration-700 ease-out"
            style={{
              width: `${width}%`,
              left: `${t * (100 - width)}%`,
              transform: `translateY(-50%) rotate(${-7 + t * 14}deg)`,
              zIndex: i + 1,
            }}
          >
            <BookCover product={book} flat className="!shadow-[0_26px_40px_-20px_rgba(92,62,20,0.6)]" />
          </div>
        );
      })}
    </div>
  );
}

export function ProductVisual({ product, className = '', eager = false }: { product: Product; className?: string; eager?: boolean }) {
  return product.type === 'pack' ? (
    <PackCover product={product} className={className} />
  ) : (
    <BookCover product={product} className={className} eager={eager} />
  );
}

export function PriceTag({ product, size = 'md' }: { product: Product; size?: 'md' | 'lg' }) {
  const { compareAt } = useShop();
  const compare = compareAt(product);
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className={`font-display font-semibold text-ink ${size === 'lg' ? 'text-[2.6rem] leading-none' : 'text-[1.7rem] leading-none'}`}>
        {compare && <span className="sr-only">Prix actuel : </span>}
        {euro(product.price_cents)}
      </span>
      {compare && (
        <>
          <span className={`text-ink-soft line-through decoration-rose-deep/70 ${size === 'lg' ? 'text-xl' : 'text-base'}`}>
            <span className="sr-only">Ancien prix : </span>
            {euro(compare)}
          </span>
          <span className="rounded-full bg-rose px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.14em] text-ink">
            Économisez {euro(compare - product.price_cents)}
          </span>
        </>
      )}
    </div>
  );
}

/** Prix compact (panier, listes) : ancien prix barré puis prix actuel en gras. */
export function InlinePrice({ product, className = '' }: { product: Product; className?: string }) {
  const { compareAt } = useShop();
  const compare = compareAt(product);
  return (
    <span className={`inline-flex flex-wrap items-baseline gap-x-2 ${className}`}>
      {compare && (
        <span className="font-sans text-[0.8em] font-normal text-ink-soft line-through decoration-rose-deep/70">
          <span className="sr-only">Ancien prix : </span>
          {euro(compare)}
        </span>
      )}
      <span className="font-semibold text-ink">
        {compare && <span className="sr-only">Prix actuel : </span>}
        {euro(product.price_cents)}
      </span>
    </span>
  );
}

export function BonusNote({ text, className = '' }: { text?: string; className?: string }) {
  if (!text) return null;
  const i = text.indexOf(':');
  const lead = i > 0 ? text.slice(0, i).trim() : '';
  const rest = i > 0 ? text.slice(i + 1).trim() : text;
  return (
    <p className={`flex items-start gap-3 border border-gold/50 bg-white/70 px-4 py-3 text-left leading-snug text-ink ${className}`}>
      <Gift className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.4} aria-hidden="true" />
      <span>
        {lead && <strong className="text-[0.8rem] font-semibold tracking-[0.12em] text-gold-deep">{lead} : </strong>}
        {rest}
      </span>
    </p>
  );
}

export function Badges({ product }: { product: Product }) {
  const list: { label: string; tone: 'gold' | 'rose' | 'ink' }[] = [];
  if (product.best_seller) list.push({ label: 'Meilleure vente', tone: 'ink' });
  if (product.is_new) list.push({ label: 'Nouveauté', tone: 'rose' });
  if (product.badge) list.push({ label: product.badge, tone: 'gold' });
  if (!list.length) return null;
  const tones = {
    gold: 'bg-foil text-ink',
    rose: 'bg-rose text-ink',
    ink: 'bg-ink text-ivory',
  };
  return (
    <div className="flex flex-wrap gap-2">
      {list.map((b) => (
        <span key={b.label} className={`px-3 py-1 text-[0.62rem] font-medium uppercase tracking-[0.2em] ${tones[b.tone]}`}>
          {b.label}
        </span>
      ))}
    </div>
  );
}

export function Spinner({ className = '' }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className}`} aria-hidden="true" />;
}

export function PageLoader({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-ink-soft" role="status">
      <Spinner className="h-7 w-7 text-gold" />
      <span className="text-sm tracking-wide">{label}</span>
    </div>
  );
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto max-w-xl border border-rose bg-rose-soft px-6 py-8 text-center" role="alert">
      <p className="font-display text-xl text-ink">Un instant…</p>
      <p className="mt-2 text-ink-soft">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="btn-outline btn-sm mt-5">
          Réessayer
        </button>
      )}
    </div>
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-sm text-danger" role="alert">
      {message}
    </p>
  );
}

const ASSURANCES = [
  { icon: ShieldCheck, title: 'Paiement sécurisé', text: 'Vos coordonnées bancaires ne nous sont jamais transmises.' },
  { icon: Download, title: 'Téléchargement numérique', text: 'Votre ebook au format PDF, accessible dès la confirmation du paiement.' },
  { icon: Tablet, title: 'Sur tous vos écrans', text: 'Ordinateur, tablette ou smartphone : lisez où vous le souhaitez.' },
  { icon: Headset, title: 'Service client', text: 'Une question ? Nous vous répondons par message.' },
];

export function Assurances({ className = '' }: { className?: string }) {
  return (
    <ul className={`grid grid-cols-2 gap-x-6 gap-y-8 lg:grid-cols-4 ${className}`}>
      {ASSURANCES.map(({ icon: Icon, title, text }) => (
        <li key={title} className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-gold/50 bg-ivory text-gold-deep">
            <Icon className="h-5 w-5" strokeWidth={1.4} aria-hidden="true" />
          </span>
          <span className="mt-4 font-display text-[1.05rem] leading-tight text-ink">{title}</span>
          <span className="mt-1.5 max-w-[15rem] text-sm font-light leading-relaxed text-ink-soft">{text}</span>
        </li>
      ))}
    </ul>
  );
}

export function BuyAssurance({ className = '' }: { className?: string }) {
  return (
    <p className={`flex items-start justify-center gap-2 text-[0.82rem] leading-snug text-ink-soft ${className}`}>
      <ShieldCheck className="mt-px h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
      <span>
        <span className="whitespace-nowrap">Paiement 100% sécurisé</span> • <span className="whitespace-nowrap">Accès immédiat à vie</span> •{' '}
        <span className="whitespace-nowrap">Support client réactif 7j/7</span>
      </span>
    </p>
  );
}

export function PaymentMarks({ className = '' }: { className?: string }) {
  const box = 'flex h-8 w-[3.25rem] items-center justify-center rounded-[3px] border border-line bg-white';
  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`} aria-label="Moyens de paiement : carte bancaire, Visa, Mastercard, PayPal">
      <li className={box}>
        <span className="rounded-[2px] bg-[#1f3f7a] px-1.5 py-[1px] text-[0.72rem] font-bold tracking-wide text-white">CB</span>
      </li>
      <li className={box}>
        <span className="text-[0.92rem] font-bold italic tracking-tight text-[#1a1f71]">VISA</span>
      </li>
      <li className={box}>
        <svg viewBox="0 0 40 24" className="h-5" aria-hidden="true">
          <circle cx="15" cy="12" r="9" fill="#eb001b" />
          <circle cx="25" cy="12" r="9" fill="#f79e1b" />
          <path d="M20 4.6a9 9 0 0 1 0 14.8 9 9 0 0 1 0-14.8z" fill="#ff5f00" />
        </svg>
      </li>
      <li className={box}>
        <span className="text-[0.74rem] font-bold italic tracking-tight">
          <span className="text-[#003087]">Pay</span>
          <span className="text-[#0079c1]">Pal</span>
        </span>
      </li>
    </ul>
  );
}

export function PageHero({ eyebrow, title, intro }: { eyebrow: string; title: ReactNode; intro?: ReactNode }) {
  return (
    <header className="relative overflow-hidden border-b border-line/70 bg-gradient-to-b from-rose-soft/80 via-cream/60 to-transparent">
      <div className="mx-auto max-w-4xl px-5 pb-12 pt-12 text-center sm:px-8 sm:pb-16 sm:pt-16">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.2, 0.7, 0.2, 1] }}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <h1 className="mt-4 text-balance font-display text-[2.3rem] leading-[1.08] text-ink sm:text-[3.4rem]">{title}</h1>
          <Ornament className="mt-6 justify-center" />
          {intro && <p className="mx-auto mt-6 max-w-2xl text-[1.08rem] font-light leading-relaxed text-ink-soft">{intro}</p>}
        </motion.div>
      </div>
    </header>
  );
}
