import { test, expect } from "@playwright/test";

// KRİTİK AKIŞ: Yetkisiz erişim — giriş yapmadan panele erişmeye çalışan
// bir ziyaretçi /panel/giris'e yönlendirilmeli, hiçbir panel verisi
// görmemeli. Playwright her teste TEMİZ (çerezsiz) bir tarayıcı bağlamı
// verir — bu yüzden ayrıca "çıkış yap" gerekmiyor, test zaten oturumsuz
// başlıyor.
//
// Bu akış, 2026-08-12'de curl ile elle doğrulanmış aynı senaryonun
// (bkz. docs/GUVENLIK.md madde 8-9) otomatikleştirilmiş hâli.
test.describe("Kritik akış: yetkisiz erişim", () => {
  test("giriş yapmadan panele erişmeye çalışan, giriş sayfasına yönlendirilir", async ({
    page,
  }) => {
    await test.step("/panel'e girişsiz erişim denenir, giriş sayfasına yönlendiriliyor", async () => {
      await page.goto("/panel");
      await expect(page).toHaveURL(/\/panel\/giris/);
    });

    await test.step("Yönlendirilen sayfa gerçekten giriş sayfası (kendi kendine döngü yok)", async () => {
      await expect(page.getByRole("heading", { name: "Panel Girişi" })).toBeVisible();
    });

    await test.step("İç bir panel sayfasına (mesajlar) doğrudan girişsiz erişim de engellenir", async () => {
      await page.goto("/panel/mesajlar");
      await expect(page).toHaveURL(/\/panel\/giris/);
    });
  });
});
