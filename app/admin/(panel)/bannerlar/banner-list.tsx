"use client";

import Link from "next/link";
import { useTransition } from "react";
import { SortableList } from "@/components/admin/sortable-list";
import { useToast } from "@/components/admin/toast";
import { Badge, ButtonLink, Thumb } from "@/components/admin/ui";
import { toggleBannerAction } from "./actions";

export type BannerRow = {
  id: string;
  title: string | null;
  image: string;
  hasMobile: boolean;
  target: string | null;
  is_active: boolean;
};

export function BannerList({ banners }: { banners: BannerRow[] }) {
  return (
    <SortableList
      table="banners"
      items={banners}
      getLabel={(b) => b.title ?? "Başlıksız banner"}
      emptyTitle="Henüz banner eklenmemiş."
      emptyAction={
        <ButtonLink href="/admin/bannerlar/yeni" variant="primary">
          + İlk bannerı ekle
        </ButtonLink>
      }
      renderItem={(b) => <Row banner={b} />}
    />
  );
}

function Row({ banner }: { banner: BannerRow }) {
  const [pending, start] = useTransition();
  const push = useToast();
  return (
    <div className="flex flex-col gap-3 px-3 py-2.5 sm:flex-row sm:items-center">
      <Thumb src={banner.image} className="aspect-[3/1] w-full shrink-0 rounded border border-rule sm:w-40" />
      <div className="min-w-0 flex-1">
        <Link href={`/admin/bannerlar/${banner.id}`} className="block truncate font-medium hover:underline">
          {banner.title ?? <span className="text-muted italic">Başlıksız banner</span>}
        </Link>
        <p className="truncate text-[13px] text-muted">{banner.target ? `→ ${banner.target}` : "Bağlantı yok"}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {banner.is_active ? <Badge tone="green">Yayında</Badge> : <Badge>Gizli</Badge>}
          {!banner.hasMobile && <Badge tone="amber">Mobil görsel yok</Badge>}
        </div>
      </div>
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const res = await toggleBannerAction(banner.id, !banner.is_active);
              push(res.status === "error" ? "error" : "success", res.message ?? "");
            })
          }
          className="rounded-md px-2 py-1 text-xs text-muted hover:bg-paper-2 hover:text-ink disabled:opacity-50"
        >
          {pending ? "…" : banner.is_active ? "Gizle" : "Yayına al"}
        </button>
        <ButtonLink href={`/admin/bannerlar/${banner.id}`} size="sm">
          Düzenle
        </ButtonLink>
      </div>
    </div>
  );
}
