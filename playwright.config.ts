import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "node:path";

// Next.js dev sunucusu .env.local'i kendisi otomatik okur, ama Playwright
// AYRI bir Node süreci olarak çalışıyor — env değişkenlerini (özellikle
// E2E_ADMIN_EMAIL/PASSWORD, SUPABASE_SERVICE_ROLE_KEY) burada elle
// yüklemek gerekiyor, aksi halde process.env'de hiç görünmezler.
dotenv.config({ path: path.resolve(__dirname, ".env.local") });

// Canlıya (prod) karşı test etmek için: PLAYWRIGHT_BASE_URL="https://..."
// ortam değişkeniyle çalıştırın (ör. `PLAYWRIGHT_BASE_URL=https://
// musteri-sitesi.vercel.app npm run test:e2e`). Tanımlıysa yerel
// `webServer` (dev sunucusu) HİÇ başlatılmaz — gerçek canlı adrese
// istek atılır. ⚠️ Admin akışı testi (e2e/admin-service-flow.spec.ts)
// canlıda çalıştırılırsa, GERÇEK/herkese açık siteye birkaç saniyeliğine
// görünür bir "E2E Test Hizmeti ..." kaydı ekleyip siler — bunu bilerek
// yapın (bkz. docs/KURULUM.md).
const LIVE_BASE_URL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: "./e2e",
  // KABUL KRİTERİ: "test 60 saniyeden uzun sürmesin" — tek bir test
  // (webServer'ın ilk açılışı hariç) bu sürede bitmeli.
  timeout: 60_000,
  // Framework'ün kendi retry'ına BİLEREK güvenilmiyor — KABUL KRİTERİ'nin
  // "3 kez arka arkaya geçmeli" şartı, testin kendi idempotency'siyle
  // (her testin kendi verisini oluşturup temizlemesiyle) sağlanıyor.
  // Retry, gerçek bir kırılganlığı maskeleyip yanlış bir güven verirdi.
  retries: 0,
  fullyParallel: true,
  // Canlı adrese karşı çalıştırılırken (LIVE_BASE_URL dolu) TEK işçiye
  // düşülüyor — 3 paralel testin aynı anda gerçek (Hobby plan, sınırlı
  // kaynaklı) bir deploy'a yüklenmesi soğuk başlatma/kaynak yarışını
  // artırıp yanıltıcı zaman aşımlarına yol açabilir. Yerelde (dev
  // sunucusu) 3 paralel işçi kalıyor.
  workers: LIVE_BASE_URL ? 1 : undefined,
  reporter: [["list"]],
  use: {
    baseURL: LIVE_BASE_URL ?? "http://localhost:3000",
    // Bir adım başarısız olduğunda NEREDE takıldığını anlamak için
    // (KABUL KRİTERİ) — trace/screenshot sadece hata durumunda üretilir.
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Tek komutla çalışsın diye (KURULUM KISITI) — `npm run test:e2e`
  // dev sunucusunu kendisi başlatır; zaten `npm run dev` açıksa (yerel
  // geliştirme sırasında sık senaryo) onu YENİDEN başlatmaz, olanı kullanır.
  // Canlı adrese karşı çalıştırılırken (LIVE_BASE_URL dolu) webServer
  // TAMAMEN atlanır — Playwright'a "sunucuyu kurma, zaten dışarıda çalışıyor" denir.
  webServer: LIVE_BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
