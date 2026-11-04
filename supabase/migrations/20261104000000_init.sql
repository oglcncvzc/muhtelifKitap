-- Muhtelif Kitap — başlangıç şeması
-- Supabase SQL Editor'da çalıştırın ya da `supabase db push` kullanın.

create extension if not exists "pgcrypto";

-- ——— Türler ———
do $$ begin
  create type public.book_category as enum ('roman', 'oyku', 'siir', 'inceleme');
exception when duplicate_object then null; end $$;

-- ——— Yazarlar ———
create table if not exists public.authors (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  bio         text,
  photo_url   text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ——— Kitaplar ———
create table if not exists public.books (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  subtitle        text,
  author_id       uuid not null references public.authors(id) on delete restrict,
  category        public.book_category not null,
  series          text,
  imprint         text not null default 'Muhtelif Kitap',
  translator      text,
  editor          text,
  cover_artist    text,
  edition         text,
  language        text not null default 'Türkçe',
  description     text,
  isbn            text,
  pages           integer check (pages is null or pages > 0),
  published_year  integer check (published_year is null or published_year between 1900 and 2100),
  price           numeric(10, 2) check (price is null or price >= 0),
  buy_url         text,
  cover_url       text not null,
  cover_width     integer not null default 1000,
  cover_height    integer not null default 1500,
  cover_color     text not null default '#e9e5da',
  featured        boolean not null default false,
  sort_order      integer not null default 0,
  is_published    boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists books_author_idx   on public.books (author_id);
create index if not exists books_category_idx on public.books (category);
create index if not exists books_sort_idx     on public.books (sort_order);

-- ——— İletişim formu ———
create table if not exists public.contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null check (char_length(name) between 2 and 120),
  email       text not null check (char_length(email) between 3 and 200),
  subject     text not null default 'genel' check (subject in ('genel', 'dosya', 'basin', 'satis')),
  message     text not null check (char_length(message) between 10 and 5000),
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ——— updated_at tetikleyicisi ———
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists authors_touch on public.authors;
create trigger authors_touch before update on public.authors
  for each row execute function public.touch_updated_at();

drop trigger if exists books_touch on public.books;
create trigger books_touch before update on public.books
  for each row execute function public.touch_updated_at();

-- ——— Row Level Security ———
alter table public.authors          enable row level security;
alter table public.books            enable row level security;
alter table public.contact_messages enable row level security;

-- Ziyaretçiler yazarları ve yayımlanmış kitapları okuyabilir.
drop policy if exists "authors are public" on public.authors;
create policy "authors are public" on public.authors
  for select to anon, authenticated using (true);

drop policy if exists "published books are public" on public.books;
create policy "published books are public" on public.books
  for select to anon, authenticated using (is_published);

-- Ziyaretçiler yalnızca mesaj bırakabilir; mesajları okuyamaz.
drop policy if exists "anyone can send a message" on public.contact_messages;
create policy "anyone can send a message" on public.contact_messages
  for insert to anon, authenticated with check (true);

-- Düzenleme işlemleri Supabase panelinden (service role) yapılır;
-- anon/authenticated için insert/update/delete politikası tanımlanmamıştır.

-- ——— Kapak görselleri için herkese açık bucket ———
insert into storage.buckets (id, name, public)
values ('covers', 'covers', true)
on conflict (id) do nothing;

drop policy if exists "covers are public" on storage.objects;
create policy "covers are public" on storage.objects
  for select to anon, authenticated using (bucket_id = 'covers');
