import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16: eski middleware.ts dosya adı `proxy.ts`'e, `middleware`
// export adı `proxy`'ye yeniden adlandırıldı (davranış aynı). Asıl mantık
// lib/supabase/proxy.ts'te (bkz. o dosyadaki yorum) — burası sadece ince
// bir çağırıcı, gelecekte tenant çözümleme mantığı da (bkz. docs/MIMARI.md
// madde 7) eklenirse tek proxy.ts dosyasında birleştirilmesi gerekecek
// (Next.js proje başına yalnızca bir proxy dosyasına izin veriyor).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Aşağıdakiler dışındaki tüm istekler:
     * - _next/static, _next/image (derleme çıktısı/görsel optimizasyonu)
     * - favicon.ico
     * - public/ altındaki statik dosyalar (uzantılı yollar)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
