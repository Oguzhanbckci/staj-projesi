export interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Sayfa başlık hiyerarşisi doğru kalsın diye çağıran belirler (varsayılan h2).
   *  `h1` SADECE bu bölümün sayfadaki TEK h1'i olduğu bağlamlarda kullanılmalı
   *  (ör. Ekip/İletişim gibi Hero'suz bağımsız sayfalar, bkz. TeamSection/
   *  ContactSection'daki `headingLevel` prop'u) — ana sayfada Hero zaten kendi
   *  h1'ini taşıdığı için oradaki çağrılar varsayılan h2'de kalmalı. */
  headingLevel?: "h1" | "h2" | "h3";
  /**
   * Başlığın ÜSTÜNE ince bir yatay ayraç çizgisi koyar (2026-08-20 tasarım
   * araştırması). Bölümler arası ayrım eskiden zemin rengi dönüşümüyle
   * (`bg-surface` / `bg-surface-raised`) yapılıyordu; incelenen 93 gerçek
   * inşaat/mimarlık sitesinin hiçbirinde bu kalıp görülmedi — ayrım ya
   * boşlukla ya da ince bir ayraç çizgisiyle (ör. Rönesans Holding)
   * yapılıyor.
   *
   * Zemin dönüşümünü bırakmanın ikinci ve daha önemli gerekçesi teknik:
   * bölüm SIRASI panelden değiştirilebiliyor (Sayfa Düzeni ekranı), yani
   * kodda sabitlenmiş bir "bir açık bir koyu" düzeni ilk sıralamada bile
   * tutarsızdı (Projeler ve Referanslar arka arkaya aynı zemindeydi) ve
   * sıra değişince tamamen bozuluyordu. Ayraç çizgisi SIRADAN BAĞIMSIZ.
   *
   * Ana sayfa bölümlerinde `true`; `/ekip` ve `/iletisim` gibi kendi
   * sayfasının başlığı olan (h1) kullanımlarda `false` — orada üstte
   * ayıracak bir bölüm yok, breadcrumb şeridi var.
   */
  rule?: boolean;
  className?: string;
}

const HEADING_TEXT_CLASS: Record<"h1" | "h2" | "h3", string> = {
  h1: "text-h1",
  h2: "text-h2",
  h3: "text-h3",
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  headingLevel = "h2",
  rule = false,
  className = "",
}: SectionHeaderProps) {
  const Heading = headingLevel;

  return (
    <div className={className}>
      {rule && <div aria-hidden="true" className="mb-10 h-px w-full bg-neutral-300" />}
      <div className="space-y-3">
        {eyebrow && (
          // `text-brand` DEĞİL `text-text-muted` (2026-08-20): incelenen
          // sitelerin tamamında bölüm etiketi nötr renkli, küçük, büyük
          // harfli ve geniş harf aralıklı — marka rengi yalnızca buton/
          // bağlantı/aktif durum gibi ETKİLEŞİMLİ öğelere ayrılmış.
          // Ayrıca bu, denetimde bulunan somut bir erişilebilirlik sorununu
          // da kapatıyor: `text-brand` koyu temada 13px metinde
          // surface-raised üzerinde 3.56:1'e düşüyordu (AA eşiği 4.5:1).
          <p className="text-caption font-semibold uppercase tracking-[0.18em] text-text-muted">
            {eyebrow}
          </p>
        )}
        {/* font-bold -> font-semibold + tracking-tight: büyük puntoda
            kalın+geniş harfler "şişkin" duruyordu; incelenen sitelerde
            başlıklar ya ince/orta ağırlıkta ya da büyük harfli-küçük
            puntolu. Ağırlığı düşürüp harf aralığını sıkmak, aynı puntoda
            daha keskin bir başlık veriyor. */}
        <Heading
          className={`${HEADING_TEXT_CLASS[headingLevel]} font-semibold tracking-tight text-balance text-text`}
        >
          {title}
        </Heading>
        {description && (
          <p className="max-w-2xl text-base text-text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}
