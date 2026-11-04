import type { Metadata } from "next";
import { Suspense } from "react";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { getTaxonomy } from "@/lib/admin/taxonomy-queries";

export const metadata: Metadata = { title: "Yayınevleri" };

export default function YayinevleriPage() {
  return (
    <>
      <PageHeader title="Yayınevleri" description="Muhtelif Kitap, Bandini Kitap gibi yayınevi markaları." />
      <Suspense fallback={<LoadingBlock rows={5} />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const { error, items, counts } = await getTaxonomy("imprints");
  if (error) return <Notice tone="error">Kayıtlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  return <TaxonomyManager kind="imprints" items={items} counts={counts} />;
}
