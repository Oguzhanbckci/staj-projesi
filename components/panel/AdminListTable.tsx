import { StatusBadge } from "./StatusBadge";
import { DeleteButton, type DeleteActionState } from "./DeleteButton";
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
  deleteAction: (prevState: DeleteActionState, formData: FormData) => Promise<DeleteActionState>;
  deleteConfirmMessage: string;
}

// Hizmetler ve Projeler yönetim tablolarının PAYLAŞTIĞI tek bileşen (bkz.
// docs/KARAR-GUNLUGU.md — "deseni projelere çoğalt, tekrarlanan kodu
// ortak bileşene çıkar"). Başlık/durum/sıra/işlem sütunları — yönergenin
// istediği dört sütun. "Düzenle" gerçek bir sayfaya (`[id]/page.tsx`)
// giden bağlantı, "Sil" geri alınamaz olduğu için onay isteyen
// DeleteButton (bkz. o dosya).
export function AdminListTable({
  rows,
  emptyMessage,
  editBasePath,
  deleteAction,
  deleteConfirmMessage,
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
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-neutral-100 last:border-0">
              <td className="py-3 pr-4">
                <p className="font-semibold text-text">{row.title}</p>
                {row.subtitle && <p className="text-caption text-text-muted">{row.subtitle}</p>}
              </td>
              <td className="py-3 pr-4">
                <StatusBadge isPublished={row.isPublished} />
              </td>
              <td className="py-3 pr-4 text-text-muted">{row.orderIndex}</td>
              <td className="py-3 pr-4">
                <div className="flex items-center gap-2">
                  <LinkButton href={`${editBasePath}/${row.id}`} size="sm" variant="ghost">
                    Düzenle
                  </LinkButton>
                  <DeleteButton
                    id={row.id}
                    action={deleteAction}
                    confirmMessage={deleteConfirmMessage}
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
