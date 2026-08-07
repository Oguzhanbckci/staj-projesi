import { createServiceRoleClient } from "@/lib/supabase/server";

// Dönüş tipi types/database.types.ts'ten otomatik çıkarılır — yanlış tablo/
// kolon adı yazılırsa derleme zamanında hata verir. Tipleri yeniden üretmek
// için: npm run types:generate (bkz. docs/MIMARI.md madde 4.1).
export async function getServices() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, title, description, is_published, order_index")
    .order("order_index");

  if (error) {
    throw new Error(`Hizmetler alınamadı: ${error.message}`);
  }

  return data;
}
