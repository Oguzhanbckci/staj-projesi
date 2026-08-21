import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { LinkButton } from "@/components/ui/LinkButton";
import { BreadcrumbJsonLd } from "@/components/site/BreadcrumbJsonLd";
import {
  getProjectBySlug,
  getPublishedProjectSlugs,
  getSiteSettings,
} from "@/lib/supabase/queries";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { getKnownSiteUrl } from "@/lib/seo/getSiteUrl";
import { PROJECT_STATUS_LABELS } from "@/lib/validation/projectFields";

// Proje detayı 2026-08-21'e kadar yalnızca bir modaldı: adresi yoktu,
// paylaşılamıyor ve arama motoru tarafından indekslenemiyordu — sitemap
// sitenin TAMAMI için 3 URL bildiriyordu. Bir inşaat firmasında arama
// trafiğinin ana kapısı proje adlarıdır ("Vadi Konutları Konya"), bu yüzden
// her yayınlanmış proje artık kendi statik sayfası.
//
// `generateStaticParams` ile sayfalar build sırasında üretiliyor (ana sayfa
// ve /ekip gibi). Panelden bir proje eklenip yayınlandığında ilgili eylem
// `revalidatePath` çağırıyor; bu yüzden `dynamicParams` varsayılanı
// (true) bilerek korunuyor — build'den sonra eklenen bir proje ilk
// istekte üretilir, 404 dönmez.

export async function generateStaticParams() {
  const slugs = await getPublishedProjectSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [project, settings] = await Promise.all([getProjectBySlug(slug), getSiteSettings()]);

  if (!project) {
    // Sayfanın kendisi notFound() ile 404 dönecek; burada yalnızca
    // anlamlı bir başlık bırakılıyor.
    return { title: "Proje bulunamadı" };
  }

  const tenantName = settings?.tenantName ?? "Firma";
  const kunye = [project.city, project.year].filter(Boolean).join(", ");

  return {
    title: `${project.title} | ${tenantName}`,
    // Açıklama önce projenin KENDİ metninden, yoksa künyeden üretiliyor —
    // her projenin ayrı bir açıklaması olmalı, yoksa arama sonucunda hepsi
    // aynı görünür (bkz. 2026-08-20 denetimi, bulgu 27).
    description:
      project.description ??
      `${project.title}${kunye ? ` — ${kunye}` : ""}. ${tenantName} tarafından gerçekleştirilen proje.`,
    alternates: getKnownSiteUrl() ? { canonical: `/projeler/${project.slug}` } : undefined,
    openGraph: {
      title: project.title,
      description: project.description ?? undefined,
      type: "article",
      images: project.coverPath
        ? [{ url: getPublicImageUrl("projects", project.coverPath) }]
        : undefined,
    },
  };
}

export default async function ProjeDetayPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  const imageUrl = project.coverPath ? getPublicImageUrl("projects", project.coverPath) : null;

  const kunye = [
    project.status ? { etiket: "Durum", deger: PROJECT_STATUS_LABELS[project.status] } : null,
    project.category ? { etiket: "Kategori", deger: project.category } : null,
    project.city ? { etiket: "Konum", deger: project.city } : null,
    project.year ? { etiket: "Yıl", deger: String(project.year) } : null,
  ].filter((x): x is { etiket: string; deger: string } => x !== null);

  return (
    <>
      <BreadcrumbJsonLd
        items={[
          { label: "Ana Sayfa", path: "/" },
          { label: "Projeler", path: "/projeler" },
          { label: project.title, path: `/projeler/${project.slug}` },
        ]}
      />

      <div className="bg-surface pt-6 sm:pt-8">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Ana Sayfa", href: "/" },
              { label: "Projeler", href: "/projeler" },
              { label: project.title },
            ]}
          />
        </Container>
      </div>

      <article className="bg-surface py-10 sm:py-16">
        <Container>
          <div className="max-w-3xl">
            {project.status && (
              <Badge variant="accent" className="mb-4">
                {PROJECT_STATUS_LABELS[project.status]}
              </Badge>
            )}
            <h1 className="text-h3 font-semibold tracking-tight text-balance break-words text-text sm:text-h1">
              {project.title}
            </h1>
            {project.description && (
              <p className="mt-4 text-base text-text-muted">{project.description}</p>
            )}
          </div>

          {/* Görsel oranı 3:2 — ziyaretçi sitesindeki tüm fotoğraf kaplarıyla
              aynı (bkz. docs/TASARIM-SISTEMI.md madde 5.1). */}
          <div className="relative mt-8 aspect-[3/2] overflow-hidden rounded-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={project.title}
                fill
                priority
                sizes="(min-width: 1152px) 1152px, 100vw"
                className="object-cover"
              />
            ) : (
              <ImagePlaceholder />
            )}
          </div>

          {kunye.length > 0 && (
            <dl className="mt-8 grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
              {kunye.map((satir) => (
                <div key={satir.etiket}>
                  <dt className="text-caption font-semibold uppercase tracking-wide text-text-muted">
                    {satir.etiket}
                  </dt>
                  <dd className="mt-1 text-base text-text">{satir.deger}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <LinkButton href="/projeler" variant="secondary">
              Tüm projelere dön
            </LinkButton>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 text-base font-semibold text-text underline decoration-neutral-300 underline-offset-4 transition-colors hover:decoration-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
              >
                Proje sitesini aç
                <ArrowUpRight
                  aria-hidden="true"
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transform-none"
                />
              </a>
            )}
          </div>
        </Container>
      </article>
    </>
  );
}
