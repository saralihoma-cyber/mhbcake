import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Eye, FileCheck2, FileWarning, ImagePlus, Pencil, Plus, Upload, X } from 'lucide-react';
import { ApiError, euro, formatSize } from '../../lib/api';
import { adminCall, centsToInput, parseEuro, uploadFile } from '../../lib/admin';
import { FieldError, Spinner } from '../../components/ui';
import { card, ConfirmButton, Empty, Pill, SectionTitle } from './AdminUi';
import type { AdminCtx, AdminProduct } from './types';

type Draft = {
  id: number | null;
  type: 'ebook' | 'pack';
  title: string;
  slug: string;
  subtitle: string;
  short_description: string;
  description: string;
  highlights: string;
  pages: string;
  price: string;
  compare: string;
  badge: string;
  is_new: boolean;
  is_active: boolean;
  sort_order: string;
  cover_url: string;
  file_path: string;
  file_name: string;
  file_size: number | null;
  included_ids: number[];
};

const emptyDraft = (type: 'ebook' | 'pack', sort: number): Draft => ({
  id: null, type, title: '', slug: '', subtitle: '', short_description: '', description: '', highlights: '', pages: '',
  price: '', compare: '', badge: '', is_new: type === 'ebook', is_active: true, sort_order: String(sort), cover_url: '',
  file_path: '', file_name: '', file_size: null, included_ids: [],
});

const toDraft = (p: AdminProduct): Draft => ({
  id: p.id,
  type: p.type === 'pack' ? 'pack' : 'ebook',
  title: p.title || '',
  slug: p.slug || '',
  subtitle: p.subtitle || '',
  short_description: p.short_description || '',
  description: p.description || '',
  highlights: (p.highlights || []).join('\n'),
  pages: p.pages ? String(p.pages) : '',
  price: centsToInput(p.price_cents),
  compare: centsToInput(p.compare_at_cents),
  badge: p.badge || '',
  is_new: !!p.is_new,
  is_active: p.is_active !== false,
  sort_order: String(p.sort_order ?? 0),
  cover_url: p.cover_url || '',
  file_path: p.file_path || '',
  file_name: p.file_name || '',
  file_size: p.file_size,
  included_ids: p.included_ids || [],
});

function Editor({ initial, ctx, onClose }: { initial: Draft; ctx: AdminCtx; onClose: () => void }) {
  const [d, setD] = useState<Draft>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [failure, setFailure] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<'pdf' | 'cover' | null>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);
  const ebooks = ctx.data.products.filter((p) => p.type !== 'pack');
  const isPack = d.type === 'pack';

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => {
    setD((prev) => ({ ...prev, [key]: value }));
    setErrors((er) => ({ ...er, [key]: '' }));
  };
  const text = (key: keyof Draft) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value as never);

  const onPdf = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) return setErrors((er) => ({ ...er, file: 'Le fichier doit être au format PDF.' }));
    if (file.size > 50 * 1024 * 1024) return setErrors((er) => ({ ...er, file: 'Le fichier dépasse 50 Mo. Compressez votre PDF puis réessayez.' }));
    setUploading('pdf');
    setErrors((er) => ({ ...er, file: '' }));
    try {
      const signed = await uploadFile('pdf', file);
      setD((prev) => ({ ...prev, file_path: signed.path, file_name: file.name, file_size: file.size }));
    } catch (err) {
      setErrors((er) => ({ ...er, file: err instanceof Error ? err.message : 'L’envoi du fichier a échoué.' }));
    } finally {
      setUploading(null);
    }
  };

  const onCover = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/\.(jpe?g|png|webp)$/i.test(file.name)) return setErrors((er) => ({ ...er, cover: 'L’image doit être au format JPG, PNG ou WebP.' }));
    if (file.size > 8 * 1024 * 1024) return setErrors((er) => ({ ...er, cover: 'L’image dépasse 8 Mo.' }));
    setUploading('cover');
    setErrors((er) => ({ ...er, cover: '' }));
    try {
      const signed = await uploadFile('cover', file);
      if (signed.public_url) setD((prev) => ({ ...prev, cover_url: signed.public_url as string }));
    } catch (err) {
      setErrors((er) => ({ ...er, cover: err instanceof Error ? err.message : 'L’envoi de l’image a échoué.' }));
    } finally {
      setUploading(null);
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const price = parseEuro(d.price);
    const compare = d.compare.trim() ? parseEuro(d.compare) : null;
    const next: Record<string, string> = {};
    if (d.title.trim().length < 2) next.title = 'Le titre est obligatoire.';
    if (price === null) next.price = 'Indiquez un prix valide, par exemple 19,90.';
    if (d.compare.trim() && compare === null) next.compare = 'Indiquez un prix valide ou laissez vide.';
    if (compare !== null && price !== null && compare <= price) next.compare = 'Le prix barré doit être supérieur au prix de vente.';
    if (isPack && d.included_ids.length < 2) next.included = 'Sélectionnez au moins deux ebooks.';
    setErrors(next);
    setFailure('');
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      await adminCall('product.save', {
        product: {
          id: d.id,
          type: d.type,
          title: d.title,
          slug: d.slug,
          subtitle: d.subtitle,
          short_description: d.short_description,
          description: d.description,
          highlights: d.highlights.split('\n').map((h) => h.trim()).filter(Boolean),
          pages: d.pages,
          price_cents: price,
          compare_at_cents: compare,
          badge: d.badge,
          is_new: d.is_new,
          is_active: d.is_active,
          sort_order: d.sort_order,
          cover_url: d.cover_url,
          file_path: d.file_path,
          file_name: d.file_name,
          file_size: d.file_size,
          included_ids: d.included_ids,
        },
      });
      await ctx.reload();
      ctx.notify('ok', d.id ? 'Modifications enregistrées.' : isPack ? 'Pack créé.' : 'Ebook ajouté à la boutique.');
      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.fields || {});
        setFailure(err.message);
      } else setFailure('L’enregistrement a échoué. Merci de réessayer.');
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/50" role="dialog" aria-modal="true" aria-label={d.id ? 'Modifier' : 'Ajouter'}>
      <form onSubmit={submit} noValidate className="mx-auto my-0 min-h-full max-w-3xl bg-ivory shadow-2xl sm:my-8 sm:min-h-0">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-line bg-ivory px-5 py-4 sm:px-8">
          <h2 className="font-display text-[1.5rem] leading-tight text-ink">
            {d.id ? `Modifier ${isPack ? 'le pack' : 'l’ebook'}` : isPack ? 'Nouveau pack' : 'Nouvel ebook'}
          </h2>
          <button type="button" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-gold-light/60" aria-label="Fermer">
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="space-y-8 px-5 py-6 sm:px-8">
          <section className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="p-title" className="label">Titre</label>
              <input id="p-title" className="field" value={d.title} onChange={text('title')} aria-invalid={!!errors.title} />
              <FieldError message={errors.title} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-subtitle" className="label">Sous-titre</label>
              <input id="p-subtitle" className="field" value={d.subtitle} onChange={text('subtitle')} />
            </div>
            <div>
              <label htmlFor="p-price" className="label">Prix de vente (€)</label>
              <input id="p-price" className="field" inputMode="decimal" placeholder="19,90" value={d.price} onChange={text('price')} aria-invalid={!!errors.price} />
              <FieldError message={errors.price} />
            </div>
            <div>
              <label htmlFor="p-compare" className="label">Prix barré (€) <span className="normal-case tracking-normal">— facultatif</span></label>
              <input id="p-compare" className="field" inputMode="decimal" placeholder={isPack ? 'Calculé automatiquement' : ''} value={d.compare} onChange={text('compare')} aria-invalid={!!errors.compare} />
              <FieldError message={errors.compare} />
              {isPack && <p className="mt-1.5 text-sm font-light text-ink-soft">Laissé vide, le prix barré est la somme des ebooks du pack.</p>}
            </div>
          </section>

          {isPack && (
            <section>
              <p className="label">Ebooks inclus dans le pack</p>
              <div className="space-y-2">
                {ebooks.length === 0 && <p className="font-light text-ink-soft">Créez d’abord vos ebooks.</p>}
                {ebooks.map((b) => (
                  <label key={b.id} className="flex min-h-[3rem] cursor-pointer items-center gap-3 border border-line bg-white px-4">
                    <input
                      type="checkbox"
                      className="h-5 w-5 accent-[#86621f]"
                      checked={d.included_ids.includes(b.id)}
                      onChange={(e) => set('included_ids', e.target.checked ? [...d.included_ids, b.id] : d.included_ids.filter((x) => x !== b.id))}
                    />
                    <span className="flex-1 text-ink">{b.title}</span>
                    <span className="text-ink-soft">{euro(b.price_cents)}</span>
                  </label>
                ))}
              </div>
              <FieldError message={errors.included} />
            </section>
          )}

          <section className="space-y-5">
            <div>
              <label htmlFor="p-short" className="label">Résumé court</label>
              <textarea id="p-short" rows={3} className="field resize-y" value={d.short_description} onChange={text('short_description')} />
              <p className="mt-1.5 text-sm font-light text-ink-soft">Affiché sur les cartes de la boutique et en haut de la fiche.</p>
            </div>
            <div>
              <label htmlFor="p-desc" className="label">Description détaillée</label>
              <textarea id="p-desc" rows={7} className="field resize-y" value={d.description} onChange={text('description')} />
              <p className="mt-1.5 text-sm font-light text-ink-soft">Laissez une ligne vide entre deux paragraphes.</p>
            </div>
            <div>
              <label htmlFor="p-high" className="label">Points forts</label>
              <textarea id="p-high" rows={5} className="field resize-y" value={d.highlights} onChange={text('highlights')} />
              <p className="mt-1.5 text-sm font-light text-ink-soft">Un point fort par ligne.</p>
            </div>
          </section>

          <section className="grid gap-6 sm:grid-cols-2">
            <div>
              <p className="label">Couverture</p>
              <div className="flex items-start gap-4">
                <div className="flex aspect-[2/3] w-24 shrink-0 items-center justify-center overflow-hidden border border-line bg-cream">
                  {d.cover_url ? <img src={d.cover_url} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-6 w-6 text-sand" strokeWidth={1.3} />}
                </div>
                <div className="min-w-0 flex-1">
                  <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onCover} />
                  <button type="button" onClick={() => coverInput.current?.click()} className="btn-outline btn-sm w-full" disabled={uploading !== null}>
                    {uploading === 'cover' ? <><Spinner className="h-4 w-4" /> Envoi…</> : <><Upload className="h-4 w-4" strokeWidth={1.5} /> {d.cover_url ? 'Remplacer' : 'Importer'}</>}
                  </button>
                  <p className="mt-2 text-sm font-light text-ink-soft">
                    {isPack ? 'Facultatif : sans image, le pack affiche les couvertures des ebooks inclus.' : 'JPG, PNG ou WebP — format portrait 2:3 conseillé.'}
                  </p>
                  {d.cover_url && (
                    <button type="button" onClick={() => set('cover_url', '')} className="mt-1 py-1.5 text-sm text-danger underline-offset-4 hover:underline">Retirer l’image</button>
                  )}
                  <FieldError message={errors.cover} />
                </div>
              </div>
            </div>

            {!isPack && (
              <div>
                <p className="label">Fichier PDF de l’ebook</p>
                <div className={`border p-4 ${d.file_path ? 'border-[#bcd6c2] bg-[#eef6f0]' : 'border-gold/60 bg-gold-light/30'}`}>
                  {d.file_path ? (
                    <p className="flex items-start gap-2.5 text-[#2f5a3c]">
                      <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
                      <span className="min-w-0 break-all">{d.file_name || 'Fichier PDF'}{d.file_size ? ` · ${formatSize(d.file_size)}` : ''}</span>
                    </p>
                  ) : (
                    <p className="flex items-start gap-2.5 text-ink">
                      <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-gold-deep" strokeWidth={1.5} />
                      Aucun fichier : vos clients ne pourront pas télécharger cet ebook.
                    </p>
                  )}
                  <input ref={pdfInput} type="file" accept="application/pdf,.pdf" className="hidden" onChange={onPdf} />
                  <button type="button" onClick={() => pdfInput.current?.click()} className="btn-outline btn-sm mt-3 w-full !bg-white" disabled={uploading !== null}>
                    {uploading === 'pdf' ? <><Spinner className="h-4 w-4" /> Envoi en cours…</> : <><Upload className="h-4 w-4" strokeWidth={1.5} /> {d.file_path ? 'Remplacer le PDF' : 'Importer le PDF'}</>}
                  </button>
                </div>
                <p className="mt-2 text-sm font-light text-ink-soft">PDF, 50 Mo maximum. Le fichier est stocké de façon privée et sécurisée.</p>
                <FieldError message={errors.file} />
              </div>
            )}
          </section>

          <section className="grid gap-5 sm:grid-cols-3">
            {!isPack && (
              <div>
                <label htmlFor="p-pages" className="label">Nombre de pages</label>
                <input id="p-pages" className="field" inputMode="numeric" value={d.pages} onChange={text('pages')} />
              </div>
            )}
            <div>
              <label htmlFor="p-badge" className="label">Étiquette</label>
              <input id="p-badge" className="field" placeholder="Édition Prestige 2026" value={d.badge} onChange={text('badge')} />
            </div>
            <div>
              <label htmlFor="p-sort" className="label">Ordre d’affichage</label>
              <input id="p-sort" className="field" inputMode="numeric" value={d.sort_order} onChange={text('sort_order')} />
            </div>
            <div className="sm:col-span-3">
              <label htmlFor="p-slug" className="label">Adresse de la page <span className="normal-case tracking-normal">— facultatif</span></label>
              <input id="p-slug" className="field" placeholder="Générée à partir du titre" value={d.slug} onChange={text('slug')} />
            </div>
            <label className="flex min-h-[3rem] cursor-pointer items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-[#86621f]" checked={d.is_active} onChange={(e) => set('is_active', e.target.checked)} />
              <span className="text-ink">Visible dans la boutique</span>
            </label>
            <label className="flex min-h-[3rem] cursor-pointer items-center gap-3">
              <input type="checkbox" className="h-5 w-5 accent-[#86621f]" checked={d.is_new} onChange={(e) => set('is_new', e.target.checked)} />
              <span className="text-ink">Afficher « Nouveauté »</span>
            </label>
          </section>

          {failure && <p className="border border-rose bg-rose-soft px-4 py-3 text-danger" role="alert">{failure}</p>}
        </div>

        <div className="sticky bottom-0 flex flex-col-reverse gap-3 border-t border-line bg-ivory px-5 py-4 sm:flex-row sm:justify-end sm:px-8">
          <button type="button" onClick={onClose} className="btn-outline btn-sm">Annuler</button>
          <button type="submit" className="btn-gold btn-sm" disabled={saving || uploading !== null}>
            {saving ? <><Spinner className="h-4 w-4" /> Enregistrement…</> : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function AdminProducts(ctx: AdminCtx) {
  const { data, run, notify } = ctx;
  const [draft, setDraft] = useState<Draft | null>(null);
  const nextSort = Math.max(0, ...data.products.map((p) => p.sort_order || 0)) + 1;

  const preview = async (id: number) => {
    try {
      const { url } = await adminCall<{ url: string }>('file.preview', { id });
      window.open(url, '_blank', 'noopener');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Fichier indisponible.');
    }
  };

  return (
    <>
      <SectionTitle
        title="Ebooks"
        hint="Modifiez les prix et les descriptions, importez vos PDF et ajoutez de nouveaux ebooks ou packs."
        action={
          <div className="flex flex-col gap-2 sm:flex-row">
            <button type="button" onClick={() => setDraft(emptyDraft('pack', nextSort))} className="btn-outline btn-sm">
              <Plus className="h-4 w-4" strokeWidth={1.6} /> Nouveau pack
            </button>
            <button type="button" onClick={() => setDraft(emptyDraft('ebook', nextSort))} className="btn-gold btn-sm">
              <Plus className="h-4 w-4" strokeWidth={1.6} /> Ajouter un ebook
            </button>
          </div>
        }
      />

      {data.products.length === 0 ? (
        <Empty>Aucun ebook pour le moment. Ajoutez votre premier ebook pour ouvrir la boutique.</Empty>
      ) : (
        <ul className="space-y-4">
          {data.products.map((p) => {
            const isPack = p.type === 'pack';
            const included = (p.included_ids || []).map((id) => data.products.find((x) => x.id === id)?.title).filter(Boolean);
            return (
              <li key={p.id} className={`${card} flex flex-col gap-5 md:flex-row md:items-center`}>
                <div className="flex min-w-0 flex-1 items-center gap-5">
                  <div className="flex aspect-[2/3] w-16 shrink-0 items-center justify-center overflow-hidden border border-line bg-cream">
                    {p.cover_url ? <img src={p.cover_url} alt="" className="h-full w-full object-cover" /> : <span className="text-[0.6rem] uppercase tracking-widest text-ink-soft">{isPack ? 'Pack' : 'PDF'}</span>}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap gap-2">
                      <Pill tone={isPack ? 'bg-rose text-ink' : 'bg-beige text-ink'}>{isPack ? 'Pack' : 'Ebook'}</Pill>
                      <Pill tone={p.is_active ? 'bg-[#dcebdf] text-[#2f5a3c]' : 'bg-beige text-ink-soft'}>{p.is_active ? 'En ligne' : 'Masqué'}</Pill>
                      {!isPack && (
                        <Pill tone={p.file_path ? 'bg-[#dcebdf] text-[#2f5a3c]' : 'bg-danger text-white'}>{p.file_path ? 'PDF en ligne' : 'PDF manquant'}</Pill>
                      )}
                    </div>
                    <p className="mt-2 font-display text-[1.25rem] leading-tight text-ink">{p.title}</p>
                    <p className="mt-1 text-sm font-light text-ink-soft">
                      {isPack
                        ? `Contient : ${included.join(' + ') || 'aucun ebook'}`
                        : `${p.pages ? `${p.pages} pages · ` : ''}${p.sales_count || 0} vente${(p.sales_count || 0) > 1 ? 's' : ''}`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 md:justify-end">
                  <p className="mr-2 font-display text-[1.5rem] text-ink">{euro(p.price_cents)}</p>
                  {!isPack && p.file_path && (
                    <button type="button" onClick={() => preview(p.id)} className="btn-outline btn-sm" aria-label={`Voir le PDF de ${p.title}`}>
                      <Eye className="h-4 w-4" strokeWidth={1.5} /> PDF
                    </button>
                  )}
                  <button type="button" onClick={() => setDraft(toDraft(p))} className="btn-outline btn-sm">
                    <Pencil className="h-4 w-4" strokeWidth={1.5} /> Modifier
                  </button>
                  <ConfirmButton onConfirm={() => run('product.delete', { id: p.id }, 'Supprimé.')}>Supprimer</ConfirmButton>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {draft && <Editor key={draft.id ?? `new-${draft.type}`} initial={draft} ctx={ctx} onClose={() => setDraft(null)} />}
    </>
  );
}
