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
 * `app/panel/(protected)/layout.tsx`'te (Server Component, `getUser()`
 * ile) tekrar yapılıyor — bkz. o dosya. Bu iki katman birbirinden
 * bağımsız, sonsuz döngü riski yok: bu fonksiyon sadece `/panel/giris`
 * DIŞINDAKİ panel rotalarını login'e yönlendirir, `/panel/giris`'in
 * kendisini hiç kontrol etmez (bkz. `isLoginPage` kontrolü) — login
 * sayfası kendi kendini asla tekrar login'e göndermez.
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
    // Kullanıcı giriş yaptıktan sonra asıl gitmek istediği sayfaya geri
    // dönebilsin diye, o an gidilmek istenen yol (+ varsa query string)
    // "next" parametresinde taşınıyor. Doğrulama/güvenli varsayılana
    // düşürme işi giriş sayfasında yapılıyor (bkz. app/panel/giris/page.tsx,
    // "next" harici bir adrese yönlendirmek için kötüye kullanılamaz —
    // açık yönlendirme/open redirect koruması orada).
    const loginUrl = new URL(LOGIN_PATH, request.url);
    const originalPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set("next", originalPath);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoginPage && user) {
    return NextResponse.redirect(new URL("/panel", request.url));
  }

  return response;
}
