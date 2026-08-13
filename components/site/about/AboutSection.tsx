import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { getPublicImageUrl } from "@/lib/supabase/storage";
import { getAboutSection } from "@/lib/supabase/queries";

// Veri burada çekiliyor (Server Component) — kayıt yoksa bölüm hiç
// render edilmez, ServicesSection'la aynı ilke.
export async function AboutSection() {
  const about = await getAboutSection();
  if (!about) return null;

  const imageUrl = about.imagePath ? getPublicImageUrl("about", about.imagePath) : null;

  return (
    <section id="hakkimizda" className="bg-surface-raised py-16 sm:py-24">
      <Container>
        <div className="grid items-center gap-10 sm:grid-cols-2">
          <div>
            <SectionHeader
              eyebrow={about.foundedYear ? `${about.foundedYear}'den beri` : undefined}
              title={about.title}
              headingLevel="h2"
            />
            {about.description && (
              <p className="mt-4 line-clamp-6 text-base text-text-muted">{about.description}</p>
            )}
            {about.coreValues.length > 0 && (
              <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-2">
                {about.coreValues.map((value) => (
                  <li key={value} className="line-clamp-1 text-base font-medium text-text">
                    • {value}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={about.title}
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full bg-surface-raised" aria-hidden="true" />
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
