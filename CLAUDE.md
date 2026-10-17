# Harfiyen: Claude Code için proje notları

Tasarımın tamamı `docs/TASARIM.md` dosyasında. Bir değişiklik yapmadan önce ilgili bölümü oku.

## Değişmez kurallar
- **Cevap istemciye gelmez.** `kb_bulmacalar` ve `kb_sozluk` tablolarının istemciye açılmasına yol açacak bir politika, görünüm veya fonksiyon ekleme. Tahmin değerlendirmesi yalnızca `kb_tahmin` RPC'sinde yapılır.
- Harfler istemcide `harfNormalle` (`src/lib/harfler.ts`) ile büyük Türkçe harfe çevrilir. Veritabanında `upper()` kullanma; İ/ı'yı yanlış çevirir.
- Oyun günü Türkiye saatine göredir (`src/lib/tarih.ts` → `trBugun`). Sunucu tarafında `(now() at time zone 'Europe/Istanbul')::date` kullanılır.
- Supabase `service_role` anahtarı hiçbir dosyaya girmez.

## Kod düzeni
- Arayüz metinleri Türkçe, sade ve cümle düzeninde. Hata mesajı ne olduğunu ve ne yapılacağını söyler.
- Kod içi adlar Türkçe (ör. `tahminGonder`, `harfDurumlari`). Bu düzeni koru.
- Renkler `src/styles.css` başındaki değişkenlerden gelir; açık, koyu ve renk körü (`data-renk="koru"`) varyantlarını birlikte güncelle.
- Hareket: karo açılışı, sallanma ve zıplama. Yeni animasyon eklerken `prefers-reduced-motion` kuralını koru.
- `localStorage` erişimi `src/lib/depo.ts` üzerinden.

## Komutlar
- `npm run dev`, `npm test`, `npm run build` (commit'ten önce test ve build çalıştır)
- `npx cap sync android`: web derlemesini Android projesine kopyalar

## Supabase
- Proje: `qjiurxkgzzlqqemkzgli` (otomatik-uygulamalar). Bu uygulamanın tabloları `kb_` öneki taşır; `gorev_kayitlari` ve `tt_` tabloları diğer uygulamalarla paylaşılır, dokunma.
- RPC'ler: `kb_bugun`, `kb_tahmin`, `kb_bitis_bilgisi`, `kb_dagilim`. Şema değişikliğini migration olarak ekle ve tasarım dokümanını güncelle.
- Anonim girişler açık olmalı (Authentication ayarları).

## Android
- İmza ayarları `android/app/build.gradle` başında ortam değişkenlerinden okunur.
- `SCHEDULE_EXACT_ALARM` izni bilerek kaldırıldı; hatırlatmalar yaklaşık zamanlı çalışır.
- İkonlar `assets/` içindeki SVG'lerden üretildi.
