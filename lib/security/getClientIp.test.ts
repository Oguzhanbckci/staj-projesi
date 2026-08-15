import { describe, it, expect } from "vitest";
import { pickTrustedClientIp } from "./getClientIp";

describe("pickTrustedClientIp", () => {
  it("x-forwarded-for tek değerse onu döner", () => {
    expect(pickTrustedClientIp("203.0.113.5", null)).toBe("203.0.113.5");
  });

  it("x-forwarded-for zincirinde SON değeri döner, ilkini değil (regresyon: sahte ilk değer atlatmasın)", () => {
    // Bir saldırganın kendi isteğine eklediği sahte IP zincirin başında,
    // Vercel'in edge ağının gerçekten gördüğü IP sonda olur.
    expect(pickTrustedClientIp("1.1.1.1, 203.0.113.5", null)).toBe("203.0.113.5");
  });

  it("aradaki fazla boşlukları temizler", () => {
    expect(pickTrustedClientIp("1.1.1.1 ,  203.0.113.5  ", null)).toBe("203.0.113.5");
  });

  it("x-forwarded-for yoksa x-real-ip'ye düşer", () => {
    expect(pickTrustedClientIp(null, "203.0.113.9")).toBe("203.0.113.9");
  });

  it("hiçbiri yoksa null döner", () => {
    expect(pickTrustedClientIp(null, null)).toBeNull();
  });

  it("x-forwarded-for boş string ise x-real-ip'ye düşer", () => {
    expect(pickTrustedClientIp("", "203.0.113.9")).toBe("203.0.113.9");
  });
});
