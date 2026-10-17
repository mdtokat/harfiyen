const HARFLER = ['H', 'A', 'R', 'F', 'İ', 'Y', 'E', 'N']
// Logo kendi kurallarını gösterir: H doğru yerde, İ kelimede var.
const RENK: Record<number, string> = { 0: 'yesil', 4: 'sari' }

export function Logo() {
  return (
    <h1 className="logo" aria-label="Harfiyen">
      {HARFLER.map((h, i) => (
        <span key={i} className={`logo-karo${RENK[i] ? ` karo-${RENK[i]}` : ''}`} aria-hidden="true">
          {h}
        </span>
      ))}
    </h1>
  )
}
