import { DeleteButton, type DeleteActionState } from "./DeleteButton";
import { PublishToggleButton, type ToggleActionState } from "./PublishToggleButton";
import { ReorderButtons, type MoveActionState } from "./ReorderButtons";
import { LinkButton } from "@/components/ui/LinkButton";

export interface AdminListRow {
  id: string;
  title: string;
  /** İkinci satırda küçük/soluk gösterilen ek bilgi (ör. projede konum/yıl). */
  subtitle?: string | null;
  isPublished: boolean;
  orderIndex: number;
}

export interface AdminListTableProps {
  rows: AdminListRow[];
  emptyMessage: string;
  /** Düzenleme linki `${editBasePath}/${row.id}` olarak üretilir. */
  editBasePath: string;
  /** Yalın hâl — silme onay metninde kullanılır: "hizmet", "proje", "referans", "soru", "ekip üyesi". */
  entityLabel: string;
  deleteAction: (prevState: DeleteActionState, formData: FormData) => Promise<DeleteActionState>;
  togglePublishedAction: (
    id: string,
    prevState: ToggleActionState,
    formData: FormData
  ) => Promise<ToggleActionState>;
  moveOrderAction: (
    id: string,
    direction: "up" | "down",
    prevState: MoveActionState,
    formData: FormData
  ) => Promise<MoveActionState>;
}

// Hizmetler/Projeler/Referanslar/SSS/Ekip yönetim tablolarının PAYLAŞTIĞI
// tek bileşen (bkz. docs/KARAR-GUNLUGU.md — "deseni projelere çoğalt,
// tekrarlanan kodu ortak bileşene çıkar"). Kendisi Server Component
// olarak kalıyor — her etkileşim (yayın toggle, sıra taşıma, silme) kendi
// client "adacığında" (bkz. o bileşenler), DeleteButton'la aynı desen.
export function AdminListTable({
  rows,
  emptyMessage,
  editBasePath,
  entityLabel,
  deleteAction,
  togglePublishedAction,
  moveOrderAction,
}: AdminListTableProps) {
  if (rows.length === 0) {
    return <p className="text-base text-text-muted">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-base">
        <thead>
          <tr className="border-b border-neutral-300 text-caption font-semibold uppercase tracking-wide text-text-muted">
            <th className="py-2 pr-4">Başlık</th>
            <th className="py-2 pr-4">Durum</th>
            <th className="py-2 pr-4">Sıra</th>
            <th className="py-2 pr-4">
              <span className="sr-only">İşlemler</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="border-b border-neutral-100 last:border-0">
              <td className="py-3 pr-4">
                <p className="font-semibold text-text">{row.title}</p>
                {row.subtitle && <p className="text-caption text-text-muted">{row.subtitle}</p>}
              </td>
              <td className="py-3 pr-4">
                <PublishToggleButton
                  id={row.id}
                  title={row.title}
                  isPublished={row.isPublished}
                  action={togglePublishedAction}
                />
              </td>
              <td className="py-3 pr-4 text-text-muted">
                <div className="flex items-center gap-1">
                  <span className="tabular-nums">{row.orderIndex}</span>
                  <ReorderButtons
                    id={row.id}
                    title={row.title}
                    isFirst={index === 0}
                    isLast={index === rows.length - 1}
                    action={moveOrderAction}
                  />
                </div>
              </td>
              <td className="py-3 pr-4">
                {/* gap-4 (sabit 16px, ekran boyutundan bağımsız) — kullanıcı
                    bulgusu: Düzenle/Sil çok yakın duruyordu. */}
                <div className="flex items-center gap-4">
                  <LinkButton href={`${editBasePath}/${row.id}`} size="sm" variant="ghost">
                    Düzenle
                  </LinkButton>
                  <DeleteButton
                    id={row.id}
                    itemName={row.title}
                    entityLabel={entityLabel}
                    action={deleteAction}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
