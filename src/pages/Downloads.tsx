import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ApiError, EMAIL_RE, postJson } from '../lib/api';
import { useSeo } from '../lib/seo';
import { FieldError, PageHero, Spinner } from '../components/ui';

export default function Downloads() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [number, setNumber] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState('');
  const [sending, setSending] = useState(false);
  useSeo('Mes téléchargements', 'Retrouvez votre commande et téléchargez à nouveau vos ebooks MHB Cake Design – Pâtissier.');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!EMAIL_RE.test(email.trim())) next.email = 'Merci de saisir l’adresse e-mail utilisée lors de l’achat.';
    if (number.trim().length < 6) next.number = 'Merci de saisir votre numéro de commande (ex. MHB-AB12CD34).';
    setErrors(next);
    setFailure('');
    if (Object.keys(next).length) return;
    setSending(true);
    try {
      const res = await postJson<{ token: string }>('/api/orders', { action: 'lookup', email, order_number: number });
      navigate(`/commande/${res.token}`);
    } catch (err) {
      setFailure(err instanceof ApiError ? err.message : 'La recherche a échoué. Merci de réessayer.');
      setSending(false);
    }
  };

  return (
    <>
      <PageHero
        eyebrow="Espace client"
        title="Mes téléchargements"
        intro="Retrouvez votre commande et téléchargez à nouveau vos ebooks, à tout moment."
      />
      <section className="mx-auto max-w-xl px-5 py-14 sm:px-8 lg:py-20">
        <form onSubmit={submit} noValidate className="border border-line bg-white/70 p-6 sm:p-10">
          <div className="space-y-5">
            <div>
              <label htmlFor="d-email" className="label">Adresse e-mail de la commande</label>
              <input
                id="d-email" type="email" inputMode="email" autoComplete="email" className="field"
                value={email} onChange={(e) => { setEmail(e.target.value); setErrors((er) => ({ ...er, email: '' })); }} aria-invalid={!!errors.email}
              />
              <FieldError message={errors.email} />
            </div>
            <div>
              <label htmlFor="d-number" className="label">Numéro de commande</label>
              <input
                id="d-number" className="field uppercase" placeholder="MHB-AB12CD34" autoCapitalize="characters"
                value={number} onChange={(e) => { setNumber(e.target.value); setErrors((er) => ({ ...er, number: '' })); }} aria-invalid={!!errors.number}
              />
              <FieldError message={errors.number} />
              <p className="mt-1.5 text-sm font-light text-ink-soft">Il figure sur votre page de confirmation de commande.</p>
            </div>
          </div>
          {failure && <p className="mt-5 border border-rose bg-rose-soft px-4 py-3 text-danger" role="alert">{failure}</p>}
          <button type="submit" className="btn-gold mt-7 w-full" disabled={sending}>
            {sending ? <><Spinner className="h-4 w-4" /> Recherche…</> : 'Accéder à mes ebooks'}
          </button>
        </form>
        <p className="mt-6 text-center font-light text-ink-soft">
          Numéro de commande égaré ?{' '}
          <Link to="/contact" className="text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep">Contactez notre service client</Link>.
        </p>
      </section>
    </>
  );
}
