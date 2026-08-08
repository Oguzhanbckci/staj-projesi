// Geçici önizleme sayfası (bkz. app/test-services/page.tsx aynı desen) —
// docs/TASARIM-SISTEMI.md + docs/TEMA-MIMARISI.md'nin görsel doğrulaması
// için. Gerçek Hero/bölüm bileşenleri yazılınca silinecek.

const NEUTRAL_STEPS = [50, 100, 300, 500, 700, 800, 900] as const;
const SEMANTIC = ["success", "warning", "error"] as const;

// Tailwind'in JIT tarayıcısı sadece kaynak kodda tam yazılı class
// isimlerini görebiliyor — `text-${tag}` gibi çalışma zamanı string
// birleştirmesi taranamaz. Bu yüzden her varyant burada tam yazılı.
const HEADINGS = [
  { tag: "h1" as const, className: "text-h1" },
  { tag: "h2" as const, className: "text-h2" },
  { tag: "h3" as const, className: "text-h3" },
  { tag: "h4" as const, className: "text-h4" },
  { tag: "h5" as const, className: "text-h5" },
  { tag: "h6" as const, className: "text-h6" },
];
const RADII = [
  { key: "sm", className: "rounded-sm" },
  { key: "md", className: "rounded-md" },
  { key: "lg", className: "rounded-lg" },
  { key: "xl", className: "rounded-xl" },
];
const SHADOWS = [
  { key: "sm", className: "shadow-sm" },
  { key: "md", className: "shadow-md" },
  { key: "lg", className: "shadow-lg" },
  { key: "xl", className: "shadow-xl" },
];

export default function ThemePreviewPage() {
  return (
    <div className="min-h-full bg-surface text-text px-6 py-12 sm:px-12">
      <div className="mx-auto max-w-4xl space-y-16">
        <header className="space-y-2">
          <p className="text-caption text-text-muted">
            Geçici önizleme — docs/TASARIM-SISTEMI.md · docs/TEMA-MIMARISI.md
          </p>
          <h1 className="text-h1 font-bold">Tasarım Sistemi Önizleme</h1>
          <p className="text-text-muted max-w-xl">
            Bu sayfanın renkleri, tipografisi, boşluğu, köşeleri ve
            gölgeleri şu an aktif tenant&apos;ın (platform sahibi)
            veritabanındaki tema ön ayarından geliyor.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-h3 font-bold">Marka &amp; Semantik Renkler</h2>
          <div className="flex flex-wrap gap-4">
            <div className="w-40 rounded-md bg-brand text-brand-on shadow-sm p-4">
              <p className="font-semibold">Marka</p>
              <p className="text-caption opacity-80">bg-brand</p>
            </div>
            {SEMANTIC.map((name) => (
              <div
                key={name}
                className="w-40 rounded-md p-4 text-white shadow-sm"
                style={{ backgroundColor: `var(--color-${name})` }}
              >
                <p className="font-semibold capitalize">{name}</p>
                <p className="text-caption opacity-80">bg-{name}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-h3 font-bold">Nötr Gri Ölçeği</h2>
          <p className="text-caption text-text-muted">
            Bu ölçek tema değişse de sabit — 700/800/900 koyu temada sayfa
            zeminine çok yakın olduğu için karşılaştırma amacıyla sabit
            beyaz bir zemin üzerinde gösteriliyor.
          </p>
          <div className="flex flex-wrap gap-3 rounded-md bg-white p-4">
            {NEUTRAL_STEPS.map((step) => (
              <div key={step} className="text-center">
                <div
                  className="h-16 w-16 rounded-md border border-black/10 shadow-sm"
                  style={{ backgroundColor: `var(--color-neutral-${step})` }}
                />
                <p className="text-caption text-black/60 mt-1">{step}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-h3 font-bold">Tipografi Ölçeği</h2>
          <div className="space-y-3 rounded-md bg-surface-raised p-6 shadow-sm">
            {HEADINGS.map(({ tag, className }) => {
              const Tag = tag;
              return (
                <Tag key={tag} className={`${className} font-bold`}>
                  {tag.toUpperCase()} — Güvenle İnşa Ediyoruz
                </Tag>
              );
            })}
            <p className="text-base">
              Gövde metni (text-base) — 30 yıllık tecrübeyle güvenli, zamanında
              ve bütçe disiplini içinde teslim ediyoruz.
            </p>
            <p className="text-caption text-text-muted">
              Caption — küçük not / form yardım metni örneği
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-h3 font-bold">Boşluk Ölçeği</h2>
          <div className="space-y-2">
            {[1, 2, 3, 4, 6, 8, 12, 16].map((n) => (
              <div key={n} className="flex items-center gap-3">
                <span className="text-caption text-text-muted w-16">
                  p-{n} ({n * 4}px)
                </span>
                <div className={`h-4 bg-brand rounded-sm`} style={{ width: `${n * 4}px` }} />
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-h3 font-bold">Köşe Yarıçapları</h2>
          <div className="flex flex-wrap gap-4">
            {RADII.map(({ key, className }) => (
              <div
                key={key}
                className={`h-20 w-20 bg-surface-raised border border-neutral-300 shadow-sm flex items-center justify-center text-caption ${className}`}
              >
                radius-{key}
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-4 pb-16">
          <h2 className="text-h3 font-bold">Gölge Seviyeleri</h2>
          <div className="flex flex-wrap gap-6">
            {SHADOWS.map(({ key, className }) => (
              <div
                key={key}
                className={`h-20 w-20 bg-surface-raised rounded-md flex items-center justify-center text-caption ${className}`}
              >
                shadow-{key}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
