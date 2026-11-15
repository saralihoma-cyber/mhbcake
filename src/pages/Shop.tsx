import { Link } from 'react-router-dom';
import { useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import ProductCard, { ProductCardSkeleton, useBuyNow } from '../components/ProductCard';
import { Assurances, Badges, BonusNote, BuyAssurance, ErrorNotice, Eyebrow, Ornament, PackCover, PageHero, PriceTag, Reveal } from '../components/ui';

export default function Shop() {
  const { ebooks, packs, loading, error, reload, buyUrl: payhip } = useShop();
  const buyNow = useBuyNow();
  useSeo(
    'Boutique – Nos ebooks de pâtisserie et de cake design en PDF',
    'Ebook pâtisserie et ebook cake design à télécharger en PDF : L’Art de la Pâtisserie – Masterclass et L’Art du Cake Design, par MHB Cake Design – Pâtissier.',
  );

  return (
    <>
      <PageHero
        eyebrow="La boutique"
        title="Nos ebooks"
        intro="Des livres numériques au format PDF, à télécharger dès la confirmation de votre paiement. Achetez-les séparément ou réunis en pack."
      />

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
        {error ? (
          <ErrorNotice message={error} onRetry={reload} />
        ) : loading ? (
          <div className="grid gap-8 md:grid-cols-2">
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </div>
        ) : ebooks.length === 0 ? (
          <div className="py-16 text-center">
            <p className="font-display text-2xl text-ink">Nos ebooks arrivent très bientôt</p>
            <p className="mt-3 font-light text-ink-soft">La boutique est en cours de préparation. Revenez nous voir prochainement.</p>
          </div>
        ) : (
          <div className={`grid gap-8 md:grid-cols-2 ${ebooks.length > 2 ? 'xl:grid-cols-3' : ''}`}>
            {ebooks.map((p, i) => (
              <Reveal key={p.id} delay={i * 0.1} className="h-full">
                <ProductCard product={p} buyUrl={payhip(p.id)} />
              </Reveal>
            ))}
          </div>
        )}

        {!loading &&
          !error &&
          packs.map((pack) => (
            <Reveal key={pack.id}>
              <article className="relative mt-12 overflow-hidden border border-gold/50 bg-gradient-to-br from-cream via-ivory to-rose-soft p-7 sm:p-12">
                <span className="pointer-events-none absolute inset-2 border border-gold/25" aria-hidden="true" />
                <div className="relative grid items-center gap-10 md:grid-cols-[0.9fr_1.1fr] md:gap-14">
                  <Link to="/pack" className="mx-auto block w-full max-w-sm" aria-label={`Découvrir ${pack.title}`}>
                    <PackCover product={pack} />
                  </Link>
                  <div className="text-center md:text-left">
                    <div className="mb-4 flex justify-center md:justify-start">
                      <Badges product={pack} />
                    </div>
                    <Eyebrow>Offre spéciale · {pack.included_ids.length} ebooks numériques PDF</Eyebrow>
                    <h2 className="mt-4 font-display text-[1.9rem] leading-[1.12] text-ink sm:text-[2.4rem]">{pack.title}</h2>
                    <Ornament className="mt-5 justify-center md:justify-start" />
                    {pack.short_description && <p className="mt-5 font-light leading-relaxed text-ink-soft">{pack.short_description}</p>}
                    <BonusNote text={pack.bonus} className="mt-5" />
                    <div className="mt-6 flex justify-center md:justify-start">
                      <PriceTag product={pack} size="lg" />
                    </div>
                    <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:justify-center md:justify-start">
                      {payhip(pack.id) ? (
                        <a href={payhip(pack.id)} target="_blank" rel="noopener noreferrer" className="btn-gold">
                          Acheter maintenant<span className="sr-only"> sur Payhip (nouvel onglet)</span>
                        </a>
                      ) : (
                        <button type="button" onClick={() => buyNow(pack.id)} className="btn-gold">
                          Acheter maintenant
                        </button>
                      )}
                      <div className="sm:hidden">
                        <BuyAssurance />
                      </div>
                      <Link to="/pack" className="btn-outline">
                        Découvrir le pack
                      </Link>
                    </div>
                    <div className="hidden sm:block">
                      <BuyAssurance className="mt-4 md:justify-start" />
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
      </section>

      <section className="border-y border-line/70 bg-white/50" aria-label="Nos engagements">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <Assurances />
        </div>
      </section>
    </>
  );
}
