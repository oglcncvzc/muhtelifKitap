/**
 * public/covers içindeki kapakları Supabase Storage'daki "covers" bucket'ına yükler
 * ve books.cover_url alanını Storage adresiyle günceller.
 *
 * Gerekli ortam değişkenleri (.env.local):
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *
 * Kullanım: npm run covers:upload
 * Not: İsteğe bağlıdır. Kapaklar /public altında da sorunsuz sunulur.
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const dir = fileURLToPath(new URL("../public/covers/", import.meta.url));

for (const file of readdirSync(dir).filter((f) => f.endsWith(".webp"))) {
  const slug = file.replace(/\.webp$/, "");
  const { error: upErr } = await supabase.storage
    .from("covers")
    .upload(file, readFileSync(dir + file), { contentType: "image/webp", upsert: true });
  if (upErr) {
    console.error(`✗ ${file}: ${upErr.message}`);
    continue;
  }
  const { data } = supabase.storage.from("covers").getPublicUrl(file);
  const { error: dbErr } = await supabase.from("books").update({ cover_url: data.publicUrl }).eq("slug", slug);
  console.log(dbErr ? `✗ ${slug}: ${dbErr.message}` : `✓ ${slug}`);
}
