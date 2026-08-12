import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// jsdom varsayılan ortam — şu an yazılan 3 birim test dosyası saf
// fonksiyon (DOM'a ihtiyaç duymuyor) ama TEST-STRATEJISI.md madde 1-2
// gelecekte "izole bileşen render'ı" testlerini de bu altyapıyla
// öngörüyor; o zaman ek kurulum gerekmesin diye jsdom + react plugin'i
// baştan hazır. tsconfigPaths, tsconfig.json'daki "@/*" alias'ını
// (proje genelinde kullanılan import yolu) Vitest'e otomatik tanıtır.
export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules", "e2e", ".next"],
  },
});
