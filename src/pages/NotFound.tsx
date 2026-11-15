import { Link } from 'react-router-dom';
import { useSeo } from '../lib/seo';
import { Ornament } from '../components/ui';

export default function NotFound() {
  useSeo('Page introuvable');
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-5 py-28 text-center">
      <p className="text-foil font-display text-7xl italic">404</p>
      <h1 className="mt-4 font-display text-3xl text-ink">Cette page s’est éclipsée</h1>
      <Ornament className="mt-6" />
      <p className="mt-6 font-light leading-relaxed text-ink-soft">
        La page que vous recherchez n’existe pas ou a été déplacée. Retrouvez nos ebooks depuis la boutique.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-outline">Retour à l’accueil</Link>
        <Link to="/boutique" className="btn-gold">Voir la boutique</Link>
      </div>
    </section>
  );
}
