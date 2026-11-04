-- Otomatik üretildi: npm run seed:sql (kaynak: data/catalog.ts)
begin;

insert into public.authors (slug, name, bio) values
  ('erim-sisman', 'Erim Şişman', null),
  ('mahmut-yigit-cakin', 'Mahmut Yiğit Çakın', null),
  ('ayhan-koc', 'Ayhan Koç', null),
  ('jean-francois-beauchemin', 'Jean-François Beauchemin', null),
  ('kader-mentes-bolat', 'Kader Menteş Bolat', null),
  ('serhat-koroglu', 'Serhat Köroğlu', null),
  ('ahmet-rifat-ilhan', 'Ahmet Rıfat İlhan', null),
  ('idris-ozyol', 'İdris Özyol', null),
  ('devrim-horlu', 'Devrim Horlu', null),
  ('ceren-biber', 'Ceren Biber', null),
  ('bengu-ozsoy', 'Bengü Özsoy', null),
  ('gokhan-arslan', 'Gökhan Arslan', null),
  ('ipek-tekdemir', 'İpek Tekdemir', null)
on conflict (slug) do update set name = excluded.name, bio = coalesce(excluded.bio, public.authors.bio);

insert into public.books (slug, title, subtitle, author_id, category, series, imprint, translator, editor, cover_artist, edition, language, description, isbn, pages, published_year, price, buy_url, cover_url, cover_width, cover_height, cover_color, featured, sort_order) values
  ('ottopunk-1-fasil', 'Ottopunk', '1. Fasıl', (select id from public.authors where slug = 'erim-sisman'), 'roman'::public.book_category, 'Muhtelif Spekülatif', 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/ottopunk-1-fasil.webp', 1000, 1566, '#223629', true, 10),
  ('isiktan-sonra-kiyamet-kayitlari', 'Işıktan Sonra', 'Kıyamet Kayıtları', (select id from public.authors where slug = 'mahmut-yigit-cakin'), 'roman'::public.book_category, 'Muhtelif Spekülatif', 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/isiktan-sonra-kiyamet-kayitlari.webp', 1000, 1555, '#2a1b29', true, 20),
  ('tarihin-molozlari-ustunde', 'Tarihin Molozları Üstünde', null, (select id from public.authors where slug = 'ayhan-koc'), 'roman'::public.book_category, 'Muhtelif Spekülatif', 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/tarihin-molozlari-ustunde.webp', 1000, 1516, '#2b4210', true, 30),
  ('kralcik', 'Kralcık', null, (select id from public.authors where slug = 'jean-francois-beauchemin'), 'roman'::public.book_category, null, 'Bandini', 'Ece Peker', null, null, null, 'Türkçe (Fransızcadan çeviri)', null, null, null, null, null, null, '/covers/kralcik.webp', 1000, 1494, '#e5e1ce', false, 40),
  ('boslugun-icinden', 'Boşluğun İçinden', null, (select id from public.authors where slug = 'kader-mentes-bolat'), 'oyku'::public.book_category, null, 'Muhtelif Kitap', null, null, null, '2. Baskı', 'Türkçe', null, null, null, null, null, null, '/covers/boslugun-icinden.webp', 1000, 1521, '#d8c856', true, 50),
  ('eve-ne-zaman-donecegiz', 'Eve Ne Zaman Döneceğiz?', null, (select id from public.authors where slug = 'serhat-koroglu'), 'oyku'::public.book_category, null, 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/eve-ne-zaman-donecegiz.webp', 1000, 1559, '#9c7e4d', false, 60),
  ('kopuk-beyazi', 'Köpük Beyazı', null, (select id from public.authors where slug = 'ahmet-rifat-ilhan'), 'oyku'::public.book_category, null, 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/kopuk-beyazi.webp', 1000, 1555, '#fed351', true, 70),
  ('dunya-bizi-unutacak', 'Dünya Bizi Unutacak', null, (select id from public.authors where slug = 'idris-ozyol'), 'siir'::public.book_category, null, 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/dunya-bizi-unutacak.webp', 1000, 1562, '#397a9d', true, 80),
  ('golgeler-cururken', 'Gölgeler Çürürken', null, (select id from public.authors where slug = 'devrim-horlu'), 'siir'::public.book_category, null, 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/golgeler-cururken.webp', 1000, 1500, '#4bf46b', true, 90),
  ('nis', 'Niş', null, (select id from public.authors where slug = 'ceren-biber'), 'siir'::public.book_category, null, 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/nis.webp', 1000, 1501, '#f26029', true, 100),
  ('orumcek-supurgesi', 'Örümcek Süpürgesi', null, (select id from public.authors where slug = 'bengu-ozsoy'), 'siir'::public.book_category, null, 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/orumcek-supurgesi.webp', 1000, 1501, '#3539f6', true, 110),
  ('sarkilar-ve-ruyalar', 'Şarkılar ve Rüyalar', null, (select id from public.authors where slug = 'gokhan-arslan'), 'siir'::public.book_category, null, 'Muhtelif Kitap', null, 'Emel Mutlu', null, null, 'Türkçe', null, null, null, null, null, null, '/covers/sarkilar-ve-ruyalar.webp', 1000, 1518, '#6361dc', true, 120),
  ('dut-sesinden-atmaca', 'Dut Sesinden Atmaca', null, (select id from public.authors where slug = 'gokhan-arslan'), 'siir'::public.book_category, null, 'Muhtelif Kitap', null, null, null, null, 'Türkçe', null, null, null, null, null, null, '/covers/dut-sesinden-atmaca.webp', 1000, 1629, '#e5e5e3', false, 130),
  ('kamburumun-insani', 'Kamburumun İnsanı', null, (select id from public.authors where slug = 'devrim-horlu'), 'siir'::public.book_category, null, 'Muhtelif Kitap', null, null, null, '2. Baskı', 'Türkçe', null, null, null, null, null, null, '/covers/kamburumun-insani.webp', 1000, 1519, '#b1a05b', false, 140),
  ('in-communication-we-trust', 'In Communication We Trust', 'New Diplomacy Language for Sustainable Ecosystem and Prosperous Society', (select id from public.authors where slug = 'ipek-tekdemir'), 'inceleme'::public.book_category, null, 'Muhtelif Kitap', null, null, 'İsmail Acar', null, 'İngilizce', null, null, null, null, null, null, '/covers/in-communication-we-trust.webp', 1000, 1478, '#999a94', false, 150)
on conflict (slug) do update set title = excluded.title, subtitle = excluded.subtitle, author_id = excluded.author_id, category = excluded.category, series = excluded.series, imprint = excluded.imprint, translator = excluded.translator, editor = excluded.editor, cover_artist = excluded.cover_artist, edition = excluded.edition, language = excluded.language, isbn = excluded.isbn, pages = excluded.pages, published_year = excluded.published_year, price = excluded.price, buy_url = excluded.buy_url, cover_width = excluded.cover_width, cover_height = excluded.cover_height, cover_color = excluded.cover_color, featured = excluded.featured, sort_order = excluded.sort_order;

commit;
