import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError } from '../../lib/api';
import { getSession, login } from '../../lib/admin';
import { useSeo } from '../../lib/seo';
import { Logo, Ornament, Spinner } from '../../components/ui';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  useSeo('Espace administrateur');

  useEffect(() => {
    if (getSession()) navigate('/admin', { replace: true });
  }, [navigate]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Merci de saisir votre e-mail et votre mot de passe.');
      return;
    }
    setSending(true);
    setError('');
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Connexion impossible. Merci de réessayer.');
      setSending(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center text-center">
          <Logo className="h-32 w-32" />
          <p className="mt-5 text-[0.7rem] font-medium uppercase tracking-[0.34em] text-gold-deep">Espace administrateur</p>
          <h1 className="mt-3 font-display text-[2.1rem] text-ink">Connexion</h1>
          <Ornament className="mt-5" />
        </div>
        <form onSubmit={submit} noValidate className="mt-8 border border-line bg-white/80 p-6 shadow-[0_30px_60px_-45px_rgba(92,62,20,0.55)] sm:p-8">
          <div className="space-y-5">
            <div>
              <label htmlFor="a-email" className="label">Adresse e-mail</label>
              <input id="a-email" type="email" inputMode="email" autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label htmlFor="a-password" className="label">Mot de passe</label>
              <input id="a-password" type="password" autoComplete="current-password" className="field" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          {error && <p className="mt-5 border border-rose bg-rose-soft px-4 py-3 text-danger" role="alert">{error}</p>}
          <button type="submit" className="btn-gold mt-6 w-full" disabled={sending}>
            {sending ? <><Spinner className="h-4 w-4" /> Connexion…</> : 'Se connecter'}
          </button>
        </form>
        <p className="mt-6 text-center">
          <Link to="/" className="py-2 text-[0.74rem] uppercase tracking-[0.22em] text-ink-soft underline-offset-8 hover:text-gold-deep hover:underline">
            Retour à la boutique
          </Link>
        </p>
      </div>
    </main>
  );
}
