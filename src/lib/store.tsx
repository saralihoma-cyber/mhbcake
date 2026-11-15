import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Faq, Product, Settings } from './api';
import { FAQS, PRODUCTS, SETTINGS } from '../data/catalogue';

type ShopState = {
  products: Product[];
  ebooks: Product[];
  packs: Product[];
  settings: Settings;
  faqs: Faq[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
  byId: (id: number) => Product | undefined;
  compareAt: (p: Product) => number | null;
  buyUrl: (id: number) => string | undefined;
};

type PackOffer = { pack: Product; complete: boolean; delta: number; savings: number };

type CartState = {
  ids: number[];
  items: Product[];
  total: number;
  count: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  add: (id: number, options?: { silent?: boolean }) => void;
  remove: (id: number) => void;
  clear: () => void;
  inCart: (id: number) => boolean;
  offer: PackOffer | null;
};

const ShopCtx = createContext<ShopState | null>(null);
const CartCtx = createContext<CartState | null>(null);
const CART_KEY = 'mhb_cart_v1';

function readCart(): number[] {
  try {
    const raw = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((x) => Number.isInteger(x)) : [];
  } catch {
    return [];
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  // Catalogue statique (src/data/catalogue.ts) : l'affichage ne dépend d'aucun serveur.
  const products: Product[] = PRODUCTS;
  const settings: Settings = SETTINGS;
  const faqs: Faq[] = FAQS;
  const loading = false as boolean;
  const error = null as string | null;
  const reload = useCallback(async () => {}, []);

  const shop = useMemo<ShopState>(() => {
    const byId = (id: number) => products.find((p) => p.id === id);
    const compareAt = (p: Product) => {
      if (p.compare_at_cents && p.compare_at_cents > p.price_cents) return p.compare_at_cents;
      if (p.type === 'pack') {
        const sum = p.included_ids.reduce((s, id) => s + (byId(id)?.price_cents || 0), 0);
        return sum > p.price_cents ? sum : null;
      }
      return null;
    };
    return {
      products,
      ebooks: products.filter((p) => p.type === 'ebook'),
      packs: products.filter((p) => p.type === 'pack' && p.included_ids.filter((id) => byId(id)).length >= 2),
      settings,
      faqs,
      loading,
      error,
      reload,
      byId,
      compareAt,
      buyUrl: (id: number) => {
        const url = (byId(id)?.payhip_url || '').trim();
        return url.startsWith('https://payhip.com/') ? url : undefined;
      },
    };
  }, [products, settings, faqs, loading, error, reload]);

  // ----- Panier -----
  const [ids, setIds] = useState<number[]>(readCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(ids));
    } catch {
      /* stockage indisponible : le panier reste en mémoire */
    }
  }, [ids]);

  // Retire du panier les articles qui ne sont plus au catalogue.
  useEffect(() => {
    if (loading || error) return;
    setIds((prev) => {
      const next = prev.filter((id) => products.some((p) => p.id === id));
      return next.length === prev.length ? prev : next;
    });
  }, [loading, error, products]);

  const cart = useMemo<CartState>(() => {
    const byId = shop.byId;
    const items = ids.map(byId).filter((p): p is Product => !!p);

    const add = (id: number, options?: { silent?: boolean }) => {
      const product = byId(id);
      if (!product) return;
      setIds((prev) => {
        if (prev.includes(id)) return prev;
        if (product.type === 'pack') return [...prev.filter((x) => !product.included_ids.includes(x)), id];
        const covered = prev.some((x) => {
          const other = byId(x);
          return other?.type === 'pack' && other.included_ids.includes(id);
        });
        return covered ? prev : [...prev, id];
      });
      if (!options?.silent) setOpen(true);
    };

    let offer: PackOffer | null = null;
    for (const pack of shop.packs) {
      if (ids.includes(pack.id)) continue;
      const owned = pack.included_ids.filter((id) => ids.includes(id));
      if (!owned.length) continue;
      const ownedTotal = owned.reduce((s, id) => s + (byId(id)?.price_cents || 0), 0);
      const fullTotal = pack.included_ids.reduce((s, id) => s + (byId(id)?.price_cents || 0), 0);
      const complete = owned.length === pack.included_ids.filter((id) => byId(id)).length;
      const savings = fullTotal - pack.price_cents;
      if (savings <= 0) continue;
      offer = { pack, complete, delta: pack.price_cents - ownedTotal, savings };
      break;
    }

    return {
      ids,
      items,
      total: items.reduce((s, p) => s + p.price_cents, 0),
      count: items.length,
      open,
      setOpen,
      add,
      remove: (id: number) => setIds((prev) => prev.filter((x) => x !== id)),
      clear: () => setIds([]),
      inCart: (id: number) =>
        ids.includes(id) ||
        ids.some((x) => {
          const other = byId(x);
          return other?.type === 'pack' && other.included_ids.includes(id);
        }),
      offer,
    };
  }, [ids, open, shop]);

  return (
    <ShopCtx.Provider value={shop}>
      <CartCtx.Provider value={cart}>{children}</CartCtx.Provider>
    </ShopCtx.Provider>
  );
}

export function useShop() {
  const ctx = useContext(ShopCtx);
  if (!ctx) throw new Error('useShop doit être utilisé dans ShopProvider');
  return ctx;
}

export function useCart() {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error('useCart doit être utilisé dans ShopProvider');
  return ctx;
}
