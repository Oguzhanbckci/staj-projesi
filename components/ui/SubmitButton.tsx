"use client";

import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/Button";

export interface SubmitButtonProps extends Omit<ButtonProps, "type" | "isLoading"> {
  /** Gönderim sürerken buton metninin yerini alır (ör. "Gönderiliyor…"). */
  pendingLabel: string;
}

// `useFormStatus` sadece bir <form> İÇİNDEKİ bir Client Component'ten
// okunabilir — bu yüzden bu, formu saran bileşenin kendisinde değil,
// ayrı, küçük bir alt bileşende olmalı (React kısıtı). Üç formda da
// (İletişim, Hizmet, Proje) aynı davranış: gönderilirken buton devre dışı
// + metin değişir (KISITLAR: "durum metinle bildirilsin").
export function SubmitButton({ pendingLabel, children, disabled, ...rest }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" isLoading={pending} disabled={pending || disabled} {...rest}>
      {pending ? pendingLabel : children}
    </Button>
  );
}
