import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import type { Page } from "@/lib/types";
import { PAGE_LABELS } from "../constants";
import { PageForm } from "../page-form";

export const metadata: Metadata = { title: "Sayfayı düzenle" };

export default function EditPagePage({ params }: PageProps<"/admin/sayfalar/[slug]">) {
  return (
    <Suspense
      fallback={
        <>
          <PageHeader title="Sayfayı düzenle" back={{ href: "/admin/sayfalar", label: "Sayfalar" }} />
          <LoadingBlock rows={6} />
        </>
      }
    >
      <EditPage params={params} />
    </Suspense>
  );
}

async function EditPage({ params }: Pick<PageProps<"/admin/sayfalar/[slug]">, "params">) {
  const [{ slug }, { supabase }] = await Promise.all([params, adminDb()]);
  if (!(slug in PAGE_LABELS)) notFound();
  const { data, error } = await supabase.from("pages").select("*").eq("slug", slug).maybeSingle();
  if (error) return <Notice tone="error">Sayfa yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  if (!data) notFound();
  const meta = PAGE_LABELS[slug];
  return (
    <>
      <PageHeader title={meta.label} description={meta.hint} back={{ href: "/admin/sayfalar", label: "Sayfalar" }} />
      <PageForm key={slug} page={data as Page} />
    </>
  );
}
