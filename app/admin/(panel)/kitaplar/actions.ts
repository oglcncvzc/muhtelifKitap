"use server";

import { redirect } from "next/navigation";
import { fail, INVALID, ok, type ActionState } from "@/lib/admin/action-state";
import { actionDb, catalogChanged } from "@/lib/admin/db";
import { dbErrorMessage } from "@/lib/admin/errors";
import { formReader, isUuid } from "@/lib/admin/form";

const ISBN_RE = /^[0-9Xx\- ]{10,20}$/;

/** Kitap ekler/günceller; yazarları (book_authors) ve satış bağlantılarını (book_links) yeniden yazar. */
export async function saveBookAction(_prev: ActionState, fd: FormData): Promise<ActionState> {
  const { supabase } = await actionDb();
  const f = formReader(fd);
  const id = f.uuid("id");

  const title = f.text("title", { required: true, label: "Kitap adı", max: 300 });
  const slug = f.slug("slug", title);
  const isbn = f.text("isbn", { max: 20 });
  if (isbn && !ISBN_RE.test(isbn)) f.fail("isbn", "ISBN yalnızca rakam, tire ve X içerebilir (10 veya 13 hane).");

  const payload = {
    title,
    slug,
    title_en: f.text("title_en", { max: 300 }),
    subtitle: f.text("subtitle", { max: 300 }),
    subtitle_en: f.text("subtitle_en", { max: 300 }),
    category_id: f.uuid("category_id"),
    series_id: f.uuid("series_id"),
    imprint_id: f.uuid("imprint_id"),
    description_tr: f.text("description_tr", { max: 20000 }),
    description_en: f.text("description_en", { max: 20000 }),
    isbn,
    pages: f.int("pages", { min: 1, max: 100000 }),
    publish_date: f.date("publish_date"),
    edition: f.text("edition", { max: 100 }),
    size: f.text("size", { max: 100 }),
    language: f.text("language", { max: 100 }),
    editor: f.text("editor", { max: 300 }),
    translator: f.text("translator", { max: 300 }),
    cover_designer: f.text("cover_designer", { max: 300 }),
    other_credits: f.text("other_credits", { max: 2000 }),
    sample_url: f.url("sample_url"),
    cover_url: f.url("cover_url"),
    cover_width: f.int("cover_width", { min: 1, max: 20000 }) ?? 1000,
    cover_height: f.int("cover_height", { min: 1, max: 20000 }) ?? 1500,
    cover_color: f.hex("cover_color", "#e7e5e0"),
    is_new: f.bool("is_new"),
    is_coming_soon: f.bool("is_coming_soon"),
    is_published: f.bool("is_published"),
    seo_title_tr: f.text("seo_title_tr", { max: 200 }),
    seo_title_en: f.text("seo_title_en", { max: 200 }),
    seo_description_tr: f.text("seo_description_tr", { max: 400 }),
    seo_description_en: f.text("seo_description_en", { max: 400 }),
  };

  // Yazarlar (sıralı, tekrarsız)
  const authorIds = [...new Set(f.all("author_ids").filter(isUuid))];

  // Satış bağlantıları
  const stores = f.all("link_store");
  const urls = f.all("link_url");
  const links: { store_id: string; url: string }[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < Math.max(stores.length, urls.length); i++) {
    const store = stores[i] ?? "";
    const raw = urls[i] ?? "";
    if (!store && !raw) continue;
    if (!isUuid(store)) {
      f.fail(`link_store_${i}`, "Mağaza seçin.");
      continue;
    }
    if (seen.has(store)) {
      f.fail(`link_store_${i}`, "Bu mağaza zaten eklendi.");
      continue;
    }
    seen.add(store);
    let url: string | null = null;
    try {
      const u = new URL(/^[a-z][a-z0-9+.-]*:/i.test(raw) ? raw : `https://${raw}`);
      if ((u.protocol === "https:" || u.protocol === "http:") && u.hostname.includes(".")) url = u.toString();
    } catch {}
    if (!url) {
      f.fail(`link_url_${i}`, raw ? "Geçerli bir adres girin (https://…)." : "Bağlantı adresi girin.");
      continue;
    }
    links.push({ store_id: store, url });
  }
  if (links.length > 30) f.fail("links", "En fazla 30 satış bağlantısı eklenebilir.");

  if (!f.ok() || !title || !slug) return fail(INVALID, f.errors);

  // Benzersiz slug
  let dup = supabase.from("books").select("id").eq("slug", slug).limit(1);
  if (id) dup = dup.neq("id", id);
  const { data: dupRows } = await dup;
  if (dupRows?.length) return fail(INVALID, { slug: "Bu kısa ad başka bir kitapta kullanılıyor." });

  let bookId = id;
  if (id) {
    const { data, error } = await supabase.from("books").update(payload).eq("id", id).select("id");
    if (error) return fail(dbErrorMessage(error));
    if (!data?.length) return fail("Kitap bulunamadı; silinmiş olabilir.");
  } else {
    // Yeni kitap listenin başına eklenir
    const { data: first } = await supabase.from("books").select("sort_order").order("sort_order").limit(1);
    const sort_order = ((first?.[0]?.sort_order as number | undefined) ?? 10) - 10;
    const { data, error } = await supabase.from("books").insert({ ...payload, sort_order }).select("id").single();
    if (error) return fail(dbErrorMessage(error));
    bookId = data.id as string;
  }

  // İlişkiler: sil + yeniden ekle
  const relErrors: string[] = [];
  const delA = await supabase.from("book_authors").delete().eq("book_id", bookId!);
  if (delA.error) relErrors.push(dbErrorMessage(delA.error));
  else if (authorIds.length) {
    const { error } = await supabase
      .from("book_authors")
      .insert(authorIds.map((author_id, position) => ({ book_id: bookId, author_id, position })));
    if (error) relErrors.push(dbErrorMessage(error));
  }
  const delL = await supabase.from("book_links").delete().eq("book_id", bookId!);
  if (delL.error) relErrors.push(dbErrorMessage(delL.error));
  else if (links.length) {
    const { error } = await supabase
      .from("book_links")
      .insert(links.map((l, i) => ({ ...l, book_id: bookId, sort_order: (i + 1) * 10 })));
    if (error) relErrors.push(dbErrorMessage(error));
  }

  catalogChanged();
  if (relErrors.length) {
    // Yeni kitap oluştu; tekrar gönderimde kopya oluşmasın diye düzenleme sayfasına geç.
    if (!id) redirect(`/admin/kitaplar/${bookId}?durum=iliski-hatasi`);
    return fail(`Kitap kaydedildi ancak yazar/satış bağlantıları kaydedilemedi: ${relErrors[0]}`);
  }
  if (!id) redirect(`/admin/kitaplar/${bookId}?durum=olusturuldu`);
  return ok("Kitap kaydedildi.");
}

export async function deleteBookAction(id: string): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isUuid(id)) return fail("Geçersiz kayıt.");
  const { data, error } = await supabase.from("books").delete().eq("id", id).select("id");
  if (error) return fail(dbErrorMessage(error));
  if (!data?.length) return fail("Kitap bulunamadı; zaten silinmiş olabilir.");
  catalogChanged();
  redirect("/admin/kitaplar?durum=silindi");
}

/** Listeden hızlı yayın aç/kapat. */
export async function togglePublishedAction(id: string, published: boolean): Promise<ActionState> {
  const { supabase } = await actionDb();
  if (!isUuid(id)) return fail("Geçersiz kayıt.");
  const { error } = await supabase.from("books").update({ is_published: Boolean(published) }).eq("id", id);
  if (error) return fail(dbErrorMessage(error));
  catalogChanged();
  return ok(published ? "Kitap yayına alındı." : "Kitap yayından kaldırıldı.");
}
