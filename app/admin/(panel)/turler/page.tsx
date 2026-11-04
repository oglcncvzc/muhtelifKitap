import type { Metadata } from "next";
import { Suspense } from "react";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { getTaxonomy } from "@/lib/admin/taxonomy-queries";

export const metadata: Metadata = { title: "Türler" };

export default function TurlerPage() {
  return (
    <>
      <PageHeader title="Türler" description="Kitap türleri (roman, öykü, şiir…). Sitedeki filtrelerde bu sırayla görünür." />
      <Suspense fallback={<LoadingBlock rows={5} />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const { error, items, counts } = await getTaxonomy("categories");
  if (error) return <Notice tone="error">Kayıtlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  return <TaxonomyManager kind="categories" items={items} counts={counts} />;
}
