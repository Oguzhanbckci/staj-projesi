import type { HTMLAttributes } from "react";

export type ContainerProps = HTMLAttributes<HTMLDivElement>;

// Hem sayfa bölümlerini (varsayılan max-w-6xl) hem içerik kartlarını
// (className ile daha dar bir max-w override edilerek) sarmak için tek,
// genel amaçlı kap — bkz. docs/TASARIM-SISTEMI.md "Bileşen API Kuralları".
export function Container({ className = "", children, ...rest }: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
