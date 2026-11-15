import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useShop } from '../lib/store';
import { useSeo } from '../lib/seo';
import { ErrorNotice, PageHero, PageLoader } from '../components/ui';

export default function FaqPage() {
  const { faqs, loading, error, reload } = useShop();
  useSeo('FAQ – Questions fréquentes', 'Format PDF, paiement, téléchargement, remboursement : toutes les réponses à vos questions sur les ebooks MHB Cake Design – Pâtissier.');

  const groups: { category: string; items: typeof faqs }[] = [];
  for (const f of faqs) {
    const category = f.category || 'Questions fréquentes';
    const group = groups.find((g) => g.category === category);
    if (group) group.items.push(f);
    else groups.push({ category, items: [f] });
  }

  return (
    <>
      <PageHero eyebrow="Aide" title="Questions fréquentes" intro="Tout ce qu’il faut savoir sur nos ebooks, la commande et le téléchargement." />
      <section className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
        {loading ? (
          <PageLoader />
        ) : error ? (
          <ErrorNotice message={error} onRetry={reload} />
        ) : groups.length === 0 ? (
          <p className="text-center font-light text-ink-soft">Aucune question n’a encore été publiée. N’hésitez pas à nous écrire.</p>
        ) : (
          <div className="space-y-12">
            {groups.map((g) => (
              <div key={g.category}>
                <h2 className="text-[0.72rem] font-medium uppercase tracking-[0.3em] text-gold-deep">{g.category}</h2>
                <div className="mt-4 divide-y divide-line border-y border-line">
                  {g.items.map((f) => (
                    <details key={f.id} className="group">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-display text-[1.18rem] leading-snug text-ink [&::-webkit-details-marker]:hidden">
                        {f.question}
                        <ChevronDown className="h-5 w-5 shrink-0 text-gold transition-transform duration-300 group-open:rotate-180" strokeWidth={1.5} />
                      </summary>
                      <p className="whitespace-pre-line pb-6 pr-8 font-light leading-relaxed text-ink-soft">{f.answer}</p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-14 border border-line bg-white/70 p-8 text-center">
          <p className="font-display text-[1.5rem] text-ink">Vous n’avez pas trouvé votre réponse ?</p>
          <p className="mt-2 font-light text-ink-soft">Notre service client est à votre écoute.</p>
          <Link to="/contact" className="btn-gold mt-6">Nous contacter</Link>
        </div>
      </section>
    </>
  );
}
