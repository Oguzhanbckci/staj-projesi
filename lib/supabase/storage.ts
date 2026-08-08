// Tablolarda sadece Storage yolu (*_path) saklanır, tam URL değil (bkz.
// docs/VERİ-MODELİ.md, "Görseller Supabase Storage'da...") — herkese açık
// (public) bucket'lar için gerçek URL burada, istemci oluşturmadan
// (ağ isteği yok, salt string birleştirme) üretilir.
export function getPublicImageUrl(bucket: string, path: string): string {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL eksik — .env.local dosyasını kontrol et."
    );
  }

  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
