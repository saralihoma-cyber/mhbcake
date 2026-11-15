import type { Faq, Settings } from '../../lib/api';

export type AdminProduct = {
  id: number;
  slug: string;
  type: 'ebook' | 'pack';
  title: string;
  subtitle: string | null;
  short_description: string | null;
  description: string | null;
  highlights: string[] | null;
  pages: number | null;
  price_cents: number;
  compare_at_cents: number | null;
  badge: string | null;
  is_new: boolean;
  is_active: boolean;
  sort_order: number | null;
  cover_url: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
  included_ids: number[] | null;
  sales_count: number | null;
  created_at: string | null;
};

export type OrderStatus = 'pending' | 'paid' | 'refunded' | 'cancelled';

export type AdminOrder = {
  id: number;
  order_number: string;
  token: string;
  first_name: string;
  last_name: string;
  email: string;
  items: { product_id: number; title: string; type: string; price_cents: number }[];
  entitlements: { id: number; title: string }[];
  total_cents: number;
  payment_method: string;
  status: OrderStatus;
  is_test: boolean;
  consent_cgv_at: string | null;
  consent_waiver_at: string | null;
  paid_at: string | null;
  download_count: number | null;
  last_download_at: string | null;
  admin_note: string | null;
  created_at: string;
};

export type AdminMessage = {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  order_number: string | null;
  is_read: boolean;
  created_at: string;
};

export type Overview = {
  admin_email: string;
  products: AdminProduct[];
  orders: AdminOrder[];
  messages: AdminMessage[];
  faqs: Faq[];
  settings: Settings;
};

export type AdminCtx = {
  data: Overview;
  /** Exécute une action, recharge les données et affiche une notification. Renvoie null en cas d'échec. */
  run: <T = unknown>(action: string, payload?: Record<string, unknown>, okText?: string) => Promise<T | null>;
  reload: () => Promise<void>;
  notify: (kind: 'ok' | 'error', text: string) => void;
  goTo: (tab: string) => void;
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'En attente de paiement',
  paid: 'Payée',
  refunded: 'Remboursée',
  cancelled: 'Annulée',
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  pending: 'bg-gold-light text-ink',
  paid: 'bg-[#dcebdf] text-[#2f5a3c]',
  refunded: 'bg-rose text-ink',
  cancelled: 'bg-beige text-ink-soft',
};
