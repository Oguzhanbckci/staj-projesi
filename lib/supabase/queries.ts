import { createServiceRoleClient } from "@/lib/supabase/server";

export type Service = {
  id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  order_index: number;
};

export async function getServices() {
  const supabase = createServiceRoleClient();
  const { data, error } = await supabase
    .from("services")
    .select("id, title, description, is_published, order_index")
    .order("order_index")
    .returns<Service[]>();

  if (error) {
    throw new Error(`Hizmetler alınamadı: ${error.message}`);
  }

  return data;
}
