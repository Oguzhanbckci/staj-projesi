import type { HTMLAttributes } from "react";

export type CardProps = HTMLAttributes<HTMLDivElement>;

// Genel amaçlı içerik kartı — hizmet kartı, referans kartı, proje kartı
// gibi tüm "kart" ihtiyaçlarının ortak zemini. Kendi bir iç düzen
// dayatmaz, tamamen children ile gelir (bkz. Container ile aynı ilke —
// TASARIM-SISTEMI.md madde 9).
export function Card({ className = "", children, ...rest }: CardProps) {
  return (
    <div
      className={`overflow-hidden rounded-lg bg-surface-raised shadow-sm ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
