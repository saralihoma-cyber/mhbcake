import { useState, type FormEvent } from 'react';
import { MailOpen, Pencil, Plus } from 'lucide-react';
import { ApiError, formatDate, type Faq, type Settings } from '../../lib/api';
import { adminCall, getSession, setSession } from '../../lib/admin';
import { Spinner } from '../../components/ui';
import { card, ConfirmButton, Empty, Pill, SectionTitle } from './AdminUi';
import type { AdminCtx } from './types';

/* ------------------------------ Messages ------------------------------ */

export function MessagesAdmin({ data, run }: AdminCtx) {
  return (
    <>
      <SectionTitle title="Messages" hint="Les demandes envoyées depuis le formulaire de contact de la boutique. Les avis clients déposés sur le site arrivent ici avec le sujet « Avis client » : pour en publier un, ajoutez-le dans le fichier src/data/avis.ts, puis redéployez." />
      {data.messages.length === 0 ? (
        <Empty>Aucun message pour le moment.</Empty>
      ) : (
        <ul className="space-y-4">
          {data.messages.map((m) => (
            <li key={m.id} className={`${card} ${m.is_read ? '' : 'border-gold/70'}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    {!m.is_read && <Pill tone="bg-foil text-ink">Nouveau</Pill>}
                    <p className="font-display text-[1.2rem] leading-tight text-ink">{m.subject}</p>
                  </div>
                  <p className="mt-1 break-all text-sm font-light text-ink-soft">
                    {m.name} · {m.email}{m.order_number ? ` · Commande ${m.order_number}` : ''} · {formatDate(m.created_at, true)}
                  </p>
                </div>
              </div>
              <p className="mt-4 whitespace-pre-line leading-relaxed text-ink">{m.message}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent(`Re : ${m.subject} – MHB Cake Design`)}`} className="btn-gold btn-sm">Répondre par e-mail</a>
                <button type="button" onClick={() => run('message.update', { id: m.id, is_read: !m.is_read })} className="btn-outline btn-sm">
                  <MailOpen className="h-4 w-4" strokeWidth={1.5} /> {m.is_read ? 'Marquer non lu' : 'Marquer comme lu'}
                </button>
                <ConfirmButton onConfirm={() => run('message.delete', { id: m.id }, 'Message supprimé.')}>Supprimer</ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* --------------------------------- FAQ -------------------------------- */

type FaqDraft = { id: number | null; question: string; answer: string; category: string; sort_order: string };

export function FaqAdmin({ data, run }: AdminCtx) {
  const [draft, setDraft] = useState<FaqDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const categories = [...new Set(data.faqs.map((f) => f.category || 'Questions fréquentes'))];

  const edit = (f: Faq) => setDraft({ id: f.id, question: f.question, answer: f.answer, category: f.category || '', sort_order: String(f.sort_order ?? 0) });
  const create = () =>
    setDraft({ id: null, question: '', answer: '', category: categories[0] || 'Les ebooks', sort_order: String(Math.max(0, ...data.faqs.map((f) => f.sort_order || 0)) + 1) });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!draft) return;
    setSaving(true);
    const ok = await run('faq.save', { faq: draft }, 'Question enregistrée.');
    setSaving(false);
    if (ok) setDraft(null);
  };

  return (
    <>
      <SectionTitle
        title="FAQ"
        hint="Les questions-réponses affichées sur la page FAQ et sur la page d’accueil."
        action={<button type="button" onClick={create} className="btn-gold btn-sm"><Plus className="h-4 w-4" strokeWidth={1.6} /> Ajouter une question</button>}
      />

      {draft && (
        <form onSubmit={submit} className={`${card} mb-6 border-gold/70`}>
          <h2 className="font-display text-[1.3rem] text-ink">{draft.id ? 'Modifier la question' : 'Nouvelle question'}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-[1fr_10rem]">
            <div className="sm:col-span-2">
              <label htmlFor="f-q" className="label">Question</label>
              <input id="f-q" className="field" required value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="f-a" className="label">Réponse</label>
              <textarea id="f-a" rows={4} className="field resize-y" required value={draft.answer} onChange={(e) => setDraft({ ...draft, answer: e.target.value })} />
            </div>
            <div>
              <label htmlFor="f-c" className="label">Rubrique</label>
              <input id="f-c" className="field" list="faq-categories" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} />
              <datalist id="faq-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            </div>
            <div>
              <label htmlFor="f-s" className="label">Ordre</label>
              <input id="f-s" className="field" inputMode="numeric" value={draft.sort_order} onChange={(e) => setDraft({ ...draft, sort_order: e.target.value })} />
            </div>
          </div>
          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => setDraft(null)} className="btn-outline btn-sm">Annuler</button>
            <button type="submit" className="btn-gold btn-sm" disabled={saving}>{saving ? <><Spinner className="h-4 w-4" /> Enregistrement…</> : 'Enregistrer'}</button>
          </div>
        </form>
      )}

      {data.faqs.length === 0 ? (
        <Empty>Aucune question publiée.</Empty>
      ) : (
        <ul className="space-y-3">
          {data.faqs.map((f) => (
            <li key={f.id} className={`${card} flex flex-col gap-4 md:flex-row md:items-start md:justify-between`}>
              <div className="min-w-0">
                <p className="text-[0.66rem] uppercase tracking-[0.2em] text-gold-deep">{f.category || 'Questions fréquentes'}</p>
                <p className="mt-1.5 font-display text-[1.15rem] leading-snug text-ink">{f.question}</p>
                <p className="mt-1.5 line-clamp-2 whitespace-pre-line font-light text-ink-soft">{f.answer}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => { edit(f); window.scrollTo(0, 0); }} className="btn-outline btn-sm"><Pencil className="h-4 w-4" strokeWidth={1.5} /> Modifier</button>
                <ConfirmButton onConfirm={() => run('faq.delete', { id: f.id }, 'Question supprimée.')}>Supprimer</ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

/* ------------------------------- Réglages ------------------------------ */

const FIELDS: { title: string; hint: string; fields: { key: string; label: string; placeholder?: string; area?: boolean }[] }[] = [
  {
    title: 'Coordonnées de contact',
    hint: 'Affichées sur la page Contact et dans le pied de page.',
    fields: [
      { key: 'contact_email', label: 'E-mail du service client', placeholder: 'contact@votre-domaine.fr' },
      { key: 'contact_phone', label: 'Téléphone' },
      { key: 'contact_address', label: 'Adresse postale', area: true },
      { key: 'instagram_url', label: 'Lien Instagram', placeholder: 'https://instagram.com/…' },
      { key: 'facebook_url', label: 'Lien Facebook', placeholder: 'https://facebook.com/…' },
    ],
  },
  {
    title: 'Informations légales',
    hint: 'Reprises automatiquement dans vos conditions générales de vente.',
    fields: [
      { key: 'legal_name', label: 'Raison sociale ou nom de l’entrepreneur' },
      { key: 'legal_status', label: 'Statut juridique', placeholder: 'Ex. : Entrepreneur individuel' },
      { key: 'siret', label: 'Numéro SIRET' },
      { key: 'legal_address', label: 'Adresse du siège' },
      { key: 'publication_director', label: 'Responsable de la publication' },
      { key: 'vat_mention', label: 'Mention de TVA', placeholder: 'Ex. : TVA non applicable, art. 293 B du CGI' },
      { key: 'mediator', label: 'Médiateur de la consommation', placeholder: 'Nom et site du médiateur' },
    ],
  },
];

export function SettingsAdmin({ data, run, notify, reload }: AdminCtx) {
  const [values, setValues] = useState<Settings>({ checkout_mode: 'test', ...data.settings });
  const [saving, setSaving] = useState(false);
  const [email, setEmail] = useState(data.admin_email);
  const [password, setPassword] = useState('');
  const [accountBusy, setAccountBusy] = useState(false);
  const manual = values.checkout_mode === 'manual';

  const set = (key: string, value: string) => setValues((v) => ({ ...v, [key]: value }));

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await run('settings.save', { values }, 'Réglages enregistrés.');
    setSaving(false);
  };

  const saveAccount = async (e: FormEvent) => {
    e.preventDefault();
    setAccountBusy(true);
    try {
      const res = await adminCall<{ email: string }>('account.update', { email, password });
      const session = getSession();
      if (session) setSession({ ...session, email: res.email });
      setPassword('');
      await reload();
      notify('ok', 'Identifiants mis à jour.');
    } catch (err) {
      notify('error', err instanceof ApiError ? err.message : 'La mise à jour a échoué.');
    } finally {
      setAccountBusy(false);
    }
  };

  const modeCard = (value: 'test' | 'manual', title: string, text: string) => (
    <label className={`flex cursor-pointer items-start gap-3.5 border p-4 transition-colors ${values.checkout_mode === value ? 'border-gold bg-gold-light/30' : 'border-line bg-white hover:border-gold/60'}`}>
      <input type="radio" name="checkout_mode" className="mt-1 h-4 w-4 accent-[#86621f]" checked={values.checkout_mode === value} onChange={() => set('checkout_mode', value)} />
      <span>
        <span className="block font-medium text-ink">{title}</span>
        <span className="mt-1 block font-light leading-relaxed text-ink-soft">{text}</span>
      </span>
    </label>
  );

  return (
    <>
      <SectionTitle title="Réglages" hint="Paiement, coordonnées, informations légales et identifiants de connexion." />

      <form onSubmit={save} className="space-y-6">
        <section className={card}>
          <h2 className="font-display text-[1.4rem] text-ink">Paiement des commandes</h2>
          <p className="mt-1 font-light leading-relaxed text-ink-soft">
            Le paiement automatique par carte bancaire et PayPal nécessite un compte chez un prestataire de paiement (Stripe, PayPal…),
            qui n’est pas encore relié à cette boutique. En attendant, choisissez le fonctionnement de vos commandes :
          </p>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {modeCard('test', 'Mode test (simulation)', 'Chaque commande est validée immédiatement, sans paiement, et donne accès aux téléchargements. À utiliser uniquement pour tester votre boutique.')}
            {modeCard('manual', 'Validation manuelle des paiements', 'La commande est enregistrée « en attente ». Le client règle selon vos instructions, puis vous confirmez le paiement dans Commandes : ses ebooks sont alors débloqués.')}
          </div>
          {manual && (
            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div>
                <label htmlFor="s-paypal" className="label">Lien PayPal.Me <span className="normal-case tracking-normal">— facultatif</span></label>
                <input id="s-paypal" className="field" placeholder="https://paypal.me/votre-identifiant" value={values.paypal_me_url || ''} onChange={(e) => set('paypal_me_url', e.target.value)} />
                <p className="mt-1.5 text-sm font-light text-ink-soft">Un bouton « Payer avec PayPal », prérempli avec le montant, s’affiche alors sur la page de commande du client.</p>
              </div>
              <div>
                <label htmlFor="s-instr" className="label">Instructions de règlement</label>
                <textarea id="s-instr" rows={4} className="field resize-y" placeholder="Ex. : Réglez votre commande via PayPal en indiquant votre numéro de commande. Vos ebooks sont débloqués dès réception." value={values.payment_instructions || ''} onChange={(e) => set('payment_instructions', e.target.value)} />
              </div>
            </div>
          )}
        </section>

        {FIELDS.map((group) => (
          <section key={group.title} className={card}>
            <h2 className="font-display text-[1.4rem] text-ink">{group.title}</h2>
            <p className="mt-1 font-light text-ink-soft">{group.hint}</p>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {group.fields.map((f) => (
                <div key={f.key} className={f.area ? 'sm:col-span-2' : ''}>
                  <label htmlFor={`s-${f.key}`} className="label">{f.label}</label>
                  {f.area ? (
                    <textarea id={`s-${f.key}`} rows={2} className="field resize-y" value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
                  ) : (
                    <input id={`s-${f.key}`} className="field" placeholder={f.placeholder} value={values[f.key] || ''} onChange={(e) => set(f.key, e.target.value)} />
                  )}
                </div>
              ))}
            </div>
          </section>
        ))}

        <div className="sticky bottom-4 z-10 flex justify-end">
          <button type="submit" className="btn-gold shadow-xl" disabled={saving}>
            {saving ? <><Spinner className="h-4 w-4" /> Enregistrement…</> : 'Enregistrer les réglages'}
          </button>
        </div>
      </form>

      <form onSubmit={saveAccount} className={`${card} mt-8`}>
        <h2 className="font-display text-[1.4rem] text-ink">Identifiants de connexion</h2>
        <p className="mt-1 font-light text-ink-soft">Modifiez l’e-mail et le mot de passe de votre espace administrateur.</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="acc-email" className="label">E-mail de connexion</label>
            <input id="acc-email" type="email" autoComplete="username" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label htmlFor="acc-pass" className="label">Nouveau mot de passe</label>
            <input id="acc-pass" type="password" autoComplete="new-password" className="field" placeholder="8 caractères minimum" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        <button type="submit" className="btn-outline btn-sm mt-5" disabled={accountBusy || (!password && email.trim().toLowerCase() === data.admin_email.toLowerCase())}>
          {accountBusy ? <><Spinner className="h-4 w-4" /> Mise à jour…</> : 'Mettre à jour mes identifiants'}
        </button>
      </form>
    </>
  );
}
