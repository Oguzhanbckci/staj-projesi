import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { getAboutSection } from "@/lib/supabase/queries";

// Veri burada çekiliyor (Server Component) — kayıt yoksa bölüm hiç
// render edilmez, ServicesSection'la aynı ilke.
export async function AboutSection() {
  const about = await getAboutSection();
  if (!about) return null;

  const imageUrl = about.imagePath ? getPublicImageUrl("about", about.imagePath) : null;

  return (
    <section id="hakkimizda" className="bg-surface py-16 sm:py-24">
      <Container>
        {/* Ayraç çizgisi burada SectionHeader'ın `rule` prop'uyla DEĞİL,
            elle konuluyor: bu bölümün başlığı iki sütunlu ızgaranın SOL
            sütununun içinde duruyor, oradaki bir çizgi sayfanın yarısında
            kesilirdi. Diğer bölümlerle aynı görünsün diye aynı değerler
            (h-px, bg-neutral-300, mb-10). */}
        <div aria-hidden="true" className="mb-10 h-px w-full bg-neutral-300" />
        {/* `items-center` DEĞİL `items-start` (2026-08-20, kullanıcı geri
            bildirimi: "yamuk duruyor"). Sol sütun uzun (başlık + iki
            paragraf), görsel ise 3:2 oranında kısa; ortalanınca görsel o
            uzun sütunun ortasında asılı kalıyor, ne üstü ne altı hiçbir
            şeyle hizalanmıyordu. Üstten hizalamak, sayfanın geri kalanına
            uygulanan kenar disiplininin aynısı. */}
        <div className="grid items-start gap-10 sm:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow={about.foundedYear ? `${about.foundedYear}'den beri` : undefined}
              title={about.title}
              headingLevel="h2"
            />
            {/* `line-clamp-6` KALDIRILDI (2026-08-20). Alan 50 karakterlik
                bir cümleyle doluyken bu kırpma görünmüyordu; ama 38 gerçek
                "Hakkımızda" sayfasının incelenmesi, sektörde doğru metin
                uzunluğunun 90-150 kelime olduğunu gösterdi (ENKA 110,
                Swinerton ~110, Doğuş 330). O uzunlukta bir metin yarım
                sütunda 8-10 satır eder ve `line-clamp-6` firmanın kendi
                hikâyesini cümlenin ortasında keserdi. */}
            {about.description && (
              <p className="mt-4 whitespace-pre-line text-base text-text-muted">
                {about.description}
              </p>
            )}
          </div>
          <div className="relative aspect-[3/2] overflow-hidden rounded-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={about.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              // 2026-08-20: burada `bg-surface-raised` düz bir kutu vardı ve
              // bölümün zemini de `bg-surface-raised` olduğu için GÖRÜNMEZDİ
              // — fotoğraf yüklememiş bir müşteride bölümün sağ yarısı
              // sessizce boş kalıyordu. Bölüm zeminleri `bg-surface`e
              // indirilince o kutu görünür bir beyaz dikdörtgene dönüştü,
              // yani düzeltmesi zorunlu hale geldi. ImagePlaceholder zaten
              // tam bu iş için var (bkz. docs/DURUM.md madde 0d).
              <ImagePlaceholder />
            )}
          </div>
        </div>

        {/* DEĞERLER, iki sütunlu ızgaranın DIŞINDA ve tam genişlikte
            (2026-08-20, "yamuk duruyor" geri bildiriminin asıl çözümü).
            Önceden sol sütunun içindeydi: başlık + iki paragraf + beş
            madde alt alta gelince sol sütun ~675px, görsel ise ~350px
            oluyordu ve iki sütun arasında iki katı fark vardı. Değerler
            dışarı alınınca üst satırda metin ve görsel yükseklikleri
            birbirine yakınsıyor, alt satır da tam genişlikte üç sütuna
            yayılıyor — hem denge kuruluyor hem satır uzunlukları
            okunaklı kalıyor.

            `line-clamp-1` de kaldırıldı: 38 gerçek Hakkımızda sayfasının
            incelenmesinde en inandırıcı değer listeleri "Başlık — ne demek
            olduğunu söyleyen kısa cümle" formundaydı (Nurol, Özak,
            Robins & Morton); çıplak sıfat dizileri en zayıflarıydı.
            Tek satıra kırpmak tam olarak o güçlü formu imkânsız
            kılıyordu — yani kod, iyi metnin yazılmasını engelliyordu. */}
        {about.coreValues.length > 0 && (
          <ul className="mt-14 grid grid-cols-1 gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {about.coreValues.map((value) => {
              // "Başlık — açıklama" biçimini ikiye ayırır. Ayraç olarak em
              // dash, en dash veya düz tire kabul ediliyor (panelde hangisi
              // yazılırsa). Ayraç yoksa `detail` boş kalır ve madde sadece
              // başlıktan ibaret olur — yani eski tek kelimelik değerler
              // (ör. "Kalite") de bozulmadan çalışmaya devam eder.
              const [title, ...rest] = value.split(/\s+[—–-]\s+/);
              const detail = rest.join(" — ");

              return (
                // Her maddenin KENDİ üst çizgisi var. "Düzensiz duruyor"
                // geri bildiriminin asıl çözümü bu: maddeler 2-3 satır
                // arasında değiştiği için alt kenarları hiçbir zaman
                // hizalanmıyordu ve göz tutunacak bir hat bulamıyordu.
                // Üst çizgiler her satırda kesintisiz bir yatay hat kurar,
                // maddelerin farklı yükseklikte bitmesi artık görünmez.
                // (Önceki hâlde tek bir blok çizgisi vardı ve tire imleri
                // serbest yüzüyordu.)
                <li key={value} className="border-t border-neutral-300 pt-4">
                  <p className="text-base font-semibold text-text">{title}</p>
                  {detail && (
                    <p className="mt-1.5 text-base text-text-muted">{detail}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
