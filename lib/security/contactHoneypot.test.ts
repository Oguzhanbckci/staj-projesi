import { describe, it, expect } from "vitest";
import { isHoneypotFilled, HONEYPOT_FIELD_NAME } from "./contactHoneypot";

function formDataWith(fields: Record<string, string>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

describe("isHoneypotFilled", () => {
  it("gizli alan boşsa (gerçek ziyaretçi senaryosu) false döner", () => {
    const formData = formDataWith({ fullName: "Ayşe Yılmaz", [HONEYPOT_FIELD_NAME]: "" });
    expect(isHoneypotFilled(formData)).toBe(false);
  });

  it("gizli alan formda hiç yoksa false döner", () => {
    const formData = formDataWith({ fullName: "Ayşe Yılmaz" });
    expect(isHoneypotFilled(formData)).toBe(false);
  });

  it("gizli alan doluysa (bot senaryosu) true döner", () => {
    const formData = formDataWith({ [HONEYPOT_FIELD_NAME]: "http://spam-link.example" });
    expect(isHoneypotFilled(formData)).toBe(true);
  });

  it("sadece boşluk karakteri içeriyorsa yine de false sayılır (trim)", () => {
    const formData = formDataWith({ [HONEYPOT_FIELD_NAME]: "   " });
    expect(isHoneypotFilled(formData)).toBe(false);
  });
});
