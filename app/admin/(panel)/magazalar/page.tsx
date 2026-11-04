import type { Metadata } from "next";
import { Suspense } from "react";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
import { LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { getTaxonomy } from "@/lib/admin/taxonomy-queries";

export const metadata: Metadata = { title: "Mağazalar" };

export default function MagazalarPage() {
  return (
    <>
      <PageHeader title="Mağazalar" description="Kitap sayfalarındaki “Satın Al” bağlantılarında kullanılan mağazalar. Kitaplarda bu sırayla gösterilir." />
      <Suspense fallback={<LoadingBlock rows={5} />}>
        <Content />
      </Suspense>
    </>
  );
}

async function Content() {
  const { error, items, counts } = await getTaxonomy("stores");
  if (error) return <Notice tone="error">Kayıtlar yüklenemedi. Sayfayı yenileyip tekrar deneyin.</Notice>;
  return <TaxonomyManager kind="stores" items={items} counts={counts} />;
}
