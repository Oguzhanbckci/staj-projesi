// Geliştirmeye özel doğrulama sayfası — ürünle YAYINLANMAYACAK. Referanslar
// (2 varyant) + İstatistikler + SSS (2 varyant). Platform tenant'ının
// testimonials/faqs kaydı olmayabileceği için (Hizmetler/Hakkımızda'daki
// gibi) örnek veriyle; İstatistikler migration'da platform tenant'a
// seed'lendiği için gerçek veriyle çalışabilir.

import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TESTIMONIALS_VARIANTS } from "@/components/site/testimonials/registry";
import { StatsSection } from "@/components/site/stats/StatsSection";
import { FaqList } from "@/components/site/faqs/FaqList";
import type { TestimonialItem } from "@/components/site/testimonials/types";
import type { FaqItem } from "@/components/site/faqs/types";

const EXAMPLE_TESTIMONIALS: TestimonialItem[] = [
  { id: "1", authorName: "Mehmet Yılmaz", authorTitle: "Vadi Konutları Site Yönetimi", quote: "Akme İnşaat ile çalışmak süreci çok kolaylaştırdı; teslim tarihine sadık kaldılar.", logoPath: null },
  { id: "2", authorName: "Ayşe Demir", authorTitle: "Marina Rezidans, Daire Sahibi", quote: "Anahtar teslim aldığımız dairemizde tadilat ihtiyacı bile çıkmadı.", logoPath: null },
  { id: "3", authorName: "Kaya Holding A.Ş.", authorTitle: "Akme Kule Yatırımcısı", quote: "Ticari bir yapıda bütçe ve süre disiplini en kritik konu; Akme bu ikisini de sözleşmeye birebir uydurdu.", logoPath: null },
];

const EXAMPLE_FAQS: FaqItem[] = [
  { id: "1", question: "İnşaat süreci ortalama ne kadar sürer?", answer: "Proje büyüklüğüne göre değişir; ortalama bir konut projesi 12-18 ay sürer." },
  { id: "2", question: "Fiyat teklifi nasıl alabilirim?", answer: "İletişim formundan proje bilgilerinizi ilettiğinizde ekibimiz sizinle iletişime geçer." },
  { id: "3", question: "Ruhsat ve izin işlemlerini siz mi takip ediyorsunuz?", answer: "Evet, tüm izin süreçleri proje kapsamına dahildir." },
  { id: "4", question: "Tamamlanan işler için garanti veriyor musunuz?", answer: "Yapısal işler için yasal 5 yıllık ayıp garantisi uygulanır." },
];

const TestimonialsGrid = TESTIMONIALS_VARIANTS.grid;
const TestimonialsFeatured = TESTIMONIALS_VARIANTS.featured;

export default function SocialProofPreviewPage() {
  return (
    <div className="min-h-full bg-surface text-text">
      <p className="border-b-2 border-warning bg-surface-raised px-6 py-2 text-center text-caption text-text">
        Geçici doğrulama sayfası — yayınlanmayacak.
      </p>

      <StatsSection />

      <section className="py-16">
        <Container>
          <SectionHeader title="Referanslar — Izgara (mobilde kaydırmalı)" headingLevel="h2" />
          <div className="mt-8">
            <TestimonialsGrid items={EXAMPLE_TESTIMONIALS} />
          </div>
        </Container>
      </section>

      <section className="bg-surface-raised py-16">
        <Container>
          <SectionHeader title="Referanslar — Tek Büyük Alıntı" headingLevel="h2" />
          <div className="mt-8">
            <TestimonialsFeatured items={EXAMPLE_TESTIMONIALS} />
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionHeader title="SSS — Tek Sütun" headingLevel="h2" />
          <div className="mt-8 max-w-2xl">
            <FaqList items={EXAMPLE_FAQS} columns={1} />
          </div>
        </Container>
      </section>

      <section className="bg-surface-raised py-16">
        <Container>
          <SectionHeader title="SSS — İki Sütun" headingLevel="h2" />
          <div className="mt-8">
            <FaqList items={EXAMPLE_FAQS} columns={2} />
          </div>
        </Container>
      </section>
    </div>
  );
}
