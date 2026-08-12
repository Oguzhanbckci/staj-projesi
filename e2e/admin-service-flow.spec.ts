import { test, expect } from "@playwright/test";
import { createTestAdminClient } from "./helpers/supabaseAdmin";

// KRİTİK AKIŞ: Admin — giriş yapar, yeni bir hizmet ekler ve yayınlar,
// ziyaretçi sitesinde göründüğünü doğrular, sonra hizmeti siler.
//
// Giriş bilgileri KODDA YAZILI DEĞİL — E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD
// ortam değişkenlerinden gelir (KISITLAR). Bu ikisi .env.local'de
// tanımlı değilse test ATLANIR (skip) — CI/başka bir makinede gerçek bir
// admin şifresi olmadan bu test sessizce "kırmızı" görünmez.
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;

test.describe("Kritik akış: admin — hizmet ekle, yayınla, doğrula, sil", () => {
  test.skip(
    !ADMIN_EMAIL || !ADMIN_PASSWORD,
    "E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD .env.local'de tanımlı değil — bkz. .env.local.example."
  );

  // Date.now() ile benzersiz başlık: aynı testin arka arkaya 3 kez
  // çalıştırılması (KABUL KRİTERİ) hiçbir zaman aynı title'da çakışmaz,
  // önceki bir koşunun kalıntısıyla da karışmaz.
  const serviceTitle = `E2E Test Hizmeti ${Date.now()}`;

  test.afterEach(async () => {
    // Testin kendi "Sil" adımına hiç ulaşamadığı (bir adım ortada
    // başarısız olduğu) senaryoda bile kaydı arkada BIRAKMAMAK için yedek
    // temizlik — aksi halde bir sonraki koşuda bu isim altında birden
    // fazla satır birikir ve "3 kez üst üste geçmeli" kriteri bozulurdu.
    const supabase = createTestAdminClient();
    await supabase.from("services").delete().eq("title", serviceTitle);
  });

  test("giriş yapar, hizmet ekler, yayınlar, sitede görünür, sonra siler", async ({ page }) => {
    await test.step("Admin giriş yapar", async () => {
      await page.goto("/panel/giris");
      await page.getByLabel("E-posta").fill(ADMIN_EMAIL!);
      await page.getByLabel("Şifre").fill(ADMIN_PASSWORD!);
      await page.getByRole("button", { name: "Giriş Yap" }).click();
      await expect(page).toHaveURL(/\/panel$/);
    });

    await test.step("Yeni hizmet eklenir ve 'Hemen yayınla' işaretlenir", async () => {
      await page.goto("/panel/icerikler/hizmetler");
      await page.getByLabel("Başlık").fill(serviceTitle);
      await page.getByLabel("Hemen yayınla").check();
      await page.getByRole("button", { name: "Hizmet Ekle" }).click();
      await expect(page.getByRole("status")).toContainText("Hizmet eklendi");
    });

    await test.step("Ziyaretçi sitesinde (ana sayfa) hizmetin göründüğü doğrulanır", async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: serviceTitle })).toBeVisible();
    });

    await test.step("Hizmet panelden silinir", async () => {
      await page.goto("/panel/icerikler/hizmetler");
      const row = page.getByRole("row", { name: serviceTitle });
      await row.getByRole("button", { name: "Sil" }).click();
      await page.getByRole("button", { name: "Evet, Sil" }).click();
      await expect(page.getByRole("row", { name: serviceTitle })).toHaveCount(0);
    });

    await test.step("Silinen hizmet artık ziyaretçi sitesinde görünmüyor", async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { name: serviceTitle })).toHaveCount(0);
    });
  });
});
