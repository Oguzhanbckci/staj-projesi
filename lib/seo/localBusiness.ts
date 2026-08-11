import type { LocalBusinessData } from "@/lib/supabase/queries";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { toE164TR } from "./formatPhone";

interface OpeningHoursSpec {
  "@type": "OpeningHoursSpecification";
  dayOfWeek: string[];
  opens: string;
  closes: string;
}

// Saf fonksiyon — Supabase'e HİÇ bağımlı değil, sadece zaten çekilmiş
// LocalBusinessData'yı JSON-LD'ye çevirir (bkz. lib/supabase/queries.ts
// getLocalBusinessData — veri çekme AYRI tutuldu, bu fonksiyon test
// edilebilir/tahmin edilebilir kalsın diye).
//
// schema.org tipi: GeneralContractor — Thing > Organization >
// LocalBusiness > HomeAndConstructionBusiness > GeneralContractor
// hiyerarşisinde inşaat firması için TANIMLANMIŞ EN SPESİFİK tip.
// Google'ın kendi rehberi mümkün olan en spesifik tipin kullanılmasını
// öneriyor (bkz. docs/SEO-PERFORMANS.md, "Yapısal Veri").
//
// KISITLAR: "eksik alan varsa hiç eklenmesin" — her alan kendi kaynağı
// doluysa eklenir, DEĞİLSE JSON nesnesinde o anahtar hiç yer almaz (boş
// string/null yazılmaz).
export function buildLocalBusinessJsonLd(data: LocalBusinessData): Record<string, unknown> | null {
  if (!data.name) return null;

  const url = `https://${data.domain}`;
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "GeneralContractor",
    "@id": `${url}/#business`,
    name: data.name,
    url,
  };

  if (data.description) {
    jsonLd.description = data.description;
  }

  if (data.logoPath) {
    jsonLd.image = getPublicImageUrl("branding", data.logoPath);
  }

  // Bilinçli basitleştirme: mevcut adres SERBEST METİN (il/ilçe ayrı
  // alanlara bölünmüyor) — bütünüyle streetAddress'e yazılıyor,
  // addressCountry "TR" sabit (platform SADECE Türkiye'de faaliyet
  // gösteren firmalar için — BAĞLAM'ın kendisi, "sabit veri" ihlali
  // değil). Detay: docs/SEO-PERFORMANS.md.
  if (data.address) {
    jsonLd.address = {
      "@type": "PostalAddress",
      streetAddress: data.address,
      addressCountry: "TR",
    };
  }

  const phone = data.phone ? toE164TR(data.phone) : null;
  if (phone) {
    jsonLd.telephone = phone;
  }

  if (data.email) {
    jsonLd.email = data.email;
  }

  const openingHours: OpeningHoursSpec[] = [];
  if (data.weekdayOpens && data.weekdayCloses) {
    openingHours.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: data.weekdayOpens,
      closes: data.weekdayCloses,
    });
  }
  // Bilinçli basitleştirme: "hafta sonu" Cumartesi VE Pazar için TEK bir
  // saat çifti (kullanıcıyla netleştirilen çerçeve) — Cumartesi/Pazar
  // farklı saatler gerekiyorsa ayrı bir görev olarak ele alınmalı.
  if (data.weekendOpens && data.weekendCloses) {
    openingHours.push({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Saturday", "Sunday"],
      opens: data.weekendOpens,
      closes: data.weekendCloses,
    });
  }
  if (openingHours.length > 0) {
    jsonLd.openingHoursSpecification = openingHours;
  }

  if (data.serviceAreas) {
    const areas = data.serviceAreas
      .split(",")
      .map((area) => area.trim())
      .filter(Boolean);
    if (areas.length > 0) {
      jsonLd.areaServed = areas;
    }
  }

  const sameAs = [data.facebookUrl, data.instagramUrl, data.linkedinUrl].filter(
    (link): link is string => !!link
  );
  if (sameAs.length > 0) {
    jsonLd.sameAs = sameAs;
  }

  return jsonLd;
}
