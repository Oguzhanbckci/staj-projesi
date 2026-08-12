#!/usr/bin/env bash
# Yeni müşteri kurulum betiği — docs/KURULUM.md'nin "Adım Adım Kurulum"
# bölümündeki adım 3-4'ü (şema + politikalar + demo içerik) TEK komutla
# uygular. Sıralı ve tekrar çalıştırılabilir (KISITLAR): supabase db push
# zaten uygulanmış migration'ları atlar, seed adımı `on conflict do
# nothing` ile korunur (bkz. supabase/setup/seed-template.sql).
#
# Kullanım:
#   ./scripts/setup-new-customer.sh "Firma Adı" "firmadomaini.com.tr" "info@firmadomaini.com.tr"
#
# Ön koşullar (docs/KURULUM.md'de detaylı):
#   - Supabase CLI kurulu ve bu proje `supabase link` ile YENİ müşterinin
#     Supabase projesine bağlanmış olmalı (kritik: yanlış projeye
#     bağlıyken çalıştırmak YANLIŞ veritabanını değiştirir — geri dönüşü
#     yoktur, bkz. KISITLAR "geri alınamaz adımlar açıkça uyarılsın").
#   - psql kurulu olmalı (PostgreSQL komut satırı istemcisi).
#   - DATABASE_URL ortam değişkeni ayarlı olmalı (Supabase Dashboard →
#     Project Settings → Database → Connection string → URI).

set -euo pipefail

TENANT_NAME="${1:-}"
TENANT_DOMAIN="${2:-}"
CONTACT_EMAIL="${3:-}"

if [ -z "$TENANT_NAME" ] || [ -z "$TENANT_DOMAIN" ] || [ -z "$CONTACT_EMAIL" ]; then
  echo "Kullanım: $0 \"Firma Adı\" \"firmadomaini.com.tr\" \"info@firmadomaini.com.tr\""
  exit 1
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "HATA: DATABASE_URL ortam değişkeni ayarlı değil."
  echo "  Supabase Dashboard -> Project Settings -> Database -> Connection string -> URI'den alıp"
  echo "  şu şekilde ayarlayın: export DATABASE_URL=\"postgresql://...\""
  exit 1
fi

if ! command -v supabase >/dev/null 2>&1; then
  echo "HATA: Supabase CLI bulunamadı. Kurulum: https://supabase.com/docs/guides/cli"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "HATA: psql bulunamadı (PostgreSQL istemcisi gerekli)."
  echo "  Alternatif: bu betiği hiç kullanmadan, supabase/setup/seed-template.sql'i"
  echo "  elle düzenleyip (__TENANT_NAME__ vb. yer tutucuları değiştirip) Supabase"
  echo "  SQL Editor'e yapıştırabilirsiniz — bkz. docs/KURULUM.md."
  exit 1
fi

echo "=== Adım 1/3: Şema + RLS politikaları uygulanıyor (supabase db push) ==="
echo "    Bu, supabase/migrations/ altındaki TÜM dosyaları sırayla uygular."
echo "    Zaten uygulanmış olanlar atlanır (Supabase CLI kendi takip eder)."
supabase db push

echo ""
echo "=== Adım 2/3: Demo içerik hazırlanıyor ($TENANT_NAME / $TENANT_DOMAIN) ==="
TMP_SEED_FILE="$(mktemp)"
trap 'rm -f "$TMP_SEED_FILE"' EXIT

sed \
  -e "s|__TENANT_NAME__|${TENANT_NAME}|g" \
  -e "s|__TENANT_DOMAIN__|${TENANT_DOMAIN}|g" \
  -e "s|__CONTACT_EMAIL__|${CONTACT_EMAIL}|g" \
  "$(dirname "$0")/../supabase/setup/seed-template.sql" > "$TMP_SEED_FILE"

echo "=== Adım 3/3: Demo içerik veritabanına yükleniyor ==="
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$TMP_SEED_FILE"

echo ""
echo "✅ Kurulum tamamlandı. Sırada (bkz. docs/KURULUM.md):"
echo "   1. Vercel'de ACTIVE_TENANT_DOMAIN=${TENANT_DOMAIN} ortam değişkenini ayarlayın."
echo "   2. Supabase Dashboard -> Authentication -> Users'dan admin hesabını oluşturun."
echo "   3. npm run types:generate ile TypeScript tiplerini bu projeden yenileyin."
echo "   4. Vercel'e deploy edin ve /panel/giris'ten giriş yapıp doğrulayın."
