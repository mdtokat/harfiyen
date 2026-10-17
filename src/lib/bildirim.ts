import { LocalNotifications } from '@capacitor/local-notifications'
import { yerelUygulama } from './platform'
import { ayarlariOku } from './ayarlar'
import { gunEkle, trBugun } from './tarih'

export async function izinIste(): Promise<boolean> {
  if (!yerelUygulama()) return false
  const mevcut = await LocalNotifications.checkPermissions()
  if (mevcut.display === 'granted') return true
  return (await LocalNotifications.requestPermissions()).display === 'granted'
}

/**
 * Önümüzdeki 7 günün hatırlatmalarını yeniden planlar. Bugünün bulmacası çözüldüyse bugünkü hatırlatma atlanır.
 * Saat, cihazın yerel saatine göre uygulanır.
 */
export async function bildirimleriPlanla(bugunBitti: boolean): Promise<void> {
  if (!yerelUygulama()) return
  try {
    const bekleyen = await LocalNotifications.getPending()
    if (bekleyen.notifications.length) {
      await LocalNotifications.cancel({ notifications: bekleyen.notifications.map((n) => ({ id: n.id })) })
    }
    const ayar = ayarlariOku()
    if (!ayar.bildirim) return
    if ((await LocalNotifications.checkPermissions()).display !== 'granted') return
    const [saat, dakika] = ayar.bildirimSaati.split(':').map(Number)
    const simdi = new Date()
    const liste = []
    for (let i = 0; i < 7; i++) {
      if (i === 0 && bugunBitti) continue
      const d = new Date(simdi.getFullYear(), simdi.getMonth(), simdi.getDate() + i, saat, dakika)
      if (d.getTime() <= simdi.getTime()) continue
      const tarih = gunEkle(trBugun(), i)
      liste.push({
        id: Number(tarih.replaceAll('-', '').slice(2)),
        title: 'Harfiyen',
        body: 'Bugünün kelimesi seni bekliyor.',
        schedule: { at: d, allowWhileIdle: true },
      })
    }
    if (liste.length) await LocalNotifications.schedule({ notifications: liste })
  } catch (e) {
    console.warn('Bildirim planlanamadı', e)
  }
}
