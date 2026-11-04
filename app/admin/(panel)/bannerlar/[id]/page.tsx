import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Flash } from "@/components/admin/toast";
import { LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { isUuid } from "@/lib/admin/form";
import type { Banner } from "@/lib/types";
import { BannerForm } from "../banner-form";
import { getBookChoices } from "../queries";

export const metadata: Metadata = { title: "Bannerı düzenle" };

export default function EditBannerPage({ params, searchParams }: PageProps<"/admin/bannerlar/[id]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Bannerı düzenle" back={{ href: "/admin/bannerlar", label: "Bannerlar" }} />
          <LoadingBlock rows={6} />
        </>
      }
    >
      <EditBanner params={params} searchParams={searchParams} />
    </Suspense>
  );
}

async function EditBanner({ params, searchParams }: Pick<PageProps<"/admin/bannerlar/[id]">, "params" | "searchParams">) {
  const [{ id }, sp, { supabase }] = await Promise.all([params, searchParams, adminDb()]);
  if (!isUuid(id)) notFound();
  const [banner, books, active] = await Promise.all([
    supabase.from("banners").select("*").eq("id", id).maybeSingle(),
    getBookChoices(supabase),
    supabase.from("banners").select("id", { count: "exact", head: true }).eq("is_active", true).neq("id", id),
  ]);
  if (banner.error) return <Notice tone="error">Banner yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  if (!banner.data) notFound();
  const b = banner.data as Banner;
  return (
    <>
      <Flash code={typeof sp.durum === "string" ? sp.durum : null} />
      <PageHeader title={b.title_tr || "Başlıksız banner"} back={{ href: "/admin/bannerlar", label: "Bannerlar" }} />
      <BannerForm key={b.id} banner={b} books={books} otherActive={active.count ?? 0} />
    </>
  );
}
