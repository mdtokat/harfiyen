import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { App as CapApp } from '@capacitor/app'
import { DENEME_SAYISI, KELIME_UZUNLUGU, harfDurumlari, harfNormalle, zorModHatasi } from './lib/harfler'
import {
  OyunHatasi,
  bitisBilgisi,
  bugunuSor,
  denemeleriGetir,
  kelimeOner,
  oturumHazirla,
  oturumuYenile,
  tahminGonder,
  tumDenemeler,
  type BitisBilgisi,
  type Satir,
} from './lib/oyun'
import { istatistikHesapla, type Istatistik } from './lib/istatistik'
import { ayarlariGuncelle, ayarlariOku, useAyarlar, zorModGunuKaydet } from './lib/ayarlar'
import { bildirimleriPlanla } from './lib/bildirim'
import { yerelUygulama } from './lib/platform'
import { trBugun } from './lib/tarih'
import { Izgara } from './components/Izgara'
import { Klavye } from './components/Klavye'
import { Logo } from './components/Logo'
import { Bildirimler, type Bildirim } from './components/Bildirimler'
import { YardimPenceresi } from './components/YardimPenceresi'
import { SonucPenceresi } from './components/SonucPenceresi'
import { AyarlarPenceresi } from './components/AyarlarPenceresi'

type Asama = 'yukleniyor' | 'oyun' | 'hazirlaniyor' | 'hata'
type PencereAdi = 'yardim' | 'sonuc' | 'ayarlar' | null

const TEBRIK = ['Dahice!', 'Olağanüstü!', 'Harika!', 'Çok iyi!', 'Güzel!', 'Son anda!']
const ACILIS_MS = 260 * (KELIME_UZUNLUGU - 1) + 520
const azHareket = () => matchMedia('(prefers-reduced-motion: reduce)').matches

const kazanildi = (s: Satir[]) => s.some((r) => r.sonuc.every((d) => d === 'yesil'))

export default function App() {
  const ayar = useAyarlar()
  const [asama, setAsama] = useState<Asama>('yukleniyor')
  const [hataAyrinti, setHataAyrinti] = useState('')
  const [tarih, setTarih] = useState('')
  const [satirlar, setSatirlar] = useState<Satir[]>([])
  const [renkliSatir, setRenkliSatir] = useState(0)
  const [mevcut, setMevcut] = useState('')
  const [bitis, setBitis] = useState<BitisBilgisi | null>(null)
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [animasyon, setAnimasyon] = useState(false)
  const [acilanSatir, setAcilanSatir] = useState<number | null>(null)
  const [sallanan, setSallanan] = useState(false)
  const [zipla, setZipla] = useState<number | null>(null)
  const [pencere, setPencere] = useState<PencereAdi>(null)
  const [bildirimler, setBildirimler] = useState<Bildirim[]>([])
  const [istatistik, setIstatistik] = useState<Istatistik | null>(null)
  const bildirimNo = useRef(0)

  const kazandi = kazanildi(satirlar)
  const bitti = kazandi || satirlar.length >= DENEME_SAYISI
  const durumlar = useMemo(() => harfDurumlari(satirlar.slice(0, renkliSatir)), [satirlar, renkliSatir])

  const bildir = useCallback((metin: string, eylem?: Bildirim['eylem'], sure = 2200) => {
    const id = ++bildirimNo.current
    setBildirimler((l) => [...l.slice(-2), { id, metin, eylem }])
    setTimeout(() => setBildirimler((l) => l.filter((b) => b.id !== id)), sure)
  }, [])

  const salla = useCallback(() => {
    setSallanan(true)
    setTimeout(() => setSallanan(false), 450)
  }, [])

  const istatistikYukle = useCallback(async (t: string) => {
    try {
      setIstatistik(istatistikHesapla(await tumDenemeler(), t))
    } catch {
      /* istatistik yüklenemezse pencere onsuz açılır */
    }
  }, [])

  const baslat = useCallback(async () => {
    setAsama('yukleniyor')
    setPencere(null)
    try {
      await oturumHazirla()
      const b = await bugunuSor()
      setTarih(b.tarih)
      if (!b.hazir) {
        setAsama('hazirlaniyor')
        return
      }
      const s = await denemeleriGetir(b.tarih)
      const bittiMi = kazanildi(s) || s.length >= DENEME_SAYISI
      setSatirlar(s)
      setRenkliSatir(s.length)
      setMevcut('')
      setAcilanSatir(null)
      setZipla(null)
      setBitis(bittiMi ? await bitisBilgisi(b.tarih) : null)
      setAsama('oyun')
      void istatistikYukle(b.tarih)
      void bildirimleriPlanla(bittiMi)
      if (bittiMi) setPencere('sonuc')
      else if (!ayarlariOku().yardimGoruldu) {
        setPencere('yardim')
        ayarlariGuncelle({ yardimGoruldu: true })
      }
    } catch (e) {
      setHataAyrinti(
        e instanceof OyunHatasi && e.kod === 'anonim_kapali'
          ? 'Geliştirici notu: Supabase projesinde anonim girişler kapalı. Authentication ayarlarından "Anonymous sign-ins" seçeneğini aç.'
          : '',
      )
      setAsama('hata')
    }
  }, [istatistikYukle])

  useEffect(() => {
    void baslat()
  }, [baslat])

  // Gün değişimi: uygulama öne gelince veya dakikada bir kontrol et.
  useEffect(() => {
    const kontrol = () => {
      if (document.visibilityState === 'visible' && tarih && trBugun() !== tarih) void baslat()
    }
    document.addEventListener('visibilitychange', kontrol)
    const t = setInterval(kontrol, 60_000)
    return () => {
      document.removeEventListener('visibilitychange', kontrol)
      clearInterval(t)
    }
  }, [tarih, baslat])

  const oynanabilir = asama === 'oyun' && !bitti && !gonderiliyor && !animasyon

  const harfEkle = (h: string) => {
    if (!oynanabilir) return
    setMevcut((m) => (m.length < KELIME_UZUNLUGU ? m + h : m))
  }
  const harfSil = () => {
    if (!oynanabilir) return
    setMevcut((m) => [...m].slice(0, -1).join(''))
  }

  const gonder = async () => {
    if (!oynanabilir) return
    const kelime = mevcut
    if ([...kelime].length < KELIME_UZUNLUGU) {
      salla()
      bildir('Kelime 5 harfli olmalı')
      return
    }
    if (ayar.zorMod) {
      const h = zorModHatasi(kelime, satirlar)
      if (h) {
        salla()
        bildir(h)
        return
      }
    }
    setGonderiliyor(true)
    try {
      const r = await tahminGonder(kelime)
      if (!r.gecerli) {
        salla()
        bildir(
          'Sözlükte yok',
          {
            ad: 'Kelimeyi öner',
            f: async () => bildir((await kelimeOner(kelime)) ? 'Önerin alındı, incelenecek' : 'Öneri gönderilemedi'),
          },
          4500,
        )
        return
      }
      if (r.tarih && r.tarih !== tarih) {
        bildir('Yeni gün başladı')
        await baslat()
        return
      }
      if (satirlar.length === 0 && ayar.zorMod) zorModGunuKaydet(tarih)
      const sira = satirlar.length
      const yeni = [...satirlar, { tahmin: kelime, sonuc: r.sonuc ?? [] }]
      setSatirlar(yeni)
      setMevcut('')
      setAcilanSatir(sira)
      setAnimasyon(true)
      setTimeout(
        () => {
          setRenkliSatir(yeni.length)
          setAnimasyon(false)
          if (!r.bitti) return
          if (r.cevap) setBitis({ cevap: r.cevap, anlam: r.anlam ?? '', ornek: r.ornek ?? '' })
          if (r.dogru) {
            setZipla(sira)
            bildir(TEBRIK[sira])
          } else if (r.cevap) {
            bildir(`Kelime: ${r.cevap}`, undefined, 4000)
          }
          void istatistikYukle(tarih)
          void bildirimleriPlanla(true)
          setTimeout(() => setPencere('sonuc'), 1700)
        },
        azHareket() ? 0 : ACILIS_MS,
      )
    } catch (e) {
      if (e instanceof OyunHatasi && (e.kod === 'oyun_bitti' || e.kod === 'bulmaca_yok' || e.kod === 'cakisma')) {
        await baslat()
      } else if (e instanceof OyunHatasi && e.kod === 'oturum') {
        await oturumuYenile().catch(() => undefined)
        bildir('Oturum yenilendi, yeniden dene')
      } else {
        bildir('Bağlantı kurulamadı. Yeniden dene.')
      }
    } finally {
      setGonderiliyor(false)
    }
  }

  // Fiziksel klavye
  const isleyiciler = useRef({ harfEkle, harfSil, gonder })
  isleyiciler.current = { harfEkle, harfSil, gonder }
  useEffect(() => {
    const f = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || document.querySelector('dialog[open]')) return
      if (e.key === 'Enter') {
        e.preventDefault()
        void isleyiciler.current.gonder()
      } else if (e.key === 'Backspace') isleyiciler.current.harfSil()
      else {
        const h = harfNormalle(e.key)
        if (h) isleyiciler.current.harfEkle(h)
      }
    }
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [])

  // Android geri tuşu: açık pencereyi kapat, yoksa uygulamadan çık.
  const pencereRef = useRef(pencere)
  pencereRef.current = pencere
  useEffect(() => {
    if (!yerelUygulama()) return
    const d = CapApp.addListener('backButton', () => {
      if (pencereRef.current) setPencere(null)
      else void CapApp.exitApp()
    })
    return () => {
      void d.then((x) => x.remove())
    }
  }, [])

  return (
    <div className="oyun">
      <header className="ust">
        <button className="ikon-dugme" onClick={() => setPencere('yardim')} aria-label="Nasıl oynanır">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.8" />
            <path d="M9.6 9.3a2.5 2.5 0 1 1 3.6 2.3c-.8.4-1.2.9-1.2 1.8v.4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="12" cy="17" r="1.1" fill="currentColor" />
          </svg>
        </button>
        <Logo />
        <div className="ust-sag">
          <button className="ikon-dugme" onClick={() => setPencere('sonuc')} aria-label="İstatistikler" disabled={asama !== 'oyun'}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 20V12M10 20V6M15 20v-9M20 20V9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
          <button className="ikon-dugme" onClick={() => setPencere('ayarlar')} aria-label="Ayarlar">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 7h10M18 7h2M4 17h4M12 17h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="16" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <circle cx="10" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="1.8" />
            </svg>
          </button>
        </div>
      </header>

      <Bildirimler liste={bildirimler} />

      <main className="tahta" aria-busy={asama === 'yukleniyor'}>
        {asama === 'hazirlaniyor' ? (
          <div className="durum-kutusu">
            <p>Bugünün kelimesi hazırlanıyor. Yeni bulmacalar her gece ekleniyor.</p>
            <button className="dugme" onClick={() => void baslat()}>
              Yeniden dene
            </button>
          </div>
        ) : asama === 'hata' ? (
          <div className="durum-kutusu">
            <p>Oyuna bağlanılamadı. İnternet bağlantını kontrol edip yeniden dene.</p>
            {hataAyrinti && <p className="kucuk">{hataAyrinti}</p>}
            <button className="dugme" onClick={() => void baslat()}>
              Yeniden dene
            </button>
          </div>
        ) : (
          <Izgara satirlar={satirlar} mevcut={mevcut} acilanSatir={acilanSatir} sallanan={sallanan} zipla={zipla} />
        )}
      </main>

      <Klavye durumlar={durumlar} pasif={!oynanabilir} onHarf={harfEkle} onSil={harfSil} onGir={() => void gonder()} />

      {pencere === 'yardim' && <YardimPenceresi onKapat={() => setPencere(null)} />}
      {pencere === 'ayarlar' && (
        <AyarlarPenceresi
          oyunSurerken={satirlar.length > 0 && !bitti}
          onKapat={() => setPencere(null)}
          onBildirimDegisti={() => void bildirimleriPlanla(bitti)}
        />
      )}
      {pencere === 'sonuc' && (
        <SonucPenceresi
          tarih={tarih}
          satirlar={satirlar}
          bitti={bitti}
          kazandi={kazandi}
          bitis={bitis}
          istatistik={istatistik}
          onKapat={() => setPencere(null)}
          onBildir={bildir}
        />
      )}
    </div>
  )
}
