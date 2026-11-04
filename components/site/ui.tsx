import Link from "next/link";
import { Fragment } from "react";

export function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1320px] px-4 sm:px-8 ${className}`}>{children}</div>;
}

export function SectionHeading({
  title,
  href,
  linkLabel,
  as: As = "h2",
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-10 flex items-end justify-between gap-6 border-b border-rule pb-4">
      <As className="display text-4xl sm:text-5xl">{title}</As>
      {href && linkLabel && (
        <Link href={href} className="label shrink-0 pb-1 hover:underline underline-offset-4">
          {linkLabel} <span aria-hidden>→</span>
        </Link>
      )}
    </div>
  );
}

export function PageHeader({ eyebrow, title, children }: { eyebrow?: string; title: string; children?: React.ReactNode }) {
  return (
    <header className="pt-12 pb-10 sm:pt-16 sm:pb-12">
      {eyebrow && <p className="label text-muted">{eyebrow}</p>}
      <h1 className="display mt-3 text-[clamp(3rem,8vw,6.5rem)]">{title}</h1>
      {children}
    </header>
  );
}

/**
 * Panelde girilen düz metni biçimlendirir:
 * boş satır → paragraf, "## " ile başlayan satır → ara başlık, tek satır sonu → <br>.
 */
export function RichText({ text, className = "" }: { text: string | null | undefined; className?: string }) {
  if (!text) return null;
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <div className={`space-y-5 ${className}`}>
      {blocks.map((block, i) =>
        block.startsWith("## ") ? (
          <h2 key={i} className="pt-4 font-serif text-2xl font-medium text-ink">
            {block.slice(3)}
          </h2>
        ) : (
          <p key={i}>
            {block.split("\n").map((line, j, arr) => (
              <Fragment key={j}>
                {line}
                {j < arr.length - 1 && <br />}
              </Fragment>
            ))}
          </p>
        ),
      )}
    </div>
  );
}

export function ButtonLink({
  href,
  children,
  variant = "solid",
  external,
}: {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "outline";
  external?: boolean;
}) {
  const cls =
    variant === "solid"
      ? "bg-ink text-paper hover:bg-ink-2"
      : "border border-ink text-ink hover:bg-ink hover:text-paper";
  const props = external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <Link href={href} {...props} className={`label inline-flex h-11 items-center gap-2 px-5 transition-colors ${cls}`}>
      {children}
    </Link>
  );
}
