import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

const CONTENT_TYPES = [
  { label: "Hero", href: "/panel/icerikler/hero", description: "Ana sayfadaki büyük tanıtım bölümünü yönet." },
  { label: "Hakkımızda", href: "/panel/icerikler/hakkimizda", description: "Firma tanıtım bölümünü yönet." },
  { label: "Hizmetler", href: "/panel/icerikler/hizmetler", description: "Hizmet kartlarını yönet." },
  { label: "Projeler", href: "/panel/icerikler/projeler", description: "Proje/portfolyo kayıtlarını yönet." },
  { label: "Referanslar", href: "/panel/icerikler/referanslar", description: "Müşteri referanslarını yönet." },
  { label: "SSS", href: "/panel/icerikler/sss", description: "Sıkça sorulan soruları yönet." },
  { label: "Ekip", href: "/panel/icerikler/ekip", description: "Ekip üyelerini yönet." },
];

// İçerik türlerine göre bir dizin — her kart, ilgili içerik türünün
// liste + ekle/düzenle/sil/sırala sayfasına götürür (bkz. Hizmetler/
// Projeler ile aynı desen, docs/MIMARI.md madde 9).
export default function IceriklerPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "Özet", href: "/panel" }, { label: "İçerikler" }]} className="mb-2" />
      <h1 className="text-h3 font-bold text-text">İçerikler</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CONTENT_TYPES.map((type) => (
          <Link key={type.href} href={type.href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ring-offset-surface">
            <Card className="p-6 transition-colors hover:bg-surface">
              <p className="text-h6 font-bold text-text">{type.label}</p>
              <p className="mt-1 text-base text-text-muted">{type.description}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
