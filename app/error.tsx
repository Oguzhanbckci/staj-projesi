"use client";

import { useEffect } from "react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

// Beklenmeyen çalışma zamanı hatalarını (render sırasında fırlatılan
// istisnalar) yakalayan hata sınırı — error.tsx her zaman Client
// Component olmalı (bkz. next/dist/docs, "Error boundaries must be
// Client Components"). Prop adı BU Next.js sürümünde `retry` — eski
// sürümlerdeki `reset` DEĞİL (next/dist/docs, error-handling.md,
// AGENTS.md'nin uyardığı türden bir kırılma).
//
// KISITLAR: "teknik detay gösterme" — `error.message`/`error.stack`
// hiçbir yerde render edilmiyor, sadece sunucu konsoluna loglanıyor
// (henüz harici bir izleme servisi yok, bkz. docs/GUVENLIK.md).
export default function ErrorPage({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error("Beklenmeyen hata:", error);
  }, [error]);

  return (
    <div className="flex min-h-full items-center justify-center bg-surface py-24">
      <Container className="max-w-md text-center">
        <p className="text-caption font-semibold uppercase tracking-wide text-error">
          Hata
        </p>
        <h1 className="mt-2 text-h3 font-bold text-text">Bir şeyler ters gitti</h1>
        <p className="mt-4 text-base text-text-muted">
          Beklenmedik bir sorun oluştu. Sayfayı yeniden yüklemeyi deneyin;
          sorun devam ederse bize ulaşabilirsiniz.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={retry}>Tekrar dene</Button>
          <LinkButton href="/" variant="secondary">
            Ana sayfaya dön
          </LinkButton>
        </div>
      </Container>
    </div>
  );
}
