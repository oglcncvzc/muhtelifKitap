"use client";

import { useState } from "react";
import { AdminForm } from "@/components/admin/admin-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { BilingualField, Checkbox, SelectField, TextField, type Option } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/image-upload";
import { Card, cx, Notice } from "@/components/admin/ui";
import type { Banner } from "@/lib/types";
import { deleteBannerAction, saveBannerAction } from "./actions";
import { MAX_ACTIVE } from "./constants";


export function BannerForm({ banner, books, otherActive }: { banner: Banner | null; books: Option[]; otherActive: number }) {
  const [mode, setMode] = useState<"book" | "url" | "none">(banner?.book_id ? "book" : banner?.link_url ? "url" : "none");
  const [active, setActive] = useState(banner?.is_active ?? true);
  const [theme, setTheme] = useState<"light" | "dark">(banner?.text_theme ?? "light");
  const baseName = `banner-${(banner?.title_tr ?? "yeni").slice(0, 30)}`;
  const tooMany = active && otherActive + 1 > MAX_ACTIVE;

  return (
    <AdminForm
      action={saveBannerAction}
      submitLabel={banner ? "Değişiklikleri kaydet" : "Bannerı oluştur"}
      footerClassName="sticky bottom-0 z-10 -mx-4 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
      footer={
        banner && (
          <>
            <span className="flex-1" />
            <ConfirmAction
              action={() => deleteBannerAction(banner.id)}
              label="Bannerı sil"
              size="md"
              title="Banner silinsin mi?"
              message="Bu banner kalıcı olarak silinecek. Yalnızca geçici olarak gizlemek için “Yayında” işaretini kaldırabilirsiniz."
            />
          </>
        )
      }
    >
      {banner && <input type="hidden" name="id" value={banner.id} />}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card title="Görseller" description="Görseller tarayıcıda küçültülür (uzun kenar ≤ 2400 px) ve WebP olarak kaydedilir.">
            <div className="space-y-5">
              <ImageUpload
                label="Masaüstü görseli"
                required
                hint="Önerilen ölçü: 2400 × 800 px (3:1). Önemli öğeleri ortada tutun."
                bucket="media"
                folder="banners"
                baseName={`${baseName}-masaustu`}
                maxEdge={2400}
                aspect="wide"
                names={{ url: "image_desktop_url" }}
                initial={{ url: banner?.image_desktop_url }}
              />
              <ImageUpload
                label="Mobil görsel"
                hint="Önerilen ölçü: 1080 × 1350 px (4:5). Boşsa masaüstü görseli kırpılarak kullanılır."
                bucket="media"
                folder="banners"
                baseName={`${baseName}-mobil`}
                maxEdge={2400}
                aspect="portrait"
                names={{ url: "image_mobile_url" }}
                initial={{ url: banner?.image_mobile_url }}
              />
            </div>
          </Card>

          <Card title="Metinler" description="Hepsi isteğe bağlıdır; boş bırakılırsa yalnızca görsel gösterilir.">
            <div className="space-y-4">
              <BilingualField label="Başlık" name="title" defaults={{ tr: banner?.title_tr, en: banner?.title_en }} />
              <BilingualField label="Alt metin" name="subtitle" multiline rows={2} defaults={{ tr: banner?.subtitle_tr, en: banner?.subtitle_en }} />
              <BilingualField label="Düğme yazısı" name="cta" defaults={{ tr: banner?.cta_tr, en: banner?.cta_en }} hint="Ör. “İncele” / “Discover”." />
            </div>
          </Card>

          <Card title="Bağlantı" description="Bannera tıklanınca açılacak sayfa.">
            <fieldset>
              <legend className="sr-only">Bağlantı türü</legend>
              <div className="mb-4 flex flex-wrap gap-2">
                {(
                  [
                    ["book", "Bir kitap"],
                    ["url", "Başka bir adres"],
                    ["none", "Bağlantı yok"],
                  ] as const
                ).map(([value, label]) => (
                  <label
                    key={value}
                    className={cx(
                      "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm",
                      mode === value ? "border-ink bg-paper-2/60" : "border-rule",
                    )}
                  >
                    <input type="radio" name="link_mode" value={value} checked={mode === value} onChange={() => setMode(value)} className="accent-ink" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
            {mode === "book" && (
              <SelectField name="book_id" label="Kitap" required options={books} defaultValue={banner?.book_id} placeholder="Kitap seçin…" />
            )}
            {mode === "url" && (
              <TextField
                name="link_url"
                label="Adres"
                required
                defaultValue={banner?.link_url}
                placeholder="/hakkimizda veya https://…"
                hint="Site içi sayfalar için / ile başlayan yol (ör. /yazarlar), dış bağlantılar için tam adres."
              />
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Yayın">
            <Checkbox name="is_active" label="Yayında" checked={active} onChange={setActive} hint="Ana sayfadaki kayan bannerda gösterilir." />
            {tooMany && (
              <Notice tone="warning" className="mt-3">
                Şu anda {otherActive} banner yayında. Ana sayfa için en fazla 3–4 banner önerilir.
              </Notice>
            )}
          </Card>
          <Card title="Yazı rengi" description="Görselin üzerindeki metnin rengi.">
            <fieldset className="grid grid-cols-2 gap-2">
              <legend className="sr-only">Yazı rengi</legend>
              {(
                [
                  ["light", "Açık yazı", "Koyu görseller için"],
                  ["dark", "Koyu yazı", "Açık görseller için"],
                ] as const
              ).map(([value, label, hint]) => (
                <label
                  key={value}
                  className={cx(
                    "cursor-pointer rounded-md border p-3 text-sm",
                    theme === value ? "border-ink ring-1 ring-ink" : "border-rule",
                    value === "light" ? "bg-ink text-white" : "bg-paper text-ink",
                  )}
                >
                  <input type="radio" name="text_theme" value={value} checked={theme === value} onChange={() => setTheme(value)} className="sr-only" />
                  <span className="block font-medium">{label}</span>
                  <span className="text-xs opacity-75">{hint}</span>
                </label>
              ))}
            </fieldset>
          </Card>
        </div>
      </div>
    </AdminForm>
  );
}
