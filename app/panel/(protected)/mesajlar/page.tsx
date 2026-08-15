import { getContactMessages } from "@/lib/supabase/panelQueries";
import { MessageListTable } from "./MessageListTable";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

// İletişim formundan gelen mesajların listesi (gerçek veri —
// contact_messages). Her satır detay sayfasına (bkz. [id]/page.tsx)
// bağlanıyor — orada tam metin gösterilip mesaj otomatik okundu olarak
// işaretleniyor.
export default async function MesajlarPage() {
  const messages = await getContactMessages();

  return (
    <div>
      <Breadcrumbs items={[{ label: "Özet", href: "/panel" }, { label: "Mesajlar" }]} className="mb-2" />
      <h1 className="text-h3 font-bold text-text">Mesajlar</h1>
      <div className="mt-6">
        <MessageListTable messages={messages} />
      </div>
    </div>
  );
}
