import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { BannerForm } from "../banner-form";
import { getBookChoices } from "../queries";

export const metadata: Metadata = { title: "Yeni banner" };

export default function NewBannerPage() {
  return (
    <>
      <PageHeader title="Yeni banner" back={{ href: "/admin/bannerlar", label: "Bannerlar" }} />
      <Suspense fallback={<LoadingBlock rows={6} />}>
        <NewBanner />
      </Suspense>
    </>
  );
}

async function NewBanner() {
  const { supabase } = await adminDb();
  const [books, active] = await Promise.all([
    getBookChoices(supabase),
    supabase.from("banners").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);
  return <BannerForm banner={null} books={books} otherActive={active.count ?? 0} />;
}
