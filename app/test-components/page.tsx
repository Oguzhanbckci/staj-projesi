// Geliştirmeye özel vitrin sayfası — ürünle YAYINLANMAYACAK (bkz.
// app/test-theme, app/test-services aynı geçici desen). components/ui/
// altındaki tüm bileşenleri, tüm varyantlarıyla yan yana gösterir.
// Klavye testi için bu dosyanın açıklamasına bkz. docs/TASARIM-SISTEMI.md
// "Bileşen Envanteri".

import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { TextField } from "@/components/ui/TextField";
import { TextareaField } from "@/components/ui/TextareaField";
import { SelectField } from "@/components/ui/SelectField";

const VARIANTS = ["primary", "secondary", "ghost"] as const;
const SIZES = ["sm", "md", "lg"] as const;

export default function ComponentsShowcasePage() {
  return (
    <div className="min-h-full bg-surface py-12 text-text">
      <Container className="space-y-16">
        <header className="space-y-1">
          <p className="text-caption text-text-muted">Geçici — yayınlanmaz</p>
          <h1 className="text-h1 font-bold">Bileşen Vitrini</h1>
        </header>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="components/ui/Button"
            title="Button"
            description="3 varyant × 3 boyut, devre dışı ve yükleniyor durumları."
          />
          {VARIANTS.map((variant) => (
            <div key={variant} className="flex flex-wrap items-center gap-3">
              <span className="w-20 text-caption text-text-muted capitalize">
                {variant}
              </span>
              {SIZES.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  {size.toUpperCase()} Buton
                </Button>
              ))}
              <Button variant={variant} disabled>
                Devre dışı
              </Button>
              <Button variant={variant} isLoading>
                Yükleniyor
              </Button>
            </div>
          ))}
        </section>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="components/ui/SectionHeader"
            title="Section Header"
            description="Üst etiket + başlık + açıklama, başlık seviyesi dışarıdan verilir."
            headingLevel="h3"
          />
          <div className="grid gap-8 sm:grid-cols-2">
            <div className="rounded-md bg-surface-raised p-6 shadow-sm">
              <SectionHeader
                eyebrow="Örnek h2"
                title="Hizmetlerimiz"
                description="Bu örnek headingLevel=h2 kullanıyor."
                headingLevel="h2"
              />
            </div>
            <div className="rounded-md bg-surface-raised p-6 shadow-sm">
              <SectionHeader
                title="Alt bölüm başlığı (h3, eyebrow/description yok)"
                headingLevel="h3"
              />
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <SectionHeader
            eyebrow="components/ui/TextField, TextareaField, SelectField"
            title="Form Alanları"
            description="Etiket, hata mesajı ve yardım metni ile."
            headingLevel="h3"
          />
          <div className="grid gap-6 rounded-md bg-surface-raised p-6 shadow-sm sm:grid-cols-2">
            <TextField label="Ad Soyad" placeholder="Mehmet Yılmaz" />
            <TextField
              label="E-posta"
              type="email"
              defaultValue="yanlis-eposta"
              error="Geçerli bir e-posta adresi girin."
            />
            <TextField
              label="Telefon"
              helpText="Başında 0 olmadan, sadece rakam."
            />
            <SelectField label="Konu" defaultValue="">
              <option value="" disabled>
                Seçiniz
              </option>
              <option value="teklif">Teklif talebi</option>
              <option value="bilgi">Genel bilgi</option>
            </SelectField>
            <TextareaField
              label="Mesaj"
              placeholder="Mesajınızı yazın"
              className="sm:col-span-2"
            />
            <TextField label="Devre dışı alan" disabled defaultValue="Düzenlenemez" />
          </div>
        </section>
      </Container>
    </div>
  );
}
