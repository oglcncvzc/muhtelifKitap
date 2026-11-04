import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import type { Settings } from "@/lib/types";
import { getBookChoices } from "../bannerlar/queries";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Site ayarları" };

export default function SettingsPage() {
  return (
    <>
      <PageHeader title="Site ayarları" description="Ana sayfa içerikleri, iletişim bilgileri ve sosyal medya bağlantıları." />
      <Suspense fallback={<LoadingBlock rows={8} />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const { supabase } = await adminDb();
  const [settings, books] = await Promise.all([supabase.from("settings").select("*").eq("id", 1).maybeSingle(), getBookChoices(supabase)]);
  if (settings.error) return <Notice tone="error">Ayarlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  return <SettingsForm settings={(settings.data ?? {}) as Partial<Settings>} books={books} />;
}
