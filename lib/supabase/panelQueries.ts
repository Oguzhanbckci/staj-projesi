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

export interface AdminServiceRow {
  id: string;
  title: string;
  isPublished: boolean;
  orderIndex: number;
}

// Ziyaretçi sitesindeki getServices() (queries.ts) sadece
// `is_published = true` döner — panel yönetim tablosu TASLAKLARI da
// görebilmeli (bkz. yönerge: "yayınlanmamışlar ayırt edilebilsin"), bu
// yüzden burada is_published filtresi YOK.
export async function getAllServices(): Promise<AdminServiceRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("services")
      .select("id, title, is_published, order_index")
      .eq("tenant_id", tenantId)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Hizmetler alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      isPublished: Boolean(row.is_published),
      orderIndex: Number(row.order_index),
    }));
  } catch (err) {
    console.error("getAllServices sorgu hatası:", err);
    return [];
  }
}

export interface ServiceDetail {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  isPublished: boolean;
}

// Düzenleme sayfasının formu doldurmak için ihtiyaç duyduğu tam kayıt
// (bkz. app/panel/(protected)/icerikler/hizmetler/[id]/page.tsx). Kayıt
// bulunamazsa ya da başka bir tenant'a aitse null döner — çağıran taraf
// bunu `notFound()` ile ele alır.
export async function getServiceById(id: string): Promise<ServiceDetail | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("services")
      .select("id, title, description, icon, is_published")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: String(data.id),
      title: String(data.title),
      description: typeof data.description === "string" ? data.description : null,
      icon: typeof data.icon === "string" ? data.icon : null,
      isPublished: Boolean(data.is_published),
    };
  } catch (err) {
    console.error("getServiceById sorgu hatası:", err);
    return null;
  }
}

export interface AdminProjectRow {
  id: string;
  title: string;
  location: string | null;
  year: number | null;
  isPublished: boolean;
  orderIndex: number;
}

export async function getAllProjects(): Promise<AdminProjectRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, location, year, is_published, order_index")
      .eq("tenant_id", tenantId)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Projeler alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      title: String(row.title),
      location: typeof row.location === "string" ? row.location : null,
      year: typeof row.year === "number" ? row.year : null,
      isPublished: Boolean(row.is_published),
      orderIndex: Number(row.order_index),
    }));
  } catch (err) {
    console.error("getAllProjects sorgu hatası:", err);
    return [];
  }
}

export interface ProjectDetail {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  location: string | null;
  year: number | null;
  liveUrl: string | null;
  isPublished: boolean;
}

// getServiceById ile aynı desen.
export async function getProjectById(id: string): Promise<ProjectDetail | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, category, location, year, live_url, is_published")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: String(data.id),
      title: String(data.title),
      description: typeof data.description === "string" ? data.description : null,
      category: typeof data.category === "string" ? data.category : null,
      location: typeof data.location === "string" ? data.location : null,
      year: typeof data.year === "number" ? data.year : null,
      liveUrl: typeof data.live_url === "string" ? data.live_url : null,
      isPublished: Boolean(data.is_published),
    };
  } catch (err) {
    console.error("getProjectById sorgu hatası:", err);
    return null;
  }
}

// Yeni bir kayıt eklenirken sırayı listenin sonuna koyar (mevcut en
// büyük order_index + 10 — araya ekleme payı bırakan 10'ar artış deseni
// zaten seed verisinde de kullanılıyordu, bkz. docs/VERİ-MODELİ.md).
// Admin'den ham bir sıra numarası istemek yerine burada hesaplanıyor —
// çakışma/yanlış girdi riskini ortadan kaldırır.
export async function getNextOrderIndex(
  table: "services" | "projects",
  tenantId: string
): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from(table)
    .select("order_index")
    .eq("tenant_id", tenantId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return 10;
  return Number(data.order_index) + 10;
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
