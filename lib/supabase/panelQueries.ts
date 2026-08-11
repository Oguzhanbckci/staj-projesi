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
  imagePath: string | null;
}

// getServiceById ile aynı desen.
export async function getProjectById(id: string): Promise<ProjectDetail | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("projects")
      .select("id, title, description, category, location, year, live_url, is_published, image_path")
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
      imagePath: typeof data.image_path === "string" ? data.image_path : null,
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
  table: "services" | "projects" | "testimonials" | "faqs" | "team_members",
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

// Sıralama (yukarı/aşağı taşı) — komşu kaydın order_index'iyle YER
// DEĞİŞTİRİR. Sınırda (ilk kayıtta yukarı / son kayıtta aşağı) sessizce
// no-op (ok:true) döner — AdminListTable zaten bu durumlarda butonu
// disabled yapıyor, bu bir güvenlik ağı. Tek paylaşılan yardımcı (5
// varlık türü için 5 kez aynı takas mantığını yazmamak için) — auth/
// revalidate iskeleti PAYLAŞILMIYOR, her actions.ts kendi
// requireAdminUser() + revalidatePath'ini çağırır (bkz. docs/MIMARI.md
// madde 9-10). İki ayrı `.update()` çağrısı bir transaction İÇİNDE değil
// — tek-admin/düşük-eşzamanlılık bağlamında kabul edilebilir bir
// basitleştirme (bkz. docs/TEST-STRATEJISI.md, "pragmatik yaklaşım").
export async function swapOrderIndex(
  table: "services" | "projects" | "testimonials" | "faqs" | "team_members",
  id: string,
  direction: "up" | "down",
  tenantId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = await createServerSupabaseClient();

  const { data: rows, error: listError } = await supabase
    .from(table)
    .select("id, order_index")
    .eq("tenant_id", tenantId)
    .order("order_index", { ascending: true });

  if (listError || !rows) {
    console.error("swapOrderIndex liste okuma hatası:", listError);
    return { ok: false, error: "Sıralama okunamadı." };
  }

  const index = rows.findIndex((row) => row.id === id);
  if (index === -1) {
    return { ok: false, error: "Kayıt bulunamadı." };
  }

  const neighborIndex = direction === "up" ? index - 1 : index + 1;
  if (neighborIndex < 0 || neighborIndex >= rows.length) {
    return { ok: true };
  }

  const current = rows[index];
  const neighbor = rows[neighborIndex];

  const { error: firstError } = await supabase
    .from(table)
    .update({ order_index: neighbor.order_index })
    .eq("id", current.id)
    .eq("tenant_id", tenantId);

  if (firstError) {
    console.error("swapOrderIndex güncelleme hatası:", firstError);
    return { ok: false, error: "Sıralama güncellenirken bir sorun oluştu." };
  }

  const { error: secondError } = await supabase
    .from(table)
    .update({ order_index: current.order_index })
    .eq("id", neighbor.id)
    .eq("tenant_id", tenantId);

  if (secondError) {
    console.error("swapOrderIndex güncelleme hatası:", secondError);
    return { ok: false, error: "Sıralama güncellenirken bir sorun oluştu." };
  }

  return { ok: true };
}

export interface AdminTestimonialRow {
  id: string;
  authorName: string;
  authorTitle: string | null;
  isPublished: boolean;
  orderIndex: number;
}

// getAllServices ile birebir aynı desen.
export async function getAllTestimonials(): Promise<AdminTestimonialRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, author_name, author_title, is_published, order_index")
      .eq("tenant_id", tenantId)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Referanslar alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      authorName: String(row.author_name),
      authorTitle: typeof row.author_title === "string" ? row.author_title : null,
      isPublished: Boolean(row.is_published),
      orderIndex: Number(row.order_index),
    }));
  } catch (err) {
    console.error("getAllTestimonials sorgu hatası:", err);
    return [];
  }
}

export interface TestimonialDetail {
  id: string;
  authorName: string;
  authorTitle: string | null;
  quote: string;
  rating: number | null;
  isPublished: boolean;
}

// getServiceById ile aynı desen. `rating` DB'de var ama ziyaretçi
// sitesinde hiç gösterilmiyor (bkz. components/site/testimonials/types.ts)
// — panel formunda düzenlenebilir olması bu görevin kapsamında (gerçek
// bir alan), siteye yansıtmak kapsam dışı.
export async function getTestimonialById(id: string): Promise<TestimonialDetail | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("testimonials")
      .select("id, author_name, author_title, quote, rating, is_published")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: String(data.id),
      authorName: String(data.author_name),
      authorTitle: typeof data.author_title === "string" ? data.author_title : null,
      quote: String(data.quote),
      rating: typeof data.rating === "number" ? data.rating : null,
      isPublished: Boolean(data.is_published),
    };
  } catch (err) {
    console.error("getTestimonialById sorgu hatası:", err);
    return null;
  }
}

export interface AdminFaqRow {
  id: string;
  question: string;
  isPublished: boolean;
  orderIndex: number;
}

export async function getAllFaqs(): Promise<AdminFaqRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, is_published, order_index")
      .eq("tenant_id", tenantId)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("SSS alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      question: String(row.question),
      isPublished: Boolean(row.is_published),
      orderIndex: Number(row.order_index),
    }));
  } catch (err) {
    console.error("getAllFaqs sorgu hatası:", err);
    return [];
  }
}

export interface FaqDetail {
  id: string;
  question: string;
  answer: string;
  isPublished: boolean;
}

export async function getFaqById(id: string): Promise<FaqDetail | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, is_published")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: String(data.id),
      question: String(data.question),
      answer: String(data.answer),
      isPublished: Boolean(data.is_published),
    };
  } catch (err) {
    console.error("getFaqById sorgu hatası:", err);
    return null;
  }
}

export interface AdminTeamMemberRow {
  id: string;
  fullName: string;
  role: string;
  isPublished: boolean;
  orderIndex: number;
}

export async function getAllTeamMembers(): Promise<AdminTeamMemberRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("team_members")
      .select("id, full_name, role, is_published, order_index")
      .eq("tenant_id", tenantId)
      .order("order_index");

    if (error || !data) {
      throw error ?? new Error("Ekip üyeleri alınamadı.");
    }

    return data.map((row) => ({
      id: String(row.id),
      fullName: String(row.full_name),
      role: String(row.role),
      isPublished: Boolean(row.is_published),
      orderIndex: Number(row.order_index),
    }));
  } catch (err) {
    console.error("getAllTeamMembers sorgu hatası:", err);
    return [];
  }
}

export interface TeamMemberDetail {
  id: string;
  fullName: string;
  role: string;
  bio: string | null;
  isPublished: boolean;
}

export async function getTeamMemberById(id: string): Promise<TeamMemberDetail | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("team_members")
      .select("id, full_name, role, bio, is_published")
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: String(data.id),
      fullName: String(data.full_name),
      role: String(data.role),
      bio: typeof data.bio === "string" ? data.bio : null,
      isPublished: Boolean(data.is_published),
    };
  } catch (err) {
    console.error("getTeamMemberById sorgu hatası:", err);
    return null;
  }
}

export interface StorageImageObject {
  path: string;
  name: string;
  updatedAt: string | null;
}

// Medya kütüphanesi (app/panel/(protected)/medya/) için — "projects"
// bucket'ındaki nesneleri listeler (bkz. supabase/migrations/
// 20260814120000_create_projects_storage_bucket.sql). Şu an sadece bu
// tek bucket var, diğer içerik türleri için henüz bucket kurulmadı
// (bkz. docs/DURUM.md).
export async function listProjectImages(): Promise<StorageImageObject[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase.storage
      .from("projects")
      .list(tenantId, { sortBy: { column: "created_at", order: "desc" } });

    if (error || !data) {
      throw error ?? new Error("Görseller listelenemedi.");
    }

    return data
      .filter((object) => object.id) // klasör yer tutucularını (id yok) ele
      .map((object) => ({
        path: `${tenantId}/${object.name}`,
        name: object.name,
        updatedAt: object.updated_at ?? null,
      }));
  } catch (err) {
    console.error("listProjectImages sorgu hatası:", err);
    return [];
  }
}

// Her görsel yolunun "kullanıldığı yer"ini (hangi projenin başlığı)
// gösterebilmek için — path → proje başlığı eşlemesi.
export async function getProjectImageUsageMap(): Promise<Map<string, string>> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return new Map();

    const { data, error } = await supabase
      .from("projects")
      .select("title, image_path")
      .eq("tenant_id", tenantId)
      .not("image_path", "is", null);

    if (error || !data) return new Map();

    const usageMap = new Map<string, string>();
    for (const row of data) {
      if (typeof row.image_path === "string") {
        usageMap.set(row.image_path, String(row.title));
      }
    }
    return usageMap;
  } catch (err) {
    console.error("getProjectImageUsageMap sorgu hatası:", err);
    return new Map();
  }
}

export interface ContactMessageRow {
  id: string;
  senderName: string;
  senderEmail: string | null;
  senderPhone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const CONTACT_MESSAGE_SELECT =
  "id, sender_name, sender_email, sender_phone, subject, message, is_read, created_at";

function mapContactMessageRow(row: {
  id: string;
  sender_name: string;
  sender_email: string | null;
  sender_phone: string | null;
  subject: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
}): ContactMessageRow {
  return {
    id: String(row.id),
    senderName: String(row.sender_name),
    senderEmail: typeof row.sender_email === "string" ? row.sender_email : null,
    senderPhone: typeof row.sender_phone === "string" ? row.sender_phone : null,
    subject: typeof row.subject === "string" ? row.subject : null,
    message: String(row.message),
    isRead: Boolean(row.is_read),
    createdAt: String(row.created_at),
  };
}

export async function getContactMessages(): Promise<ContactMessageRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return [];

    const { data, error } = await supabase
      .from("contact_messages")
      .select(CONTACT_MESSAGE_SELECT)
      .eq("tenant_id", tenantId)
      .order("created_at", { ascending: false });

    if (error || !data) {
      throw error ?? new Error("Mesajlar alınamadı.");
    }

    return data.map(mapContactMessageRow);
  } catch (err) {
    console.error("getContactMessages sorgu hatası:", err);
    return [];
  }
}

// getServiceById ile aynı desen — mesaj detay sayfası için (bkz.
// app/panel/(protected)/mesajlar/[id]/page.tsx). Liste ve detay AYNI
// şekli (ContactMessageRow) paylaşıyor — liste zaten tam mesaj metnini
// içeriyor, ayrı bir "Detail" tipi gerekmiyor.
export async function getContactMessageById(id: string): Promise<ContactMessageRow | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const tenantId = await getActiveTenantId();
    if (!tenantId) return null;

    const { data, error } = await supabase
      .from("contact_messages")
      .select(CONTACT_MESSAGE_SELECT)
      .eq("id", id)
      .eq("tenant_id", tenantId)
      .maybeSingle();

    if (error || !data) return null;

    return mapContactMessageRow(data);
  } catch (err) {
    console.error("getContactMessageById sorgu hatası:", err);
    return null;
  }
}
