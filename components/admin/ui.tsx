import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

/** Yönetim paneli temel görsel bileşenleri (hook içermez; sunucu ve istemcide kullanılabilir). */

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

type Variant = "primary" | "secondary" | "ghost" | "danger" | "danger-solid";
type Size = "sm" | "md";

export function buttonClass(variant: Variant = "secondary", size: Size = "md") {
  return cx(
    "inline-flex items-center justify-center gap-1.5 rounded-md font-medium whitespace-nowrap transition-colors",
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:opacity-50",
    size === "sm" ? "h-8 px-2.5 text-[13px]" : "h-10 px-4 text-sm",
    variant === "primary" && "bg-ink text-white hover:bg-ink-2",
    variant === "secondary" && "border border-rule bg-white text-ink hover:bg-paper-2",
    variant === "ghost" && "text-ink hover:bg-paper-2",
    variant === "danger" && "border border-red-200 bg-white text-red-700 hover:bg-red-50",
    variant === "danger-solid" && "bg-red-700 text-white hover:bg-red-800",
  );
}

export function ButtonLink({
  variant,
  size,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link {...props} className={cx(buttonClass(variant, size), className)} />;
}

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted hover:text-ink"
          >
            <span aria-hidden>←</span> {back.label}
          </Link>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({
  title,
  description,
  children,
  className,
  actions,
}: {
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}) {
  return (
    <section className={cx("rounded-lg border border-rule bg-white", className)}>
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 border-b border-rule px-4 py-3 sm:px-5">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-ink">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-muted">{description}</p>}
          </div>
          {actions}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-rule bg-white/60 px-6 py-12 text-center">
      <p className="font-medium text-ink">{title}</p>
      {children && <div className="mx-auto mt-1 max-w-md text-sm text-muted">{children}</div>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}

type Tone = "neutral" | "green" | "amber" | "blue" | "red";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded px-1.5 py-0.5 text-[11px] leading-4 font-medium",
        tone === "neutral" && "bg-paper-2 text-ink-2",
        tone === "green" && "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
        tone === "amber" && "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
        tone === "blue" && "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
        tone === "red" && "bg-red-50 text-red-700 ring-1 ring-red-200",
      )}
    >
      {children}
    </span>
  );
}

export function Notice({
  tone = "neutral",
  title,
  children,
  className,
}: {
  tone?: "neutral" | "info" | "warning" | "error" | "success";
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : undefined}
      className={cx(
        "rounded-md border px-3.5 py-2.5 text-sm",
        tone === "neutral" && "border-rule bg-paper-2/60 text-ink-2",
        tone === "info" && "border-sky-200 bg-sky-50 text-sky-900",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
        tone === "error" && "border-red-200 bg-red-50 text-red-800",
        tone === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
        className,
      )}
    >
      {title && <p className="font-medium">{title}</p>}
      {children && <div className={title ? "mt-0.5" : undefined}>{children}</div>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("animate-pulse rounded bg-paper-2", className)} />;
}

export function LoadingBlock({ rows = 5, label = "Yükleniyor…" }: { rows?: number; label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Yükleniyor…</span>
      <Skeleton className="mb-2 h-7 w-48" />
      <Skeleton className="mb-8 h-4 w-80 max-w-full" />
      <div className="space-y-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Önizleme görseli: blob: ve Storage adresleri için düz <img>. */
export function Thumb({
  src,
  alt = "",
  className,
  color,
}: {
  src: string | null | undefined;
  alt?: string;
  className?: string;
  color?: string;
}) {
  if (!src) {
    return (
      <div
        aria-hidden
        className={cx("flex items-center justify-center bg-paper-2 text-[10px] text-muted", className)}
        style={color ? { background: color } : undefined}
      >
        —
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={cx("object-cover", className)} />;
}

export function formatDate(iso: string | null | undefined, withTime = false) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
    timeZone: "Europe/Istanbul",
  });
}
