import { forwardRef } from "react";

export interface FormErrorSummaryProps {
  /** Alan adı -> hata metni. Boş/undefined değerler otomatik elenir. */
  errors: Partial<Record<string, string>>;
  /** Alan adı -> ekranda gösterilecek Türkçe etiket (özet listede). */
  fieldLabels: Record<string, string>;
  /** Alan id'leri `${fieldIdPrefix}-${alanAdı}` biçiminde üretilmiş olmalı
   *  (bkz. formun kendisindeki alan id'leri) — özet buradaki linklerle
   *  ilgili alana atlayabilsin diye. */
  fieldIdPrefix: string;
}

// İletişim/Hizmet/Proje formlarının üçünde de aynı: sayfanın üstünde bir
// hata ÖZETİ (role="alert" — ekran okuyucuya duyurulur) + her hatanın
// ilgili alana giden bir linki. Alan bazlı hata (aria-describedby/
// aria-invalid) ayrıca her alanın kendisinde (TextField vb.) zaten var —
// bu, EK bir katman (bkz. docs/GUVENLIK.md ilkesi: renk tek başına
// yeterli değil, WCAG "hata özeti" deseni).
export const FormErrorSummary = forwardRef<HTMLDivElement, FormErrorSummaryProps>(
  function FormErrorSummary({ errors, fieldLabels, fieldIdPrefix }, ref) {
    const entries = Object.entries(errors).filter(
      (entry): entry is [string, string] => !!entry[1]
    );

    if (entries.length === 0) return null;

    return (
      <div
        ref={ref}
        role="alert"
        tabIndex={-1}
        className="rounded-md border border-error bg-surface-raised px-4 py-3 focus:outline-none"
      >
        <p className="font-semibold text-error">
          Formda düzeltilmesi gereken {entries.length} hata var:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-base text-error">
          {entries.map(([field, message]) => (
            <li key={field}>
              <a href={`#${fieldIdPrefix}-${field}`} className="underline hover:no-underline">
                {fieldLabels[field] ?? field}: {message}
              </a>
            </li>
          ))}
        </ul>
      </div>
    );
  }
);
