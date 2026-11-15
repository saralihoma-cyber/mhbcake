import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { euro } from '../lib/api';
import { useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import BuyBox from '../components/BuyBox';
import Reviews from '../components/Reviews';
import { Badges, BookCover, ErrorNotice, Eyebrow, InlinePrice, Ornament, PackCover, PageLoader, Reveal, SectionHeading } from '../components/ui';

export default function ProductPage() {
  const { slug } = useParams();
  const { products, ebooks, packs, loading, error, reload, compareAt } = useShop();
  const product = products.find((p) => p.slug === slug);

  useSeo(
    product ? `${product.title} – Ebook numérique · PDF` : 'Ebook',
    product?.short_description || undefined,
  );

  if (loading) return <PageLoader label="Chargement de l’ebook…" />;
  if (error) return <div className="px-5 py-20"><ErrorNotice message={error} onRetry={reload} /></div>;
  if (!product) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <p className="font-display text-3xl text-ink">Cet ebook est introuvable</p>
        <p className="mt-3 font-light text-ink-soft">Il n’est peut-être plus proposé à la vente.</p>
        <Link to="/boutique" className="btn-gold mt-8">Voir la boutique</Link>
      </div>
    );
  }
  if (product.type === 'pack') return <Navigate to="/pack" replace />;

  const paragraphs = (product.description || '').split(/\n{2,}/).map((s) => s.trim()).filter(Boolean);
  const pack = packs.find((p) => p.included_ids.includes(product.id));
  const others = ebooks.filter((p) => p.id !== product.id).slice(0, 2);
  const details = [
    { label: 'Format', value: 'Ebook numérique (fichier PDF)' },
    ...(product.pages ? [{ label: 'Nombre de pages', value: `${product.pages} pages` }] : []),
    { label: 'Langue', value: 'Français' },
    { label: 'Livraison', value: 'Téléchargement numérique' },
    { label: 'Éditeur', value: 'MHB Cake Design – Pâtissier' },
  ];

  return (
    <>
      <nav className="mx-auto flex max-w-7xl flex-wrap items-center gap-1.5 px-5 pt-6 text-[0.8rem] font-light text-ink-soft sm:px-8" aria-label="Fil d’Ariane">
        <Link to="/" className="py-1 hover:text-gold-deep">Accueil</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/boutique" className="py-1 hover:text-gold-deep">Boutique</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink">{product.title}</span>
      </nav>

      <section className="mx-auto max-w-7xl px-5 pb-16 pt-6 sm:px-8 lg:pb-24 lg:pt-10">
        <div className="grid gap-10 lg:grid-cols-[1.02fr_0.98fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <div className="relative flex items-center justify-center overflow-hidden bg-gradient-to-b from-rose-soft via-cream to-beige/70 px-8 py-12 sm:py-16">
              <span className="pointer-events-none absolute left-1/2 top-8 h-[86%] w-[70%] max-w-md -translate-x-1/2 rounded-t-full border border-gold/40" aria-hidden="true" />
              <BookCover product={product} eager className="w-[72%] max-w-[23rem]" />
            </div>
          </div>

          <div>
            <Badges product={product} />
            <Eyebrow className="mt-5">Ebook numérique · PDF{product.pages ? ` · ${product.pages} pages` : ''}</Eyebrow>
            <h1 className="mt-3 font-display text-[2.3rem] leading-[1.06] text-ink sm:text-[3.2rem]">{product.title}</h1>
            {product.subtitle && <p className="mt-4 font-display text-[1.25rem] italic leading-snug text-ink-soft">{product.subtitle}</p>}
            <Ornament className="mt-6" />
            {product.short_description && (
              <p className="mt-6 text-[1.08rem] font-light leading-relaxed text-ink-soft">{product.short_description}</p>
            )}

            {product.highlights.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[0.72rem] font-medium uppercase tracking-[0.28em] text-gold-deep">Les points forts</h2>
                <ul className="mt-4 space-y-3">
                  {product.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-3.5 leading-relaxed text-ink">
                      <span className="mt-[0.6rem] block h-1.5 w-1.5 shrink-0 rotate-45 bg-gold" aria-hidden="true" />
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-9 border-t border-line pt-8">
              <BuyBox product={product} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line/70 bg-white/50">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20 lg:py-20">
          <div>
            <SectionHeading align="left" eyebrow="Résumé" title="À propos de cet ebook" />
            <div className="prose-mhb mt-7 text-[1.06rem] font-light leading-[1.8] text-ink-soft">
              {paragraphs.length > 0 ? paragraphs.map((p) => <p key={p} className="whitespace-pre-line">{p}</p>) : <p>{product.short_description}</p>}
            </div>
          </div>
          <div>
            <h2 className="font-display text-[1.5rem] text-ink">Fiche détaillée</h2>
            <dl className="mt-5 divide-y divide-line border-y border-line">
              {details.map((d) => (
                <div key={d.label} className="flex items-baseline justify-between gap-6 py-3.5">
                  <dt className="text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft">{d.label}</dt>
                  <dd className="text-right text-ink">{d.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <Reviews productIds={[product.id]} subject="cet ebook" />

      {pack && (
        <section className="mx-auto max-w-5xl px-5 pt-16 sm:px-8 lg:pt-24">
          <Reveal>
            <div className="relative grid items-center gap-8 border border-gold/50 bg-gradient-to-br from-cream via-ivory to-rose-soft p-7 sm:grid-cols-[0.8fr_1.2fr] sm:p-10">
              <Link to="/pack" className="mx-auto block w-full max-w-[17rem]" aria-label={`Découvrir ${pack.title}`}>
                <PackCover product={pack} />
              </Link>
              <div className="text-center sm:text-left">
                <Eyebrow>Offre spéciale</Eyebrow>
                <h2 className="mt-3 font-display text-[1.7rem] leading-tight text-ink">{pack.title}</h2>
                <p className="mt-3 font-light leading-relaxed text-ink-soft">
                  Réunissez les {pack.included_ids.length} ebooks pour <strong className="font-semibold text-ink">{euro(pack.price_cents)}</strong>
                  {compareAt(pack) ? (
                    <>
                      {' '}au lieu de <span className="line-through decoration-rose-deep/70">{euro(compareAt(pack) as number)}</span>
                    </>
                  ) : null}
                  .
                </p>
                <Link to="/pack" className="btn-outline mt-6">
                  Découvrir le pack <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {others.length > 0 && (
        <section className="mx-auto max-w-5xl px-5 pt-16 sm:px-8 lg:pt-24">
          <SectionHeading eyebrow="À découvrir aussi" title="Poursuivez votre apprentissage" />
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {others.map((o) => (
              <li key={o.id}>
                <Link to={`/ebook/${o.slug}`} className="book-hover group flex items-center gap-6 border border-line bg-white/70 p-5 transition-colors hover:border-gold/60">
                  <span className="w-24 shrink-0"><BookCover product={o} /></span>
                  <span className="min-w-0">
                    <span className="block font-display text-[1.25rem] leading-tight text-ink group-hover:text-gold-deep">{o.title}</span>
                    <span className="mt-1.5 block text-sm font-light text-ink-soft">Ebook numérique · PDF{o.pages ? ` · ${o.pages} pages` : ''}</span>
                    <span className="mt-2 block font-display text-lg text-ink"><InlinePrice product={o} /></span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
