import { useEffect, useState } from 'react'
import { oku, yaz } from './depo'

export type Tema = 'sistem' | 'acik' | 'koyu'

export interface Ayarlar {
  tema: Tema
  zorMod: boolean
  renkKoru: boolean
  bildirim: boolean
  bildirimSaati: string
  yardimGoruldu: boolean
}

const VARSAYILAN: Ayarlar = {
  tema: 'sistem',
  zorMod: false,
  renkKoru: false,
  bildirim: false,
  bildirimSaati: '10:00',
  yardimGoruldu: false,
}
const ANAHTAR = 'ayarlar'

const dinleyiciler = new Set<(a: Ayarlar) => void>()
let mevcut: Ayarlar = { ...VARSAYILAN, ...oku<Partial<Ayarlar>>(ANAHTAR, {}) }

export const ayarlariOku = () => mevcut

export function ayarlariGuncelle(degisiklik: Partial<Ayarlar>) {
  mevcut = { ...mevcut, ...degisiklik }
  yaz(ANAHTAR, mevcut)
  gorunumuUygula()
  dinleyiciler.forEach((f) => f(mevcut))
}

export function useAyarlar(): Ayarlar {
  const [a, setA] = useState(mevcut)
  useEffect(() => {
    dinleyiciler.add(setA)
    return () => {
      dinleyiciler.delete(setA)
    }
  }, [])
  return a
}

export function gorunumuUygula() {
  const kok = document.documentElement
  if (mevcut.tema === 'sistem') kok.removeAttribute('data-theme')
  else kok.setAttribute('data-theme', mevcut.tema === 'koyu' ? 'dark' : 'light')
  if (mevcut.renkKoru) kok.setAttribute('data-renk', 'koru')
  else kok.removeAttribute('data-renk')
}

// Zor modla oynanan günler (paylaşımda * işareti için)
export const zorModGunu = (tarih: string) => oku<string[]>('zor-mod-gunleri', []).includes(tarih)
export function zorModGunuKaydet(tarih: string) {
  const g = oku<string[]>('zor-mod-gunleri', [])
  if (!g.includes(tarih)) yaz('zor-mod-gunleri', [...g.slice(-400), tarih])
}
