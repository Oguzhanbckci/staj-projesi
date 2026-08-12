import { describe, it, expect } from "vitest";
import { contactFormSchema } from "./contact";

const validPayload = {
  fullName: "Ayşe Yılmaz",
  email: "ayse@ornek.com",
  phone: "0532 555 12 34",
  subject: "genel-bilgi",
  message: "Bu mesaj test amaçlı yazılmış, en az yirmi karakter uzunluğunda.",
};

describe("contactFormSchema", () => {
  it("geçerli veriyi kabul eder", () => {
    const result = contactFormSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("telefon boş bırakılabilir (opsiyonel alan)", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, phone: "" });
    expect(result.success).toBe(true);
  });

  it("2 karakterden kısa ad soyadı reddeder", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, fullName: "A" });
    expect(result.success).toBe(false);
  });

  it("geçersiz e-posta formatını reddeder", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, email: "gecersiz-eposta" });
    expect(result.success).toBe(false);
  });

  it("20 karakterden kısa mesajı reddeder", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, message: "kısa mesaj" });
    expect(result.success).toBe(false);
  });

  it("telefonda harf/sembol olursa reddeder", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, phone: "abc-def-ghij" });
    expect(result.success).toBe(false);
  });

  it("listede olmayan bir konu değerini reddeder", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, subject: "bilinmeyen-konu" });
    expect(result.success).toBe(false);
  });

  it("2000 karakterden uzun mesajı reddeder", () => {
    const result = contactFormSchema.safeParse({ ...validPayload, message: "a".repeat(2001) });
    expect(result.success).toBe(false);
  });
});
