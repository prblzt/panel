import type { ReactNode } from "react";
import type React from "react";

export function Screen({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-8 pt-2 md:px-8 md:pt-7">
      <header className="mb-5 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="large-title text-ink">{title}</h1>
          {subtitle ? <p className="mt-0.5 text-[15px] text-muted">{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`overflow-hidden rounded-[10px] bg-surface ${className}`}>{children}</section>;
}

export function Row({
  children,
  last = false,
}: {
  children: ReactNode;
  last?: boolean;
}) {
  return <div className={`flex items-center gap-3 px-4 py-3 ${last ? "" : "border-b border-line"}`}>{children}</div>;
}

const fieldClass =
  "h-11 w-full rounded-[10px] bg-surface px-3 text-[17px] text-ink shadow-[inset_0_0_0_0.5px_var(--color-line)] outline-none focus:shadow-[inset_0_0_0_2px_var(--color-apple)]";

export function Field({
  label,
  ...props
}: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-muted">{label}</span>
      <input className={fieldClass} {...props} />
    </label>
  );
}

export function TextArea({
  label,
  ...props
}: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-muted">{label}</span>
      <textarea className={`${fieldClass} h-28 resize-none py-3`} {...props} />
    </label>
  );
}

export function SelectField({
  label,
  children,
  ...props
}: { label: string; children: ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] text-muted">{label}</span>
      <select className={fieldClass} {...props}>
        {children}
      </select>
    </label>
  );
}

export function Sheet({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 backdrop-blur-[2px] md:items-center" onClick={onClose}>
      <div
        className="max-h-[88dvh] w-full max-w-lg overflow-y-auto rounded-t-[38px] bg-canvas p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl md:rounded-[28px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-3 h-[5px] w-9 rounded-full bg-raised md:hidden" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-[17px] font-semibold text-ink">{title}</h2>
          <button type="button" onClick={onClose} className="text-[17px] text-apple">
            Fermer
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`h-11 rounded-full bg-apple px-4 text-[15px] font-semibold text-white disabled:opacity-40 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
