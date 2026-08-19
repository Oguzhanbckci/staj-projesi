import type { ReactNode } from "react";

export interface ImagePlaceholderProps {
  /** Ortada gösterilecek dekoratif ikon (opsiyonel) — ör. hizmetin kendi
   *  lucide ikonu. Verilmezse sadece degrade + ızgara deseni kalır. */
  icon?: ReactNode;
  className?: string;
}

// Gerçek bir fotoğraf YOKKEN kullanılan dekoratif yer tutucu. Daha önce bu
// durumlarda bölümler tamamen BOŞ (tek renk, görünmez bir kutu) render
// ediliyordu — ziyaretçi sitesinin "basit/yüzeysel" görünmesinin somut
// sebeplerinden biriydi (bkz. docs/DURUM.md madde 0d).
//
// Görsel dili HeroVariantA'daki "fotoğraf yoksa" katmanından devralıyor
// (degrade + ince ızgara — bir inşaat/plan çizimine hafif gönderme), ama
// Hero'dakinin aksine SABİT beyaz değil TOKEN tabanlı: bu bileşen kart
// içinde, temaya göre değişen bir zeminin üstünde duruyor, o yüzden
// `currentColor` + `text-brand` ile hem açık hem koyu temada doğru
// çalışıyor (bkz. docs/TASARIM-SISTEMI.md madde 9.3 — sabit renk yazma).
//
// Tamamen dekoratif: `aria-hidden`, hiçbir anlam taşımıyor. Gerçek bilgi
// her zaman kartın metninde (başlık/açıklama) zaten mevcut.
export function ImagePlaceholder({ icon, className = "" }: ImagePlaceholderProps) {
  return (
    <div
      aria-hidden="true"
      className={`relative flex h-full w-full items-center justify-center overflow-hidden bg-surface ${className}`}
    >
      {/* Yumuşak marka rengi parıltısı — kutuyu "boş" olmaktan çıkarır. */}
      <div
        className="absolute inset-0 text-brand opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 25% 25%, currentColor, transparent 55%), radial-gradient(circle at 80% 75%, currentColor, transparent 50%)",
        }}
      />
      {/* İnce ızgara — teknik çizim/plan çağrışımı. */}
      <div
        className="absolute inset-0 text-text opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      {icon && <div className="relative text-brand opacity-40">{icon}</div>}
    </div>
  );
}
