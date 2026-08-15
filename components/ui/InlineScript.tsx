export interface InlineScriptProps {
  html: string;
}

// Next.js'in resmi "preventing-flash-before-hydration" kılavuzundaki AYNI
// yardımcı bileşen (bkz. node_modules/next/dist/docs/01-app/02-guides/
// preventing-flash-before-hydration.md, "Extracting a reusable component").
// `app/layout.tsx`'teki kök tema script'inden FARKLI: o gerçek <head>
// içinde (kök layout hiç client-taraflı yeniden render olmuyor, bu yüzden
// sorun yok); bu bileşen ise sayfa GÖVDESİNDE kullanılan script'ler için —
// React, geliştirme modunda gövdede render edilen <script> etiketleri için
// uyarı veriyor ("Scripts inside React components are never executed when
// rendering on the client"). `type`'ı sunucuda "text/javascript" (tarayıcı
// ilk HTML ayrıştırmasında SENKRON çalıştırır), istemcide "text/plain"
// (script olarak asla çalıştırılmaz) yaparak hem gerçek soruna (client
// taraflı yeniden render'da script zaten çalışmaz) hem geliştirme
// uyarısına aynı anda çözüm — `suppressHydrationWarning` bu kasıtlı
// server/client type farkını bastırır.
export function InlineScript({ html }: InlineScriptProps) {
  return (
    <script
      type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
