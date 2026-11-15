import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown } from 'lucide-react';
import { productPath, type Product } from '../lib/api';
import { useCart, useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import ProductCard, { ProductCardSkeleton, useBuyNow } from '../components/ProductCard';
import Reviews from '../components/Reviews';
import { Assurances, Badges, BonusNote, BuyAssurance, ErrorNotice, InlinePrice, Eyebrow, Logo, Ornament, PackCover, PriceTag, ProductVisual, Reveal, SectionHeading } from '../components/ui';

const ADVANTAGES = [
  { title: 'Un savoir-faire structuré', text: 'Des fondamentaux aux techniques professionnelles, chaque chapitre vous fait progresser pas à pas.' },
  { title: 'Pour débutants et passionnés', text: 'Des explications claires pour bien démarrer, et des conseils de chef pour affiner votre geste.' },
  { title: 'Recettes et techniques réunies', text: 'Les recettes incontournables, la décoration créative et les astuces qui font la différence.' },
  { title: 'Accès numérique immédiat', text: 'Votre ebook est disponible au téléchargement dès la confirmation de votre paiement.' },
  { title: 'Sur tous vos écrans', text: 'Un PDF à consulter sur ordinateur, tablette ou smartphone — jusque dans votre cuisine.' },
  { title: 'À votre rythme', text: 'Le fichier vous appartient : lisez, relisez et pratiquez quand vous le souhaitez.' },
];

const GALLERY = [
  { src: '/images/macarons.webp', label: 'Macarons', alt: 'Macarons rose poudré et ivoire décorés de feuille d’or' },
  { src: '/images/entremets.webp', label: 'Entremets', alt: 'Entremets au glaçage miroir rose, framboises et fleur en sucre' },
  { src: '/images/fleurs-en-sucre.webp', label: 'Fleurs en sucre', alt: 'Roses et pivoines en sucre sur un gâteau cake design' },
];

const ease = [0.2, 0.7, 0.2, 1] as const;
const heroItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease } },
};

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-line/70">
      <div className="absolute inset-0 hidden lg:block">
        <motion.img
          src="/images/banniere-cake-design.webp"
          alt="Gâteau cake design ivoire orné de pivoines en sucre et de feuille d’or"
          className="h-full w-full object-cover object-[70%_center]"
          initial={{ scale: 1.08, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.8, ease }}
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ivory via-ivory/75 to-transparent" />
      </div>
      <div className="relative lg:hidden">
        <img
          src="/images/banniere-cake-design.webp"
          alt="Gâteau cake design ivoire orné de pivoines en sucre et de feuille d’or"
          className="aspect-[16/9] w-full object-cover object-[82%_center]"
          fetchPriority="high"
        />
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ivory to-transparent" />
      </div>

      <div className="relative mx-auto max-w-7xl px-5 pb-14 pt-4 sm:px-8 lg:flex lg:min-h-[42rem] lg:items-center lg:py-24">
        <motion.div
          className="mx-auto max-w-2xl text-center lg:mx-0 lg:text-left"
          initial="hidden"
          animate="show"
          variants={{ show: { transition: { staggerChildren: 0.13, delayChildren: 0.15 } } }}
        >
          <motion.div variants={heroItem}>
            <Eyebrow>Ebooks numériques · Format PDF</Eyebrow>
          </motion.div>
          <motion.h1
            variants={heroItem}
            className="mt-5 text-balance font-display text-[clamp(1.9rem,8.4vw,2.5rem)] leading-[1.12] text-ink sm:text-[3rem] xl:text-[3.4rem]"
          >
            Réalisez des gâteaux <em className="text-gold-deep sm:whitespace-nowrap">dignes d’un chef pâtissier</em> chez vous, sans matériel professionnel.
          </motion.h1>
          <motion.p variants={heroItem} className="mx-auto mt-6 max-w-xl text-[1.08rem] font-light leading-relaxed text-ink-soft sm:text-[1.2rem] lg:mx-0">
            Maîtrisez enfin les secrets du Cake Design, des ganaches parfaites et des décorations florales grâce à nos 2 guides
            pas-à-pas illustrés (70+ pages).
          </motion.p>
          <motion.div variants={heroItem} className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Link to="/boutique" className="btn-gold w-full sm:w-auto">
              Découvrir nos ebooks
            </Link>
            <Link to="/pack" className="btn-outline w-full sm:w-auto">
              Le pack des deux ebooks
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

function SpotlightRow({ product }: { product: Product }) {
  const { add, inCart } = useCart();
  const added = inCart(product.id);
  const href = productPath(product);
  return (
    <li className="grid grid-cols-[5.5rem_1fr] items-center gap-5 py-6 sm:grid-cols-[7rem_1fr_auto] sm:gap-8">
      <Link to={href} className="block" aria-label={`Découvrir ${product.title}`}>
        <ProductVisual product={product} className={product.type === 'pack' ? 'w-full' : 'mx-auto w-[82%]'} />
      </Link>
      <div className="min-w-0">
        <Badges product={product} />
        <h3 className="mt-2 font-display text-[1.35rem] leading-tight text-ink">
          <Link to={href} className="hover:text-gold-deep">
            {product.title}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-light text-ink-soft">
          {product.type === 'pack' ? `${product.included_ids.length} ebooks numériques PDF réunis` : `Ebook numérique · PDF${product.pages ? ` · ${product.pages} pages` : ''}`}
        </p>
        <p className="mt-2 font-display text-xl text-ink sm:hidden"><InlinePrice product={product} /></p>
      </div>
      <div className="col-span-2 flex items-center gap-5 sm:col-span-1 sm:flex-col sm:items-end sm:gap-3">
        <p className="hidden font-display text-2xl text-ink sm:block"><InlinePrice product={product} className="justify-end" /></p>
        <button type="button" onClick={() => add(product.id)} disabled={added} className="btn-outline btn-sm w-full sm:w-auto">
          {added ? (
            <>
              <Check className="h-4 w-4" strokeWidth={1.6} /> Dans le panier
            </>
          ) : (
            'Ajouter au panier'
          )}
        </button>
      </div>
    </li>
  );
}

export default function Home() {
  const { ebooks, packs, products, faqs, loading, error, reload, buyUrl } = useShop();
  const buyNow = useBuyNow();
  useSeo(
    'MHB Cake Design – Pâtissier | Ebooks de pâtisserie et de cake design en PDF',
    'Ebooks de pâtisserie et formation cake design en PDF par MHB Cake Design – Pâtissier : techniques de pâtisserie, recettes fondamentales et créations artistiques à télécharger.',
  );

  const pack = packs[0];
  const homeFaqs = faqs.filter((f) => f.featured).sort((a, b) => (a.featured || 0) - (b.featured || 0));
  const spotlight = [...products].sort(
    (a, b) => Number(b.best_seller) - Number(a.best_seller) || Number(b.is_new) - Number(a.is_new) || a.sort_order - b.sort_order,
  );

  return (
    <>
      <Hero />

      <section className="border-b border-line/70 bg-white/50" aria-label="Nos engagements">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <Assurances />
        </div>
      </section>

      {/* La maison */}
      <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <Reveal className="flex justify-center">
            <div className="relative flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
              <span className="absolute inset-0 rounded-full border border-gold/40" aria-hidden="true" />
              <span className="absolute -inset-4 rounded-full border border-rose" aria-hidden="true" />
              <span className="absolute inset-3 rounded-full bg-white shadow-[0_30px_60px_-30px_rgba(92,62,20,0.5)]" aria-hidden="true" />
              <Logo className="relative h-[86%] w-[86%]" />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading
              align="left"
              eyebrow="La maison MHB"
              title={
                <>
                  La pâtisserie, <em className="text-foil pr-1">un art qui se transmet</em>
                </>
              }
            />
            <div className="prose-mhb mt-6 text-[1.06rem] font-light leading-relaxed text-ink-soft">
              <p>
                MHB Cake Design – Pâtissier réunit deux passions : la pâtisserie française, exigeante et gourmande, et le cake design,
                où chaque gâteau devient une création à part entière.
              </p>
              <p>
                À travers nos ebooks, nous partageons des techniques claires, des recettes fondamentales et des conseils de chef pour
                vous accompagner pas à pas — que vous fassiez vos premiers pas ou que vous souhaitiez perfectionner votre geste.
              </p>
            </div>
            <Link
              to="/a-propos"
              className="mt-8 inline-flex items-center gap-3 py-2 text-[0.76rem] font-medium uppercase tracking-[0.24em] text-gold-deep underline-offset-8 hover:underline"
            >
              Découvrir la maison <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Les ebooks */}
      <section className="bg-gradient-to-b from-transparent via-cream/70 to-transparent py-16 lg:py-20" id="ebooks">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Nos ebooks"
              title="Deux guides pour maîtriser votre art"
              intro="Deux livres numériques complets, à télécharger au format PDF : l’un consacré à la pâtisserie, l’autre à l’univers du cake design."
            />
          </Reveal>
          <div className="mt-14">
            {error ? (
              <ErrorNotice message={error} onRetry={reload} />
            ) : loading ? (
              <div className="grid gap-8 md:grid-cols-2">
                <ProductCardSkeleton />
                <ProductCardSkeleton />
              </div>
            ) : ebooks.length === 0 ? (
              <p className="text-center font-light text-ink-soft">Nos ebooks seront bientôt disponibles.</p>
            ) : (
              <div className={`grid gap-8 md:grid-cols-2 ${ebooks.length > 2 ? 'xl:grid-cols-3' : ''}`}>
                {ebooks.map((p, i) => (
                  <Reveal key={p.id} delay={i * 0.12} className="h-full">
                    <ProductCard product={p} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal className="relative mx-auto w-full max-w-sm lg:max-w-none">
            <span className="arch absolute -left-4 -top-4 h-full w-full border border-gold/50" aria-hidden="true" />
            <img
              src="/images/macarons.webp"
              alt="Macarons rose poudré et ivoire décorés de feuille d’or"
              loading="lazy"
              width={900}
              height={1350}
              className="arch relative aspect-[4/5] w-full object-cover shadow-[0_40px_70px_-40px_rgba(92,62,20,0.6)]"
            />
          </Reveal>
          <div>
            <Reveal>
              <SectionHeading
                align="left"
                eyebrow="Pourquoi nos ebooks"
                title="Tout le nécessaire pour progresser, avec élégance"
              />
            </Reveal>
            <ul className="mt-10 grid gap-x-10 gap-y-9 sm:grid-cols-2">
              {ADVANTAGES.map((a, i) => (
                <Reveal key={a.title} delay={0.06 * i}>
                  <li className="list-none border-t border-line pt-5">
                    <span className="text-foil font-display text-2xl italic">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="mt-2 font-display text-[1.25rem] leading-tight text-ink">{a.title}</h3>
                    <p className="mt-2 font-light leading-relaxed text-ink-soft">{a.text}</p>
                  </li>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Nouveautés & meilleures ventes */}
      <section className="bg-rose-soft/70 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-5 sm:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="À la une"
              title="Nouveautés & meilleures ventes"
              intro="Les dernières parutions de la maison, à découvrir sans attendre."
            />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-12 border border-line bg-ivory px-5 sm:px-10">
              {loading ? (
                <div className="space-y-6 py-8">
                  <div className="skeleton h-24 w-full" />
                  <div className="skeleton h-24 w-full" />
                </div>
              ) : error ? (
                <p className="py-10 text-center font-light text-ink-soft">La sélection est momentanément indisponible.</p>
              ) : spotlight.length === 0 ? (
                <p className="py-10 text-center font-light text-ink-soft">De nouvelles parutions arrivent très bientôt.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {spotlight.map((p) => (
                    <SpotlightRow key={p.id} product={p} />
                  ))}
                </ul>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Pack */}
      {pack && (
        <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-28">
          <Reveal>
            <div className="relative overflow-hidden border border-gold/50 bg-gradient-to-br from-cream via-ivory to-rose-soft p-7 shadow-[0_50px_90px_-60px_rgba(92,62,20,0.7)] sm:p-12 lg:p-16">
              <span className="pointer-events-none absolute inset-2 border border-gold/25" aria-hidden="true" />
              <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
                <Link to="/pack" aria-label={`Découvrir ${pack.title}`} className="mx-auto block w-full max-w-md">
                  <PackCover product={pack} />
                </Link>
                <div className="text-center lg:text-left">
                  <div className="mb-4 flex justify-center lg:justify-start">
                    <Badges product={pack} />
                  </div>
                  <Eyebrow>Offre spéciale permanente</Eyebrow>
                  <h2 className="mt-4 font-display text-[2rem] leading-[1.1] text-ink sm:text-[2.7rem]">{pack.title}</h2>
                  <Ornament className="mt-6 justify-center lg:justify-start" />
                  {pack.short_description && (
                    <p className="mt-6 text-[1.05rem] font-light leading-relaxed text-ink-soft">{pack.short_description}</p>
                  )}
                  <BonusNote text={pack.bonus} className="mt-5" />
                  <div className="mt-7 flex justify-center lg:justify-start">
                    <PriceTag product={pack} size="lg" />
                  </div>
                  <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
                    {buyUrl(pack.id) ? (
                      <a href={buyUrl(pack.id)} target="_blank" rel="noopener noreferrer" className="btn-gold">
                        Acheter le pack<span className="sr-only"> sur Payhip (nouvel onglet)</span>
                      </a>
                    ) : (
                      <button type="button" onClick={() => buyNow(pack.id)} className="btn-gold">
                        Acheter le pack
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
                    <BuyAssurance className="mt-4 lg:justify-start" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* Avis clients */}
      <Reviews />

      {/* Univers */}
      <section className="mx-auto max-w-7xl px-5 pb-8 sm:px-8">
        <Reveal>
          <SectionHeading eyebrow="L’univers" title="Gourmandise, précision et poésie" />
        </Reveal>
        <ul className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-10">
          {GALLERY.map((g, i) => (
            <Reveal key={g.src} delay={i * 0.12}>
              <li className="group list-none text-center">
                <div className={`arch overflow-hidden ${i === 1 ? 'sm:mt-10' : ''}`}>
                  <img
                    src={g.src}
                    alt={g.alt}
                    loading="lazy"
                    width={900}
                    height={1350}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
                  />
                </div>
                <p className="mt-5 font-display text-xl italic text-ink">{g.label}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* FAQ */}
      {homeFaqs.length > 0 && (
        <section id="faq" className="mx-auto max-w-3xl px-5 pt-20 sm:px-8 lg:pt-28">
          <Reveal>
            <SectionHeading eyebrow="FAQ" title="Foire aux questions" />
          </Reveal>
          <Reveal delay={0.1}>
            <div className="mt-10 divide-y divide-line border-y border-line">
              {homeFaqs.map((f) => (
                <details key={f.id} className="group">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-[1.15rem] text-ink [&::-webkit-details-marker]:hidden">
                    {f.question}
                    <ChevronDown className="h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-180" strokeWidth={1.5} />
                  </summary>
                  <p className="whitespace-pre-line pb-6 pr-10 font-light leading-relaxed text-ink-soft">{f.answer}</p>
                </details>
              ))}
            </div>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link to="/faq" className="btn-outline w-full sm:w-auto">
                Toutes les questions
              </Link>
              <Link to="/contact" className="btn-outline w-full !border-transparent !bg-transparent sm:w-auto">
                Contacter le service client
              </Link>
            </div>
          </Reveal>
        </section>
      )}
    </>
  );
}
