"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { ToastContainer } from "@/components/ui/ToastContainer";
import { getContactSubjectLabel } from "@/lib/validation/contact";
import type { ToastData } from "@/components/ui/Toast";

// Realtime INSERT payload'ı ham DB satırı (snake_case) — panelQueries.ts'teki
// mapContactMessageRow'un camelCase ContactMessageRow'u DEĞİL, sadece bu
// bildirimin ihtiyaç duyduğu 3 alan tipleniyor.
interface ContactMessageInsertPayload {
  id: string;
  sender_name: string;
  subject: string | null;
}

// Panel açıkken yeni bir iletişim mesajı geldiğinde ANINDA (sayfa
// yenilemeden) toast bildirimi gösterir + okunmamış sayacını artırır —
// kullanıcı isteği (2026-08-18): "anlık gözüksün, bildirim gelsin".
// Supabase Realtime (`postgres_changes`, INSERT) kullanıyor — anon key'li
// bağlantı contact_messages'ı HİÇ GÖREMEZ (RLS, bkz. GUVENLIK.md madde
// 1-2/17), bu yüzden bu abonelik SADECE giriş yapmış panel kullanıcısının
// oturumu (authenticated rolü, zaten tam SELECT izni var) üzerinden
// çalışır — yeni bir erişim genişletmesi değil, mevcut RLS izninin doğal
// bir uzantısı. `PanelShell.tsx`'te bir kez mount edilir (her panel
// sayfasında aktif kalsın diye).
export function NewMessageNotifier({
  tenantId,
  setUnreadCount,
}: {
  tenantId: string;
  /** useState'in setter'ı — React'te referansı stabildir, bu yüzden
   *  effect'in bağımlılık dizisinde her render'da gereksiz yeniden
   *  abonelik tetiklemez (bir inline callback'in aksine). */
  setUnreadCount: Dispatch<SetStateAction<number>>;
}) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const router = useRouter();

  useEffect(() => {
    // getActiveTenantId() teorik olarak null dönebilir (bkz.
    // lib/supabase/queries.ts) — bu durumda abone olunacak bir tenant
    // yok, sessizce atla (panelin geri kalanı zaten bu durumda boş/0
    // değerlere düşüyor, burası da aynı ilkeyi izliyor).
    if (!tenantId) return;

    const supabase = createBrowserSupabaseClient();
    let cancelled = false;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    // GERÇEK BUG (yedinci oturumda bulundu, bkz. docs/KARAR-GUNLUGU.md): burada
    // eskiden client oluşturulur oluşturulmaz senkron olarak subscribe()
    // çağrılıyordu. createBrowserSupabaseClient() oturumu çerezden ASENKRON
    // okur (bkz. lib/supabase/client.ts, @supabase/ssr); subscribe() bu
    // okuma tamamlanmadan tetiklenince kanal Realtime'a "anon" rolüyle
    // katılıyordu — contact_messages'ta anon'un HİÇ SELECT izni olmadığı
    // için (bilerek öyle kurulmuş, bkz. GUVENLIK.md madde 1-2) INSERT
    // olayları RLS tarafından SESSİZCE filtreleniyordu. subscribe() yine de
    // "SUBSCRIBED" (hatasız) dönüyordu, bu yüzden CHANNEL_ERROR/TIMED_OUT
    // logu da hiç tetiklenmiyordu — sorun görünmez kalıyordu.
    // Düzeltme: abone olmadan ÖNCE oturumu bekleyip access_token'ı elle
    // `supabase.realtime.setAuth()` ile Realtime soketine veriyoruz, böylece
    // ilk katılım (join) baştan "authenticated" rolüyle oluyor.
    async function subscribe() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session) {
        supabase.realtime.setAuth(session.access_token);
      }

      channel = supabase
        .channel(`contact-messages-${tenantId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "contact_messages",
            filter: `tenant_id=eq.${tenantId}`,
          },
          (payload) => {
            const row = payload.new as ContactMessageInsertPayload;
            setToasts((prev) => [
              ...prev,
              {
                id: row.id,
                title: "Yeni mesaj",
                description: `${row.sender_name} — ${getContactSubjectLabel(row.subject)}`,
                href: `/panel/mesajlar/${row.id}`,
              },
            ]);
            setUnreadCount((count) => count + 1);
            // Mesajlar listesi (mesajlar/page.tsx) ve Özet ekranındaki
            // sayılar Server Component'ten geliyor — router.refresh() bu
            // ağacı sunucudan yeniden çeker, kullanıcı o an hangi panel
            // sayfasındaysa (ör. /panel/mesajlar) sayfa hiç yenilenmeden
            // yeni mesaj listeye düşer.
            router.refresh();
          }
        )
        .subscribe((status, err) => {
          // Bağlantı kurulamazsa (ör. CSP/ağ engeli, CHANNEL_ERROR/TIMED_OUT)
          // bildirim sessizce hiç gelmez — bu sessizliği teşhis edilebilir
          // yapmak için konsola logla (2026-08-18, gerçek bir CSP hatası bu
          // şekilde bulundu, bkz. KARAR-GUNLUGU.md).
          if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
            console.error("[NewMessageNotifier] Realtime bağlantısı kurulamadı:", status, err);
          }
        });
    }

    subscribe();

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tenantId, setUnreadCount, router]);

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
}
