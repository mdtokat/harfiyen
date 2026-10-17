// Oyun günü Türkiye saatiyle değişir (UTC+3, yaz saati uygulanmaz).
const TR_OFSET_MS = 3 * 60 * 60 * 1000

/** Bulmaca numarası 1'den başlar. Yayına çıkış tarihine göre değiştirilebilir. */
export const BASLANGIC = '2026-10-17'

export function trBugun(simdi = new Date()): string {
  return new Date(simdi.getTime() + TR_OFSET_MS).toISOString().slice(0, 10)
}

export function gunFarki(a: string, b: string): number {
  return Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000)
}

export function gunEkle(tarih: string, n: number): string {
  const d = new Date(`${tarih}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}

export const bulmacaNo = (tarih: string) => gunFarki(BASLANGIC, tarih) + 1

/** Türkiye saatiyle bir sonraki gece yarısına kalan milisaniye. */
export function geceYarisinaKalan(simdi = new Date()): number {
  const yarin = gunEkle(trBugun(simdi), 1)
  return Date.parse(`${yarin}T00:00:00Z`) - TR_OFSET_MS - simdi.getTime()
}

export function sureMetni(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000))
  const iki = (n: number) => String(n).padStart(2, '0')
  return `${iki(Math.floor(s / 3600))}:${iki(Math.floor((s % 3600) / 60))}:${iki(s % 60)}`
}
