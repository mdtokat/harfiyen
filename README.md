# Harfiyen

Her gün yeni bir 5 harfli Türkçe kelime. Altı denemede bul, anlamını öğren, sonucunu harfleri ele vermeden paylaş. Web'de GitHub Pages üzerinden, Android'de Google Play üzerinden yayınlanır. Günlük kelimeleri Claude zamanlanmış görevi seçer ve Supabase'e yazar.

Ayrıntılı tasarım: [docs/TASARIM.md](docs/TASARIM.md)

## Nasıl çalışır

- Cevap istemciye hiç gönderilmez. Her tahmin `kb_tahmin` fonksiyonunda (Supabase RPC) değerlendirilir; cevap yalnızca oyun bitince döner.
- Oyuncu, form doldurmadan anonim oturumla tanınır. Oyun durumu ve istatistikler sunucuda saklanır; 6 deneme sınırı sunucuda uygulanır.
- Oyun günü Türkiye saatiyle 00:00'da değişir.

## Yapı

| Klasör | İçerik |
|---|---|
| `src/App.tsx` | Oyun akışı: oturum, tahmin, açılış animasyonu, gün değişimi |
| `src/components` | Izgara, klavye, logo, pencereler (yardım, sonuç/istatistik, ayarlar) |
| `src/lib` | Supabase istemcisi, oyun API'si, harf kuralları, istatistik, bildirimler |
| `tests` | Harf normalleştirme, klavye durumu ve zor mod testleri (`npm test`) |
| `android` | Capacitor Android projesi |
| `.github/workflows` | Web yayını ve Android derlemesi |

Teknoloji: React + TypeScript + Vite, Supabase, Capacitor 8, vite-plugin-pwa.

## Geliştirme

```bash
npm install
npm run dev     # http://localhost:5173
npm test        # birim testleri
npm run build   # tip kontrolü + üretim derlemesi
```

## Supabase gereksinimi

**Authentication → Sign In / Providers → Anonymous sign-ins** açık olmalı. Kapalıysa oyun "Oyuna bağlanılamadı" der ve altında bu ayarı hatırlatan bir not gösterir.

Supabase projesi: `otomatik-uygulamalar` (`qjiurxkgzzlqqemkzgli`). Tablolar `kb_` önekiyle başlar; şema ve fonksiyonlar `docs/TASARIM.md` Bölüm 9'da.

## Yayınlama

### Web (GitHub Pages)
1. Repo **Public** olmalı (ücretsiz planda Pages yalnızca herkese açık repolarda çalışır).
2. **Settings → Pages → Build and deployment → Source: GitHub Actions** seç.
3. `main` dalına her push'ta site otomatik yayınlanır: `https://mdtokat.github.io/harfiyen/`

### Android
1. **Actions → Android derlemesi → Run workflow**.
2. İmza anahtarı yoksa yalnızca **test-apk** üretilir; telefona indirip doğrudan kurabilirsin.
3. Play için imzalı AAB üretmek üzere **Settings → Secrets and variables → Actions** altına şu gizli değerleri ekle:
   - `ANDROID_KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS` (`upload`), `KEY_PASSWORD`
4. İş akışını yeniden çalıştır; **play-aab** çıktısını Play Console'a yükle.

İmza anahtarı oluşturma:
```bash
keytool -genkeypair -v -keystore upload-key.jks -alias upload -keyalg RSA -keysize 2048 -validity 10000
base64 -i upload-key.jks        # Mac
# Windows PowerShell: [Convert]::ToBase64String([IO.File]::ReadAllBytes("upload-key.jks")) | Set-Clipboard
```

## Bulmaca numarası

Paylaşımdaki `#1` numarası `src/lib/tarih.ts` içindeki `BASLANGIC` tarihinden sayılır. Yayına çıktığın gün bu tarihi o güne çekersen ilk bulmaca #1 olur.
