import { useState } from 'react';
import { ChevronDown, Copy, ExternalLink, Search } from 'lucide-react';
import { euro, formatDate } from '../../lib/api';
import { card, ConfirmButton, Empty, Pill, SectionTitle } from './AdminUi';
import { STATUS_LABEL, STATUS_TONE, type AdminCtx, type AdminOrder, type OrderStatus } from './types';

const METHOD: Record<string, string> = { card: 'Carte bancaire', paypal: 'PayPal', manual: 'Règlement manuel' };
const FILTERS: { key: 'all' | OrderStatus | 'test'; label: string }[] = [
  { key: 'all', label: 'Toutes' },
  { key: 'pending', label: 'En attente' },
  { key: 'paid', label: 'Payées' },
  { key: 'refunded', label: 'Remboursées' },
  { key: 'cancelled', label: 'Annulées' },
  { key: 'test', label: 'Tests' },
];

function OrderRow({ order, ctx }: { order: AdminOrder; ctx: AdminCtx }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(order.admin_note || '');
  const [busy, setBusy] = useState(false);
  const link = `${window.location.origin}/commande/${order.token}`;

  const setStatus = async (status: OrderStatus, okText: string) => {
    setBusy(true);
    await ctx.run('order.update', { id: order.id, status }, okText);
    setBusy(false);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      ctx.notify('ok', 'Lien client copié.');
    } catch {
      ctx.notify('error', 'Copie impossible : sélectionnez le lien manuellement.');
    }
  };

  return (
    <li className="border border-line bg-white">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="flex w-full flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4 text-left hover:bg-cream/50">
        <span className="min-w-0 flex-1 basis-56">
          <span className="block text-ink">{order.order_number}</span>
          <span className="block truncate text-sm font-light text-ink-soft">{order.first_name} {order.last_name} · {order.email}</span>
        </span>
        <span className="text-sm font-light text-ink-soft">{formatDate(order.created_at, true)}</span>
        <span className="flex items-center gap-2">
          {order.is_test && <Pill tone="border border-sand text-ink-soft">Test</Pill>}
          <Pill tone={STATUS_TONE[order.status]}>{STATUS_LABEL[order.status]}</Pill>
        </span>
        <span className="font-display text-xl text-ink">{euro(order.total_cents)}</span>
        <ChevronDown className={`h-5 w-5 text-gold transition-transform ${open ? 'rotate-180' : ''}`} strokeWidth={1.5} />
      </button>

      {open && (
        <div className="grid gap-6 border-t border-line px-5 py-5 lg:grid-cols-2">
          <div>
            <h3 className="text-[0.68rem] uppercase tracking-[0.22em] text-gold-deep">Articles</h3>
            <ul className="mt-2 divide-y divide-line border-y border-line">
              {order.items.map((i) => (
                <li key={i.product_id} className="flex justify-between gap-4 py-2.5">
                  <span className="text-ink">{i.title}</span>
                  <span className="shrink-0 text-ink">{euro(i.price_cents)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 text-[0.95rem]">
              <div className="flex justify-between gap-4"><dt className="font-light text-ink-soft">Mode de règlement</dt><dd className="text-right text-ink">{order.is_test ? 'Simulation (mode test)' : METHOD[order.payment_method] || order.payment_method}</dd></div>
              <div className="flex justify-between gap-4"><dt className="font-light text-ink-soft">Paiement confirmé le</dt><dd className="text-right text-ink">{formatDate(order.paid_at, true)}</dd></div>
              <div className="flex justify-between gap-4"><dt className="font-light text-ink-soft">Téléchargements</dt><dd className="text-right text-ink">{order.download_count || 0}{order.last_download_at ? ` · dernier le ${formatDate(order.last_download_at)}` : ''}</dd></div>
              <div className="flex justify-between gap-4"><dt className="font-light text-ink-soft">CGV et renonciation au droit de rétractation</dt><dd className="text-right text-ink">Acceptées le {formatDate(order.consent_waiver_at, true)}</dd></div>
            </dl>
          </div>

          <div className="space-y-5">
            <div>
              <h3 className="text-[0.68rem] uppercase tracking-[0.22em] text-gold-deep">Page de téléchargement du client</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                <a href={link} target="_blank" rel="noreferrer" className="btn-outline btn-sm"><ExternalLink className="h-4 w-4" strokeWidth={1.5} /> Ouvrir</a>
                <button type="button" onClick={copy} className="btn-outline btn-sm"><Copy className="h-4 w-4" strokeWidth={1.5} /> Copier le lien</button>
                <a href={`mailto:${order.email}?subject=${encodeURIComponent(`Votre commande ${order.order_number} – MHB Cake Design`)}`} className="btn-outline btn-sm">Écrire au client</a>
              </div>
            </div>

            <div>
              <h3 className="text-[0.68rem] uppercase tracking-[0.22em] text-gold-deep">Statut de la commande</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {order.status !== 'paid' && (
                  <button type="button" disabled={busy} onClick={() => setStatus('paid', 'Paiement confirmé : le client peut télécharger ses ebooks.')} className="btn-gold btn-sm">
                    Confirmer le paiement
                  </button>
                )}
                {order.status === 'paid' && (
                  <ConfirmButton disabled={busy} onConfirm={() => setStatus('refunded', 'Commande marquée comme remboursée : les téléchargements sont désactivés.')}>Marquer remboursée</ConfirmButton>
                )}
                {order.status === 'pending' && (
                  <ConfirmButton disabled={busy} onConfirm={() => setStatus('cancelled', 'Commande annulée.')}>Annuler</ConfirmButton>
                )}
                {(order.status === 'cancelled' || order.status === 'refunded') && (
                  <button type="button" disabled={busy} onClick={() => setStatus('pending', 'Commande remise en attente.')} className="btn-outline btn-sm">Remettre en attente</button>
                )}
                {order.is_test && (
                  <ConfirmButton disabled={busy} onConfirm={() => ctx.run('order.delete', { id: order.id }, 'Commande de test supprimée.')}>Supprimer ce test</ConfirmButton>
                )}
              </div>
              {order.status === 'paid' && !order.is_test && (
                <p className="mt-2 text-sm font-light text-ink-soft">Le remboursement lui-même s’effectue depuis votre moyen de paiement ; ce statut désactive l’accès aux fichiers.</p>
              )}
            </div>

            <div>
              <label htmlFor={`note-${order.id}`} className="text-[0.68rem] uppercase tracking-[0.22em] text-gold-deep">Note interne</label>
              <textarea id={`note-${order.id}`} rows={2} className="field mt-2 resize-y" value={note} onChange={(e) => setNote(e.target.value)} />
              <button
                type="button"
                className="btn-outline btn-sm mt-2"
                disabled={busy || note === (order.admin_note || '')}
                onClick={async () => { setBusy(true); await ctx.run('order.update', { id: order.id, admin_note: note }, 'Note enregistrée.'); setBusy(false); }}
              >
                Enregistrer la note
              </button>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

export default function AdminOrders(ctx: AdminCtx) {
  const { data } = ctx;
  const [filter, setFilter] = useState<'all' | OrderStatus | 'test'>('all');
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const list = data.orders.filter((o) => {
    if (filter === 'test' ? !o.is_test : filter !== 'all' && o.status !== filter) return false;
    if (!q) return true;
    return [o.order_number, o.email, o.first_name, o.last_name].some((v) => (v || '').toLowerCase().includes(q));
  });

  return (
    <>
      <SectionTitle title="Commandes" hint="Consultez vos commandes, confirmez les paiements et accédez à la page de téléchargement de chaque client." />

      <div className={`${card} mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`}>
        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" strokeWidth={1.5} />
          <label htmlFor="o-search" className="sr-only">Rechercher une commande</label>
          <input id="o-search" className="field !pl-10" placeholder="N° de commande, nom ou e-mail" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="-mx-1 flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`min-h-[2.75rem] px-3.5 text-[0.72rem] font-medium uppercase tracking-[0.14em] transition-colors ${filter === f.key ? 'bg-ink text-ivory' : 'text-ink-soft hover:bg-cream'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {data.orders.length === 0 ? (
        <Empty>Aucune commande pour le moment. Elles apparaîtront ici dès le premier achat.</Empty>
      ) : list.length === 0 ? (
        <Empty>Aucune commande ne correspond à cette recherche.</Empty>
      ) : (
        <ul className="space-y-3">
          {list.map((o) => <OrderRow key={o.id} order={o} ctx={ctx} />)}
        </ul>
      )}
    </>
  );
}
