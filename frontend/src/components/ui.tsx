import {
  forwardRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type PropsWithChildren,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from 'react';
import { cn } from '@/lib/utils';

export const Button = ({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-full px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
      variant === 'primary' && 'bg-accent text-white hover:bg-accentDark',
      variant === 'secondary' && 'border border-[#d6c4a6] bg-white/85 text-ink hover:border-accent/40 hover:bg-white',
      variant === 'ghost' && 'bg-transparent text-ink hover:bg-white/70',
      variant === 'danger' && 'bg-danger text-white hover:bg-[#8b3026]',
      className
    )}
    {...props}
  />
);

export const Panel = ({ className, children }: PropsWithChildren<{ className?: string }>) => (
  <section className={cn('glass-panel rounded-[2rem] p-6', className)}>{children}</section>
);

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  action
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
    <div>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-accent">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 font-display text-3xl text-ink">{title}</h2>
      {description ? <p className="mt-2 max-w-2xl text-sm text-[#5d584d]">{description}</p> : null}
    </div>
    {action}
  </div>
);

export const StatCard = ({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) => (
  <div className="rounded-[1.75rem] border border-white/60 bg-white/70 p-5">
    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7b6f5b]">{label}</p>
    <p className="mt-4 font-display text-4xl text-ink">{value}</p>
    <p className="mt-2 text-sm text-[#5d584d]">{hint}</p>
  </div>
);

export const Badge = ({
  children,
  tone = 'neutral',
  className
}: PropsWithChildren<{
  tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger';
  className?: string;
}>) => (
  <span
    className={cn(
      'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]',
      tone === 'neutral' && 'bg-[#eee0c8] text-[#5d584d]',
      tone === 'accent' && 'bg-accent/10 text-accent',
      tone === 'success' && 'bg-success/10 text-success',
      tone === 'warning' && 'bg-sunrise/40 text-accentDark',
      tone === 'danger' && 'bg-danger/10 text-danger',
      className
    )}
  >
    {children}
  </span>
);

export const Modal = ({
  open,
  title,
  description,
  onClose,
  children,
  footer
}: PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
}>) => {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#1f241f]/45 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-[2rem] border border-white/60 bg-card p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-3xl text-ink">{title}</h3>
            {description ? <p className="mt-2 text-sm text-[#5d584d]">{description}</p> : null}
          </div>
          <button
            type="button"
            className="rounded-full border border-[#d6c4a6] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#5d584d]"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 flex flex-wrap gap-3">{footer}</div> : null}
      </div>
    </div>
  );
};

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn('input-base', className)}
    {...props}
  />
));

Input.displayName = 'Input';

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn('input-base', className)}
    {...props}
  />
));

Select.displayName = 'Select';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn('input-base min-h-28 resize-y', className)}
    {...props}
  />
));

Textarea.displayName = 'Textarea';

export const Field = ({
  label,
  hint,
  children
}: PropsWithChildren<{
  label: string;
  hint?: string;
}>) => (
  <label className="block">
    <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
    {children}
    {hint ? <span className="mt-2 block text-xs text-[#7b7568]">{hint}</span> : null}
  </label>
);

export const EmptyState = ({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) => (
  <div className="rounded-[1.75rem] border border-dashed border-[#d7c7ab] bg-white/60 p-8 text-center">
    <h3 className="font-display text-2xl text-ink">{title}</h3>
    <p className="mx-auto mt-3 max-w-xl text-sm text-[#5d584d]">{description}</p>
    {action ? <div className="mt-5">{action}</div> : null}
  </div>
);

export const Spinner = ({ label = 'Loading' }: { label?: string }) => (
  <div className="flex items-center gap-3 text-sm text-[#5d584d]">
    <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/20 border-t-accent" />
    <span>{label}</span>
  </div>
);

export const SkeletonBlock = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-2xl bg-[#eadcc2]', className)} />
);
