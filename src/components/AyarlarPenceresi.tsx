import { useState } from 'react'
import { Pencere } from './Pencere'
import { ayarlariGuncelle, useAyarlar, type Tema } from '../lib/ayarlar'
import { izinIste } from '../lib/bildirim'
import { linkAc, yerelUygulama } from '../lib/platform'
import { SITE_URL, SURUM } from '../lib/sabitler'

const TEMALAR: { id: Tema; ad: string }[] = [
  { id: 'sistem', ad: 'Sistem' },
  { id: 'acik', ad: 'Açık' },
  { id: 'koyu', ad: 'Koyu' },
]

interface Props {
  oyunSurerken: boolean
  onKapat: () => void
  onBildirimDegisti: () => void
}

export function AyarlarPenceresi({ oyunSurerken, onKapat, onBildirimDegisti }: Props) {
  const ayar = useAyarlar()
  const [izinNotu, setIzinNotu] = useState('')

  const bildirimDegis = async (acik: boolean) => {
    setIzinNotu('')
    if (acik && !(await izinIste())) {
      setIzinNotu('Bildirim izni verilmedi. Telefonun ayarlarından Harfiyen için bildirimleri açabilirsin.')
      return
    }
    ayarlariGuncelle({ bildirim: acik })
    onBildirimDegisti()
  }

  return (
    <Pencere baslik="Ayarlar" onKapat={onKapat}>
      <label className="ayar-satir">
        <span>
          <strong>Zor mod</strong>
          <small>Bulduğun ipuçlarını sonraki tahminlerde kullanmak zorundasın.</small>
          {oyunSurerken && <small>Zor mod, günün ilk tahmininden önce değiştirilebilir.</small>}
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={ayar.zorMod}
          disabled={oyunSurerken}
          onChange={(e) => ayarlariGuncelle({ zorMod: e.target.checked })}
        />
      </label>
      <label className="ayar-satir">
        <span>
          <strong>Renk körü modu</strong>
          <small>Yeşil ve sarı yerine turuncu ve mavi kullanılır.</small>
        </span>
        <input type="checkbox" role="switch" checked={ayar.renkKoru} onChange={(e) => ayarlariGuncelle({ renkKoru: e.target.checked })} />
      </label>
      <div className="ayar-satir ayar-dikey">
        <strong>Tema</strong>
        <div className="bolumlu-secici" role="radiogroup" aria-label="Tema">
          {TEMALAR.map((t) => (
            <button key={t.id} role="radio" aria-checked={ayar.tema === t.id} onClick={() => ayarlariGuncelle({ tema: t.id })}>
              {t.ad}
            </button>
          ))}
        </div>
      </div>
      {yerelUygulama() && (
        <>
          <label className="ayar-satir">
            <span>
              <strong>Günlük hatırlatma</strong>
              <small>Kelimeyi çözmediğin günlerde hatırlatır.</small>
            </span>
            <input type="checkbox" role="switch" checked={ayar.bildirim} onChange={(e) => void bildirimDegis(e.target.checked)} />
          </label>
          {ayar.bildirim && (
            <label className="ayar-satir">
              <strong>Hatırlatma saati</strong>
              <input
                type="time"
                value={ayar.bildirimSaati}
                onChange={(e) => {
                  ayarlariGuncelle({ bildirimSaati: e.target.value || '10:00' })
                  onBildirimDegisti()
                }}
              />
            </label>
          )}
          {izinNotu && <p className="uyari">{izinNotu}</p>}
        </>
      )}
      <div className="ayar-alt">
        <button className="metin-dugme" onClick={() => void linkAc(`${SITE_URL}gizlilik.html`)}>
          Gizlilik politikası
        </button>
        <span>Sürüm {SURUM}</span>
      </div>
    </Pencere>
  )
}
