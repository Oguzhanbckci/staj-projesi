import type { SupabaseClient } from "@supabase/supabase-js";

// SUNUCU-ÖZEL — sadece app/panel/giris/page.tsx'teki signInAction'dan
// çağrılır.
//
// 2026-08-18 DÜZELTMESİ (dokuzuncu oturumun kendi çok-ajanlı review'ü):
// İlk sürüm ayrı `checkLoginRateLimit` (SELECT COUNT) + `recordFailedLoginAttempt`
// (INSERT) fonksiyonlarından oluşuyordu — bu "check-then-act" deseni ATOMIK
// DEĞİLDİ: eşzamanlı istekler hepsi aynı düşük sayımı görüp hepsi "izin
// verildi" alabiliyordu, saldırgan paralel isteklerle "5 deneme/15 dakika"
// sınırını fiilen atlatabiliyordu. Çözüm: sayım + rezervasyon artık TEK bir
// Postgres fonksiyonunda (`check_and_reserve_login_attempt`), IP bazlı bir
// `pg_advisory_xact_lock` ile serileştirilmiş olarak atomik çalışıyor (bkz.
// supabase/migrations/20260818150000_add_atomic_rate_limit_functions.sql).
export const LOGIN_RATE_LIMIT_MAX_ATTEMPTS = 5;
export const LOGIN_RATE_LIMIT_WINDOW_MINUTES = 15;

export interface LoginRateLimitResult {
  allowed: boolean;
  /** Sadece allowed:false iken dolu — kullanıcıya gösterilecek bekleme süresi. */
  retryAfterMinutes?: number;
  /** Sadece allowed:true iken dolu — başarılı girişte releaseLoginAttempt'e geçirilir. */
  attemptId: string | null;
}

// KISITLAR (kullanıcı isteği): "15 dakikada 5 defa yanlış girerse
// kilitlesin", "kilit kalıcı olsun", "bir süre sonra tekrar deneyebilsin".
// Rezervasyon (insert) `signInWithPassword` çağrılmadan ÖNCE, aynı atomik
// adımda oluşur — yani bir istek "izin verildi" aldığı anda o denemenin
// sayaca yansıması GARANTİ, aradan bir istek daha giremez (advisory lock
// aynı IP için tüm çağrıları sıraya sokar).
export async function checkAndReserveLoginAttempt(
  supabase: SupabaseClient,
  ip: string | null
): Promise<LoginRateLimitResult> {
  // IP okunamadıysa (yerel geliştirme, ya da beklenmeyen bir proxy
  // yapılandırması) hız sınırı UYGULANMAZ — checkContactRateLimit'teki
  // aynı gerekçe: IP olmadan kimin kim olduğunu güvenilir şekilde ayırt
  // edemeyiz, o zaman hiç engellemeyiz.
  if (!ip) {
    return { allowed: true, attemptId: null };
  }

  const { data, error } = await supabase.rpc("check_and_reserve_login_attempt", {
    p_ip: ip,
    p_max_attempts: LOGIN_RATE_LIMIT_MAX_ATTEMPTS,
    p_window_minutes: LOGIN_RATE_LIMIT_WINDOW_MINUTES,
  });

  if (error || !data || data.length === 0) {
    // RPC başarısız olursa (geçici DB sorunu, migration henüz uygulanmadı
    // vb.) admini TAMAMEN kilitlemek yanlış pozitiften daha kötü bir sonuç
    // olurdu — hatayı sunucuya logla, girişe izin ver (checkContactRateLimit
    // ile aynı ilke).
    console.error("checkAndReserveLoginAttempt RPC hatası:", error);
    return { allowed: true, attemptId: null };
  }

  const row = data[0] as { allowed: boolean; attempt_id: string | null };
  if (!row.allowed) {
    return { allowed: false, retryAfterMinutes: LOGIN_RATE_LIMIT_WINDOW_MINUTES, attemptId: null };
  }

  return { allowed: true, attemptId: row.attempt_id };
}

// signInWithPassword BAŞARILI olduğunda çağrılır — checkAndReserveLoginAttempt'in
// oluşturduğu rezervasyon satırını siler, böylece doğru şifre girmek
// kullanıcının kalan hakkını tüketmez (sadece GERÇEK başarısız denemeler
// sayılır). attemptId null ise (IP okunamadığı için hiç rezervasyon
// yapılmadıysa) sessizce no-op.
export async function releaseLoginAttempt(
  supabase: SupabaseClient,
  attemptId: string | null
): Promise<void> {
  if (!attemptId) return;

  const { error } = await supabase.rpc("delete_login_attempt", { p_id: attemptId });
  if (error) {
    console.error("releaseLoginAttempt RPC hatası:", error);
  }
}
