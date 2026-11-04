"use client";

import { AdminForm } from "@/components/admin/admin-form";
import { BilingualField, SelectField, TextArea, TextField, type Option } from "@/components/admin/fields";
import { Card } from "@/components/admin/ui";
import type { Settings } from "@/lib/types";
import { saveSettingsAction } from "./actions";

export function SettingsForm({ settings, books }: { settings: Partial<Settings>; books: Option[] }) {
  const s = settings;
  return (
    <AdminForm
      action={saveSettingsAction}
      submitLabel="Ayarları kaydet"
      footerClassName="sticky bottom-0 z-10 -mx-4 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
    >
      <div className="space-y-6">
        <Card title="Genel">
          <TextField name="company_name" label="Yayınevi adı" required defaultValue={s.company_name ?? "Muhtelif Kitap"} hint="Alt bilgide ve telif satırında kullanılır." />
        </Card>

        <Card title="Ana sayfa · Öne çıkan kitap" description="Ana sayfada geniş kapak ve kısa tanıtımla gösterilir. Dönemsel olarak değiştirebilirsiniz.">
          <div className="space-y-4">
            <SelectField name="featured_book_id" label="Öne çıkan kitap" options={books} defaultValue={s.featured_book_id} placeholder="— Gösterme —" />
            <BilingualField
              label="Tanıtım metni"
              name="featured_text"
              multiline
              rows={4}
              defaults={{ tr: s.featured_text_tr, en: s.featured_text_en }}
              hint="Boş bırakılırsa kitabın tanıtım metninin başı kullanılır."
            />
          </div>
        </Card>

        <Card title="Ana sayfa · Kısa hakkımızda" description="“Devamını oku” bağlantısıyla Hakkımızda sayfasına yönlendirir.">
          <BilingualField label="Metin" name="home_about" multiline rows={5} defaults={{ tr: s.home_about_tr, en: s.home_about_en }} />
        </Card>

        <Card title="İletişim bilgileri">
          <div className="grid gap-4 md:grid-cols-2">
            <TextArea name="address" label="Adres" rows={3} defaultValue={s.address} wrapperClassName="md:col-span-2" />
            <TextField name="phone" label="Telefon" type="tel" defaultValue={s.phone} placeholder="+90 212 …" />
            <TextField name="email" label="E-posta" type="email" defaultValue={s.email} placeholder="info@…" />
            <TextField
              name="map_query"
              label="Harita adresi"
              defaultValue={s.map_query}
              wrapperClassName="md:col-span-2"
              hint="Google Haritalar'da aranacak adres metni (ör. “Muhtelif Kitap, Kadıköy, İstanbul”). İletişim sayfasındaki harita bununla gösterilir."
            />
          </div>
        </Card>

        <Card title="Dosya gönderimi" description="İletişim sayfasında yazarlara yönelik kısa bilgi.">
          <BilingualField label="Metin" name="submission" multiline rows={5} defaults={{ tr: s.submission_tr, en: s.submission_en }} />
        </Card>

        <Card title="Sosyal medya" description="Tam adres girin (https://…). Boş bırakılanlar sitede gösterilmez.">
          <div className="grid gap-4 md:grid-cols-2">
            <TextField name="instagram" label="Instagram" type="url" inputMode="url" defaultValue={s.instagram} placeholder="https://instagram.com/…" />
            <TextField name="x" label="X (Twitter)" type="url" inputMode="url" defaultValue={s.x} placeholder="https://x.com/…" />
            <TextField name="facebook" label="Facebook" type="url" inputMode="url" defaultValue={s.facebook} placeholder="https://facebook.com/…" />
            <TextField name="youtube" label="YouTube" type="url" inputMode="url" defaultValue={s.youtube} placeholder="https://youtube.com/@…" />
            <TextField name="linkedin" label="LinkedIn" type="url" inputMode="url" defaultValue={s.linkedin} placeholder="https://linkedin.com/company/…" />
          </div>
        </Card>
      </div>
    </AdminForm>
  );
}
