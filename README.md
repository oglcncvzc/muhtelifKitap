# Muhtelif Kitap — web sitesi ve yönetim paneli

Next.js 16 (App Router, Cache Components) · Tailwind CSS 4 · Supabase (veritabanı, Auth, Storage) · Vercel

- Site: https://muhtelif-kitap.vercel.app (TR) · https://muhtelif-kitap.vercel.app/en (EN)
- Yönetim paneli: https://muhtelif-kitap.vercel.app/admin · https://muhtelif-kitap-admin.vercel.app

## Yerelde çalıştırma

```bash
npm install
cp .env.example .env.local   # değerleri doldurun
npm run dev
```

## Yapı

| Klasör | İçerik |
| --- | --- |
| `app/[lang]/` | Herkese açık site (TR/EN). `proxy.ts` TR adreslerini (`/kitaplar`) ve EN adreslerini (`/en/books`) bu iç rotalara yönlendirir |
| `app/admin/` | Yönetim paneli (kendi root layout'u; Supabase Auth ile giriş) |
| `lib/data.ts` | Sitenin tüm içeriği tek önbellekli sorguyla (`catalog` etiketi) |
| `lib/i18n.ts` | Dil yolları, dil seçici, arayüz metinleri (TR/EN) |
| `supabase/migrations/` | Şema, RLS politikaları, Storage bucket'ları, tetikleyiciler |

### Adresler

| Sayfa | TR | EN |
| --- | --- | --- |
| Ana sayfa | `/` | `/en` |
| Kitaplar | `/kitaplar` · `/kitaplar/[slug]` | `/en/books` · `/en/books/[slug]` |
| Yazarlar | `/yazarlar` · `/yazarlar/[slug]` | `/en/authors` · `/en/authors/[slug]` |
| Hakkımızda / İletişim | `/hakkimizda` · `/iletisim` | `/en/about` · `/en/contact` |
| Yasal | `/kvkk` · `/gizlilik-politikasi` · `/cerez-politikasi` | `/en/kvkk` · `/en/privacy-policy` · `/en/cookie-policy` |

## İçerik yönetimi

Tüm içerik panelden düzenlenir: kitaplar (künye, TR/EN tanıtım, kapak, tadımlık PDF, satış linkleri, SEO), yazarlar, bannerlar, türler, diziler, yayınevleri, mağazalar, sayfalar (Hakkımızda, KVKK, gizlilik, çerez), site ayarları (iletişim bilgileri, öne çıkan kitap, ana sayfa metinleri), iletişim mesajları ve yöneticiler.

Panelden yapılan her kayıt siteyi anında günceller. Supabase panelinden doğrudan yapılan değişiklikler de veritabanı tetikleyicisi (`pg_net` → `/api/revalidate`) sayesinde anında yansır.

**Metin biçimi:** paragraflar boş satırla ayrılır; `## ` ile başlayan satır ara başlıktır.

## Güvenlik

- Herkese açık kayıt kapalıdır; yöneticileri yalnızca bir yönetici ekleyebilir (`/admin/yoneticiler`).
- RLS: ziyaretçiler yalnızca yayımlanmış içeriği okuyabilir ve iletişim formuna yazabilir; tüm yazma işlemleri `is_admin()` ile sınırlıdır.
- Her Server Action yetkiyi yeniden doğrular. `SUPABASE_SERVICE_ROLE_KEY` yalnızca yönetici ekleme/silmede, yetki doğrulandıktan sonra kullanılır.

## Ortam değişkenleri (Vercel)

`NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (sensitive), `REVALIDATE_SECRET`, `CRON_SECRET`

## Bakım

- **Supabase'in uykuya geçmemesi:** `vercel.json` içindeki Vercel Cron her gün `/api/keepalive`'ı çağırır.
- **Alan adı alındığında:** Vercel'de domaini ekleyin, `NEXT_PUBLIC_SITE_URL`'i güncelleyin, Supabase Auth → URL Configuration'a ve Vault'taki `revalidate_url`'e yeni adresi yazın, Google Search Console'a sitemap'i (`/sitemap.xml`) gönderin.

## Tasarım notları

- Yazı tipleri: **Big Shoulders** (logodaki dar harflere yakın başlıklar), **Newsreader** (metin), **JetBrains Mono** (etiketler).
- Nötr palet (siyah, kırık beyaz, açık gri); rengi kapaklar taşır. Kapaklar düz ve net, 3B efekt yok.
