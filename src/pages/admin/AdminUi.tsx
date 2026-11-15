import { useEffect, useState, type ReactNode } from 'react';

export const card = 'border border-line bg-white p-5 sm:p-6';

/** Bouton à double confirmation pour les actions irréversibles. */
export function ConfirmButton({
  onConfirm,
  children,
  confirmLabel = 'Confirmer ?',
  className = '',
  disabled = false,
}: {
  onConfirm: () => void;
  children: ReactNode;
  confirmLabel?: string;
  className?: string;
  disabled?: boolean;
}) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (armed) {
          setArmed(false);
          onConfirm();
        } else setArmed(true);
      }}
      className={`inline-flex min-h-[2.75rem] items-center justify-center gap-2 border px-4 text-[0.72rem] font-medium uppercase tracking-[0.16em] transition-colors disabled:opacity-50 ${
        armed ? 'border-danger bg-danger text-white' : 'border-line text-danger hover:border-danger'
      } ${className}`}
    >
      {armed ? confirmLabel : children}
    </button>
  );
}

export function Pill({ children, tone }: { children: ReactNode; tone: string }) {
  return <span className={`inline-block whitespace-nowrap px-2.5 py-1 text-[0.64rem] font-medium uppercase tracking-[0.14em] ${tone}`}>{children}</span>;
}

export function SectionTitle({ title, hint, action }: { title: string; hint?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="font-display text-[1.9rem] leading-tight text-ink">{title}</h1>
        {hint && <p className="mt-1 max-w-2xl font-light text-ink-soft">{hint}</p>}
      </div>
      {action}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="border border-dashed border-sand bg-white/60 px-6 py-12 text-center font-light text-ink-soft">{children}</div>;
}
