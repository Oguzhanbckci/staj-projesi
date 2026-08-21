"use client";

import "./globals.css";

// Kök layout'un (app/layout.tsx) KENDİSİ hata fırlatırsa devreye giren
// SON çare — bu dosya root layout'un YERİNE geçer, bu yüzden kendi
// <html>/<body>'sini tanımlamak ZORUNDA (bkz. next/dist/docs,
// "global-error must include html and body tags"). app/layout.tsx hiç
// çalışmadığı için dinamik tema/font enjeksiyonuna güvenilemez —
// globals.css'teki STATİK :root varsayılanları (bkz. FOUC önleme
// tasarımı, docs/TEMA-MIMARISI.md) burada devreye giriyor, bu yüzden
// design token class'ları (bg-surface, text-text vb.) yine de makul bir
// görünüm verir.
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="tr">
      <body className="flex min-h-screen items-center justify-center bg-surface antialiased">
        <div className="max-w-md px-6 text-center">
          <p className="text-caption font-semibold uppercase tracking-wide text-error">
            Hata
          </p>
          <h1 className="mt-2 text-h3 font-bold text-text">
            Uygulama başlatılamadı
          </h1>
          <p className="mt-4 text-base text-text-muted">
            Beklenmedik bir sorun oluştu. Sayfayı yenilemeyi deneyin; sorun
            devam ederse daha sonra tekrar ziyaret edin.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-8 inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-base font-semibold text-brand-on hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ring-offset-surface"
          >
            Tekrar dene
          </button>
        </div>
      </body>
    </html>
  );
}
