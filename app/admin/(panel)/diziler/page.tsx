import type { Metadata } from "next";
import { Suspense } from "react";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { getTaxonomy } from "@/lib/admin/taxonomy-queries";

export const metadata: Metadata = { title: "Diziler" };

export default function DizilerPage() {
  return (
    <>
      <PageHeader title="Diziler" description="Muhtelif Şiir, Muhtelif Spekülatif gibi diziler. Sitede bu sırayla gösterilir." />
      <Suspense fallback={<LoadingBlock rows={5} />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const { error, items, counts } = await getTaxonomy("series");
  if (error) return <Notice tone="error">Kayıtlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  return <TaxonomyManager kind="series" items={items} counts={counts} />;
}
