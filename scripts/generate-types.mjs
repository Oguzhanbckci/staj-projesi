// Supabase şemasından TypeScript tiplerini üretir.
// Çalıştırma: npm run types:generate
//
// Proje ref'i ELLE YAZILMAZ — .env.local'deki NEXT_PUBLIC_SUPABASE_URL'den
// türetilir (https://<ref>.supabase.co -> <ref>). Önceden package.json'da
// `--project-id <sabit-ref>` yazıyordu; "tek müşteri = tek kurulum"
// modelinde (bkz. docs/KURULUM.md) bu iki soruna yol açıyordu:
//   1. Kurulum betiğinin bitiş mesajı kişiyi doğrudan bu komuta
//      yönlendiriyordu, yani yeni müşterinin değil ESKİ müşterinin
//      şemasından tip üretiliyordu.
//   2. Kılavuz bunu "package.json'ı düzenle, sonra geri al" diye çözüyordu —
//      her kurulumda tekrarlanan, kaza ile commit'lenmeye açık bir adım.
// Aynı türetme next.config.ts'te (görsel host'u) ve lib/supabase/*'ta da
// yapılıyor; tek kaynak NEXT_PUBLIC_SUPABASE_URL.

import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { writeFileSync } from "node:fs";

const OUTPUT = "types/database.types.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!url) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL tanımlı değil. Bu komut .env.local'i okur; " +
      "npm run types:generate ile çalıştırın (bkz. package.json)."
  );
}

let projectRef;
try {
  projectRef = new URL(url).hostname.split(".")[0];
} catch {
  throw new Error(`NEXT_PUBLIC_SUPABASE_URL geçerli bir adres değil: ${url}`);
}
if (!projectRef) {
  throw new Error(`NEXT_PUBLIC_SUPABASE_URL'den proje ref'i çıkarılamadı: ${url}`);
}

console.log(`Tipler üretiliyor — Supabase projesi: ${projectRef}`);

// CLI, `supabase` paketinin bir devDependency'si (package.json) ve giriş
// noktası düz bir Node script'i: node_modules/supabase/dist/supabase.js.
// Bu yüzden doğrudan `node <script>` olarak çağrılıyor.
//
// İlk sürüm `spawnSync("supabase", …, { shell: true })` kullanıyordu —
// Windows'ta `.cmd` sarmalayıcısını çözebilmek için. Node 20+ bunu
// DEP0190 ile uyarıyor ve haklı: `shell: true` ile argümanlar kaçırılmaz,
// yalnızca birleştirilir, yani argümandaki bir karakter kabuk tarafından
// yorumlanabilir (projectRef bir ortam değişkeninden geliyor). Kabuk
// tamamen devre dışı bırakılınca hem uyarı hem o sınıf risk kalkıyor.
const require = createRequire(import.meta.url);
let cliPath;
try {
  cliPath = require.resolve("supabase/dist/supabase.js");
} catch {
  throw new Error(
    "Supabase CLI bulunamadı (node_modules/supabase). `npm install` çalıştırın."
  );
}

const result = spawnSync(
  process.execPath,
  [cliPath, "gen", "types", "typescript", "--project-id", projectRef, "--schema", "public"],
  { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
);

if (result.error) {
  throw new Error(
    `Supabase CLI çalıştırılamadı: ${result.error.message}\n` +
      "Kurulum: https://supabase.com/docs/guides/cli"
  );
}
if (result.status !== 0) {
  process.stderr.write(result.stderr ?? "");
  throw new Error(`Supabase CLI ${result.status} koduyla çıktı — tip dosyası DEĞİŞTİRİLMEDİ.`);
}

// Çıktı yalnızca komut BAŞARILI olduğunda yazılır. Eski hâlde bu iş kabuk
// yönlendirmesiyle (`> types/database.types.ts`) yapılıyordu; kabuk dosyayı
// komut daha çalışmadan sıfırlar, yani CLI hata verdiğinde geriye BOŞ bir
// tip dosyası kalır ve proje derlenmez hâle gelirdi.
const output = result.stdout ?? "";
if (output.trim().length === 0) {
  throw new Error("Supabase CLI boş çıktı verdi — tip dosyası DEĞİŞTİRİLMEDİ.");
}

writeFileSync(OUTPUT, output, "utf8");
console.log(`${OUTPUT} güncellendi (${output.length} bayt).`);
