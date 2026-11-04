import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingBlock, Notice, PageHeader } from "@/components/admin/ui";
import { adminDb } from "@/lib/admin/db";
import { BookForm } from "../book-form";
import { getBookOptions } from "../queries";

export const metadata: Metadata = { title: "Yeni kitap" };

export default function NewBookPage() {
  return (
    <>
      <PageHeader title="Yeni kitap" back={{ href: "/admin/kitaplar", label: "Kitaplar" }} />
      <Suspense fallback={<LoadingBlock rows={8} />}>
        <NewBook />
      </Suspense>
    </>
  );
}

async function NewBook() {
  const { supabase } = await adminDb();
  const { error, ...options } = await getBookOptions(supabase);
  return (
    <>
      {error && <Notice tone="error" className="mb-4">Seçim listeleri yüklenemedi; sayfayı yenileyin.</Notice>}
      <BookForm book={null} authorIds={[]} links={[]} options={options} />
    </>
  );
}
