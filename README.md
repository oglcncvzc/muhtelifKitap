# Muhtelif Kitap — web sitesi

Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · Supabase · Vercel

## Yerelde çalıştırma

```bash
npm install
npm run dev          # http://localhost:3000
```

Supabase bağlantısı olmadan da çalışır: katalog `data/catalog.ts` dosyasından okunur.

## Sayfalar

| Yol | İçerik |
| --- | --- |
| `/` | Hero, Muhtelif Spekülatif dizisi, Şiir, Öykü, Çeviri & İnceleme, Başka Kitap |
| `/kitaplar` | Katalog: tür/dizi filtresi + arama (`?tur=siir`, `?dizi=spekulatif`, `?q=`) |
| `/kitaplar/[slug]` | Kitap detayı, künye, yazarın diğer kitapları, benzer kitaplar |
| `/yazarlar`, `/yazarlar/[slug]` | Yazar listesi (A–Z) ve yazar sayfaları |
| `/hakkimizda` | Yayınevi ve Başka Kitap |
| `/iletisim` | İletişim formu → Supabase `contact_messages` tablosu |

## İçerik ekleme

- **Supabase yokken:** `data/catalog.ts` dosyasına kitap ekleyin, kapağı `public/covers/<slug>.webp` olarak koyun.
- `description`, `isbn`, `pages`, `publishedYear`, `price`, `buyUrl` alanları doldurulunca kitap sayfasında kendiliğinden görünür.
- E-posta, Instagram ve adres: `lib/site.ts`.

## Supabase kurulumu

1. Supabase'de yeni proje açın.
2. **SQL Editor**'da sırayla çalıştırın:
   - `supabase/migrations/20261104000000_init.sql` (tablolar, RLS, `covers` bucket'ı)
   - `supabase/seed.sql` (15 kitap, 13 yazar — `npm run seed:sql` ile `data/catalog.ts`'den yeniden üretilir)
3. `.env.example` → `.env.local` kopyalayın, `NEXT_PUBLIC_SUPABASE_URL` ve `NEXT_PUBLIC_SUPABASE_ANON_KEY` girin.
4. (İsteğe bağlı) Kapakları Storage'a taşımak için `SUPABASE_SERVICE_ROLE_KEY` girip `npm run covers:upload` çalıştırın.
5. Bundan sonra kitaplar Supabase **Table Editor**'dan düzenlenir. İletişim mesajları `contact_messages` tablosuna düşer.

**Güvenlik:** Ziyaretçiler (anon) yalnızca yayımlanmış kitapları ve yazarları okuyabilir, yalnızca mesaj ekleyebilir; mesajları okuyamaz. Düzenleme service role / panel üzerinden yapılır.

### Değişikliklerin anında yansıması

Veri varsayılan olarak saatte bir tazelenir. Anında yansıması için:

1. Vercel'de `REVALIDATE_SECRET` tanımlayın.
2. Supabase → Database → Webhooks: `books` ve `authors` tablolarında Insert/Update/Delete için
   `POST https://<alan-adı>/api/revalidate`, header `x-revalidate-secret: <REVALIDATE_SECRET>`.

### Supabase'in uykuya geçmemesi

Ücretsiz planda 7 gün istek gelmeyen proje duraklatılır. `vercel.json` içindeki Vercel Cron,
her gün 06:00 UTC'de `/api/keepalive` adresini çağırır ve veritabanına gerçek bir sorgu atar.
Vercel'de `CRON_SECRET` tanımlı olmalı (Vercel bunu `Authorization` başlığına kendisi ekler).
Durumu Vercel → proje → Settings → Cron Jobs ekranından izleyebilir, oradan elle de tetikleyebilirsiniz.

## Vercel'e yayınlama

1. Projeyi GitHub'a gönderin, Vercel'de **Import** edin.
2. **Root Directory:** boş bırakın (repo kökü projenin kendisi)
3. Environment Variables: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `REVALIDATE_SECRET`, `CRON_SECRET`
   (`SUPABASE_SERVICE_ROLE_KEY` Vercel'e eklenmez.)
4. Deploy.

## Tasarım notları

- Yazı tipleri: **Big Shoulders** (logodaki dar, uzun harflere yakın başlıklar), **Newsreader** (metin), **JetBrains Mono** (etiketler).
- Renkler sitenin kendisinde nötr (kâğıt / mürekkep); rengi kapaklar taşıyor. Kitap sayfasının arka planı kapağın baskın renginden tonlanır.
- Spekülatif dizi koyu bölümde, şiir dizisi yatay rafta gösterilir.
