import { createServerSupabaseClient } from "@/lib/supabase/server";

// Bu dosyadaki sorgular sadece `app/panel/(protected)/` altından çağrılır
// — çağıran taraf zaten oturumu doğrulamış olmalı (bkz. o layout'taki
// `getUser()` kontrolü). Bilerek `createServiceRoleClient()` DEĞİL,
// `createServerSupabaseClient()` (anon key + oturum çerezi) kullanılıyor:
// panel "authenticated" rolüyle çalışır, RLS'in `..._authenticated_select_all`
// politikaları (bkz. docs/GUVENLIK.md) zaten taslak dahil her şeyi
// görmesine izin veriyor — service role (RLS bypass) burada gereksiz bir
// güç artışı olurdu. `lib/supabase/queries.ts`'teki herkese açık içerik
// sorgularından bilinçli olarak ayrı bir dosyada (bkz. docs/KARAR-GUNLUGU.md,
// 2026-08-12).
//
// Aktif tenant, `getActiveTenantId()`'deki (queries.ts) geçici sabit
// domain kısıtına tabidir — Host header'a göre gerçek tenant çözümlemesi
// gelene kadar panel de aynı (Akme İnşaat) tenant'ı gösterir.
import { getActiveTenantId } from "@/lib/supabase/queries";

export async function getServicesCount(): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return 0;

    const { count, error } = await supabase
      .from("services")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);

    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    console.error("getServicesCount sorgu hatası:", err);
    return 0;
  }
}

export async function getProjectsCount(): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return 0;

    const { count, error } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId);

    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    console.error("getProjectsCount sorgu hatası:", err);
    return 0;
  }
}

export async function getUnreadMessagesCount(): Promise<number> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return 0;

    const { count, error } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact", head: true })
      .eq("tenant_id", tenantId)
      .eq("is_read", false);

    if (error) throw error;
    return count ?? 0;
  } catch (err) {
    console.error("getUnreadMessagesCount sorgu hatası:", err);
    return 0;
  }
}

export interface ContactMessageRow {
  id: string;
  senderName: string;
  senderPhone: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export async function getContactMessages(): Promise<ContactMessageRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("contact_messages")
      .select("id, sender_name, sender_phone, message, is_read, created_at")
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw error ?? new Error("Mesajlar alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      senderName: String(row.sender_name),
      senderPhone: typeof row.sender_phone === "string" ? row.sender_phone : null,
      message: String(row.message),
      isRead: Boolean(row.is_read),
      createdAt: String(row.created_at),
    }));
  } catch (err) {
    console.error("getContactMessages sorgu hatası:", err);
    return [];
  }
}
