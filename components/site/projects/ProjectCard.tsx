import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { PROJECT_STATUS_LABELS } from "@/lib/validation/projectFields";
import type { ProjectItem } from "./types";

// Hem ızgara hem mozaik düzeninde kullanılan TEK kart — aynı veri, sadece
// `fill` (görsel alanının sabit oran mı yoksa ebeveyn hücreyi mi
// dolduracağı) ve `className` (mozaikte col/row-span) farklı.
//
// 2026-08-21: Kart artık bir modal AÇMIYOR, gerçek bir sayfaya GİDİYOR
// (/projeler/<slug>) — bu yüzden <button> değil <Link>. Modal'ın adresi
// yoktu: paylaşılamıyor, yer imine eklenemiyor ve arama motoru
// indeksleyemiyordu (bkz. docs/RAKIP-ANALIZI.md — incelenen 93 sitenin
// hiçbiri proje detayı için modal kullanmıyor). Doğru öğeyi seçmek
// erişilebilirlik açısından da şart: gezinme bir bağlantıdır, ekran
// okuyucu ve "yeni sekmede aç" davranışı buna bağlı.
//
// 2026-08-19 zenginleştirmesi (bkz. docs/DURUM.md madde 0d):
// - Görsel yoksa artık boş kutu değil, paylaşılan ImagePlaceholder
//   (Hizmetler'de kurulan aynı bileşen).
// - `category` ARTIK GÖSTERİLİYOR — veri 2026-08-08'den beri vardı ve
//   filtre listesi ondan türetiliyordu, ama kartın kendisinde hiç
//   görünmüyordu (sadece şehir · yıl). Rozet, görselin üstünde SOLID bir
//   zemine sahip `neutral` varyantla duruyor: yarı saydam olsaydı
//   rastgele bir fotoğrafın üstünde kontrast garanti edilemezdi.
// - Kart bir modal açtığı hâlde bunu belli eden hiçbir görsel işaret
//   yoktu (sadece odak halkası) — hover'da beliren küçük bir büyütme
//   ikonu bu eksiği kapatıyor.
// - Hover dili Hizmetler'le BİLEREK aynı (yükselme + marka renkli ince
//   çerçeve + görselde yakınlaşma) — site genelinde tutarlı hissetmeli.
export function ProjectCard({
  project,
  priority = false,
  fill = false,
  className = "",
}: {
  project: ProjectItem;
  priority?: boolean;
  fill?: boolean;
  className?: string;
}) {
  const imageUrl = project.coverPath
    ? getPublicImageUrl("projects", project.coverPath)
    : null;

  return (
    <Card
      className={`group flex h-full flex-col ring-1 ring-neutral-300/60 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:ring-brand/40 motion-reduce:transform-none motion-reduce:transition-none ${className}`}
    >
      <Link
        href={`/projeler/${project.slug}`}
        className="flex h-full flex-col text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <div className={`relative overflow-hidden ${fill ? "flex-1" : "aspect-[3/2]"}`}>
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={project.title}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transform-none motion-reduce:transition-none"
            />
          ) : (
            <ImagePlaceholder />
          )}

          {/* Kategori + durum rozetleri yan yana. Sağ üst köşe boş
              bırakılıyor — orada hover'da beliren büyütme ikonu var.
              İkisi de SOLID zeminli varyantlar (`neutral` ve `accent`):
              rastgele bir fotoğrafın üstünde yarı saydam zeminle
              kontrast garanti edilemez. Durum rozeti kategoriden daha
              güçlü varyantta (`accent` = dolu yüzey + tam güçte metin),
              çünkü "Devam Ediyor" bilgisi ziyaretçi için kategoriden
              daha güçlü bir sinyal (bkz. docs/RAKIP-ANALIZI.md). */}
          {(project.category || project.status) && (
            <div className="absolute left-3 top-3 flex flex-wrap gap-2">
              {project.status && (
                <Badge variant="accent" className="shadow-sm">
                  {PROJECT_STATUS_LABELS[project.status]}
                </Badge>
              )}
              {project.category && (
                <Badge variant="neutral" className="shadow-sm">
                  {project.category}
                </Badge>
              )}
            </div>
          )}

          {/* "Bu kart bir sayfaya gider" işareti — sadece hover/odakta
              belirir, dekoratif olduğu için ekran okuyucudan gizli
              (bağlantının erişilebilir adı zaten başlıktan geliyor). */}
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 rounded-full bg-surface-raised/90 p-1.5 text-text opacity-0 shadow-sm backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none"
          >
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <div className="p-4">
          <h3 className="line-clamp-1 text-h6 font-semibold text-text transition-colors group-hover:text-brand motion-reduce:transition-none">
            {project.title}
          </h3>
          <p className="mt-1 text-caption text-text-muted">
            {[project.city, project.year].filter(Boolean).join(" · ")}
          </p>
        </div>
      </Link>
    </Card>
  );
}
