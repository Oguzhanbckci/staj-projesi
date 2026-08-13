// Saf modül — React'e/Next.js'e bağımlı değil, hem istemcide (hızlı ön
// kontrol/UX) hem sunucuda (gerçek/yetkili doğrulama) kullanılır — aynı
// ilke lib/validation/*.ts'deki zod şemalarıyla (bkz. o dosyalardaki
// yorum). `File`/`Blob` Web API'si hem tarayıcıda hem Next.js'in Server
// Action FormData'sında aynı şekilde çalışır.
//
// KISITLAR: "tür kontrolü yalnız dosya uzantısına bakmasın" — bu yüzden
// burada uzantı/tarayıcının bildirdiği MIME (`file.type`) HİÇ
// kullanılmıyor, sadece dosyanın gerçek ilk baytları (magic number)
// okunuyor. Eşleşen türden üretilen uzantı, kullanıcının orijinal dosya
// adından bağımsız — path oluştururken bu döner değer kullanılır.
export type AllowedImageType = "image/jpeg" | "image/png" | "image/webp";

export interface ImageSignature {
  mimeType: AllowedImageType;
  extension: "jpg" | "png" | "webp";
}

const JPEG_MAGIC = [0xff, 0xd8, 0xff];
const PNG_MAGIC = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function bytesMatch(bytes: Uint8Array, magic: number[], offset = 0): boolean {
  if (bytes.length < offset + magic.length) return false;
  return magic.every((byte, index) => bytes[offset + index] === byte);
}

// İlk 12 bayt üç imzanın hepsini (JPEG 3, PNG 8, WEBP'in "WEBP" kısmı
// 8-11 aralığında) kapsamaya yetiyor.
export async function detectImageSignature(file: File): Promise<ImageSignature | null> {
  const header = new Uint8Array(await file.slice(0, 12).arrayBuffer());

  if (bytesMatch(header, JPEG_MAGIC)) {
    return { mimeType: "image/jpeg", extension: "jpg" };
  }

  if (bytesMatch(header, PNG_MAGIC)) {
    return { mimeType: "image/png", extension: "png" };
  }

  // WEBP: "RIFF" (0-3) + 4 bayt dosya boyutu (4-7, kontrol edilmiyor) + "WEBP" (8-11).
  const isRiff = bytesMatch(header, [0x52, 0x49, 0x46, 0x46]);
  const isWebp = bytesMatch(header, [0x57, 0x45, 0x42, 0x50], 8);
  if (isRiff && isWebp) {
    return { mimeType: "image/webp", extension: "webp" };
  }

  return null;
}

// KISITLAR: "boyut sınırı koy". 10 MB — kaliteli bir DSLR/drone
// fotoğrafını (inşaat firması proje görselleri için tipik, 8-15MB'a
// çıkabilir) kapsayacak kadar geniş, ama next.config.ts'teki
// serverActions.bodySizeLimit/proxyClientMaxBodySize'ın (15MB, bkz. o
// dosyadaki yorum) altında rahat bir pay bırakıyor — red kararını HER
// ZAMAN bu sınır versin, Next.js'in ham gövde limiti değil. next/image
// zaten ziyaretçiye giden gerçek boyutu otomatik optimize ettiği için
// (bkz. next.config.ts images.remotePatterns) bu sınırın site
// performansına doğrudan bir etkisi yok, sadece Storage/yükleme
// tarafında bir üst sınır.
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export function formatMegabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
