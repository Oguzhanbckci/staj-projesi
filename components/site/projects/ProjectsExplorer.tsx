"use client";

import { useState } from "react";
import { GALLERY_VARIANTS } from "./registry";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/validation/projectFields";
import type { ProjectItem, GalleryVariant } from "./types";

const ALL_LABEL = "Tümü";

// Tek bir filtre şeridi. İki kez (kategori ve durum) kullanıldığı için
// bileşene çıkarıldı — aynı sınıf dizisini iki yerde tutmak, birinde
// yapılan bir düzeltmenin diğerine taşınmaması demekti (bkz.
// docs/AI-KURALLARI.md madde 4.4 ve bu projede tekrar eden hata sınıfı).
//
// Mobilde tek satır yatay kaydırma, sm ve üstünde sarma. Kategori sayısının
// üst sınırı yok (panelden girilen serbest metinden türüyor) ve Türkçe adlar
// uzun: 5 kategoriyle şerit 320px'de 128px, yani galeriden önce yarım ekran
// yer kaplıyordu. Kalıp TestimonialsGrid'de zaten kullanılıyor.
function FilterRow({
  label,
  options,
  selected,
  onSelect,
  className = "",
}: {
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
  className?: string;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`flex snap-x gap-2 overflow-x-auto pb-2 sm:flex-wrap sm:overflow-visible sm:pb-0 ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-caption font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none ${
              isSelected
                ? "bg-brand text-brand-on shadow-sm"
                : "border border-control bg-surface-raised text-text hover:border-brand/40 hover:bg-neutral-100 hover:text-brand"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

// SUNUCU/İSTEMCİ SINIRI BURASI: ProjectsSection.tsx (Server Component)
// veriyi zaten çekip `projects`/`categories`/`statuses`'i buraya prop
// olarak geçiyor — bu dosya kendi veri çekmiyor, SADECE filtre
// etkileşimini yönetiyor. İlk render yine sunucudan gelir (Next.js
// Client Component'leri de ilk istekte sunucuda render eder); başlangıç
// değerleri "Tümü" olduğu için ilk HTML zaten tüm projeleri gösterir,
// hydration'dan önce hiçbir şey "yüklenmiyor".
//
// 2026-08-21: Detay penceresi (ProjectDetailModal) kaldırıldı — kartlar
// artık /projeler/<slug> sayfasına giden gerçek bağlantılar. Bu dosyadan
// bir diyalog, odak tuzağı ve seçili-kayıt state'i düştü; ziyaretçinin
// indirdiği JS de o kadar azaldı.
export function ProjectsExplorer({
  projects,
  categories,
  statuses = [],
  galleryVariant = "grid",
}: {
  projects: ProjectItem[];
  categories: string[];
  statuses?: ProjectStatus[];
  galleryVariant?: GalleryVariant;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>(ALL_LABEL);
  const [selectedStatus, setSelectedStatus] = useState<string>(ALL_LABEL);

  // İki eksen VE ile birleşir: "Konut" + "Devam Ediyor" = devam eden konut
  // projeleri. Durum ekseni kategoriden bağımsızdır (bkz.
  // docs/RAKIP-ANALIZI.md — sektörde en yaygın ikinci eksen).
  const filtered = projects.filter(
    (p) =>
      (selectedCategory === ALL_LABEL || p.category === selectedCategory) &&
      (selectedStatus === ALL_LABEL || p.status === selectedStatus)
  );

  const Gallery = GALLERY_VARIANTS[galleryVariant];

  return (
    <div>
      <FilterRow
        label="Kategoriye göre filtrele"
        className="mt-12"
        selected={selectedCategory}
        onSelect={setSelectedCategory}
        options={[ALL_LABEL, ...categories].map((c) => ({ value: c, label: c }))}
      />

      {/* Durum şeridi yalnızca en az bir projede durum girilmişse çıkar —
          alan opsiyonel, boş bir filtre satırı göstermek anlamsız olurdu. */}
      {statuses.length > 0 && (
        <FilterRow
          label="Duruma göre filtrele"
          className="mt-3"
          selected={selectedStatus}
          onSelect={setSelectedStatus}
          options={[
            { value: ALL_LABEL, label: ALL_LABEL },
            ...statuses.map((s) => ({ value: s, label: PROJECT_STATUS_LABELS[s] })),
          ]}
        />
      )}

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-base text-text-muted">
          Bu filtreye uyan proje yok.
        </p>
      ) : (
        <div className="mt-8">
          <Gallery projects={filtered} />
        </div>
      )}
    </div>
  );
}
