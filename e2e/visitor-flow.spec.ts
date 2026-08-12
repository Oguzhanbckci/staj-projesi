import { test, expect } from "@playwright/test";
import { createTestAdminClient } from "./helpers/supabaseAdmin";

// KRİTİK AKIŞ: Ziyaretçi — ana sayfa açılır, bölümler görünür, projeler
// kategoriye göre filtrelenir, iletişim formu gönderilir.
//
// Seçiciler: CSS class/metin yerine erişilebilir rol (getByRole) veya
// gerçek <label> ilişkisi (getByLabel) kullanılıyor (KISITLAR) — bu
// zaten kod tabanının kendi erişilebilirlik disiplininin doğal sonucu
// (bkz. docs/TEST-STRATEJISI.md madde 9).
test.describe("Kritik akış: ziyaretçi", () => {
  // Date.now() ile üretilen benzersiz e-posta — bu testin oluşturduğu
  // contact_messages satırını başka hiçbir kayıtla karıştırmadan, kesin
  // olarak bulup silebilmek için (KISITLAR: "kendi verisini temizlesin").
  const uniqueEmail = `e2e-visitor-${Date.now()}@example.com`;

  test.afterEach(async () => {
    const supabase = createTestAdminClient();
    await supabase.from("contact_messages").delete().eq("sender_email", uniqueEmail);
  });

  test("ana sayfa açılır, bölümler görünür, projeler filtrelenir, iletişim formu gönderilir", async ({
    page,
  }) => {
    await test.step("Ana sayfa açılıyor, temel yapı (başlık + gezinme) görünüyor", async () => {
      await page.goto("/");
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("navigation").first()).toBeVisible();
    });

    await test.step("Proje galerisi kategoriye göre filtreleniyor", async () => {
      const filterGroup = page.getByRole("group", { name: "Kategoriye göre filtrele" });
      await expect(filterGroup).toBeVisible();

      const filterButtons = filterGroup.getByRole("button");
      // "Tümü" + en az 1 gerçek kategori olmalı, aksi halde filtreleme
      // hiç test edilemez — demo veriye hardcode bağımlı olmadan, gerçek
      // bir ön koşulu doğruluyoruz.
      await expect(filterButtons).not.toHaveCount(0);
      expect(await filterButtons.count()).toBeGreaterThan(1);

      const firstCategoryButton = filterButtons.nth(1);
      await firstCategoryButton.click();
      await expect(firstCategoryButton).toHaveAttribute("aria-pressed", "true");
    });

    await test.step("İletişim formu gönderiliyor", async () => {
      await page.goto("/iletisim");
      await page.getByLabel("Ad Soyad").fill("E2E Test Kullanıcı");
      await page.getByLabel("E-posta").fill(uniqueEmail);
      await page.getByLabel("Konu").selectOption({ label: "Genel Bilgi" });
      await page
        .getByLabel("Mesaj")
        .fill("Bu, Playwright uçtan uca testi tarafından otomatik gönderilmiş bir mesajdır.");
      await page.getByRole("button", { name: "Gönder" }).click();

      await expect(page.getByRole("status")).toContainText("teşekkürler");
    });
  });
});
