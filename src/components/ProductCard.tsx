import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Check } from 'lucide-react';
import { productPath, type Product } from '../lib/api';
import { useCart, useShop } from '../lib/store';
import { Badges, BuyAssurance, PriceTag, ProductVisual } from './ui';

export function useBuyNow() {
  const { add } = useCart();
  const navigate = useNavigate();
  return (id: number) => {
    add(id, { silent: true });
    navigate('/commander');
  };
}

export default function ProductCard({ product, buyUrl: buyUrlProp }: { product: Product; buyUrl?: string }) {
  const { add, inCart } = useCart();
  const shop = useShop();
  const buyUrl = buyUrlProp ?? shop.buyUrl(product.id);
  const buyNow = useBuyNow();
  const isPack = product.type === 'pack';
  const href = productPath(product);
  const added = inCart(product.id);

  return (
    <article className="book-hover group flex h-full flex-col border border-line bg-white/70 shadow-[0_30px_60px_-45px_rgba(92,62,20,0.55)] transition-shadow duration-500 hover:shadow-[0_40px_70px_-40px_rgba(92,62,20,0.6)]">
      <Link
        to={href}
        className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-rose-soft via-cream to-beige/60 px-8 pb-10 pt-16 sm:pb-12"
        aria-label={`Découvrir ${product.title}`}
      >
        <span className="pointer-events-none absolute left-1/2 top-8 h-[78%] w-[62%] -translate-x-1/2 rounded-t-full border border-gold/30" aria-hidden="true" />
        <ProductVisual product={product} className={isPack ? 'w-[86%] max-w-[22rem]' : 'w-[58%] max-w-[15rem]'} />
        <span className="absolute left-4 top-4">
          <Badges product={product} />
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-6 sm:p-8">
        <p className="text-[0.66rem] uppercase tracking-[0.26em] text-gold-deep">
          {isPack ? `Pack · ${product.included_ids.length} ebooks numériques PDF` : `Ebook numérique · PDF${product.pages ? ` · ${product.pages} pages` : ''}`}
        </p>
        <h3 className="mt-3 font-display text-[1.6rem] leading-[1.15] text-ink">
          <Link to={href} className="transition-colors hover:text-gold-deep">
            {product.title}
          </Link>
        </h3>
        {product.subtitle && <p className="mt-2 font-display text-[1.02rem] italic leading-snug text-ink-soft">{product.subtitle}</p>}
        {product.short_description && (
          <p className="mt-4 line-clamp-4 font-light leading-relaxed text-ink-soft">{product.short_description}</p>
        )}
        {!isPack && product.highlights.length > 0 && (
          <ul className="mt-5 space-y-2.5">
            {product.highlights.slice(0, 3).map((h) => (
              <li key={h} className="flex items-start gap-3 leading-snug text-ink">
                <Check className="mt-[0.2rem] h-4 w-4 shrink-0 text-gold-deep" strokeWidth={1.8} aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        )}

        <div className="mt-auto pt-6">
          <div className="hairline mb-6 opacity-60" />
          <PriceTag product={product} />
          <div className="mt-5 flex flex-col gap-3">
            {buyUrl ? (
              <a href={buyUrl} target="_blank" rel="noopener noreferrer" className="btn-gold w-full">
                Acheter maintenant<span className="sr-only"> sur Payhip (nouvel onglet)</span>
              </a>
            ) : (
              <button type="button" onClick={() => buyNow(product.id)} className="btn-gold w-full">
                Acheter maintenant
              </button>
            )}
            <BuyAssurance />
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => add(product.id)} className="btn-outline btn-sm flex-1" disabled={added}>
                {added ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={1.6} /> Dans le panier
                  </>
                ) : (
                  'Ajouter au panier'
                )}
              </button>
              <Link to={href} className="btn-outline btn-sm flex-1 !border-transparent !bg-transparent">
                Découvrir <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="border border-line bg-white/60" aria-hidden="true">
      <div className="flex items-center justify-center bg-cream px-8 py-12">
        <div className="skeleton aspect-[2/3] w-[55%] max-w-[14rem]" />
      </div>
      <div className="space-y-4 p-8">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-7 w-4/5" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}
