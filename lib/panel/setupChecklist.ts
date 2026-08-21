// Kurulum kontrol listesi — SAF mantık, veri çekmez.
//
// Neden var: `scripts/setup-new-customer.sh` + `supabase/setup/seed-template.sql`
// yeni müşteriyi YAYINDA (`is_published = true`) yer tutucu içerikle kuruyor —
// "[Adres — panelden güncelleyin]", "[Telefon]", "Örnek Konut Projesi",
// "[Ad Soyad]". Bunlar gerçek içerikle değiştirilene kadar ziyaretçiye
// görünür ve schema.org yapısal verisine de girer. Panelin Özet ekranı ise
// yalnızca üç sayı gösteriyordu; hangi alanların hâlâ şablondan geldiğine
// dair tek bir uyarı yoktu.
//
// Bu, `docs/RAKIP-ANALIZI.md`'nin bizim satış argümanımız olarak yazdığı
// şeyin tersi: yerel firma sitelerinin "bakımsızlık izi" (temizlenmemiş
// dummy içerik) tam olarak kaçındığımız şey — ama ürün onu kendi kurulum
// akışında üretiyordu ve hiçbir yerde yakalamıyordu.
//
// Saf tutulmasının sebebi test edilebilirlik: kurallar veri çekmeden
// sınanabiliyor (bkz. setupChecklist.test.ts). Sayfa yalnızca veriyi
// toplayıp buraya veriyor.

export type SetupIssueSeverity = "yayinda" | "eksik";

export interface SetupIssue {
  id: string;
  /** Kısa başlık — listede kalın görünür. */
  title: string;
  /** Ne yapılması gerektiğini söyleyen tek cümle. */
  detail: string;
  /** Doğrudan ilgili panel ekranı. */
  href: string;
  /**
   * `yayinda`: ziyaretçi ŞU AN yer tutucu içerik görüyor — acil.
   * `eksik`: bir varlık/alan hiç doldurulmamış; site çalışır ama eksik.
   */
  severity: SetupIssueSeverity;
}

export interface SetupChecklistInput {
  contact: { address: string | null; phone: string | null } | null;
  branding: { logoPath: string | null; faviconPath: string | null } | null;
  seo: { seoDescription: string | null; ogImagePath: string | null } | null;
  projects: { title: string; location: string | null; imagePath: string | null; isPublished: boolean }[];
  testimonials: { authorName: string; isPublished: boolean }[];
  teamMembers: { fullName: string; isPublished: boolean }[];
}

/**
 * Şablon yer tutucusu mu? Kurulum şablonundaki tüm yer tutucular köşeli
 * parantezle BAŞLAR ("[Adres — panelden güncelleyin]", "[Telefon]",
 * "[Şehir, İlçe]", "[Ad Soyad]"). Metnin ortasındaki bir köşeli parantez
 * (ör. "Ataşehir [merkez]") yer tutucu sayılmaz — yanlış alarm üretmemek
 * için kural bilerek dar tutuldu.
 */
export function isPlaceholderText(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trimStart().startsWith("[");
}

/**
 * Şablondan gelen örnek kayıt mı? Şablon başlıkları "Örnek " ile başlıyor
 * ("Örnek Konut Projesi", "Örnek Müşteri Adı"). Büyük/küçük harf duyarsız,
 * çünkü kullanıcı düzenlerken başlığı bozup "örnek ..." bırakmış olabilir.
 */
export function isSampleTitle(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trimStart().toLocaleLowerCase("tr").startsWith("örnek ");
}

export function buildSetupChecklist(input: SetupChecklistInput): SetupIssue[] {
  const issues: SetupIssue[] = [];

  // --- Ziyaretçinin ŞU AN gördüğü yer tutucular ---

  const contactPlaceholders = [
    isPlaceholderText(input.contact?.address) ? "adres" : null,
    isPlaceholderText(input.contact?.phone) ? "telefon" : null,
  ].filter(Boolean);

  if (contactPlaceholders.length > 0) {
    issues.push({
      id: "contact-placeholder",
      title: "İletişim bilgileri hâlâ şablondan geliyor",
      detail: `Footer'da, İletişim sayfasında ve arama motoruna giden yapısal veride ${contactPlaceholders.join(" ve ")} alanı yer tutucu olarak görünüyor.`,
      href: "/panel/tema",
      severity: "yayinda",
    });
  }

  const sampleProjects = input.projects.filter((p) => p.isPublished && isSampleTitle(p.title));
  if (sampleProjects.length > 0) {
    issues.push({
      id: "sample-projects",
      title: `${sampleProjects.length} örnek proje yayında`,
      detail: "Şablondan gelen örnek projeler sitede görünüyor — gerçek projelerle değiştirin veya taslağa alın.",
      href: "/panel/icerikler/projeler",
      severity: "yayinda",
    });
  }

  const placeholderLocations = input.projects.filter(
    (p) => p.isPublished && isPlaceholderText(p.location)
  );
  if (placeholderLocations.length > 0) {
    issues.push({
      id: "project-location-placeholder",
      title: `${placeholderLocations.length} yayınlanmış projede konum yer tutucu`,
      detail: 'Kartlarda "[Şehir, İlçe]" yazıyor — gerçek konumu girin.',
      href: "/panel/icerikler/projeler",
      severity: "yayinda",
    });
  }

  const sampleTestimonials = input.testimonials.filter(
    (t) => t.isPublished && isSampleTitle(t.authorName)
  );
  if (sampleTestimonials.length > 0) {
    issues.push({
      id: "sample-testimonials",
      title: `${sampleTestimonials.length} örnek referans yayında`,
      detail: "Uydurma bir müşteri yorumu, gerçek referanslardan daha çok zarar verir — değiştirin veya taslağa alın.",
      href: "/panel/icerikler/referanslar",
      severity: "yayinda",
    });
  }

  const placeholderTeam = input.teamMembers.filter(
    (m) => m.isPublished && isPlaceholderText(m.fullName)
  );
  if (placeholderTeam.length > 0) {
    issues.push({
      id: "team-placeholder",
      title: `${placeholderTeam.length} ekip üyesinde ad yer tutucu`,
      detail: 'Ekip sayfasında "[Ad Soyad]" görünüyor — gerçek adı girin veya kaydı taslağa alın.',
      href: "/panel/icerikler/ekip",
      severity: "yayinda",
    });
  }

  // --- Doldurulmamış alanlar: site çalışır ama eksik görünür ---

  if (!input.branding?.logoPath) {
    issues.push({
      id: "logo-missing",
      title: "Logo yüklenmedi",
      detail: "Üst menüde firma adı düz metin olarak görünüyor.",
      href: "/panel/tema",
      severity: "eksik",
    });
  }

  if (!input.branding?.faviconPath) {
    issues.push({
      id: "favicon-missing",
      title: "Favicon yüklenmedi",
      detail: "Tarayıcı sekmesinde ve yer imlerinde varsayılan ikon görünüyor.",
      href: "/panel/tema",
      severity: "eksik",
    });
  }

  if (!input.seo?.seoDescription) {
    issues.push({
      id: "seo-description-missing",
      title: "Arama motoru açıklaması boş",
      detail: "Google sonuçlarında sayfadan rastgele bir metin parçası gösterilir.",
      href: "/panel/ayarlar",
      severity: "eksik",
    });
  }

  if (!input.seo?.ogImagePath) {
    issues.push({
      id: "og-image-missing",
      title: "Paylaşım görseli yüklenmedi",
      detail: "WhatsApp/LinkedIn paylaşımlarında otomatik üretilen yedek görsel kullanılır.",
      href: "/panel/ayarlar",
      severity: "eksik",
    });
  }

  const imagelessProjects = input.projects.filter((p) => p.isPublished && !p.imagePath);
  if (imagelessProjects.length > 0) {
    issues.push({
      id: "project-image-missing",
      title: `${imagelessProjects.length} yayınlanmış projede görsel yok`,
      detail: "Fotoğrafsız proje kartı yer tutucu desenle görünüyor.",
      href: "/panel/icerikler/projeler",
      severity: "eksik",
    });
  }

  return issues;
}
