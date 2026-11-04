"use client";

import Link from "next/link";
import { useTransition } from "react";
import { SortableList } from "@/components/admin/sortable-list";
import { useToast } from "@/components/admin/toast";
import { Badge, ButtonLink, Thumb } from "@/components/admin/ui";
import { toggleFeaturedAuthorAction } from "./actions";

export type AuthorRow = { id: string; name: string; slug: string; photo_url: string | null; featured: boolean; books: number };

export function AuthorList({ authors }: { authors: AuthorRow[] }) {
  return (
    <SortableList
      table="authors"
      items={authors}
      getLabel={(a) => a.name}
      search={{ placeholder: "Yazar ara…", getText: (a) => `${a.name} ${a.slug}` }}
      emptyTitle="Henüz yazar eklenmemiş."
      emptyAction={
        <ButtonLink href="/admin/yazarlar/yeni" variant="primary">
          + İlk yazarı ekle
        </ButtonLink>
      }
      renderItem={(a) => <Row author={a} />}
    />
  );
}

function Row({ author }: { author: AuthorRow }) {
  const [pending, start] = useTransition();
  const push = useToast();
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <Thumb src={author.photo_url} className="size-10 shrink-0 rounded-full border border-rule" />
      <div className="min-w-0 flex-1">
        <Link href={`/admin/yazarlar/${author.id}`} className="block truncate font-medium hover:underline">
          {author.name}
        </Link>
        <p className="text-[13px] text-muted">{author.books ? `${author.books} kitap` : "Kitabı yok"}</p>
      </div>
      {author.featured && <Badge tone="blue">Ana sayfada</Badge>}
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const res = await toggleFeaturedAuthorAction(author.id, !author.featured);
            push(res.status === "error" ? "error" : "success", res.message ?? "");
          })
        }
        className="hidden shrink-0 rounded-md px-2 py-1 text-xs text-muted hover:bg-paper-2 hover:text-ink disabled:opacity-50 sm:block"
      >
        {pending ? "…" : author.featured ? "Ana sayfadan kaldır" : "Ana sayfada göster"}
      </button>
      <ButtonLink href={`/admin/yazarlar/${author.id}`} size="sm" className="shrink-0">
        Düzenle
      </ButtonLink>
    </div>
  );
}
