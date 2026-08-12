import { describe, it, expect, afterEach } from "vitest";
import { getSiteUrl, getSiteHost } from "./getSiteUrl";

function clearEnv() {
  delete process.env.NEXT_PUBLIC_SITE_URL;
  delete process.env.VERCEL_PROJECT_PRODUCTION_URL;
  delete process.env.VERCEL_URL;
}

// Gerçek bir hatanın regresyon testi (bkz. docs/KARAR-GUNLUGU.md,
// 2026-08-17) — canlı Lighthouse SEO skoru önce 92'den 58'e düştü
// (tenant domain'i gerçek yayın adresi sanılıyordu), sonra İLK
// düzeltme de yanlış çıktı: VERCEL_URL, kullanıcının gördüğü KALICI
// adresi değil, o TEK deploy'a özel GEÇİCİ bir hash'li adresi
// veriyordu — sitemap yine yanlış (başka) bir adrese işaret etmeye
// devam etti. VERCEL_PROJECT_PRODUCTION_URL (kalıcı) araya eklendi.
describe("getSiteUrl", () => {
  afterEach(clearEnv);

  it("NEXT_PUBLIC_SITE_URL ayarlıysa onu kullanır (sondaki / temizlenir)", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://akmeinsaat.com.tr/";
    expect(getSiteUrl("yer-tutucu.com")).toBe("https://akmeinsaat.com.tr");
  });

  it("NEXT_PUBLIC_SITE_URL yoksa VERCEL_PROJECT_PRODUCTION_URL'e düşer", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "staj-projesi-olive.vercel.app";
    expect(getSiteUrl("yer-tutucu.com")).toBe("https://staj-projesi-olive.vercel.app");
  });

  it("ikisi de yoksa (deploy'a özel, GÜVENİLMEZ) VERCEL_URL'e düşer", () => {
    process.env.VERCEL_URL = "staj-projesi-b49qmlaf2-toffesoft-staj.vercel.app";
    expect(getSiteUrl("yer-tutucu.com")).toBe(
      "https://staj-projesi-b49qmlaf2-toffesoft-staj.vercel.app"
    );
  });

  it("hiçbiri yoksa tenant domain'ine (son çare) düşer", () => {
    expect(getSiteUrl("akmeinsaat.com.tr")).toBe("https://akmeinsaat.com.tr");
  });

  it("öncelik sırası: NEXT_PUBLIC_SITE_URL > VERCEL_PROJECT_PRODUCTION_URL > VERCEL_URL", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://gercek-domain.com";
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "staj-projesi-olive.vercel.app";
    process.env.VERCEL_URL = "staj-projesi-b49qmlaf2-toffesoft-staj.vercel.app";
    expect(getSiteUrl("yer-tutucu.com")).toBe("https://gercek-domain.com");
  });
});

describe("getSiteHost", () => {
  afterEach(clearEnv);

  it("şemayı (https://) kaldırıp sadece host döner", () => {
    process.env.VERCEL_PROJECT_PRODUCTION_URL = "staj-projesi-olive.vercel.app";
    expect(getSiteHost("yer-tutucu.com")).toBe("staj-projesi-olive.vercel.app");
  });
});
