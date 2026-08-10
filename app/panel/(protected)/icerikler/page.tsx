import Link from "next/link";
import { Card } from "@/components/ui/Card";

const CONTENT_TYPES = [
  { label: "Hizmetler", href: "/panel/icerikler/hizmetler", description: "Hizmet kartlarını yönet." },
  { label: "Projeler", href: "/panel/icerikler/projeler", description: "Proje/portfolyo kayıtlarını yönet." },
];

// İçerik türlerine göre bir dizin — Referanslar/SSS/Ekip gibi diğer
// liste içerikleri için de aynı desen (bkz. Hizmetler/Projeler) ileride
// buraya eklenecek (bkz. docs/DURUM.md "Sıradaki adım").
export default function IceriklerPage() {
  return (
    <div>
      <h1 className="text-h3 font-bold text-text">İçerikler</h1>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {CONTENT_TYPES.map((type) => (
          <Link key={type.href} href={type.href} className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2">
            <Card className="p-6 transition-colors hover:bg-surface">
              <p className="text-h6 font-bold text-text">{type.label}</p>
              <p className="mt-1 text-base text-text-muted">{type.description}</p>
            </Card>
          </Link>
        ))}
      </div>
      <p className="mt-8 text-base text-text-muted">
        Referanslar, SSS, Ekip gibi diğer içerik türleri Faz 5&apos;te eklenecek.
      </p>
    </div>
  );
}
