import { ApiError, postJson } from './api';

export type AdminSession = { access_token: string; refresh_token: string; expires_at?: number; email: string };

const KEY = 'mhb_admin_session';

export function getSession(): AdminSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function setSession(session: AdminSession | null) {
  try {
    if (session) localStorage.setItem(KEY, JSON.stringify(session));
    else localStorage.removeItem(KEY);
  } catch {
    /* stockage indisponible */
  }
}

export async function login(email: string, password: string) {
  const session = await postJson<AdminSession>('/api/auth', { action: 'login', email, password });
  setSession(session);
  return session;
}

export function logout() {
  setSession(null);
}

async function refresh(): Promise<AdminSession | null> {
  const current = getSession();
  if (!current?.refresh_token) return null;
  try {
    const next = await postJson<AdminSession>('/api/auth', { action: 'refresh', refresh_token: current.refresh_token });
    setSession(next);
    return next;
  } catch {
    setSession(null);
    return null;
  }
}

export async function adminCall<T>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  let session = getSession();
  if (!session) throw new ApiError('Session expirée. Merci de vous reconnecter.', 401);
  const send = (s: AdminSession) =>
    postJson<T>('/api/admin', { action, ...payload }, { Authorization: `Bearer ${s.access_token}` });
  try {
    return await send(session);
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      session = await refresh();
      if (session) return send(session);
    }
    throw err;
  }
}

export type SignedUpload = { signed_url: string; path: string; public_url: string | null };

export async function uploadFile(kind: 'pdf' | 'cover', file: File): Promise<SignedUpload> {
  const signed = await adminCall<SignedUpload>('upload.sign', { kind, file_name: file.name });
  const form = new FormData();
  form.append('cacheControl', '3600');
  form.append('', file);
  let res: Response;
  try {
    res = await fetch(signed.signed_url, { method: 'PUT', body: form, headers: { 'x-upsert': 'true' } });
  } catch {
    throw new ApiError('L’envoi du fichier a été interrompu. Vérifiez votre connexion puis réessayez.', 0);
  }
  if (!res.ok) {
    throw new ApiError(
      res.status === 413
        ? 'Ce fichier est trop volumineux pour être envoyé.'
        : 'L’envoi du fichier a échoué. Merci de réessayer.',
      res.status,
    );
  }
  return signed;
}

export const parseEuro = (value: string): number | null => {
  const cleaned = value.replace(/\s|€/g, '').replace(',', '.');
  if (!cleaned) return null;
  const n = Number(cleaned);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

export const centsToInput = (cents: number | null | undefined) =>
  cents === null || cents === undefined ? '' : (cents / 100).toFixed(2).replace('.', ',');
