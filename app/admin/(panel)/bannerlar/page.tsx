import type { Metadata } from "next";
import { Suspense } from "react";
import { Flash } from "@/components/admin/toast";
import { ButtonLink, LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import type { Banner } from "@/lib/types";
import { BannerList, type BannerRow } from "./banner-list";
import { MAX_ACTIVE } from "./constants";

export const metadata: Metadata = { title: "Bannerlar" };

export default function BannersPage({ searchParams }: PageProps<"/admin/bannerlar">) {
  return (
    <>
      <PageHeader
        title="Bannerlar"
        description="Ana sayfanın üstündeki kayan banner. Yayındaki bannerlar bu sırayla döner; en fazla 3–4 banner önerilir."
        actions={
          <ButtonLink href="/admin/bannerlar/yeni" variant="primary">
            + Yeni banner
          </ButtonLink>
        }
      />
      <Suspense fallback={<LoadingBlock rows={4} />}>
        <Banners searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Banners({ searchParams }: { searchParams: PageProps<"/admin/bannerlar">["searchParams"] }) {
  const { supabase } = await adminDb();
  const [{ data, error }, sp] = await Promise.all([
    supabase.from("banners").select("*, book:books(title)").order("sort_order"),
    searchParams,
  ]);
  if (error) return <Notice tone="error">Bannerlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  const rows = (data ?? []) as (Banner & { book: { title: string } | null })[];
  const banners: BannerRow[] = rows.map((b) => ({
    id: b.id,
    title: b.title_tr,
    image: b.image_desktop_url,
    hasMobile: Boolean(b.image_mobile_url),
    target: b.book ? `Kitap: ${b.book.title}` : b.link_url,
    is_active: b.is_active,
  }));
  const active = banners.filter((b) => b.is_active).length;
  return (
    <>
      <Flash code={typeof sp.durum === "string" ? sp.durum : null} />
      {active > MAX_ACTIVE && (
        <Notice tone="warning" className="mb-4">
          {active} banner yayında. Ana sayfanın sade kalması için en fazla 3–4 banner önerilir; bazılarını gizleyebilirsiniz.
        </Notice>
      )}
      {active === 0 && banners.length > 0 && (
        <Notice tone="info" className="mb-4">
          Yayında banner yok; ana sayfada banner alanı gösterilmeyecek.
        </Notice>
      )}
      <BannerList banners={banners} />
    </>
  );
}
