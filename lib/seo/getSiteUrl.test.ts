import { describe, it, expect, afterEach } from "vitest";
import { getSiteUrl, getSiteHost } from "./getSiteUrl";

// Gerçek bir hatanın regresyon testi (bkz. docs/KARAR-GUNLUGU.md,
// 2026-08-17) — canlı Lighthouse SEO skoru 92'den 58'e düştü çünkü
// sitemap/robots.txt/JSON-LD, tenant'ın veritabanı domain'ini (bir iş
// kimliği kavramı) sitenin gerçek yayın adresi sanıyordu.
describe("getSiteUrl", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
  });

  it("NEXT_PUBLIC_SITE_URL ayarlıysa onu kullanır (sondaki / temizlenir)", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://akmeinsaat.com.tr/";
    expect(getSiteUrl("yer-tutucu.com")).toBe("https://akmeinsaat.com.tr");
  });

  it("NEXT_PUBLIC_SITE_URL yoksa VERCEL_URL'e düşer", () => {
    process.env.VERCEL_URL = "staj-projesi-olive.vercel.app";
    expect(getSiteUrl("yer-tutucu.com")).toBe("https://staj-projesi-olive.vercel.app");
  });

  it("ikisi de yoksa tenant domain'ine (son çare) düşer", () => {
    expect(getSiteUrl("akmeinsaat.com.tr")).toBe("https://akmeinsaat.com.tr");
  });

  it("NEXT_PUBLIC_SITE_URL, VERCEL_URL'den önceliklidir", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://gercek-domain.com";
    process.env.VERCEL_URL = "staj-projesi-olive.vercel.app";
    expect(getSiteUrl("yer-tutucu.com")).toBe("https://gercek-domain.com");
  });
});

describe("getSiteHost", () => {
  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.VERCEL_URL;
  });

  it("şemayı (https://) kaldırıp sadece host döner", () => {
    process.env.VERCEL_URL = "staj-projesi-olive.vercel.app";
    expect(getSiteHost("yer-tutucu.com")).toBe("staj-projesi-olive.vercel.app");
  });
});
