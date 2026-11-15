import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { ApiError, EMAIL_RE, postJson } from '../lib/api';
import { useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import { FieldError, PageHero, Spinner } from '../components/ui';

const SUBJECTS = ['Question sur un ebook', 'Commande et paiement', 'Problème de téléchargement', 'Autre demande'];
const EMPTY = { name: '', email: '', subject: '', order_number: '', message: '' };

export default function Contact() {
  const { settings } = useShop();
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState('');
  const [sent, setSent] = useState(false);
  useSeo('Contact – Service client', 'Contactez le service client de MHB Cake Design – Pâtissier pour toute question sur nos ebooks, votre commande ou votre téléchargement.');

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = 'Merci d’indiquer votre nom.';
    if (!EMAIL_RE.test(form.email.trim())) next.email = 'Merci de saisir une adresse e-mail valide.';
    if (!form.subject) next.subject = 'Merci de choisir un sujet.';
    if (form.message.trim().length < 10) next.message = 'Votre message est un peu court (10 caractères minimum).';
    setErrors(next);
    setFailure('');
    if (Object.keys(next).length) return;

    setSending(true);
    try {
      await postJson('/api/contact', form);
      setSent(true);
      setForm(EMPTY);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields || {});
        setFailure(err.message);
      } else setFailure('Votre message n’a pas pu être envoyé. Merci de réessayer.');
    } finally {
      setSending(false);
    }
  };

  const coords = [
    settings.contact_email && { icon: Mail, label: 'E-mail', value: settings.contact_email, href: `mailto:${settings.contact_email}` },
    settings.contact_phone && { icon: Phone, label: 'Téléphone', value: settings.contact_phone, href: `tel:${settings.contact_phone.replace(/\s/g, '')}` },
    settings.contact_address && { icon: MapPin, label: 'Adresse', value: settings.contact_address, href: '' },
  ].filter(Boolean) as { icon: typeof Mail; label: string; value: string; href: string }[];

  return (
    <>
      <PageHero
        eyebrow="Service client"
        title="Contact"
        intro="Une question sur un ebook, une commande ou un téléchargement ? Écrivez-nous, nous vous répondrons avec plaisir."
      />

      <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <aside>
            <h2 className="font-display text-[1.7rem] text-ink">Nos coordonnées</h2>
            <p className="mt-3 font-light leading-relaxed text-ink-soft">
              Le formulaire ci-contre est le moyen le plus rapide de nous joindre. Pensez à indiquer votre numéro de commande si votre
              demande concerne un achat.
            </p>
            {coords.length > 0 && (
              <ul className="mt-7 space-y-5">
                {coords.map(({ icon: Icon, label, value, href }) => (
                  <li key={label} className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-gold/50 text-gold-deep">
                      <Icon className="h-4 w-4" strokeWidth={1.5} />
                    </span>
                    <span>
                      <span className="block text-[0.68rem] uppercase tracking-[0.24em] text-ink-soft">{label}</span>
                      {href ? (
                        <a href={href} className="mt-0.5 block break-all text-ink hover:text-gold-deep">{value}</a>
                      ) : (
                        <span className="mt-0.5 block whitespace-pre-line text-ink">{value}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-8 border border-line bg-white/70 p-6">
              <p className="font-display text-[1.15rem] text-ink">Avant de nous écrire</p>
              <p className="mt-2 font-light leading-relaxed text-ink-soft">
                La réponse à votre question se trouve peut-être déjà dans notre foire aux questions.
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <Link to="/faq" className="py-1 text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep">Consulter la FAQ</Link>
                <Link to="/mes-telechargements" className="py-1 text-ink underline decoration-gold underline-offset-4 hover:text-gold-deep">Retrouver mes téléchargements</Link>
              </div>
            </div>
          </aside>

          <div className="border border-line bg-white/70 p-6 sm:p-10">
            {sent ? (
              <div className="flex flex-col items-center py-10 text-center" role="status">
                <CheckCircle2 className="h-12 w-12 text-success" strokeWidth={1.2} />
                <h2 className="mt-5 font-display text-[1.8rem] text-ink">Merci pour votre message</h2>
                <p className="mt-3 max-w-md font-light leading-relaxed text-ink-soft">
                  Il a bien été transmis à notre service client. Nous vous répondrons à l’adresse e-mail indiquée.
                </p>
                <button type="button" onClick={() => setSent(false)} className="btn-outline btn-sm mt-7">
                  Envoyer un autre message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <h2 className="font-display text-[1.7rem] text-ink">Écrivez-nous</h2>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="c-name" className="label">Nom et prénom</label>
                    <input id="c-name" className="field" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={!!errors.name} />
                    <FieldError message={errors.name} />
                  </div>
                  <div>
                    <label htmlFor="c-email" className="label">Adresse e-mail</label>
                    <input id="c-email" type="email" inputMode="email" className="field" autoComplete="email" value={form.email} onChange={set('email')} aria-invalid={!!errors.email} />
                    <FieldError message={errors.email} />
                  </div>
                  <div>
                    <label htmlFor="c-subject" className="label">Sujet</label>
                    <select id="c-subject" className="field" value={form.subject} onChange={set('subject')} aria-invalid={!!errors.subject}>
                      <option value="">Choisir un sujet…</option>
                      {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <FieldError message={errors.subject} />
                  </div>
                  <div>
                    <label htmlFor="c-order" className="label">N° de commande <span className="normal-case tracking-normal">(facultatif)</span></label>
                    <input id="c-order" className="field" placeholder="MHB-…" value={form.order_number} onChange={set('order_number')} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="c-message" className="label">Votre message</label>
                    <textarea id="c-message" rows={6} className="field resize-y" value={form.message} onChange={set('message')} aria-invalid={!!errors.message} />
                    <FieldError message={errors.message} />
                  </div>
                </div>
                {failure && <p className="mt-5 border border-rose bg-rose-soft px-4 py-3 text-danger" role="alert">{failure}</p>}
                <button type="submit" className="btn-gold mt-7 w-full sm:w-auto" disabled={sending}>
                  {sending ? <><Spinner className="h-4 w-4" /> Envoi en cours…</> : 'Envoyer le message'}
                </button>
                <p className="mt-4 text-sm font-light text-ink-soft">
                  Vos données servent uniquement à traiter votre demande. Voir notre{' '}
                  <Link to="/confidentialite" className="underline decoration-gold underline-offset-4 hover:text-gold-deep">politique de confidentialité</Link>.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
