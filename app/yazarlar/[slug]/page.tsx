import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAuthor, getAuthors } from "@/lib/catalog";
import { CATEGORY_LABELS } from "@/lib/types";
import { Shelf } from "@/components/shelf";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const authors = await getAuthors();
  return authors.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) return {};
  return {
    title: author.name,
    description: author.bio ?? `${author.name} — Muhtelif Kitap'tan çıkan kitapları: ${author.books.map((b) => b.title).join(", ")}.`,
  };
}

export default function AuthorPage({ params }: Props) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1400px] px-4 pt-20 sm:px-8" aria-busy>
          <div className="h-28 w-2/3 animate-pulse bg-paper-2" />
        </div>
      }
    >
      <AuthorContent params={params} />
    </Suspense>
  );
}

async function AuthorContent({ params }: Props) {
  const { slug } = await params;
  const author = await getAuthor(slug);
  if (!author) notFound();

  const kinds = [...new Set(author.books.map((b) => CATEGORY_LABELS[b.category]))];

  return (
    <div className="mx-auto max-w-[1400px] px-4 sm:px-8">
      <nav aria-label="İçerik yolu" className="label pt-6 text-muted">
        <Link href="/yazarlar" className="hover:text-ink">Yazarlar</Link>
      </nav>
      <header className="grid gap-8 border-b border-ink pt-10 pb-10 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="label text-muted">{kinds.join(" · ")}</p>
          <h1 className="display mt-4 text-[clamp(3.5rem,10vw,9rem)]">{author.name}</h1>
        </div>
        <div className="self-end lg:col-span-4">
          {author.bio ? (
            <p className="text-xl leading-relaxed text-ink-2">{author.bio}</p>
          ) : (
            <p className="label text-muted">
              Muhtelif Kitap’tan {author.books.length} kitap
            </p>
          )}
        </div>
      </header>
      <Shelf books={author.books} />
    </div>
  );
}
