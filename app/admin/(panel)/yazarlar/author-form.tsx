"use client";

import { AdminForm } from "@/components/admin/admin-form";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { BilingualField, Checkbox, TextField } from "@/components/admin/fields";
import { ImageUpload } from "@/components/admin/image-upload";
import { SlugField, useAutoSlug } from "@/components/admin/slug-field";
import { buttonClass, Card } from "@/components/admin/ui";
import type { Author } from "@/lib/types";
import { deleteAuthorAction, saveAuthorAction } from "./actions";

export function AuthorForm({ author, bookCount = 0, publicHref }: { author: Author | null; bookCount?: number; publicHref?: string }) {
  const isNew = !author;
  const slug = useAutoSlug(author?.slug ?? "", author?.name ?? "", isNew);

  return (
    <AdminForm
      action={saveAuthorAction}
      submitLabel={isNew ? "Yazarı oluştur" : "Değişiklikleri kaydet"}
      footerClassName="sticky bottom-0 z-10 -mx-4 border-t border-rule bg-paper/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
      footer={
        author && (
          <>
            {publicHref && (
              <a href={publicHref} target="_blank" rel="noreferrer" className={buttonClass("ghost")}>
                Sitede gör ↗
              </a>
            )}
            <span className="flex-1" />
            <ConfirmAction
              action={() => deleteAuthorAction(author.id)}
              label="Yazarı sil"
              size="md"
              title="Yazar silinsin mi?"
              message={
                <>
                  <p>
                    <strong>{author.name}</strong> kalıcı olarak silinecek.
                  </p>
                  {bookCount > 0 && (
                    <p className="mt-2 text-amber-800">
                      Bu yazar {bookCount} kitapla eşleştirilmiş. Kitaplar silinmez, ancak yazar bilgisi bu kitaplardan kaldırılır.
                    </p>
                  )}
                </>
              }
            />
          </>
        )
      }
    >
      {author && <input type="hidden" name="id" value={author.id} />}
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card title="Temel bilgiler">
            <div className="space-y-4">
              <TextField name="name" label="Ad soyad" required defaultValue={author?.name} onChange={(e) => slug.onSource(e.target.value)} />
              <SlugField value={slug.slug} onChange={slug.setSlug} source={slug.source} auto={slug.auto} onAutoChange={slug.setAuto} prefix="/yazarlar/" />
            </div>
          </Card>
          <Card title="Biyografi" description="Paragrafları boş bir satırla ayırın.">
            <BilingualField label="Biyografi" name="bio" multiline rows={10} defaults={{ tr: author?.bio_tr, en: author?.bio_en }} />
          </Card>
          <Card title="Bağlantılar" description="Tam adres girin (ör. https://instagram.com/kullaniciadi).">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="website" label="İnternet sitesi" type="url" inputMode="url" defaultValue={author?.website} placeholder="https://" />
              <TextField name="instagram" label="Instagram" type="url" inputMode="url" defaultValue={author?.instagram} placeholder="https://instagram.com/…" />
              <TextField name="x" label="X (Twitter)" type="url" inputMode="url" defaultValue={author?.x} placeholder="https://x.com/…" />
              <TextField name="facebook" label="Facebook" type="url" inputMode="url" defaultValue={author?.facebook} placeholder="https://facebook.com/…" />
            </div>
          </Card>
        </div>
        <div className="space-y-6">
          <Card title="Görünürlük">
            <Checkbox name="featured" label="Ana sayfada göster" defaultChecked={author?.featured ?? false} hint="“Yazarlarımız” bölümünde yer alır." />
          </Card>
          <Card title="Fotoğraf">
            <ImageUpload
              label="Yazar fotoğrafı"
              hint="Kare ya da dikey bir fotoğraf önerilir. Uzun kenarı 1600 px'e küçültülür."
              bucket="media"
              folder="authors"
              baseName={slug.slug || "yazar"}
              maxEdge={1600}
              aspect="portrait"
              names={{ url: "photo_url" }}
              initial={{ url: author?.photo_url }}
            />
          </Card>
        </div>
      </div>
    </AdminForm>
  );
}
