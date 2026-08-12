import { LinkButton } from "@/components/ui/LinkButton";
import { Container } from "@/components/ui/Container";

// Root app/not-found.tsx — Next.js 16'da hem notFound() çağrılan
// segmentleri hem de EŞLEŞMEYEN her URL'i (yanlış yazılmış adres,
// silinmiş bir bağlantı) otomatik yakalar (bkz. next/dist/docs,
// "Root app/not-found handles global unmatched URLs"). Kök layout'un
// İÇİNDE render edildiği için tenant'ın tema/font'unu otomatik miras
// alır — ekstra bir şey yapmaya gerek yok.
//
// KISITLAR: "kullanıcıya ne yapacağını söyle, teknik detay gösterme" —
// hangi URL'in denendiği, hangi route'un eşleşmediği gibi hiçbir teknik
// bilgi burada yok, sadece net bir yönlendirme.
export default function NotFound() {
  return (
    <div className="flex min-h-full items-center justify-center bg-surface py-24">
      <Container className="max-w-md text-center">
        <p className="text-caption font-semibold uppercase tracking-wide text-brand">
          404
        </p>
        <h1 className="mt-2 text-h3 font-bold text-text">Sayfa bulunamadı</h1>
        <p className="mt-4 text-base text-text-muted">
          Aradığınız sayfa taşınmış, kaldırılmış olabilir ya da hiç var
          olmadı. Adresi kontrol edin veya ana sayfaya dönün.
        </p>
        <div className="mt-8">
          <LinkButton href="/">Ana sayfaya dön</LinkButton>
        </div>
      </Container>
    </div>
  );
}
