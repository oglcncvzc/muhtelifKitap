"use client";

import Link from "next/link";
import { useState } from "react";
import { AdminForm, useFieldError } from "@/components/admin/admin-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { BilingualField, Checkbox, inputClass, SelectField, TextArea, TextField, type Option } from "@/components/admin/fields";
import { PdfUpload } from "@/components/admin/file-upload";
import { ImageUpload } from "@/components/admin/image-upload";
import { OrderedPicker } from "@/components/admin/ordered-picker";
import { SlugField, useAutoSlug } from "@/components/admin/slug-field";
import { buttonClass, Card, cx, Notice } from "@/components/admin/ui";
import type { Book } from "@/lib/types";
import { deleteBookAction, saveBookAction } from "./actions";
import type { BookOptions } from "./queries";

type LinkRow = { key: number; store_id: string; url: string };

export function BookForm({
  book,
  authorIds,
  links,
  options,
  publicHref,
  bannerCount = 0,
  isFeatured = false,
}: {
  book: Book | null;
  authorIds: string[];
  links: { store_id: string; url: string }[];
  options: BookOptions;
  publicHref?: string;
  bannerCount?: number;
  isFeatured?: boolean;
}) {
  const isNew = !book;
  const slug = useAutoSlug(book?.slug ?? "", book?.title ?? "", isNew);

  return (
    <AdminForm
      action={saveBookAction}
      submitLabel={isNew ? "Kitabı oluştur" : "Değişiklikleri kaydet"}
      footerClassName="sticky bottom-0 z-10 -mx-4 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
      footer={
        !isNew && (
          <>
            {publicHref && (
              <a href={publicHref} target="_blank" rel="noreferrer" className={buttonClass("ghost")}>
                Sitede gör ↗
              </a>
            )}
            <span className="flex-1" />
            <ConfirmAction
              action={() => deleteBookAction(book.id)}
              label="Kitabı sil"
              size="md"
              title="Kitap silinsin mi?"
              message={
                <>
                  <p>
                    <strong>{book.title}</strong> kalıcı olarak silinecek; yazar eşleştirmeleri ve satış bağlantıları da
                    kaldırılacak. Bu işlem geri alınamaz.
                  </p>
                  {(bannerCount > 0 || isFeatured) && (
                    <p className="mt-2 text-amber-800">
                      {bannerCount > 0 && `${bannerCount} banner bu kitaba bağlı; bağlantıları kaldırılacak. `}
                      {isFeatured && "Bu kitap ana sayfada öne çıkan kitap olarak seçili."}
                    </p>
                  )}
                </>
              }
            />
          </>
        )
      }
    >
      {book && <input type="hidden" name="id" value={book.id} />}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card title="Temel bilgiler">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <TextField
                  name="title"
                  label="Kitap adı"
                  tag="TR"
                  required
                  defaultValue={book?.title}
                  onChange={(e) => slug.onSource(e.target.value)}
                />
                <TextField name="title_en" label="Kitap adı" tag="EN" defaultValue={book?.title_en} hint="Boşsa Türkçe ad kullanılır." />
              </div>
              <BilingualField label="Alt başlık" name="subtitle" suffixes={["", "_en"]} defaults={{ tr: book?.subtitle, en: book?.subtitle_en }} />
              <SlugField
                value={slug.slug}
                onChange={slug.setSlug}
                source={slug.source}
                auto={slug.auto}
                onAutoChange={slug.setAuto}
                prefix="/kitaplar/"
              />
            </div>
          </Card>

          <Card title="Yazarlar" description="Birden çok yazar eklenebilir; sitede bu sırayla gösterilir.">
            <OrderedPicker
              name="author_ids"
              label="Yazarlar"
              options={options.authors}
              initial={authorIds}
              addLabel="Yazar ekle…"
              emptyText="Henüz yazar eklenmedi."
              createHref="/admin/yazarlar/yeni"
              createLabel="Yeni yazar"
            />
          </Card>

          <Card title="Tanıtım metni" description="Paragrafları boş bir satırla ayırın.">
            <BilingualField label="Tanıtım" name="description" multiline rows={10} defaults={{ tr: book?.description_tr, en: book?.description_en }} />
          </Card>

          <Card title="Künye">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TextField name="isbn" label="ISBN" defaultValue={book?.isbn} placeholder="978-605-…" inputMode="numeric" />
              <TextField name="pages" label="Sayfa sayısı" type="number" min={1} defaultValue={book?.pages} />
              <TextField name="publish_date" label="Basım tarihi" type="date" defaultValue={book?.publish_date} />
              <TextField name="edition" label="Baskı" defaultValue={book?.edition} placeholder="1. baskı" />
              <TextField name="size" label="Ebat" defaultValue={book?.size} placeholder="13,5 × 21 cm" />
              <TextField name="language" label="Dil" defaultValue={book?.language} placeholder="Türkçe" />
              <TextField name="editor" label="Editör" defaultValue={book?.editor} />
              <TextField name="translator" label="Çevirmen" defaultValue={book?.translator} />
              <TextField name="cover_designer" label="Kapak tasarımı" defaultValue={book?.cover_designer} />
            </div>
            <div className="mt-4">
              <TextArea
                name="other_credits"
                label="Diğer künye bilgileri"
                rows={3}
                defaultValue={book?.other_credits}
                hint="Her satıra bir bilgi yazın (ör. Düzelti: Ad Soyad)."
              />
            </div>
          </Card>

          <Card title="Satış noktaları" description="“Satın Al” bağlantıları sitede yeni sekmede açılır.">
            <LinkRepeater stores={options.stores} initial={links} />
          </Card>

          <Card title="Arama motoru (SEO)" description="Boş bırakılırsa kitap adı ve tanıtım metninin başı kullanılır.">
            <div className="space-y-4">
              <BilingualField label="SEO başlığı" name="seo_title" softLimit={60} defaults={{ tr: book?.seo_title_tr, en: book?.seo_title_en }} />
              <BilingualField
                label="SEO açıklaması"
                name="seo_description"
                multiline
                rows={3}
                softLimit={160}
                defaults={{ tr: book?.seo_description_tr, en: book?.seo_description_en }}
              />
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Yayın durumu">
            <div className="space-y-3">
              <Checkbox name="is_published" label="Sitede yayında" defaultChecked={book?.is_published ?? true} hint="Kapalıysa kitap sitede görünmez (taslak)." />
              <Checkbox name="is_new" label="“Yeni” etiketi" defaultChecked={book?.is_new ?? false} hint="Ana sayfadaki yeni çıkanlarda gösterilir." />
              <Checkbox name="is_coming_soon" label="“Yakında” etiketi" defaultChecked={book?.is_coming_soon ?? false} />
            </div>
          </Card>

          <Card title="Sınıflandırma">
            <div className="space-y-4">
              <SelectField name="category_id" label="Tür" options={options.categories} defaultValue={book?.category_id} />
              <SelectField name="series_id" label="Dizi" options={options.series} defaultValue={book?.series_id} />
              <SelectField name="imprint_id" label="Yayınevi" options={options.imprints} defaultValue={book?.imprint_id} />
            </div>
          </Card>

          <Card title="Kapak">
            <ImageUpload
              label="Kapak görseli"
              hint="JPG/PNG/WebP. Uzun kenarı 1600 px'e küçültülür ve WebP olarak kaydedilir."
              bucket="covers"
              folder=""
              baseName={slug.slug || "kapak"}
              maxEdge={1600}
              aspect="cover"
              names={{ url: "cover_url", width: "cover_width", height: "cover_height", color: "cover_color" }}
              initial={
                book?.cover_url
                  ? { url: book.cover_url, width: book.cover_width, height: book.cover_height, color: book.cover_color }
                  : undefined
              }
            />
          </Card>

          <Card title="Tadımlık okuma">
            <PdfUpload label="PDF dosyası" name="sample_url" baseName={slug.slug || "tadimlik"} initialUrl={book?.sample_url} />
          </Card>
        </div>
      </div>
    </AdminForm>
  );
}

function LinkRepeater({ stores, initial }: { stores: Option[]; initial: { store_id: string; url: string }[] }) {
  const [rows, setRows] = useState<LinkRow[]>(() => initial.map((l, i) => ({ key: i, ...l })));
  const [nextKey, setNextKey] = useState(initial.length);
  const generalError = useFieldError("links");

  function add() {
    const used = new Set(rows.map((r) => r.store_id));
    const free = stores.find((s) => !used.has(s.value));
    setRows([...rows, { key: nextKey, store_id: free?.value ?? "", url: "" }]);
    setNextKey(nextKey + 1);
  }

  if (stores.length === 0) {
    return (
      <Notice tone="warning">
        Henüz mağaza tanımlanmamış. Önce <Link href="/admin/magazalar" className="underline">Mağazalar</Link> sayfasından mağaza ekleyin.
      </Notice>
    );
  }

  return (
    <div className="space-y-3">
      {rows.length === 0 && <p className="text-sm text-muted">Henüz satış bağlantısı yok.</p>}
      {rows.map((row, i) => (
        <LinkRowFields
          key={row.key}
          index={i}
          row={row}
          stores={stores}
          onChange={(patch) => setRows(rows.map((r) => (r.key === row.key ? { ...r, ...patch } : r)))}
          onRemove={() => setRows(rows.filter((r) => r.key !== row.key))}
        />
      ))}
      {generalError && <p className="text-xs font-medium text-red-700">{generalError}</p>}
      <button type="button" onClick={add} className={buttonClass("secondary", "sm")}>
        + Bağlantı ekle
      </button>
    </div>
  );
}

function LinkRowFields({
  index,
  row,
  stores,
  onChange,
  onRemove,
}: {
  index: number;
  row: LinkRow;
  stores: Option[];
  onChange: (patch: Partial<LinkRow>) => void;
  onRemove: () => void;
}) {
  const storeError = useFieldError(`link_store_${index}`);
  const urlError = useFieldError(`link_url_${index}`);
  return (
    <div className="grid gap-2 rounded-md border border-rule p-2 sm:grid-cols-[12rem_minmax(0,1fr)_auto] sm:items-start sm:border-0 sm:p-0">
      <div>
        <label className="sr-only" htmlFor={`link-store-${row.key}`}>
          Mağaza {index + 1}
        </label>
        <select
          id={`link-store-${row.key}`}
          name="link_store"
          value={row.store_id}
          onChange={(e) => onChange({ store_id: e.target.value })}
          aria-invalid={storeError ? true : undefined}
          className={inputClass}
        >
          <option value="">Mağaza seçin…</option>
          {stores.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {storeError && <p className="mt-1 text-xs font-medium text-red-700">{storeError}</p>}
      </div>
      <div>
        <label className="sr-only" htmlFor={`link-url-${row.key}`}>
          Bağlantı adresi {index + 1}
        </label>
        <input
          id={`link-url-${row.key}`}
          name="link_url"
          type="url"
          inputMode="url"
          value={row.url}
          onChange={(e) => onChange({ url: e.target.value })}
          placeholder="https://…"
          aria-invalid={urlError ? true : undefined}
          className={cx(inputClass, "font-mono text-[13px]")}
        />
        {urlError && <p className="mt-1 text-xs font-medium text-red-700">{urlError}</p>}
      </div>
      <button type="button" onClick={onRemove} className={buttonClass("ghost")} aria-label={`Bağlantıyı kaldır ${index + 1}`}>
        Kaldır
      </button>
    </div>
  );
}
