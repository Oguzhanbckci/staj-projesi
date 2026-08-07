import { getServices } from "@/lib/supabase/queries";

// Geçici doğrulama sayfası — Supabase bağlantısının çalıştığını görmek için.
// Gerçek Hizmetler bölüm bileşeni (components/site/) yazılınca silinecek.
export default async function TestServicesPage() {
  const services = await getServices();

  return (
    <div>
      <h1>Hizmetler (test sayfası)</h1>
      <ul>
        {services.map((service) => (
          <li key={service.id}>
            {service.title} — {service.is_published ? "yayında" : "taslak"}
          </li>
        ))}
      </ul>
    </div>
  );
}
