"use client";

import Link from "next/link";
import { useTransition } from "react";
import { SortableList } from "@/components/admin/sortable-list";
import { useToast } from "@/components/admin/toast";
import { Badge, ButtonLink, cx, Thumb } from "@/components/admin/ui";
import { togglePublishedAction } from "./actions";

export type BookRow = {
  id: string;
  title: string;
  slug: string;
  cover_url: string | null;
  cover_color: string;
  is_new: boolean;
  is_coming_soon: boolean;
  is_published: boolean;
  category: string | null;
  series: string | null;
  authors: string[];
};

export function BookList({ books }: { books: BookRow[] }) {
  return (
    <SortableList
      table="books"
      items={books}
      getLabel={(b) => b.title}
      search={{
        placeholder: "Kitap adı veya yazar ara…",
        getText: (b) => `${b.title} ${b.authors.join(" ")} ${b.slug}`,
      }}
      emptyTitle="Henüz kitap eklenmemiş."
      emptyAction={
        <ButtonLink href="/admin/kitaplar/yeni" variant="primary">
          + İlk kitabı ekle
        </ButtonLink>
      }
      renderItem={(b) => <Row book={b} />}
    />
  );
}

function Row({ book }: { book: BookRow }) {
  const [pending, start] = useTransition();
  const push = useToast();
  return (
    <div className={cx("flex items-center gap-3 px-3 py-2 sm:gap-4", !book.is_published && "bg-paper/50")}>
      <Thumb src={book.cover_url} color={book.cover_color} className="h-14 w-10 shrink-0 rounded-sm border border-rule" />
      <div className="min-w-0 flex-1">
        <Link href={`/admin/kitaplar/${book.id}`} className="block truncate font-medium text-ink hover:underline">
          {book.title}
        </Link>
        <p className="truncate text-[13px] text-muted">
          {book.authors.length ? book.authors.join(", ") : <span className="italic">Yazar yok</span>}
          {book.category && <> · {book.category}</>}
          {book.series && <> · {book.series}</>}
        </p>
        <div className="mt-1 flex flex-wrap gap-1 md:hidden">
          <Flags book={book} />
        </div>
      </div>
      <div className="hidden flex-wrap justify-end gap-1 md:flex">
        <Flags book={book} />
      </div>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await togglePublishedAction(book.id, !book.is_published);
            push(res.status === "error" ? "error" : "success", res.message ?? "");
          })
        }
        className="hidden shrink-0 rounded-md px-2 py-1 text-xs text-muted hover:bg-paper-2 hover:text-ink disabled:opacity-50 sm:block"
        aria-label={book.is_published ? `Yayından kaldır: ${book.title}` : `Yayına al: ${book.title}`}
      >
        {pending ? "…" : book.is_published ? "Yayından kaldır" : "Yayına al"}
      </button>
      <ButtonLink href={`/admin/kitaplar/${book.id}`} size="sm" className="shrink-0">
        Düzenle
      </ButtonLink>
    </div>
  );
}

function Flags({ book }: { book: BookRow }) {
  return (
    <>
      {book.is_published ? <Badge tone="green">Yayında</Badge> : <Badge>Taslak</Badge>}
      {book.is_new && <Badge tone="blue">Yeni</Badge>}
      {book.is_coming_soon && <Badge tone="amber">Yakında</Badge>}
    </>
  );
}
