import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, Download, FileText, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import type { Product } from '../lib/api';
import { useCart, useShop } from '../lib/store';
import { useBuyNow } from './ProductCard';
import { BuyAssurance, InlinePrice, PaymentMarks, PriceTag } from './ui';

const DIGITAL_POINTS = [
  { icon: FileText, text: 'Format PDF, lisible sur ordinateur, tablette et smartphone' },
  { icon: Download, text: 'Téléchargement disponible dès la confirmation de votre paiement' },
  { icon: Lock, text: 'Lien de téléchargement sécurisé et personnel' },
  { icon: RefreshCw, text: 'Fichier à retrouver à tout moment dans « Mes téléchargements »' },
];

export default function BuyBox({ product }: { product: Product }) {
  const { add, inCart } = useCart();
  const buyNow = useBuyNow();
  const added = inCart(product.id);
  const buyUrl = useShop().buyUrl(product.id);

  // Réserve la place de la barre d'achat fixe sur mobile.
  useEffect(() => {
    document.body.classList.add('has-buybar');
    return () => document.body.classList.remove('has-buybar');
  }, []);

  return (
    <>
      <p className="mb-6 flex items-start gap-3 border border-gold/50 bg-gold-light/30 px-4 py-3 leading-relaxed text-ink">
        <FileText className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.4} aria-hidden="true" />
        <span>
          <strong className="font-medium">{product.type === 'pack' ? 'Ebooks numériques' : 'Ebook numérique'}</strong> —{' '}
          {product.type === 'pack' ? 'fichiers PDF' : 'fichier PDF'} à télécharger. Aucun livre papier n’est expédié.
        </span>
      </p>
      <PriceTag product={product} size="lg" />
      <div className="mt-7 flex flex-col gap-3">
        {buyUrl ? (
          <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="btn-gold w-full !min-h-[3.75rem] !text-[0.86rem]">
            <Lock className="h-4 w-4" strokeWidth={1.6} /> Acheter maintenant<span className="sr-only"> sur Payhip (nouvel onglet)</span>
          </a>
        ) : (
          <button type="button" onClick={() => buyNow(product.id)} className="btn-gold w-full !min-h-[3.75rem] !text-[0.86rem]">
            <Lock className="h-4 w-4" strokeWidth={1.6} /> Acheter maintenant
          </button>
        )}
        <BuyAssurance />
        <button type="button" onClick={() => add(product.id)} disabled={added} className="btn-outline w-full">
          {added ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.6} /> Déjà dans votre panier
            </>
          ) : (
            'Ajouter au panier'
          )}
        </button>
      </div>

      <div className="mt-7 border border-line bg-white/70 p-5 sm:p-6">
        <p className="flex items-center gap-2.5 font-display text-[1.1rem] text-ink">
          <ShieldCheck className="h-5 w-5 text-gold" strokeWidth={1.4} /> Votre téléchargement numérique, en toute sérénité
        </p>
        <ul className="mt-4 space-y-3">
          {DIGITAL_POINTS.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-start gap-3 text-[0.95rem] font-light leading-snug text-ink-soft">
              <Icon className="mt-0.5 h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.5} />
              {text}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
          <PaymentMarks />
          <Link to="/faq" className="py-1 text-sm text-ink-soft underline decoration-gold underline-offset-4 hover:text-gold-deep">
            Une question ?
          </Link>
        </div>
      </div>

      {/* Barre d'achat mobile */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-ivory/95 px-4 py-3 shadow-[0_-12px_30px_-20px_rgba(92,62,20,0.6)] backdrop-blur lg:hidden">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.68rem] uppercase tracking-[0.18em] text-ink-soft">{product.title}</p>
            <p className="font-display text-xl leading-tight text-ink"><InlinePrice product={product} /></p>
          </div>
          {buyUrl ? (
            <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="btn-gold btn-sm !min-h-[3rem] shrink-0">
              Acheter<span className="sr-only"> sur Payhip (nouvel onglet)</span>
            </a>
          ) : (
            <button type="button" onClick={() => buyNow(product.id)} className="btn-gold btn-sm !min-h-[3rem] shrink-0">
              Acheter
            </button>
          )}
        </div>
      </div>
    </>
  );
}
