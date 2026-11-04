-- Muhtelif Kitap v2: iki dilli içerik + yönetim paneli
-- v1'deki books/authors yalnızca örnek veri içerdiği için yeniden kurulur.
-- contact_messages korunur.

-- ——— v1 temizliği ———
drop table if exists public.books cascade;
drop table if exists public.authors cascade;
drop type if exists public.book_category;

-- ——— Yöneticiler ———
create table if not exists public.admins (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ——— Ortak updated_at ———
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ——— Sözlük tabloları ———
create table public.imprints (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  logo_url    text,
  website     text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name_tr     text not null,
  name_en     text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.series (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name_tr         text not null,
  name_en         text not null,
  description_tr  text,
  description_en  text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table public.stores (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ——— Yazarlar ———
create table public.authors (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  photo_url   text,
  bio_tr      text,
  bio_en      text,
  website     text,
  instagram   text,
  x           text,
  facebook    text,
  featured    boolean not null default false,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ——— Kitaplar ———
create table public.books (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique,
  title               text not null,
  title_en            text,
  subtitle            text,
  subtitle_en         text,
  category_id         uuid references public.categories(id) on delete set null,
  series_id           uuid references public.series(id) on delete set null,
  imprint_id          uuid references public.imprints(id) on delete set null,
  description_tr      text,
  description_en      text,
  isbn                text,
  pages               integer check (pages is null or pages > 0),
  publish_date        date,
  edition             text,
  size                text,
  language            text,
  editor              text,
  translator          text,
  cover_designer      text,
  other_credits       text,
  sample_url          text,
  cover_url           text,
  cover_width         integer not null default 1000,
  cover_height        integer not null default 1500,
  cover_color         text not null default '#e7e5e0',
  is_new              boolean not null default false,
  is_coming_soon      boolean not null default false,
  is_published        boolean not null default true,
  sort_order          integer not null default 0,
  seo_title_tr        text,
  seo_title_en        text,
  seo_description_tr  text,
  seo_description_en  text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index books_sort_idx     on public.books (sort_order);
create index books_category_idx on public.books (category_id);
create index books_series_idx   on public.books (series_id);
create index books_imprint_idx  on public.books (imprint_id);

create table public.book_authors (
  book_id    uuid not null references public.books(id) on delete cascade,
  author_id  uuid not null references public.authors(id) on delete cascade,
  position   integer not null default 0,
  primary key (book_id, author_id)
);
create index book_authors_author_idx on public.book_authors (author_id);

create table public.book_links (
  id          uuid primary key default gen_random_uuid(),
  book_id     uuid not null references public.books(id) on delete cascade,
  store_id    uuid not null references public.stores(id) on delete cascade,
  url         text not null,
  sort_order  integer not null default 0,
  unique (book_id, store_id)
);

-- ——— Bannerlar ———
create table public.banners (
  id                 uuid primary key default gen_random_uuid(),
  title_tr           text,
  title_en           text,
  subtitle_tr        text,
  subtitle_en        text,
  cta_tr             text,
  cta_en             text,
  link_url           text,
  book_id            uuid references public.books(id) on delete set null,
  image_desktop_url  text not null,
  image_mobile_url   text,
  text_theme         text not null default 'light' check (text_theme in ('light', 'dark')),
  is_active          boolean not null default true,
  sort_order         integer not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ——— Sayfalar (Hakkımızda, KVKK, Gizlilik, Çerez) ———
create table public.pages (
  slug        text primary key,
  title_tr    text not null,
  title_en    text not null,
  body_tr     text,
  body_en     text,
  updated_at  timestamptz not null default now()
);

-- ——— Site ayarları (tek satır) ———
create table public.settings (
  id                 integer primary key default 1 check (id = 1),
  company_name       text not null default 'Muhtelif Kitap',
  featured_book_id   uuid references public.books(id) on delete set null,
  featured_text_tr   text,
  featured_text_en   text,
  home_about_tr      text,
  home_about_en      text,
  submission_tr      text,
  submission_en      text,
  address            text,
  phone              text,
  email              text,
  map_query          text,
  instagram          text,
  x                  text,
  facebook           text,
  youtube            text,
  linkedin           text,
  updated_at         timestamptz not null default now()
);
insert into public.settings (id) values (1) on conflict do nothing;

-- ——— updated_at tetikleyicileri ———
do $$
declare t text;
begin
  foreach t in array array['imprints','categories','series','stores','authors','books','banners','pages','settings'] loop
    execute format('drop trigger if exists %1$s_touch on public.%1$s', t);
    execute format('create trigger %1$s_touch before update on public.%1$s for each row execute function public.touch_updated_at()', t);
  end loop;
end $$;

-- ——— RLS ———
do $$
declare t text;
begin
  foreach t in array array['admins','imprints','categories','series','stores','authors','books','book_authors','book_links','banners','pages','settings'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "admin full access" on public.%I', t);
    execute format('create policy "admin full access" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;

  -- Herkese açık okuma
  foreach t in array array['imprints','categories','series','stores','authors','book_authors','book_links','pages','settings'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('create policy "public read" on public.%I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

drop policy if exists "public read" on public.books;
create policy "public read" on public.books for select to anon, authenticated using (is_published);

drop policy if exists "public read" on public.banners;
create policy "public read" on public.banners for select to anon, authenticated using (is_active);

-- İletişim mesajları: ziyaretçi yazar, yalnızca yönetici okur/günceller/siler.
drop policy if exists "admin manage messages" on public.contact_messages;
create policy "admin manage messages" on public.contact_messages
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ——— Storage ———
insert into storage.buckets (id, name, public) values
  ('covers', 'covers', true),
  ('media',  'media',  true),
  ('files',  'files',  true)
on conflict (id) do nothing;

drop policy if exists "covers are public" on storage.objects;
drop policy if exists "public buckets readable" on storage.objects;
create policy "public buckets readable" on storage.objects
  for select to anon, authenticated using (bucket_id in ('covers', 'media', 'files'));

drop policy if exists "admins manage files" on storage.objects;
create policy "admins manage files" on storage.objects
  for all to authenticated
  using (bucket_id in ('covers', 'media', 'files') and public.is_admin())
  with check (bucket_id in ('covers', 'media', 'files') and public.is_admin());

-- ——— Site önbelleğini yenileme tetikleyicileri (bkz. 20261104010000) ———
do $$
declare t text;
begin
  foreach t in array array['imprints','categories','series','stores','authors','books','book_authors','book_links','banners','pages','settings'] loop
    execute format('drop trigger if exists %1$s_revalidate on public.%1$s', t);
    execute format('create trigger %1$s_revalidate after insert or update or delete on public.%1$s for each statement execute function public.notify_site_revalidate()', t);
  end loop;
end $$;
