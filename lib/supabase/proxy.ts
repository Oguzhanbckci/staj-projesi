import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getKnownSiteUrl } from "@/lib/seo/getSiteUrl";

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
  // KANONİK ADRESE YÖNLENDİRME (2026-08-17 eklendi) — Vercel her deploy
  // için birden fazla adres üretir (kalıcı üretim adresi + git dalı
  // önizlemesi + o TEK deploy'a özel bir adres, bkz. docs/KARAR-GUNLUGU.md).
  // Ziyaretçi/arama motoru "yan" adreslerden birine gelirse, bilinen tek
  // GERÇEK adrese (NEXT_PUBLIC_SITE_URL/VERCEL_PROJECT_PRODUCTION_URL)
  // 308 (kalıcı) yönlendirilir — SEO sinyalleri tek adreste toplanır,
  // panel oturum çerezleri de her zaman AYNI origin'de kurulur (birden
  // fazla adreste dağılıp tutarsız oturum durumuna düşmez). Sadece bu
  // ikisinden biri KESİN olarak biliniyorsa çalışır (VERCEL_URL/tenant
  // domain'i gibi güvenilmez tahminlerle YÖNLENDİRME yapılmaz, bkz.
  // getKnownSiteUrl yorumu) ve sadece üretimde (yerel `next dev`'de host
  // zaten `localhost` olduğu için bu kontrol anlamsız/zararlı olurdu).
  const isLocalHost = /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(request.nextUrl.host);
  if (process.env.NODE_ENV !== "development" && !isLocalHost) {
    const knownSiteUrl = getKnownSiteUrl();
    if (knownSiteUrl) {
      const canonicalHost = new URL(knownSiteUrl).host;
      if (request.nextUrl.host !== canonicalHost) {
        const target = new URL(request.nextUrl.pathname + request.nextUrl.search, knownSiteUrl);
        return NextResponse.redirect(target, 308);
      }
    }
  }

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
