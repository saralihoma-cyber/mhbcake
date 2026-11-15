import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Facebook, Instagram, Lock, Mail, MapPin, Menu, Phone, ShoppingBag, Sparkles, Trash2, X } from 'lucide-react';
import { euro, productPath } from '../lib/api';
import { useCart, useShop } from '../lib/store';
import { BookCover, InlinePrice, Logo, Ornament, PackCover, PaymentMarks } from './ui';

const NAV_LEFT = [
  { to: '/', label: 'Accueil' },
  { to: '/boutique', label: 'Boutique' },
  { to: '/pack', label: 'Le Pack' },
];
const NAV_RIGHT = [
  { to: '/a-propos', label: 'À propos' },
  { to: '/faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact' },
];

const navClass = ({ isActive }: { isActive: boolean }) =>
  `relative py-2 text-[0.74rem] font-medium uppercase tracking-[0.24em] transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-center after:bg-gold after:transition-transform after:duration-500 hover:text-gold-deep ${
    isActive ? 'text-gold-deep after:scale-x-100' : 'text-ink after:scale-x-0 hover:after:scale-x-100'
  }`;

function Header() {
  const { count, setOpen } = useCart();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenu(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menu ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menu]);

  const cartButton = (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-ink transition-colors hover:bg-gold-light/60"
      aria-label={count ? `Ouvrir le panier (${count} article${count > 1 ? 's' : ''})` : 'Ouvrir le panier'}
    >
      <ShoppingBag className="h-[1.35rem] w-[1.35rem]" strokeWidth={1.4} />
      {count > 0 && (
        <span className="bg-foil absolute right-0.5 top-0.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full px-1 text-[0.66rem] font-semibold text-ink">
          {count}
        </span>
      )}
    </button>
  );

  return (
    <>
      <p className="bg-ink px-4 py-2.5 text-center text-[0.68rem] font-medium leading-relaxed tracking-[0.12em] text-gold-light sm:text-[0.74rem] sm:tracking-[0.22em]">
        OFFRE DE LANCEMENT : <strong className="font-semibold text-white">-50%</strong> SUR TOUS LES EBOOKS POUR LES 50 PREMIERS ACHETEURS
      </p>
      <header
        className={`sticky top-0 z-40 border-b bg-ivory/95 backdrop-blur transition-shadow duration-500 ${
          scrolled ? 'border-line shadow-[0_10px_30px_-22px_rgba(92,62,20,0.6)]' : 'border-transparent'
        }`}
      >
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 sm:px-8">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => setMenu(true)}
              className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-gold-light/60 lg:hidden"
              aria-label="Ouvrir le menu"
              aria-expanded={menu}
            >
              <Menu className="h-6 w-6" strokeWidth={1.4} />
            </button>
            <nav className="hidden items-center gap-9 lg:flex" aria-label="Navigation principale">
              {NAV_LEFT.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.to === '/'} className={navClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <Link to="/" className="block py-2" aria-label="MHB Cake Design – Pâtissier, retour à l’accueil">
            <Logo
              small
              className={`transition-all duration-500 ${scrolled ? 'h-[3.6rem] w-[3.6rem] lg:h-[4.2rem] lg:w-[4.2rem]' : 'h-[4.4rem] w-[4.4rem] lg:h-[6.4rem] lg:w-[6.4rem]'}`}
            />
          </Link>

          <div className="flex items-center justify-end gap-9">
            <nav className="hidden items-center gap-9 lg:flex" aria-label="Navigation secondaire">
              {NAV_RIGHT.map((l) => (
                <NavLink key={l.to} to={l.to} className={navClass}>
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <div className="-mr-2">{cartButton}</div>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menu && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col overflow-y-auto bg-ivory lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <span className="w-11" />
              <Logo small className="h-[4.4rem] w-[4.4rem]" />
              <button
                type="button"
                onClick={() => setMenu(false)}
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-gold-light/60"
                aria-label="Fermer le menu"
              >
                <X className="h-6 w-6" strokeWidth={1.4} />
              </button>
            </div>
            <nav className="flex flex-1 flex-col items-center justify-center gap-1 px-6 pb-10" aria-label="Navigation mobile">
              {[...NAV_LEFT, ...NAV_RIGHT, { to: '/mes-telechargements', label: 'Mes téléchargements' }].map((l, i) => (
                <motion.div key={l.to} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i + 0.1 }}>
                  <NavLink
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) => `block px-4 py-3 text-center font-display text-[1.7rem] ${isActive ? 'text-foil' : 'text-ink'}`}
                  >
                    {l.label}
                  </NavLink>
                </motion.div>
              ))}
              <Ornament className="mt-6" />
              <Link to="/boutique" className="btn-gold mt-8 w-full max-w-xs">
                Découvrir nos ebooks
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CartDrawer() {
  const { open, setOpen, items, total, remove, offer, add } = useCart();
  const { loading } = useShop();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Votre panier">
          <motion.button
            type="button"
            aria-label="Fermer le panier"
            className="absolute inset-0 h-full w-full cursor-default bg-ink/45"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-ivory shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.5, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="font-display text-2xl text-ink">Votre panier</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full hover:bg-gold-light/60"
                aria-label="Fermer le panier"
              >
                <X className="h-5 w-5" strokeWidth={1.4} />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <ShoppingBag className="h-10 w-10 text-gold" strokeWidth={1} />
                <p className="mt-5 font-display text-xl text-ink">{loading ? 'Chargement de votre panier…' : 'Votre panier est vide'}</p>
                {!loading && (
                  <>
                    <p className="mt-2 font-light text-ink-soft">Découvrez nos ebooks de pâtisserie et de cake design.</p>
                    <Link to="/boutique" onClick={() => setOpen(false)} className="btn-gold mt-7">
                      Voir la boutique
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  {items.map((p) => (
                    <li key={p.id} className="flex gap-4 py-5">
                      <Link to={productPath(p)} className="w-20 shrink-0 self-center">
                        {p.type === 'pack' ? <PackCover product={p} /> : <BookCover product={p} flat />}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-gold-deep">
                          {p.type === 'pack' ? 'Pack · ebooks numériques PDF' : 'Ebook numérique · PDF'}
                        </p>
                        <Link to={productPath(p)} className="mt-1 block font-display text-[1.08rem] leading-snug text-ink hover:text-gold-deep">
                          {p.title}
                        </Link>
                        <p className="mt-2 font-display text-lg text-ink"><InlinePrice product={p} /></p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(p.id)}
                        className="flex h-11 w-11 shrink-0 items-center justify-center self-start rounded-full text-ink-soft hover:bg-rose-soft hover:text-danger"
                        aria-label={`Retirer ${p.title} du panier`}
                      >
                        <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="border-t border-line bg-cream/70 px-6 pb-6 pt-5">
                  {offer && (
                    <div className="mb-5 border border-gold/40 bg-ivory p-4">
                      <p className="flex items-start gap-2 text-sm leading-relaxed text-ink">
                        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                        <span>
                          {offer.complete ? (
                            <>
                              Ces ebooks existent en pack : économisez <strong className="font-medium">{euro(offer.savings)}</strong>.
                            </>
                          ) : offer.delta > 0 ? (
                            <>
                              Complétez votre collection : le pack complet pour seulement{' '}
                              <strong className="font-medium">{euro(offer.delta)}</strong> de plus.
                            </>
                          ) : (
                            <>Le pack complet vous revient moins cher que cet ebook seul.</>
                          )}
                        </span>
                      </p>
                      <button type="button" onClick={() => add(offer.pack.id)} className="btn-outline btn-sm mt-3 w-full">
                        Passer au pack
                      </button>
                    </div>
                  )}
                  <div className="flex items-baseline justify-between">
                    <span className="text-[0.74rem] uppercase tracking-[0.22em] text-ink-soft">Total</span>
                    <span className="font-display text-[1.9rem] leading-none text-ink">{euro(total)}</span>
                  </div>
                  <button type="button" onClick={() => navigate('/commander')} className="btn-gold mt-5 w-full">
                    <Lock className="h-4 w-4" strokeWidth={1.6} /> Commander
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="mt-3 w-full py-2 text-[0.72rem] uppercase tracking-[0.2em] text-ink-soft underline-offset-4 hover:text-gold-deep hover:underline"
                  >
                    Continuer mes achats
                  </button>
                </div>
              </>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}

function Footer() {
  const { settings } = useShop();
  const year = new Date().getFullYear();
  const linkClass = 'inline-block py-1.5 font-light text-ink-soft transition-colors hover:text-gold-deep';
  const socials = [
    { url: settings.instagram_url, label: 'Instagram', icon: Instagram },
    { url: settings.facebook_url, label: 'Facebook', icon: Facebook },
  ].filter((s) => s.url);

  return (
    <footer className="relative mt-24 border-t border-line bg-cream">
      <div className="hairline absolute inset-x-0 -top-px" />
      <div className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr_1fr_1.2fr]">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <Link to="/" aria-label="MHB Cake Design – Pâtissier, retour à l’accueil">
              <Logo className="h-36 w-36" />
            </Link>
            <p className="mt-4 max-w-xs font-display text-lg italic leading-snug text-ink">
              L’art de la pâtisserie et du cake design à portée de main.
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex gap-2">
                {socials.map(({ url, label, icon: Icon }) => (
                  <a
                    key={label}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/50 text-gold-deep hover:bg-gold-light"
                  >
                    <Icon className="h-4 w-4" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            )}
          </div>

          <nav aria-label="Boutique">
            <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-deep">La boutique</h3>
            <ul className="mt-4">
              <li><Link className={linkClass} to="/boutique">Nos ebooks</Link></li>
              <li><Link className={linkClass} to="/pack">Le pack des deux ebooks</Link></li>
              <li><Link className={linkClass} to="/mes-telechargements">Mes téléchargements</Link></li>
              <li><Link className={linkClass} to="/a-propos">À propos de MHB</Link></li>
            </ul>
          </nav>

          <nav aria-label="Informations">
            <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-deep">Informations</h3>
            <ul className="mt-4">
              <li><Link className={linkClass} to="/faq">Questions fréquentes</Link></li>
              <li><Link className={linkClass} to="/cgv">Conditions générales de vente</Link></li>
              <li><Link className={linkClass} to="/confidentialite">Politique de confidentialité</Link></li>
              <li><Link className={linkClass} to="/remboursement">Politique de remboursement</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="text-[0.7rem] font-medium uppercase tracking-[0.3em] text-gold-deep">Service client</h3>
            <ul className="mt-4 space-y-2.5 font-light text-ink-soft">
              {settings.contact_email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <a className="break-all hover:text-gold-deep" href={`mailto:${settings.contact_email}`}>{settings.contact_email}</a>
                </li>
              )}
              {settings.contact_phone && (
                <li className="flex items-start gap-2.5">
                  <Phone className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <a className="hover:text-gold-deep" href={`tel:${settings.contact_phone.replace(/\s/g, '')}`}>{settings.contact_phone}</a>
                </li>
              )}
              {settings.contact_address && (
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold" strokeWidth={1.5} />
                  <span className="whitespace-pre-line">{settings.contact_address}</span>
                </li>
              )}
              <li>
                <Link to="/contact" className="inline-block py-1 text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep">
                  Nous écrire
                </Link>
              </li>
            </ul>
            <PaymentMarks className="mt-6" />
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 border-t border-line pt-6 text-center text-[0.8rem] font-light text-ink-soft sm:flex-row sm:justify-between sm:text-left">
          <p>© {year} MHB Cake Design – Pâtissier. Tous droits réservés.</p>
          <Link to="/admin" className="py-1 hover:text-gold-deep">
            Espace administrateur
          </Link>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#contenu" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-ivory">
        Aller au contenu
      </a>
      <Header />
      <main id="contenu" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
