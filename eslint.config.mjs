import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    // `_`-prefixli parametreler ("bilerek kullanılmıyor" kuralımız, ör.
    // useActionState imzasındaki `_prevState`) her pozisyonda görmezden
    // gelinsin — varsayılan `after-used` davranışı sadece son parametre
    // kullanılmıyorsa öncekileri de işaretliyor (bkz. toggle/move
    // Server Action'ları, hepsi (id, ..., _prevState, _formData) alıyor
    // ama ikisini de kullanmıyor).
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
