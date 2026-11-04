-- Otomatik üretildi: npm run seed:sql
begin;

insert into public.categories (slug, name_tr, name_en, sort_order) values
  ('roman', 'Roman', 'Novel', 10),
  ('oyku', 'Öykü', 'Short Stories', 20),
  ('siir', 'Şiir', 'Poetry', 30),
  ('inceleme', 'İnceleme', 'Non-fiction', 40)
on conflict (slug) do nothing;

insert into public.series (slug, name_tr, name_en, description_tr, description_en, sort_order) values
  ('muhtelif-spekulatif', 'Muhtelif Spekülatif', 'Muhtelif Speculative', 'Bilimkurgu, fantastik ve kıyamet sonrası anlatılar.', 'Science fiction, fantasy and post-apocalyptic narratives.', 10),
  ('muhtelif-siir', 'Muhtelif Şiir', 'Muhtelif Poetry', 'Ortak bir tasarım diliyle yayımlanan şiir dizimiz.', 'Our poetry series, published with a shared design language.', 20)
on conflict (slug) do nothing;

insert into public.imprints (slug, name, logo_url, sort_order) values
  ('muhtelif-kitap', 'Muhtelif Kitap', '/brand/muhtelif-logo.png', 10),
  ('bandini-kitap', 'Bandini Kitap', null, 20),
  ('baska-kitap', 'Başka Kitap', '/brand/baska-kitap.png', 30)
on conflict (slug) do nothing;

insert into public.stores (slug, name, sort_order) values
  ('amazon-tr', 'Amazon Türkiye', 10),
  ('kitapyurdu', 'Kitapyurdu', 20)
on conflict (slug) do nothing;

insert into public.authors (slug, name, featured, sort_order) values
  ('erim-sisman', 'Erim Şişman', true, 10),
  ('mahmut-yigit-cakin', 'Mahmut Yiğit Çakın', true, 20),
  ('ayhan-koc', 'Ayhan Koç', true, 30),
  ('ahmet-rifat-ilhan', 'Ahmet Rıfat İlhan', true, 40),
  ('kader-mentes-bolat', 'Kader Menteş Bolat', true, 50),
  ('serhat-koroglu', 'Serhat Köroğlu', true, 60),
  ('idris-ozyol', 'İdris Özyol', false, 70),
  ('devrim-horlu', 'Devrim Horlu', false, 80),
  ('ceren-biber', 'Ceren Biber', false, 90),
  ('bengu-ozsoy', 'Bengü Özsoy', false, 100),
  ('gokhan-arslan', 'Gökhan Arslan', false, 110),
  ('jean-francois-beauchemin', 'Jean-François Beauchemin', false, 120),
  ('ipek-tekdemir', 'İpek Tekdemir', false, 130)
on conflict (slug) do nothing;

insert into public.books (slug, title, subtitle, category_id, series_id, imprint_id, language, editor, translator, cover_designer, edition, cover_url, cover_width, cover_height, cover_color, is_new, sort_order) values
  ('ottopunk-1-fasil', 'Ottopunk', '1. Fasıl', (select id from public.categories where slug = 'roman'), (select id from public.series where slug = 'muhtelif-spekulatif'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/ottopunk-1-fasil.webp', 1000, 1566, '#223629', true, 10),
  ('isiktan-sonra-kiyamet-kayitlari', 'Işıktan Sonra', 'Kıyamet Kayıtları', (select id from public.categories where slug = 'roman'), (select id from public.series where slug = 'muhtelif-spekulatif'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/isiktan-sonra-kiyamet-kayitlari.webp', 1000, 1555, '#2a1b29', true, 20),
  ('tarihin-molozlari-ustunde', 'Tarihin Molozları Üstünde', null, (select id from public.categories where slug = 'roman'), (select id from public.series where slug = 'muhtelif-spekulatif'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/tarihin-molozlari-ustunde.webp', 1000, 1516, '#2b4210', true, 30),
  ('kopuk-beyazi', 'Köpük Beyazı', null, (select id from public.categories where slug = 'oyku'), null, (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/kopuk-beyazi.webp', 1000, 1555, '#fed351', true, 40),
  ('boslugun-icinden', 'Boşluğun İçinden', null, (select id from public.categories where slug = 'oyku'), null, (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, '2. Baskı', 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/boslugun-icinden.webp', 1000, 1521, '#d8c856', false, 50),
  ('eve-ne-zaman-donecegiz', 'Eve Ne Zaman Döneceğiz?', null, (select id from public.categories where slug = 'oyku'), null, (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/eve-ne-zaman-donecegiz.webp', 1000, 1559, '#9c7e4d', false, 60),
  ('dunya-bizi-unutacak', 'Dünya Bizi Unutacak', null, (select id from public.categories where slug = 'siir'), (select id from public.series where slug = 'muhtelif-siir'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/dunya-bizi-unutacak.webp', 1000, 1562, '#397a9d', false, 70),
  ('golgeler-cururken', 'Gölgeler Çürürken', null, (select id from public.categories where slug = 'siir'), (select id from public.series where slug = 'muhtelif-siir'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/golgeler-cururken.webp', 1000, 1500, '#4bf46b', false, 80),
  ('nis', 'Niş', null, (select id from public.categories where slug = 'siir'), (select id from public.series where slug = 'muhtelif-siir'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/nis.webp', 1000, 1501, '#f26029', false, 90),
  ('orumcek-supurgesi', 'Örümcek Süpürgesi', null, (select id from public.categories where slug = 'siir'), (select id from public.series where slug = 'muhtelif-siir'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/orumcek-supurgesi.webp', 1000, 1501, '#3539f6', false, 100),
  ('sarkilar-ve-ruyalar', 'Şarkılar ve Rüyalar', null, (select id from public.categories where slug = 'siir'), (select id from public.series where slug = 'muhtelif-siir'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', 'Emel Mutlu', null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/sarkilar-ve-ruyalar.webp', 1000, 1518, '#6361dc', false, 110),
  ('dut-sesinden-atmaca', 'Dut Sesinden Atmaca', null, (select id from public.categories where slug = 'siir'), (select id from public.series where slug = 'muhtelif-siir'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/dut-sesinden-atmaca.webp', 1000, 1629, '#e5e5e3', false, 120),
  ('kamburumun-insani', 'Kamburumun İnsanı', null, (select id from public.categories where slug = 'siir'), (select id from public.series where slug = 'muhtelif-siir'), (select id from public.imprints where slug = 'muhtelif-kitap'), 'Türkçe', null, null, null, '2. Baskı', 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/kamburumun-insani.webp', 1000, 1519, '#b1a05b', false, 130),
  ('kralcik', 'Kralcık', null, (select id from public.categories where slug = 'roman'), null, (select id from public.imprints where slug = 'bandini-kitap'), 'Türkçe', null, 'Ece Peker', null, null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/kralcik.webp', 1000, 1494, '#e5e1ce', false, 140),
  ('in-communication-we-trust', 'In Communication We Trust', 'New Diplomacy Language for Sustainable Ecosystem and Prosperous Society', (select id from public.categories where slug = 'inceleme'), null, (select id from public.imprints where slug = 'muhtelif-kitap'), 'İngilizce', null, null, 'İsmail Acar', null, 'https://zlpoeauocdokutpiyoqt.supabase.co/storage/v1/object/public/covers/in-communication-we-trust.webp', 1000, 1478, '#999a94', false, 150)
on conflict (slug) do nothing;

insert into public.book_authors (book_id, author_id, position) values
  ((select id from public.books where slug = 'ottopunk-1-fasil'), (select id from public.authors where slug = 'erim-sisman'), 0),
  ((select id from public.books where slug = 'isiktan-sonra-kiyamet-kayitlari'), (select id from public.authors where slug = 'mahmut-yigit-cakin'), 0),
  ((select id from public.books where slug = 'tarihin-molozlari-ustunde'), (select id from public.authors where slug = 'ayhan-koc'), 0),
  ((select id from public.books where slug = 'kopuk-beyazi'), (select id from public.authors where slug = 'ahmet-rifat-ilhan'), 0),
  ((select id from public.books where slug = 'boslugun-icinden'), (select id from public.authors where slug = 'kader-mentes-bolat'), 0),
  ((select id from public.books where slug = 'eve-ne-zaman-donecegiz'), (select id from public.authors where slug = 'serhat-koroglu'), 0),
  ((select id from public.books where slug = 'dunya-bizi-unutacak'), (select id from public.authors where slug = 'idris-ozyol'), 0),
  ((select id from public.books where slug = 'golgeler-cururken'), (select id from public.authors where slug = 'devrim-horlu'), 0),
  ((select id from public.books where slug = 'nis'), (select id from public.authors where slug = 'ceren-biber'), 0),
  ((select id from public.books where slug = 'orumcek-supurgesi'), (select id from public.authors where slug = 'bengu-ozsoy'), 0),
  ((select id from public.books where slug = 'sarkilar-ve-ruyalar'), (select id from public.authors where slug = 'gokhan-arslan'), 0),
  ((select id from public.books where slug = 'dut-sesinden-atmaca'), (select id from public.authors where slug = 'gokhan-arslan'), 0),
  ((select id from public.books where slug = 'kamburumun-insani'), (select id from public.authors where slug = 'devrim-horlu'), 0),
  ((select id from public.books where slug = 'kralcik'), (select id from public.authors where slug = 'jean-francois-beauchemin'), 0),
  ((select id from public.books where slug = 'in-communication-we-trust'), (select id from public.authors where slug = 'ipek-tekdemir'), 0)
on conflict do nothing;

insert into public.pages (slug, title_tr, title_en, body_tr, body_en) values
  ('hakkimizda', 'Hakkımızda', 'About', 'Muhtelif Kitap; roman, öykü, şiir ve inceleme yayımlayan bağımsız bir yayınevi. Adımız kataloğumuzu anlatıyor: tek bir türe, tek bir sese bağlı kalmadan, okunmayı hak eden metinleri yan yana getiriyoruz.

## Yayın anlayışımız

Şiir kitaplarımız aynı tasarım dilini paylaşan, renkleriyle rafta birbirini bulan Muhtelif Şiir dizisinde yayımlanıyor. Muhtelif Spekülatif dizisinde ise bilimkurgu, fantastik ve kıyamet sonrası anlatılara yer açıyoruz.

Her kitabı kendi dünyasıyla, kendi kapağıyla ele alıyor; yazarlarımızla birlikte metnin en iyi hâline ulaşmaya çalışıyoruz.', 'Muhtelif Kitap is an independent publisher of novels, short stories, poetry and non-fiction. Our name — Turkish for "assorted" — describes our list: rather than committing to a single genre or voice, we bring together texts that deserve to be read.

## Our approach

Our poetry appears in the Muhtelif Poetry series, whose books share a design language and find one another on the shelf through colour. The Muhtelif Speculative series makes room for science fiction, fantasy and post-apocalyptic narratives.

We treat every book on its own terms, with its own world and its own cover, and work closely with our authors to bring each text to its best form.'),
  ('kvkk', 'KVKK Aydınlatma Metni', 'Personal Data Notice (KVKK)', 'Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusu sıfatıyla Muhtelif Kitap tarafından hazırlanmıştır.

## İşlenen veriler

İletişim formu aracılığıyla ilettiğiniz ad, e-posta adresi ve mesaj içeriği.

## İşleme amacı ve hukuki sebep

Verileriniz yalnızca başvurunuzu değerlendirmek ve size dönüş yapmak amacıyla, Kanun''un 5. maddesindeki açık rıza ve meşru menfaat sebeplerine dayanılarak işlenir.

## Aktarım ve saklama

Veriler, sitenin barındırma ve veritabanı hizmet sağlayıcılarının sunucularında saklanır; üçüncü kişilerle pazarlama amacıyla paylaşılmaz. Başvurunuzun sonuçlanmasının ardından makul süre içinde silinir.

## Haklarınız

Kanun''un 11. maddesi kapsamındaki haklarınızı kullanmak için İletişim sayfasındaki bilgiler üzerinden bize ulaşabilirsiniz.', 'This notice is provided by Muhtelif Kitap as data controller under the Turkish Personal Data Protection Law No. 6698 (KVKK).

## Data we process

Your name, email address and message content submitted through the contact form.

## Purpose and legal basis

Your data is processed solely to review your enquiry and respond to you, on the basis of explicit consent and legitimate interest under Article 5 of the Law.

## Transfer and retention

Data is stored on the servers of the site''s hosting and database providers and is never shared with third parties for marketing. It is deleted within a reasonable period after your enquiry is concluded.

## Your rights

To exercise your rights under Article 11 of the Law, please reach us using the details on the Contact page.'),
  ('gizlilik', 'Gizlilik Politikası', 'Privacy Policy', 'Muhtelif Kitap web sitesi bir tanıtım ve katalog sitesidir; sitede satış yapılmaz, üyelik veya ödeme bilgisi toplanmaz.

## Topladığımız bilgiler

Yalnızca iletişim formuna kendi isteğinizle yazdığınız bilgiler kaydedilir. Site, ziyaretçileri izlemeye yönelik analiz veya reklam araçları kullanmaz.

## Dış bağlantılar

Kitap sayfalarındaki "Satın Al" bağlantıları sizi bağımsız satış noktalarına yönlendirir. Bu sitelerin gizlilik uygulamalarından Muhtelif Kitap sorumlu değildir.

## İletişim

Gizlilikle ilgili sorularınız için İletişim sayfasındaki bilgileri kullanabilirsiniz.', 'The Muhtelif Kitap website is an informational catalogue; nothing is sold on the site and no account or payment information is collected.

## Information we collect

Only the information you choose to submit through the contact form is stored. The site does not use analytics or advertising tools to track visitors.

## External links

"Buy" links on book pages take you to independent retailers. Muhtelif Kitap is not responsible for the privacy practices of those sites.

## Contact

For privacy-related questions, please use the details on the Contact page.'),
  ('cerez', 'Çerez Politikası', 'Cookie Policy', 'Muhtelif Kitap web sitesi ziyaretçileri izlemeye yönelik çerez kullanmaz.

## Zorunlu çerezler

Yalnızca yönetim panelinde, yetkili kullanıcıların oturumunu sürdürmek için teknik olarak zorunlu çerezler kullanılır. Bu çerezler site ziyaretçilerine yerleştirilmez.

## Tercihleriniz

Tarayıcınızın ayarlarından çerezleri dilediğiniz zaman silebilir veya engelleyebilirsiniz.', 'The Muhtelif Kitap website does not use cookies to track visitors.

## Strictly necessary cookies

Strictly necessary cookies are used only in the administration panel to keep authorised users signed in. They are not set for site visitors.

## Your choices

You can delete or block cookies at any time in your browser settings.')
on conflict (slug) do nothing;

update public.settings set company_name = 'Muhtelif Kitap', featured_book_id = (select id from public.books where slug = 'ottopunk-1-fasil'), home_about_tr = 'Muhtelif Kitap; roman, öykü, şiir ve inceleme yayımlayan bağımsız bir yayınevi. Tek bir türe, tek bir sese bağlı kalmadan, okunmayı hak eden metinleri yan yana getiriyoruz.', home_about_en = 'Muhtelif Kitap is an independent publisher of novels, short stories, poetry and non-fiction. Rather than committing to a single genre or voice, we bring together texts that deserve to be read.', submission_tr = 'Roman, öykü, şiir ya da spekülatif kurgu dosyanızı değerlendirmemizi isterseniz, iletişim formunda “Dosya gönderimi” konusunu seçip kısaca kendinizden ve metninizden bahsedin.', submission_en = 'If you would like us to consider your novel, short story, poetry or speculative fiction manuscript, choose “Manuscript submission” in the contact form and tell us briefly about yourself and your work.' where id = 1;

commit;
