import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-brand text-brand-on hover:opacity-90",
  secondary:
    "bg-surface-raised text-text border border-neutral-300 hover:bg-neutral-100",
  ghost: "bg-transparent text-brand hover:bg-neutral-100",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-sm px-3 text-caption",
  md: "h-10 gap-2 rounded-md px-4 text-base",
  lg: "h-12 gap-2 rounded-lg px-6 text-base",
};

// Gerçek <button> — asChild/polymorphic yok (bkz. docs/TASARIM-SISTEMI.md
// "Bileşen API Kuralları"). Devre dışı bırakma native `disabled` ile
// yapılır: hem tıklamayı engeller hem tab sırasından çıkarır, ek kod
// gerekmez.
export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={`inline-flex items-center justify-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
      {isLoading && <span className="sr-only"> — Yükleniyor</span>}
    </button>
  );
}
