// Yayında/Taslak göstergesi — sadece renk değil, her zaman metinle
// birlikte (bkz. docs/GUVENLIK.md ilkesi: renk körü bir kullanıcı da
// ayırt edebilmeli). Kenarlıklı/dolgusuz stil bilinçli — success/warning
// için WCAG kontrastı sadece "surface/surface-raised üzerinde metin"
// olarak doğrulandı (bkz. docs/TASARIM-SISTEMI.md madde 2), dolgu +
// açık renk metin kombinasyonu hiç test edilmedi.
export function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-caption font-semibold ${
        isPublished ? "border-success text-success" : "border-warning text-warning"
      }`}
    >
      {isPublished ? "Yayında" : "Taslak"}
    </span>
  );
}
