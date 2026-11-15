import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, BookOpen, CheckCircle2, ExternalLink, HelpCircle, LayoutDashboard, LogOut, Mail, Receipt, Settings as SettingsIcon } from 'lucide-react';
import { ApiError, euro, formatDate } from '../../lib/api';
import { adminCall, getSession, logout } from '../../lib/admin';
import { useSeo } from '../../lib/seo';
import { ErrorNotice, Logo, PageLoader } from '../../components/ui';
import { card, Pill, SectionTitle } from './AdminUi';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import { FaqAdmin, MessagesAdmin, SettingsAdmin } from './AdminMisc';
import { STATUS_LABEL, STATUS_TONE, type AdminCtx, type Overview } from './types';

const DEFAULT_ADMIN_EMAIL = 'admin@mhb-cakedesign.fr';

function Dashboard({ data, goTo }: AdminCtx) {
  const real = data.orders.filter((o) => !o.is_test);
  const paid = real.filter((o) => o.status === 'paid');
  const pending = data.orders.filter((o) => o.status === 'pending');
  const tests = data.orders.filter((o) => o.is_test);
  const unread = data.messages.filter((m) => !m.is_read);
  const revenue = paid.reduce((s, o) => s + o.total_cents, 0);
  const missingPdf = data.products.filter((p) => p.type !== 'pack' && !p.file_path);
  const s = data.settings;

  const alerts: { text: string; tab: string; cta: string }[] = [];
  if (s.checkout_mode !== 'manual') {
    alerts.push({
      text: 'Mode test actif : les commandes sont validées sans paiement réel et donnent accès aux téléchargements. Avant d’annoncer votre boutique, activez la validation manuelle des paiements ou faites connecter un prestataire de paiement.',
      tab: 'settings',
      cta: 'Régler le paiement',
    });
  }
  if (missingPdf.length) {
    alerts.push({
      text: `Fichier PDF manquant pour : ${missingPdf.map((p) => p.title).join(' ; ')}. Tant qu’il n’est pas ajouté, vos clients ne peuvent pas télécharger ${missingPdf.length > 1 ? 'ces ebooks' : 'cet ebook'}.`,
      tab: 'products',
      cta: 'Ajouter les PDF',
    });
  }
  if (data.admin_email === DEFAULT_ADMIN_EMAIL) alerts.push({ text: 'Vous utilisez les identifiants administrateur par défaut. Remplacez-les par votre e-mail et un mot de passe personnel.', tab: 'settings', cta: 'Modifier' });

  const kpis = [
    { label: 'Chiffre d’affaires encaissé', value: euro(revenue), hint: 'Commandes payées, hors tests' },
    { label: 'Commandes payées', value: String(paid.length), hint: tests.length ? `+ ${tests.length} commande${tests.length > 1 ? 's' : ''} de test` : 'Hors tests' },
    { label: 'En attente de paiement', value: String(pending.length), hint: 'À valider après règlement' },
    { label: 'Messages non lus', value: String(unread.length), hint: `${data.messages.length} message${data.messages.length > 1 ? 's' : ''} au total` },
  ];

  return (
    <>
      <SectionTitle title="Tableau de bord" hint="Vue d’ensemble de votre boutique." />

      {alerts.length > 0 ? (
        <ul className="mb-8 space-y-3">
          {alerts.map((a) => (
            <li key={a.text} className="flex flex-col gap-3 border border-gold/60 bg-gold-light/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="flex items-start gap-3 leading-relaxed text-ink">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} /> {a.text}
              </p>
              <button type="button" onClick={() => goTo(a.tab)} className="btn-outline btn-sm shrink-0 !bg-white">{a.cta}</button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-8 flex items-center gap-3 border border-[#bcd6c2] bg-[#eef6f0] p-4 text-[#2f5a3c]">
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} /> Votre boutique est entièrement configurée.
        </p>
      )}

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <li key={k.label} className={card}>
            <p className="text-[0.68rem] uppercase tracking-[0.2em] text-ink-soft">{k.label}</p>
            <p className="mt-3 font-display text-[2.2rem] leading-none text-ink">{k.value}</p>
            <p className="mt-2 text-sm font-light text-ink-soft">{k.hint}</p>
          </li>
        ))}
      </ul>

      <div className={`${card} mt-8`}>
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-[1.4rem] text-ink">Dernières commandes</h2>
          <button type="button" onClick={() => goTo('orders')} className="py-2 text-[0.72rem] uppercase tracking-[0.18em] text-gold-deep underline-offset-4 hover:underline">Tout voir</button>
        </div>
        {data.orders.length === 0 ? (
          <p className="mt-4 font-light text-ink-soft">Aucune commande pour le moment.</p>
        ) : (
          <ul className="mt-3 divide-y divide-line">
            {data.orders.slice(0, 6).map((o) => (
              <li key={o.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3.5">
                <div className="min-w-0">
                  <p className="text-ink">{o.order_number} · {o.first_name} {o.last_name}</p>
                  <p className="text-sm font-light text-ink-soft">{formatDate(o.created_at, true)}</p>
                </div>
                <div className="flex items-center gap-3">
                  {o.is_test && <Pill tone="border border-sand text-ink-soft">Test</Pill>}
                  <Pill tone={STATUS_TONE[o.status]}>{STATUS_LABEL[o.status]}</Pill>
                  <span className="font-display text-lg text-ink">{euro(o.total_cents)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

const TABS = [
  { key: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { key: 'products', label: 'Ebooks', icon: BookOpen },
  { key: 'orders', label: 'Commandes', icon: Receipt },
  { key: 'messages', label: 'Messages', icon: Mail },
  { key: 'faq', label: 'FAQ', icon: HelpCircle },
  { key: 'settings', label: 'Réglages', icon: SettingsIcon },
];

export default function Admin() {
  const navigate = useNavigate();
  const [data, setData] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('dashboard');
  const [toast, setToast] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useSeo('Espace administrateur');

  const notify = useCallback((kind: 'ok' | 'error', text: string) => {
    setToast({ kind, text });
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const handleAuth = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        logout();
        navigate('/admin/connexion', { replace: true });
        return true;
      }
      return false;
    },
    [navigate],
  );

  const reload = useCallback(async () => {
    try {
      setData(await adminCall<Overview>('overview'));
      setError('');
    } catch (err) {
      if (handleAuth(err)) return;
      setError(err instanceof Error ? err.message : 'Chargement impossible.');
    } finally {
      setLoading(false);
    }
  }, [handleAuth]);

  useEffect(() => {
    if (!getSession()) {
      navigate('/admin/connexion', { replace: true });
      return;
    }
    reload();
  }, [reload, navigate]);

  const run = useCallback(
    async <T,>(action: string, payload: Record<string, unknown> = {}, okText?: string): Promise<T | null> => {
      try {
        const result = await adminCall<T>(action, payload);
        await reload();
        if (okText) notify('ok', okText);
        return result;
      } catch (err) {
        if (!handleAuth(err)) notify('error', err instanceof Error ? err.message : 'L’action a échoué.');
        return null;
      }
    },
    [reload, notify, handleAuth],
  );

  const goTo = useCallback((next: string) => {
    setTab(next);
    window.scrollTo(0, 0);
  }, []);

  const signOut = () => {
    logout();
    navigate('/admin/connexion', { replace: true });
  };

  const badges: Record<string, number> = data
    ? {
        orders: data.orders.filter((o) => o.status === 'pending').length,
        messages: data.messages.filter((m) => !m.is_read).length,
      }
    : {};

  const ctx: AdminCtx | null = data ? { data, run, reload, notify, goTo } : null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-line bg-ivory/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Logo small className="h-12 w-12 shrink-0" />
            <div className="min-w-0">
              <p className="truncate font-display text-lg leading-tight text-ink">MHB Cake Design</p>
              <p className="truncate text-[0.62rem] uppercase tracking-[0.24em] text-gold-deep">Espace administrateur</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-3">
            <Link to="/" target="_blank" className="flex min-h-[2.75rem] items-center gap-2 px-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink-soft hover:text-gold-deep">
              <ExternalLink className="h-4 w-4" strokeWidth={1.5} /> <span className="hidden sm:inline">Voir la boutique</span>
            </Link>
            <button type="button" onClick={signOut} className="flex min-h-[2.75rem] items-center gap-2 px-3 text-[0.72rem] uppercase tracking-[0.16em] text-ink-soft hover:text-danger">
              <LogOut className="h-4 w-4" strokeWidth={1.5} /> <span className="hidden sm:inline">Déconnexion</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl overflow-x-auto px-2 sm:px-6" aria-label="Sections de l’administration">
          <ul className="flex min-w-max gap-1">
            {TABS.map(({ key, label, icon: Icon }) => (
              <li key={key}>
                <button
                  type="button"
                  onClick={() => goTo(key)}
                  aria-current={tab === key ? 'page' : undefined}
                  className={`flex min-h-[3rem] items-center gap-2 border-b-2 px-3 text-[0.74rem] font-medium uppercase tracking-[0.14em] transition-colors sm:px-4 ${
                    tab === key ? 'border-gold text-gold-deep' : 'border-transparent text-ink-soft hover:text-ink'
                  }`}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} /> {label}
                  {badges[key] > 0 && (
                    <span className="bg-foil flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[0.66rem] font-semibold text-ink">{badges[key]}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-8 sm:py-10">
        {loading ? (
          <PageLoader label="Chargement de votre espace…" />
        ) : error || !ctx ? (
          <ErrorNotice message={error || 'Chargement impossible.'} onRetry={() => { setLoading(true); reload(); }} />
        ) : (
          <>
            {['dashboard', 'products', 'faq', 'settings'].includes(tab) && (
              <p className="mb-6 flex items-start gap-3 border border-gold/60 bg-gold-light/30 p-4 leading-relaxed text-ink" role="note">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} aria-hidden="true" />
                <span>
                  <strong className="font-medium">Le site public affiche un catalogue fixe.</strong> Les ebooks, prix, liens Payhip, questions de la
                  FAQ, coordonnées et mentions légales modifiés ici n’apparaissent plus sur le site : ils se changent dans le fichier{' '}
                  <code className="break-all">src/data/catalogue.ts</code>, puis le site doit être redéployé. Les commandes, les messages et
                  l’import des PDF restent gérés ici.
                </span>
              </p>
            )}
            {tab === 'dashboard' && <Dashboard {...ctx} />}
            {tab === 'products' && <AdminProducts {...ctx} />}
            {tab === 'orders' && <AdminOrders {...ctx} />}
            {tab === 'messages' && <MessagesAdmin {...ctx} />}
            {tab === 'faq' && <FaqAdmin {...ctx} />}
            {tab === 'settings' && <SettingsAdmin {...ctx} />}
          </>
        )}
      </main>

      {toast && (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[70] flex justify-center px-4" role="status" aria-live="polite">
          <p className={`pointer-events-auto max-w-lg px-5 py-3.5 text-[0.95rem] shadow-xl ${toast.kind === 'ok' ? 'bg-ink text-ivory' : 'bg-danger text-white'}`}>
            {toast.text}
          </p>
        </div>
      )}
    </div>
  );
}
