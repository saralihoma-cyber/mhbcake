import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { euro, type Product } from '../lib/api';
import { useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import BuyBox from '../components/BuyBox';
import Reviews from '../components/Reviews';
import { Assurances, Badges, BonusNote, BookCover, ErrorNotice, Eyebrow, InlinePrice, Ornament, PackCover, PageLoader, Reveal, SectionHeading } from '../components/ui';

export default function PackPage() {
  const { packs, loading, error, reload, byId } = useShop();
  const pack = packs[0];

  useSeo(
    pack ? `${pack.title} – Offre spéciale` : 'Le pack des deux ebooks',
    'Le pack des deux ebooks MHB Cake Design – Pâtissier : L’Art de la Pâtisserie – Masterclass et L’Art du Cake Design réunis en PDF à prix promotionnel.',
  );

  if (loading) return <PageLoader label="Chargement du pack…" />;
  if (error) return <div className="px-5 py-20"><ErrorNotice message={error} onRetry={reload} /></div>;
  if (!pack) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="font-display text-3xl text-ink">Le pack n’est pas disponible pour le moment</p>
        <p className="mt-3 font-light text-ink-soft">Retrouvez nos ebooks à l’unité dans la boutique.</p>
        <Link to="/boutique" className="btn-gold mt-8">Voir la boutique</Link>
      </div>
    );
  }

  const books = pack.included_ids.map(byId).filter((p): p is Product => !!p);
  const separate = books.reduce((sum, b) => sum + b.price_cents, 0);
  const totalPages = books.reduce((s, b) => s + (b.pages || 0), 0);
  const paragraphs = (pack.description || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);

  return (
    <>
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-5 pt-6 text-[0.8rem] font-light text-ink-soft sm:px-8" aria-label="Fil d’Ariane">
        <Link to="/" className="py-1 hover:text-gold-deep">Accueil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/boutique" className="py-1 hover:text-gold-deep">Boutique</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink">Le pack</span>
      </nav>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:pb-24 lg:pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="relative overflow-hidden border border-gold/40 bg-gradient-to-br from-rose-soft via-cream to-beige/70 px-6 py-12 sm:px-12 sm:py-16">
              <span className="pointer-events-none absolute inset-2 border border-gold/25" aria-hidden="true" />
              <PackCover product={pack} className="relative mx-auto w-full max-w-md" />
            </div>
          </div>

          <div>
            <Badges product={pack} />
            <Eyebrow className="mt-5">
              Offre spéciale permanente · {books.length} ebooks numériques PDF{totalPages ? ` · ${totalPages} pages` : ''}
            </Eyebrow>
            <h1 className="mt-3 font-display text-[2.3rem] leading-[1.06] text-ink sm:text-[3.2rem]">{pack.title}</h1>
            {pack.subtitle && <p className="mt-4 font-display text-[1.25rem] italic leading-snug text-ink-soft">{pack.subtitle}</p>}
            <Ornament className="mt-6" />
            {pack.short_description && <p className="mt-6 text-[1.08rem] font-light leading-relaxed text-ink-soft">{pack.short_description}</p>}
            <BonusNote text={pack.bonus} className="mt-5" />

            <div className="mt-8">
              <h2 className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-gold-deep">Le pack comprend</h2>
              <ul className="mt-4 divide-y divide-line border-y border-line">
                {books.map((b) => (
                  <li key={b.id} className="flex items-center gap-5 py-4">
                    <span className="w-14 shrink-0"><BookCover product={b} flat /></span>
                    <span className="min-w-0 flex-1">
                      <Link to={`/ebook/${b.slug}`} className="font-display text-[1.15rem] leading-tight text-ink hover:text-gold-deep">{b.title}</Link>
                      <span className="mt-1 block text-sm font-light text-ink-soft">Ebook numérique · PDF{b.pages ? ` · ${b.pages} pages` : ''}</span>
                    </span>
                    <span className="shrink-0 text-right text-ink"><InlinePrice product={b} className="justify-end" /></span>
                  </li>
                ))}
              </ul>
              {separate > pack.price_cents && (
                <p className="mt-4 text-[0.98rem] text-ink">
                  Achetés séparément : <span className="line-through decoration-rose-deep/70">{euro(separate)}</span>
                  {' — '}avec le pack, vous économisez <strong className="font-medium">{euro(separate - pack.price_cents)}</strong>.
                </p>
              )}
            </div>

            {pack.highlights.length > 0 && (
              <ul className="mt-7 space-y-3">
                {pack.highlights.map((h) => (
                  <li key={h} className="flex items-start gap-3.5 leading-relaxed text-ink">
                    <span className="mt-[0.6rem] block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
                    {h}
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-9 border-t border-line pt-8">
              <BuyBox product={pack} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/50">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Dans le détail"
            title="Deux ebooks, un même savoir-faire"
            intro={paragraphs[0]}
          />
          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {books.map((b, i) => (
              <Reveal key={b.id} delay={i * 0.1} className="h-full">
                <article className="book-hover flex h-full flex-col border border-line bg-ivory p-6 sm:flex-row sm:gap-7 sm:p-8">
                  <Link to={`/ebook/${b.slug}`} className="mx-auto mb-6 block w-36 shrink-0 sm:mx-0 sm:mb-0" aria-label={`Découvrir ${b.title}`}>
                    <BookCover product={b} />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <h3 className="font-display text-[1.4rem] leading-tight text-ink">{b.title}</h3>
                    {b.short_description && <p className="mt-3 font-light leading-relaxed text-ink-soft">{b.short_description}</p>}
                    <ul className="mt-4 space-y-1.5">
                      {b.highlights.slice(0, 3).map((h) => (
                        <li key={h} className="flex items-start gap-3 text-[0.95rem] text-ink">
                          <span className="mt-[0.55rem] block h-1 w-1 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    <Link
                      to={`/ebook/${b.slug}`}
                      className="mt-auto inline-flex items-center gap-2 pt-5 text-[0.72rem] font-medium uppercase tracking-[0.22em] text-gold-deep underline-offset-8 hover:underline"
                    >
                      Voir la fiche <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                    </Link>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
          {paragraphs.length > 1 && (
            <div className="prose-mhb mx-auto mt-12 max-w-3xl text-center text-[1.06rem] font-light leading-[1.8] text-ink-soft">
              {paragraphs.slice(1).map((p) => <p key={p} className="whitespace-pre-line">{p}</p>)}
            </div>
          )}
        </div>
      </section>

      <Reviews productIds={[pack.id, ...pack.included_ids]} subject="le pack" />

      <section className="mx-auto max-w-7xl px-5 pt-16 sm:px-8" aria-label="Nos engagements">
        <Assurances />
      </section>
    </>
  );
}
