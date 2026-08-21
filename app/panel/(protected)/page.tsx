import Link from "next/link";
import { Card } from "@/components/ui/Card";
import {
  getAllProjects,
  getAllTeamMembers,
  getAllTestimonials,
  getProjectsCount,
  getSeoSettings,
  getServicesCount,
  getThemeSettings,
  getUnreadMessagesCount,
} from "@/lib/supabase/panelQueries";
import { buildSetupChecklist } from "@/lib/panel/setupChecklist";
import { SetupChecklistCard } from "./SetupChecklistCard";

// Panel ana sayfası — özet ekranı. Sayılar ve kurulum kontrol listesi
// burada, sayfa render edilirken çekiliyor (bkz. üst layout'taki auth
// notu — bu satırlara oturumsuz bir istek asla ulaşamaz).
export default async function PanelPage() {
  // Tek `Promise.all` — kontrol listesi için gereken 5 sorgu da
  // sayaçlarla PARALEL çalışır, ekranı yavaşlatmaz. Hepsi zaten var olan
  // sorgular; kontrol listesi yeni tablo/migration gerektirmiyor.
  const [servicesCount, projectsCount, unreadCount, theme, seo, projects, testimonials, team] =
    await Promise.all([
      getServicesCount(),
      getProjectsCount(),
      getUnreadMessagesCount(),
      getThemeSettings(),
      getSeoSettings(),
      getAllProjects(),
      getAllTestimonials(),
      getAllTeamMembers(),
    ]);

  const setupIssues = buildSetupChecklist({
    contact: theme ? { address: theme.address, phone: theme.phone } : null,
    branding: theme ? { logoPath: theme.logoPath, faviconPath: theme.faviconPath } : null,
    seo: seo ? { seoDescription: seo.seoDescription, ogImagePath: seo.ogImagePath } : null,
    projects,
    testimonials,
    teamMembers: team,
  });

  return (
    <div>
      <h1 className="text-h3 font-bold text-text">Özet</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard label="Hizmet" value={servicesCount} href="/panel/icerikler" />
        <SummaryCard label="Proje" value={projectsCount} href="/panel/icerikler" />
        <SummaryCard
          label="Okunmamış Mesaj"
          value={unreadCount}
          href="/panel/mesajlar"
          highlight={unreadCount > 0}
        />
      </div>

      <SetupChecklistCard issues={setupIssues} />

      <div className="mt-8">
        <h2 className="text-h5 font-semibold text-text">Hızlı Erişim</h2>
        <ul className="mt-3 space-y-2 text-base">
          <li>
            <Link href="/panel/mesajlar" className="font-semibold text-brand hover:underline">
              Mesajları görüntüle →
            </Link>
          </li>
          <li>
            <Link href="/panel/icerikler" className="font-semibold text-brand hover:underline">
              İçerikleri yönet →
            </Link>
          </li>
          <li>
            <Link href="/panel/tema" className="font-semibold text-brand hover:underline">
              Tema ayarlarını düzenle →
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  href,
  highlight = false,
}: {
  label: string;
  value: number;
  href: string;
  highlight?: boolean;
}) {
  return (
    <Link href={href} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 ring-offset-surface rounded-lg">
      <Card
        className={`p-6 transition-colors hover:bg-surface ${highlight ? "border border-brand" : ""}`}
      >
        <p className="text-caption font-semibold uppercase tracking-wide text-text-muted">
          {label}
        </p>
        <p className="mt-2 text-h2 font-bold text-text">{value}</p>
      </Card>
    </Link>
  );
}
