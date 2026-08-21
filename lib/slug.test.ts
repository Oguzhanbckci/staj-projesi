import { describe, it, expect } from "vitest";
import { slugify, ensureUniqueSlug, SLUG_MAX_LENGTH } from "./slug";

describe("slugify", () => {
  it("Türkçe harfleri ASCII karşılığına indirir", () => {
    expect(slugify("Şişli Güneş Sitesi")).toBe("sisli-gunes-sitesi");
    expect(slugify("ÇAĞDAŞ Yapı")).toBe("cagdas-yapi");
    expect(slugify("İzmir Karşıyaka Ofis")).toBe("izmir-karsiyaka-ofis");
  });

  it("noktalı/noktasız I ayrımını yerelden BAĞIMSIZ çözer", () => {
    // Kritik uç: Türkçe yerelde "I".toLowerCase() = "ı", İngilizce yerelde "i".
    // Eşleme küçültmeden ÖNCE yapıldığı için sonuç her ortamda aynı.
    expect(slugify("Ilgın Toplu Konut")).toBe("ilgin-toplu-konut");
    expect(slugify("İstanbul")).toBe("istanbul");
  });

  it("noktalama ve boşlukları tek tireye indirir, baş/son tireleri atar", () => {
    expect(slugify("Vadi Konutları 2. Etap")).toBe("vadi-konutlari-2-etap");
    expect(slugify("  --Marina   Rezidans--  ")).toBe("marina-rezidans");
    expect(slugify("A & B / C")).toBe("a-b-c");
  });

  it("uzun başlığı kırpar ve sonda tire bırakmaz", () => {
    const uzun = slugify("a".repeat(100));
    expect(uzun.length).toBe(SLUG_MAX_LENGTH);

    // Kırpmanın tam bir tireye denk geldiği durum: sonda tire kalmamalı.
    const kelimeler = slugify(`${"b".repeat(SLUG_MAX_LENGTH - 1)} ikinci`);
    expect(kelimeler.endsWith("-")).toBe(false);
  });

  it("hiç harf/rakam içermeyen başlıkta boş string döner", () => {
    expect(slugify("***")).toBe("");
    expect(slugify("   ")).toBe("");
  });
});

describe("ensureUniqueSlug", () => {
  it("çakışma yoksa slug'ı olduğu gibi bırakır", () => {
    expect(ensureUniqueSlug("vadi-konutlari", [])).toBe("vadi-konutlari");
    expect(ensureUniqueSlug("vadi-konutlari", ["marina-rezidans"])).toBe("vadi-konutlari");
  });

  it("çakışmada 2'den başlayarak ilk boş numarayı verir", () => {
    expect(ensureUniqueSlug("vadi-konutlari", ["vadi-konutlari"])).toBe("vadi-konutlari-2");
    expect(ensureUniqueSlug("vadi-konutlari", ["vadi-konutlari", "vadi-konutlari-2"])).toBe(
      "vadi-konutlari-3"
    );
  });

  it("aradaki boşluğu doldurur (silinmiş bir kayıttan kalan numara)", () => {
    expect(ensureUniqueSlug("proje", ["proje", "proje-3"])).toBe("proje-2");
  });

  it("boş tabanda yedek değeri kullanır", () => {
    expect(ensureUniqueSlug("", [])).toBe("proje");
    expect(ensureUniqueSlug("", ["proje"])).toBe("proje-2");
    expect(ensureUniqueSlug("", [], "kayit")).toBe("kayit");
  });
});
