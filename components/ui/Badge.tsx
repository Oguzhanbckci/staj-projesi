import type { HTMLAttributes } from "react";

type BadgeVariant = "brand" | "neutral" | "accent" | "success";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  brand: "bg-brand/10 text-brand",
  neutral: "bg-neutral-100 text-text-muted",
  accent: "bg-accent text-accent-on",
  success: "bg-success/10 text-success",
};

// Küçük etiket/pill — durum rozetleri (StatusBadge/ReadStatusBadge) gibi
// tek bir anlam taşımaz, dekoratif/bilgilendirici kısa etiketler için
// (bkz. giriş sayfası "Yönetim Paneli" etiketi). Gerçek metin rengi
// varyantı zaten yeterli kontrastı sağlıyor (brand/success token'ları
// TASARIM-SISTEMI.md'de WCAG doğrulamalı), opaklıklı zemin sadece
// dekoratif — metin rengi ham token'a bağlı kalıyor.
export function Badge({ variant = "neutral", className = "", children, ...rest }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-caption font-semibold ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
}
