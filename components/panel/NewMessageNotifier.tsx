"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
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

  useEffect(() => {
    // getActiveTenantId() teorik olarak null dönebilir (bkz.
    // lib/supabase/queries.ts) — bu durumda abone olunacak bir tenant
    // yok, sessizce atla (panelin geri kalanı zaten bu durumda boş/0
    // değerlere düşüyor, burası da aynı ilkeyi izliyor).
    if (!tenantId) return;

    const supabase = createBrowserSupabaseClient();
    const channel = supabase
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
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId, setUnreadCount]);

  function dismissToast(id: string) {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }

  return <ToastContainer toasts={toasts} onDismiss={dismissToast} />;
}
