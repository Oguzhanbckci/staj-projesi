import { describe, it, expect } from "vitest";
import { buildBreadcrumbListJsonLd } from "./breadcrumbList";

describe("buildBreadcrumbListJsonLd", () => {
  it("boş liste için null döner", () => {
    expect(buildBreadcrumbListJsonLd("https://ornek.com", [])).toBeNull();
  });

  it("her öğe için sırayla position/name/item üretir", () => {
    const result = buildBreadcrumbListJsonLd("https://ornek.com", [
      { label: "Ana Sayfa", path: "/" },
      { label: "Ekip", path: "/ekip" },
    ]);

    expect(result).toEqual({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Ana Sayfa", item: "https://ornek.com" },
        { "@type": "ListItem", position: 2, name: "Ekip", item: "https://ornek.com/ekip" },
      ],
    });
  });

  it("kök yol ('/') için çift slash oluşturmaz", () => {
    const result = buildBreadcrumbListJsonLd("https://ornek.com", [{ label: "Ana Sayfa", path: "/" }]);
    expect(result?.itemListElement[0].item).toBe("https://ornek.com");
  });

  it("siteUrl sonunda slash varsa temizler", () => {
    const result = buildBreadcrumbListJsonLd("https://ornek.com/", [{ label: "İletişim", path: "/iletisim" }]);
    expect(result?.itemListElement[0].item).toBe("https://ornek.com/iletisim");
  });
});
