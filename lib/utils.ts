/**
 * Açık yönlendirme (open redirect) koruması. Bir "sonraki adres" (`next`)
 * değeri URL'den/kullanıcıdan geldiğinde asla doğrudan `redirect()`'e
 * verilmez — burada doğrulanır. Sadece `prefix` ile başlayan, göreli
 * (protokolsüz/host'suz) bir yolsa kabul edilir; aksi halde `fallback`'e
 * düşülür. Kullanım: `app/panel/giris/page.tsx` (bkz. docs/GUVENLIK.md,
 * "Rota Koruma Katmanları").
 *
 * Engellenen saldırı yüzeyleri:
 * - `https://evil.com`, `javascript:...` → `/` ile başlamıyor, reddedilir.
 * - `//evil.com` (protokol-göreli URL — tarayıcı bunu dış siteye gider
 *   şekilde yorumlar) → özellikle kontrol edilip reddedilir.
 * - `/baska-bir-yer` (izin verilen önekin dışında) → reddedilir.
 */
export function getSafeRedirectPath(
  next: string | null | undefined,
  options: { prefix: string; exclude?: string[]; fallback: string }
): string {
  const { prefix, exclude = [], fallback } = options;

  if (!next) return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  if (!next.startsWith(prefix)) return fallback;
  if (exclude.includes(next.split("?")[0])) return fallback;

  return next;
}
