import type { AnchorHTMLAttributes } from "react";

type LinkButtonVariant = "primary" | "secondary" | "ghost";
type LinkButtonSize = "sm" | "md" | "lg";

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkButtonVariant;
  size?: LinkButtonSize;
}

const VARIANT_CLASSES: Record<LinkButtonVariant, string> = {
  primary: "bg-brand text-brand-on hover:opacity-90",
  secondary:
    "bg-surface-raised text-text border border-neutral-300 hover:bg-neutral-100",
  ghost: "bg-transparent text-brand hover:bg-neutral-100",
};

const SIZE_CLASSES: Record<LinkButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-sm px-3 text-caption",
  md: "h-10 gap-2 rounded-md px-4 text-base",
  lg: "h-12 gap-2 rounded-lg px-6 text-base",
};

// Button (components/ui/Button.tsx) ile aynı görsel dil, ama gezinme için
// gerçek <a> — CTA linkleri bir aksiyon değil gezinmedir (WCAG: buton=
// aksiyon, link=gezinme), bu yüzden Button'a asChild eklemek yerine ayrı,
// kendi içinde basit bir bileşen (bkz. TASARIM-SISTEMI.md madde 9.2).
export function LinkButton({
  variant = "primary",
  size = "md",
  className = "",
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <a
      className={`inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </a>
  );
}
