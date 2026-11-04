-- Kitap/yazar değişince sitenin önbelleğini anında yenile.
-- Adres ve şifre Vault'tan okunur; bu dosyada gizli bilgi yoktur.
--
-- Vault'a bir kez eklenmesi gerekenler (SQL Editor):
--   select vault.create_secret('https://muhtelif-kitap.vercel.app/api/revalidate', 'revalidate_url');
--   select vault.create_secret('<REVALIDATE_SECRET>', 'revalidate_secret');

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_site_revalidate()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_url text;
  secret     text;
begin
  select decrypted_secret into target_url from vault.decrypted_secrets where name = 'revalidate_url';
  select decrypted_secret into secret     from vault.decrypted_secrets where name = 'revalidate_secret';

  if target_url is not null and secret is not null then
    perform net.http_post(
      url     := target_url,
      headers := jsonb_build_object('Content-Type', 'application/json', 'x-revalidate-secret', secret),
      body    := jsonb_build_object('table', tg_table_name, 'op', tg_op)
    );
  end if;
  return null;
end $$;

revoke all on function public.notify_site_revalidate() from public, anon, authenticated;

drop trigger if exists books_revalidate on public.books;
create trigger books_revalidate
  after insert or update or delete on public.books
  for each statement execute function public.notify_site_revalidate();

drop trigger if exists authors_revalidate on public.authors;
create trigger authors_revalidate
  after insert or update or delete on public.authors
  for each statement execute function public.notify_site_revalidate();
