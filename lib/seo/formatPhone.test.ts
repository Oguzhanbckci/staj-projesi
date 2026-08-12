import { describe, it, expect } from "vitest";
import { toE164TR } from "./formatPhone";

describe("toE164TR", () => {
  it("zaten +90 ile başlayan numarayı boşluksuz döner", () => {
    expect(toE164TR("+90 532 555 12 34")).toBe("+905325551234");
  });

  it("başında + olmayan ama 90 ülke koduyla başlayan numarayı dönüştürür", () => {
    expect(toE164TR("90 532 555 12 34")).toBe("+905325551234");
  });

  it("baştaki 0 ile yazılan yerel biçimi dönüştürür", () => {
    expect(toE164TR("0532 555 12 34")).toBe("+905325551234");
  });

  it("ülke kodu/0 olmadan 10 haneli numarayı dönüştürür", () => {
    expect(toE164TR("532 555 12 34")).toBe("+905325551234");
  });

  it("boş veya sadece boşluktan oluşan girdi için null döner", () => {
    expect(toE164TR("")).toBeNull();
    expect(toE164TR("   ")).toBeNull();
  });

  it("tanınmayan/eksik haneli bir numara için YANLIŞ bir tahminde bulunmak yerine null döner", () => {
    expect(toE164TR("12345")).toBeNull();
    expect(toE164TR("çok uzun ve anlamsız bir metin 999999999999")).toBeNull();
  });
});
