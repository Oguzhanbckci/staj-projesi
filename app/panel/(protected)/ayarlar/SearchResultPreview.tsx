// Google arama sonucu görünümünün SADE bir taklidi — gerçek Google
// arayüzünü birebir kopyalamıyor (marka/logo taklidi YOK, sadece genel
// tipografi/renk kalıbı: mavi başlık, yeşil/gri domain, gri açıklama).
// KISITLAR: "arama sonucunda nasıl görüneceğinin önizlemesi" — müşteri
// SEO'da bilgisiz olduğu için soyut bir kart yerine tanıdık bir görünüm
// daha açıklayıcı.
export function SearchResultPreview({
  domain,
  title,
  description,
}: {
  domain: string;
  title: string;
  description: string;
}) {
  return (
    <div className="max-w-lg space-y-1 rounded-md border border-neutral-300 bg-surface-raised p-4">
      <p className="text-caption text-text-muted">{domain}</p>
      {/* TASARIM-SISTEMI.md madde 0.1'in "renkler token'dır, hardcode
          edilmez" ilkesinin BİLEREK tek istisnası: bu, sitenin KENDİ
          rengi değil, Google'ın arama sonucu link rengini taklit ediyor
          — tenant'ın marka rengini kullansaydık (ör. text-brand),
          önizleme YANILTICI olurdu (gerçek Google sonucu her zaman bu
          sabit maviyle görünür, tenant temasından bağımsız). */}
      <p className="truncate text-base text-[#1a0dab] hover:underline">
        {title || "Sayfa başlığı buraya gelecek"}
      </p>
      <p className="line-clamp-2 text-caption text-text-muted">
        {description || "Açıklama buraya gelecek — ziyaretçilerin arama sonuçlarında göreceği kısa özet metni."}
      </p>
    </div>
  );
}
