"use client";

import { AdminForm } from "@/components/admin/admin-form";
import { BilingualField } from "@/components/admin/fields";
import { Card, Notice } from "@/components/admin/ui";
import type { Page } from "@/lib/types";
import { savePageAction } from "./actions";

export function PageForm({ page }: { page: Page }) {
  return (
    <AdminForm
      action={savePageAction}
      footerClassName="sticky bottom-0 z-10 -mx-4 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
    >
      <input type="hidden" name="slug" value={page.slug} />
      <div className="space-y-6">
        <Card title="Başlık">
          <BilingualField label="Başlık" name="title" requiredTr requiredEn defaults={{ tr: page.title_tr, en: page.title_en }} />
        </Card>
        <Card title="Metin">
          <Notice tone="info" className="mb-4">
            <strong>Biçim:</strong> Paragrafları <strong>boş bir satırla</strong> ayırın. <code className="rounded bg-white/70 px-1">## </code> ile
            başlayan satırlar ara başlık olarak gösterilir (ör. <code className="rounded bg-white/70 px-1">## Yayın anlayışımız</code>).
          </Notice>
          <BilingualField label="Metin" name="body" multiline rows={22} defaults={{ tr: page.body_tr, en: page.body_en }} />
        </Card>
      </div>
    </AdminForm>
  );
}
