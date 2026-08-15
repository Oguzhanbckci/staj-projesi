import { describe, it, expect } from "vitest";
import { buildContactNotificationEmail } from "./contactNotification";

const BASE_INPUT = {
  tenantName: "Akme İnşaat",
  senderName: "Ayşe Yılmaz",
  senderEmail: "ayse@ornek.com",
  senderPhone: null,
  subject: null,
  message: "Merhaba, bir keşif randevusu almak istiyorum.",
  panelMessagesUrl: "https://akmeinsaat.com.tr/panel/mesajlar",
};

describe("buildContactNotificationEmail", () => {
  it("firma adını konuya ekler", () => {
    const email = buildContactNotificationEmail(BASE_INPUT);
    expect(email.subject).toContain("Akme İnşaat");
  });

  it("gönderen adı/e-posta ve mesajı hem html hem text gövdesine yazar", () => {
    const email = buildContactNotificationEmail(BASE_INPUT);
    expect(email.html).toContain("Ayşe Yılmaz");
    expect(email.html).toContain("ayse@ornek.com");
    expect(email.html).toContain("bir keşif randevusu almak istiyorum");
    expect(email.text).toContain("Ayşe Yılmaz");
    expect(email.text).toContain("bir keşif randevusu almak istiyorum");
  });

  it("panel bağlantısını içerir", () => {
    const email = buildContactNotificationEmail(BASE_INPUT);
    expect(email.html).toContain("https://akmeinsaat.com.tr/panel/mesajlar");
    expect(email.text).toContain("https://akmeinsaat.com.tr/panel/mesajlar");
  });

  it("boş alanlar (telefon/konu) eksik değer uydurmadan hiç eklenmez", () => {
    const email = buildContactNotificationEmail(BASE_INPUT);
    expect(email.html).not.toContain("Telefon");
    expect(email.html).not.toContain("Konu");
  });

  it("telefon ve konu doluysa ikisi de gövdeye eklenir", () => {
    const email = buildContactNotificationEmail({
      ...BASE_INPUT,
      senderPhone: "5325551234",
      subject: "proje-teklifi",
    });
    expect(email.html).toContain("5325551234");
    expect(email.html).toContain("Proje Teklifi");
    expect(email.text).toContain("5325551234");
    expect(email.text).toContain("Proje Teklifi");
  });

  it("mesaj metnindeki HTML özel karakterlerini kaçırır (XSS önlemi)", () => {
    const email = buildContactNotificationEmail({
      ...BASE_INPUT,
      senderName: '<script>alert(1)</script>',
    });
    expect(email.html).not.toContain("<script>alert(1)</script>");
    expect(email.html).toContain("&lt;script&gt;");
  });
});
