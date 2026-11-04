import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { formatDate, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { PAGE_LABELS } from "./constants";

export const metadata: Metadata = { title: "Sayfalar" };

export default function PagesPage() {
  return (
    <>
      <PageHeader title="Sayfalar" description="Hakkımızda ve yasal metinler. Her sayfanın Türkçe ve İngilizce metni ayrı girilir." />
      <Suspense fallback={<LoadingBlock rows={4} />}>
        <PageList />
      </Suspense>
    </>
  );
}

async function PageList() {
  const { supabase } = await adminDb();
  const { data, error } = await supabase.from("pages").select("slug, title_tr, title_en, body_tr, body_en, updated_at");
  if (error) return <Notice tone="error">Sayfalar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  const rows = (data ?? []) as { slug: string; title_tr: string; title_en: string; body_tr: string | null; body_en: string | null; updated_at: string }[];
  const order = Object.keys(PAGE_LABELS);
  const rank = (slug: string) => (order.includes(slug) ? order.indexOf(slug) : 99);
  rows.sort((a, b) => rank(a.slug) - rank(b.slug));
  if (rows.length === 0) return <Notice tone="warning">Düzenlenecek sayfa bulunamadı.</Notice>;
  return (
    <ul className="divide-y divide-rule overflow-hidden rounded-lg border border-rule bg-white">
      {rows.map((p) => (
        <li key={p.slug}>
          <Link href={`/admin/sayfalar/${p.slug}`} className="flex items-center gap-4 px-4 py-3 hover:bg-paper/40">
            <div className="min-w-0 flex-1">
              <p className="font-medium">{PAGE_LABELS[p.slug]?.label ?? p.title_tr}</p>
              <p className="truncate text-[13px] text-muted">
                {p.title_tr} / {p.title_en}
                {(!p.body_tr || !p.body_en) && <span className="text-amber-700"> · {!p.body_tr ? "TR" : "EN"} metni boş</span>}
              </p>
            </div>
            <span className="hidden text-xs text-muted sm:block">Güncellendi: {formatDate(p.updated_at)}</span>
            <span aria-hidden className="text-muted">→</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
