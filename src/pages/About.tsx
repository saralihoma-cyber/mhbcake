import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { Logo, Ornament, PageHero, Reveal, SectionHeading } from '../components/ui';

const VALUES = [
  {
    title: 'L’exigence',
    text: 'En pâtisserie, tout se joue dans le détail : une pesée juste, une cuisson maîtrisée, un geste précis. Nos ebooks vont à l’essentiel, sans rien laisser au hasard.',
  },
  {
    title: 'La transmission',
    text: 'Un savoir-faire ne vaut que s’il se partage. Nous expliquons le « comment » mais aussi le « pourquoi », pour que chaque technique devienne la vôtre.',
  },
  {
    title: 'La créativité',
    text: 'Le cake design est un terrain d’expression. Une fois les bases acquises, place à l’imagination : couleurs, volumes, fleurs en sucre et finitions dorées.',
  },
];

export default function About() {
  useSeo(
    'À propos de MHB Cake Design – Pâtissier',
    'Découvrez MHB Cake Design – Pâtissier : une maison dédiée à la pâtisserie et au cake design, et à la transmission de leurs techniques à travers des ebooks.',
  );

  return (
    <>
      <PageHero
        eyebrow="La maison"
        title="À propos de MHB"
        intro="Une maison dédiée à la pâtisserie et au cake design — et au plaisir de les transmettre."
      />

      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal className="relative mx-auto w-full max-w-md lg:max-w-none">
            <span className="arch absolute -right-4 -top-4 h-full w-full border border-gold/50" aria-hidden="true" />
            <img
              src="/images/fleurs-en-sucre.webp"
              alt="Roses et pivoines en sucre sur un gâteau cake design ivoire"
              width={900}
              height={1350}
              className="arch relative aspect-[4/5] w-full object-cover shadow-[0_40px_70px_-40px_rgba(92,62,20,0.6)]"
            />
          </Reveal>
          <Reveal delay={0.1}>
            <SectionHeading
              align="left"
              eyebrow="Notre vocation"
              title={
                <>
                  Rendre accessible <em className="text-foil pr-1">l’art du beau gâteau</em>
                </>
              }
            />
            <div className="prose-mhb mt-6 text-[1.06rem] font-light leading-[1.8] text-ink-soft">
              <p>
                MHB Cake Design – Pâtissier est né d’une conviction simple : la belle pâtisserie n’est pas réservée aux laboratoires
                des grandes maisons. Avec les bonnes bases, les bons gestes et un peu de patience, chacun peut réaliser chez soi des
                créations dont il sera fier.
              </p>
              <p>
                C’est dans cet esprit que nous avons conçu nos ebooks. <em>L’Art de la Pâtisserie – Masterclass</em> pose les
                fondations : techniques, recettes et fondamentaux. <em>L’Art du Cake Design</em> ouvre les portes de la création, des
                recettes de base aux réalisations artistiques.
              </p>
              <p>
                Deux guides complémentaires, pensés pour les débutants comme pour les passionnés, à lire et à pratiquer à votre rythme.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line/70 bg-rose-soft/70">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 lg:py-20">
          <Reveal>
            <SectionHeading eyebrow="Ce qui nous guide" title="Trois valeurs, une signature" />
          </Reveal>
          <ul className="mt-12 grid gap-8 md:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 0.1} className="h-full">
                <li className="h-full list-none border border-line bg-ivory p-8 text-center">
                  <span className="text-foil font-display text-3xl italic">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 font-display text-[1.45rem] text-ink">{v.title}</h3>
                  <Ornament className="mt-4 justify-center" />
                  <p className="mt-5 font-light leading-relaxed text-ink-soft">{v.text}</p>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <Reveal className="order-2 text-center lg:order-1 lg:text-left">
            <Logo className="mx-auto h-32 w-32 lg:mx-0" />
            <p className="mt-6 font-display text-[1.6rem] italic leading-snug text-ink sm:text-[1.9rem]">
              « L’art de la pâtisserie et du cake design à portée de main. »
            </p>
            <p className="mt-5 font-light leading-relaxed text-ink-soft">
              Parcourez nos ebooks et commencez dès aujourd’hui : votre prochain gâteau n’attend que vous.
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <Link to="/boutique" className="btn-gold">Découvrir nos ebooks</Link>
              <Link to="/contact" className="btn-outline">Nous contacter</Link>
            </div>
          </Reveal>
          <Reveal delay={0.1} className="order-1 lg:order-2">
            <img
              src="/images/atelier-patisserie.webp"
              alt="Plan de travail en marbre : poche à douille, spatule, fleurs en sucre et carnet de recettes"
              loading="lazy"
              width={1400}
              height={933}
              className="aspect-[3/2] w-full object-cover shadow-[0_40px_70px_-40px_rgba(92,62,20,0.6)]"
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
