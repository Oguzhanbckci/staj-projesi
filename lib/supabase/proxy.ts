import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const LOGIN_PATH = "/panel/giris";

/**
 * Kök `proxy.ts`'in çağırdığı asıl mantık (Next.js 16'da `middleware.ts` ->
 * `proxy.ts` olarak yeniden adlandırıldı, davranış aynı — bkz.
 * node_modules/next/dist/docs/.../file-conventions/proxy.md). İki iş yapar:
 * 1. Oturum çerezini tazeler (Supabase Auth token'ları belli aralıklarla
 *    yenilenir — bu olmazsa Server Component'lerde `getUser()` sessizce
 *    süresi dolmuş bir oturumla çalışabilir, bkz. docs/GUVENLIK.md).
 * 2. `/panel` altındaki (giriş sayfası hariç) her rotayı korur — oturum
 *    yoksa `/panel/giris`'e yönlendirir.
 *
 * `getUser()` kullanılıyor, `getSession()` DEĞİL — `getSession()` sadece
 * yerel çerezi okur, sunucu tarafında doğrulamaz; Supabase'in kendi güvenlik
 * uyarısı "sayfa/kullanıcı verisi korumak için her zaman getUser() kullanın"
 * der (bkz. docs/GUVENLIK.md).
 *
 * ÖNEMLİ (Next.js'in kendi belgesindeki uyarı): Proxy, "tam bir oturum
 * yönetimi/yetkilendirme çözümü" olarak kullanılmamalı — sadece hızlı bir
 * yönlendirme katmanı. Asıl güvenlik kontrolü her zaman ayrıca
 * `app/panel/layout.tsx`'te (Server Component, `getUser()` ile) tekrar
 * yapılıyor — bkz. o dosya.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === LOGIN_PATH;
  const isPanelRoute = pathname.startsWith("/panel");

  if (isPanelRoute && !isLoginPage && !user) {
    return NextResponse.redirect(new URL(LOGIN_PATH, request.url));
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return response;
}
