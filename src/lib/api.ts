export type Product = {
  id: number;
  slug: string;
  type: 'ebook' | 'pack';
  title: string;
  subtitle: string | null;
  short_description: string | null;
  description: string | null;
  highlights: string[];
  pages: number | null;
  price_cents: number;
  compare_at_cents: number | null;
  badge: string | null;
  is_new: boolean;
  cover_url: string | null;
  included_ids: number[];
  sort_order: number;
  has_file: boolean;
  file_size: number | null;
  best_seller: boolean;
  payhip_url?: string;
  bonus?: string;
};

export type Settings = Record<string, string>;

export type Faq = {
  id: number;
  question: string;
  answer: string;
  category: string | null;
  sort_order: number;
  /** Rang d'affichage dans la FAQ de la page d'accueil (absent = page FAQ uniquement). */
  featured?: number;
};

export type OrderView = {
  order_number: string;
  status: 'pending' | 'paid' | 'refunded' | 'cancelled';
  is_test: boolean;
  created_at: string;
  paid_at: string | null;
  first_name: string;
  email: string;
  items: { product_id: number; title: string; type: 'ebook' | 'pack'; price_cents: number }[];
  total_cents: number;
  payment_method: string;
  downloads: {
    product_id: number;
    title: string;
    subtitle: string | null;
    cover_url: string | null;
    pages: number | null;
    file_size: number | null;
    available: boolean;
  }[];
};

export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;
  constructor(message: string, status: number, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, init);
  } catch {
    throw new ApiError('Connexion impossible. Vérifiez votre réseau puis réessayez.', 0);
  }
  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  if (!res.ok) {
    const body = (data || {}) as { error?: string; fields?: Record<string, string> };
    throw new ApiError(body.error || 'Une erreur est survenue. Merci de réessayer dans un instant.', res.status, body.fields);
  }
  return data as T;
}

export function postJson<T>(path: string, body: unknown, headers: Record<string, string> = {}): Promise<T> {
  return api<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
}

const euroFormat = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' });
export const euro = (cents: number) => euroFormat.format((cents || 0) / 100);

export const formatDate = (iso: string | null | undefined, withTime = false) => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
};

export const formatSize = (bytes: number | null | undefined) => {
  if (!bytes) return '';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} Mo`;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export const productPath = (p: Pick<Product, 'type' | 'slug'>) => (p.type === 'pack' ? '/pack' : `/ebook/${p.slug}`);
