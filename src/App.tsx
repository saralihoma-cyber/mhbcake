import { Component, lazy, Suspense, useEffect, type ReactNode } from 'react';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { ShopProvider } from './lib/store';
import Layout from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import PackPage from './pages/PackPage';
import About from './pages/About';
import Contact from './pages/Contact';
import FaqPage from './pages/Faq';
import { Cgv, Confidentialite, Remboursement } from './pages/Legal';
import Checkout from './pages/Checkout';
import OrderPage from './pages/OrderPage';
import Downloads from './pages/Downloads';
import NotFound from './pages/NotFound';
import { PageLoader } from './components/ui';

const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));
const Admin = lazy(() => import('./pages/admin/Admin'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error) {
    console.error('[MHB] Erreur d’affichage :', error);
    // Après une mise à jour du site, un onglet resté ouvert peut demander un fichier qui n'existe plus :
    // on recharge alors la page, une seule fois.
    const stale = /dynamically imported module|module script failed|Failed to fetch|Unable to preload/i.test(error?.message || '');
    try {
      if (stale && !sessionStorage.getItem('mhb_reloaded')) {
        sessionStorage.setItem('mhb_reloaded', '1');
        window.location.reload();
      }
    } catch {
      /* stockage indisponible : on affiche simplement le message ci-dessous */
    }
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 py-16 text-center" role="alert">
        <img src="/images/logo-mhb-sm.webp" alt="MHB Cake Design – Pâtissier" width={240} height={240} className="h-28 w-28 rounded-full mix-blend-multiply" />
        <h1 className="mt-6 font-display text-3xl text-ink">Cette page n’a pas pu s’afficher</h1>
        <p className="mt-3 font-light leading-relaxed text-ink-soft">
          Un incident est survenu pendant le chargement. Rechargez la page ; si le problème persiste, revenez à l’accueil.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={() => window.location.reload()} className="btn-gold">Recharger la page</button>
          <a href="/" className="btn-outline">Retour à l’accueil</a>
        </div>
      </main>
    );
  }
}

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <BrowserRouter>
        <ScrollToTop />
        <ErrorBoundary>
        <Routes>
          <Route path="/admin/connexion" element={<Suspense fallback={<PageLoader />}><AdminLogin /></Suspense>} />
          <Route path="/admin" element={<Suspense fallback={<PageLoader />}><Admin /></Suspense>} />
          <Route
            element={
              <ShopProvider>
                <Layout />
              </ShopProvider>
            }
          >
            <Route path="/" element={<Home />} />
            <Route path="/boutique" element={<Shop />} />
            <Route path="/ebook/:slug" element={<ProductPage />} />
            <Route path="/pack" element={<PackPage />} />
            <Route path="/a-propos" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/cgv" element={<Cgv />} />
            <Route path="/confidentialite" element={<Confidentialite />} />
            <Route path="/remboursement" element={<Remboursement />} />
            <Route path="/commander" element={<Checkout />} />
            <Route path="/commande/:token" element={<OrderPage />} />
            <Route path="/mes-telechargements" element={<Downloads />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </MotionConfig>
  );
}
