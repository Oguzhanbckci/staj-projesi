import { describe, it, expect } from "vitest";
import { projectFormSchema } from "./project";

// 2026-08-20 mentör denetimi (bulgu 09). Bu testin asıl koruduğu şey ZOD
// ŞEMASI İLE DB CHECK KISITININ UYUMU: `projects.year` kolonunda
// `check (year is null or year between 1800 and 2100)` var
// (20260806120000_create_content_tables.sql:164). Şema DB'nin izin
// verdiğinden GEVŞEK olursa doğrulama "tamam" der, INSERT patlar ve
// kullanıcı alan-bazlı hata yerine genel bir "sistem hatası" görür —
// denetimden önce tam olarak bu oluyordu ("202" şemadan geçiyordu).

const validPayload = {
  title: "Vadi Konutları",
  description: "48 daireli konut projesi.",
  category: "Konut",
  location: "Ankara",
  year: "2024",
  liveUrl: "",
  isPublished: true,
};

describe("projectFormSchema", () => {
  it("geçerli veriyi kabul eder", () => {
    expect(projectFormSchema.safeParse(validPayload).success).toBe(true);
  });

  it("yıl boş bırakılabilir (opsiyonel alan)", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "" }).success).toBe(true);
  });

  it("DB alt sınırını (1800) kabul eder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "1800" }).success).toBe(true);
  });

  it("DB üst sınırını (2100) kabul eder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "2100" }).success).toBe(true);
  });

  // BULGU 09'UN REGRESYON TESTLERİ — denetimden önce üçü de şemadan
  // GEÇİYORDU ve INSERT sırasında DB kısıtına takılıyordu.
  it("alt sınırın altındaki yılı reddeder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "1799" }).success).toBe(false);
  });

  it("üst sınırın üstündeki yılı reddeder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "2101" }).success).toBe(false);
  });

  it("eksik haneli yılı reddeder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "202" }).success).toBe(false);
  });

  it("sıfırlardan oluşan yılı reddeder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "0000" }).success).toBe(false);
  });

  it("4 haneden uzun yılı reddeder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "20244" }).success).toBe(false);
  });

  it("sayı olmayan yılı reddeder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, year: "iki bin" }).success).toBe(false);
  });

  it("2 karakterden kısa başlığı reddeder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, title: "V" }).success).toBe(false);
  });

  it("geçersiz canlı adresi reddeder", () => {
    expect(projectFormSchema.safeParse({ ...validPayload, liveUrl: "ornek.com" }).success).toBe(false);
  });

  it("geçerli canlı adresi kabul eder", () => {
    expect(
      projectFormSchema.safeParse({ ...validPayload, liveUrl: "https://ornek.com" }).success
    ).toBe(true);
  });
});
