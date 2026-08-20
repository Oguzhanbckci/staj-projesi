import { Container } from "@/components/ui/Container";
import { getStats } from "@/lib/supabase/queries";
import type { StatItem } from "./types";

// Sayılar Türkçe biçimde (binlik ayraç ".") — Intl.NumberFormat("tr-TR").
// Etkileşim yok, tamamen Server Component.
function formatStat(stat: StatItem): string {
  return `${new Intl.NumberFormat("tr-TR").format(stat.value)}${stat.suffix ?? ""}`;
}

export async function StatsSection() {
  const stats = await getStats();
  if (stats.length === 0) return null;

  return (
    // 2026-08-20 tasarım araştırması: bu bölüm `bg-brand` ile TÜM genişliği
    // kaplayan dolu bir marka bandıydı ve CtaSection ile BİREBİR aynı
    // görünüyordu — 8 bölümlük ana sayfanın 2'si özdeş düz renk bloğuydu.
    // İncelenen 93 sitenin çoğunda renkli tam genişlik bant HİÇ YOK; sayı
    // bölümleri nötr zeminde, ayrımı ince çizgiyle yapılıyor. Marka bandı
    // artık yalnızca CtaSection'da — yani sayfada TEK bir renk çapası var
    // ve o da gerçekten eylem çağrısı olan yer.
    <section id="istatistikler" className="border-y border-neutral-300 bg-surface py-16 sm:py-20">
      <Container>
        {/* Sabit `grid-cols-4` DEĞİL — kayıt sayısı değişken (Akme'de 3) ve
            sabit sütun sayısı, sayı sütuna tam bölünmediğinde grubu sola
            kaydırıyordu (kullanıcı bulgusu: "sayfa büyüyünce yazılar
            ilerlemiyor"). Eski çözüm `flex justify-center`'dı; artık
            `auto-fit` + `1fr`: boş kolonlar çöker, öğeler kalan genişliği
            EŞİT paylaşır. Böylece hem sayıdan bağımsız hem de sol kenarı
            sayfadaki diğer bölümlerle hizalı (ortalanmış değil). */}
        <dl className="grid grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] gap-x-8 gap-y-10">
          {stats.map((stat) => (
            // Eskiden düz <p> çiftleriydi; artık gerçek bir tanım listesi:
            // etiket = terim (dt), rakam = değer (dd). Geçerli HTML `dt`nin
            // `dd`den ÖNCE gelmesini şart koşuyor, ekran okuyucu da bu sırada
            // "Yıllık Deneyim, 25+" diye doğal okuyor. GÖRSEL sıra ise ters
            // olmalı (rakam üstte) — bunu `flex-col-reverse` sağlıyor.
            // İçerik odaklanılabilir olmadığı için görsel/DOM sıra ayrışması
            // burada erişilebilirlik sorunu yaratmıyor.
            <div key={stat.id} className="flex flex-col-reverse">
              {/* Etiketler araştırmada istisnasız 2-3 kelimelik isim
                  tamlaması ("Years in Business", "Offices Nationwide") —
                  cümle değil. Büyük harf + geniş aralık, SectionHeader'ın
                  eyebrow'uyla aynı dil. `mt-3` görsel olarak rakamın ALTINDA
                  duruyor (ters sıra), yani rakamla etiket arasındaki boşluk. */}
              <dt className="mt-3 text-caption font-semibold uppercase tracking-[0.18em] text-text-muted">
                {stat.label}
              </dt>
              {/* Ölçek karşıtlığı: 49-61px rakam / 13px etiket ≈ 4.7×.
                  Araştırmanın en tekrar eden bulgusu — hiyerarşi ardışık
                  kademeler arasındaki küçük farktan değil, çok küçük etiket
                  ile çok büyük içerik arasındaki SERT farktan geliyor.
                  `tabular-nums`: rakamlar sabit genişlikte hizalanıyor.
                  `text-brand` burada GÜVENLİ ve bilinçli: marka rengi küçük
                  metinde koyu temada 3.56:1'e düşüyordu (AA eşiği 4.5:1,
                  denetim bulgusu) — ama bu punto WCAG'in "büyük metin"
                  tanımına giriyor ve orada eşik 3:1. Yani rengi küçük
                  etiketten alıp büyük rakama taşımak aynı anda hem marka
                  varlığını koruyor hem erişilebilirliği düzeltiyor. */}
              <dd className="text-h2 font-semibold tabular-nums tracking-tight text-brand sm:text-h1">
                {formatStat(stat)}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
