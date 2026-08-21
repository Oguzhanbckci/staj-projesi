import { describe, it, expect } from "vitest";
import { buildSetupChecklist, isPlaceholderText, isSampleTitle } from "./setupChecklist";
import type { SetupChecklistInput } from "./setupChecklist";

// Tamamlanmış bir kurulum: hiçbir uyarı çıkmamalı. Testlerin çoğu bunun
// üzerine TEK bir alanı bozarak ilerliyor — böylece her uyarının gerçekten
// kendi kuralından çıktığı görülüyor.
const TAMAM: SetupChecklistInput = {
  contact: { address: "Atatürk Cad. No:12, Konya", phone: "0332 000 00 00" },
  branding: { logoPath: "tenant/logo.png", faviconPath: "tenant/favicon.png" },
  seo: { seoDescription: "Konya'da konut ve ticari yapı inşaatı.", ogImagePath: "tenant/og.png" },
  projects: [{ title: "Vadi Konutları", location: "Konya, Selçuklu", imagePath: "p/1.jpg", isPublished: true }],
  testimonials: [{ authorName: "Kaya Holding A.Ş.", isPublished: true }],
  teamMembers: [{ fullName: "Zeynep Aksoy", isPublished: true }],
};

function bozarak(degisiklik: Partial<SetupChecklistInput>) {
  return buildSetupChecklist({ ...TAMAM, ...degisiklik });
}

describe("isPlaceholderText", () => {
  it("köşeli parantezle BAŞLAYAN metni yer tutucu sayar", () => {
    expect(isPlaceholderText("[Telefon]")).toBe(true);
    expect(isPlaceholderText("  [Adres — panelden güncelleyin]")).toBe(true);
  });

  it("metnin ortasındaki köşeli parantezi yer tutucu SAYMAZ (yanlış alarm)", () => {
    expect(isPlaceholderText("Ataşehir [merkez]")).toBe(false);
    expect(isPlaceholderText("0332 000 00 00")).toBe(false);
  });

  it("null/boş değerde false döner", () => {
    expect(isPlaceholderText(null)).toBe(false);
    expect(isPlaceholderText("")).toBe(false);
  });
});

describe("isSampleTitle", () => {
  it('"Örnek " ile başlayan başlığı yakalar, büyük/küçük harften bağımsız', () => {
    expect(isSampleTitle("Örnek Konut Projesi")).toBe(true);
    expect(isSampleTitle("örnek müşteri adı")).toBe(true);
  });

  it("içinde 'örnek' geçen gerçek bir başlığı YAKALAMAZ", () => {
    expect(isSampleTitle("Örnekköy Toplu Konut")).toBe(false);
    expect(isSampleTitle("Bir örnek proje")).toBe(false);
  });
});

describe("buildSetupChecklist", () => {
  it("her şey doldurulmuşsa hiç uyarı üretmez", () => {
    expect(buildSetupChecklist(TAMAM)).toEqual([]);
  });

  it("iletişim yer tutucularını tek uyarıda toplar ve hangi alan olduğunu söyler", () => {
    const issues = bozarak({ contact: { address: "[Adres — panelden güncelleyin]", phone: "[Telefon]" } });
    const contact = issues.find((i) => i.id === "contact-placeholder");
    expect(contact).toBeDefined();
    expect(contact!.detail).toContain("adres");
    expect(contact!.detail).toContain("telefon");
    expect(contact!.severity).toBe("yayinda");
    expect(contact!.href).toBe("/panel/tema");
  });

  it("TASLAK durumdaki örnek kayıtlar uyarı üretmez — ziyaretçi onları görmüyor", () => {
    const issues = bozarak({
      projects: [
        { title: "Örnek Konut Projesi", location: "[Şehir, İlçe]", imagePath: null, isPublished: false },
      ],
    });
    expect(issues.some((i) => i.id === "sample-projects")).toBe(false);
    expect(issues.some((i) => i.id === "project-location-placeholder")).toBe(false);
    expect(issues.some((i) => i.id === "project-image-missing")).toBe(false);
  });

  it("yayınlanmış örnek kayıtları sayar", () => {
    const issues = bozarak({
      projects: [
        { title: "Örnek Konut Projesi", location: "Konya", imagePath: "a.jpg", isPublished: true },
        { title: "Örnek Ticari Proje", location: "Konya", imagePath: "b.jpg", isPublished: true },
        { title: "Vadi Konutları", location: "Konya", imagePath: "c.jpg", isPublished: true },
      ],
    });
    const sample = issues.find((i) => i.id === "sample-projects");
    expect(sample?.title).toContain("2");
  });

  it("eksik varlıkları 'eksik', yayındaki yer tutucuları 'yayinda' olarak işaretler", () => {
    const issues = bozarak({
      branding: { logoPath: null, faviconPath: null },
      teamMembers: [{ fullName: "[Ad Soyad]", isPublished: true }],
    });
    expect(issues.find((i) => i.id === "logo-missing")?.severity).toBe("eksik");
    expect(issues.find((i) => i.id === "team-placeholder")?.severity).toBe("yayinda");
  });

  it("kayıt hiç yoksa (sorgu boş döndü) çökmez, yalnızca eksik alanları bildirir", () => {
    const issues = buildSetupChecklist({
      contact: null,
      branding: null,
      seo: null,
      projects: [],
      testimonials: [],
      teamMembers: [],
    });
    expect(issues.map((i) => i.id)).toEqual([
      "logo-missing",
      "favicon-missing",
      "seo-description-missing",
      "og-image-missing",
    ]);
  });

  it("her uyarı bir panel ekranına bağlanır", () => {
    const issues = buildSetupChecklist({
      contact: { address: "[Adres]", phone: "[Telefon]" },
      branding: { logoPath: null, faviconPath: null },
      seo: { seoDescription: null, ogImagePath: null },
      projects: [{ title: "Örnek Proje", location: "[Şehir, İlçe]", imagePath: null, isPublished: true }],
      testimonials: [{ authorName: "Örnek Müşteri Adı", isPublished: true }],
      teamMembers: [{ fullName: "[Ad Soyad]", isPublished: true }],
    });
    expect(issues.length).toBeGreaterThan(0);
    for (const issue of issues) {
      expect(issue.href.startsWith("/panel/")).toBe(true);
      expect(issue.detail.length).toBeGreaterThan(10);
    }
  });
});
