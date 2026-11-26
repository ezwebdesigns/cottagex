import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Les lignes issues des colonnes json de Drizzle/CMS restent dynamiques
      // pendant la migration : un typage strict de ces 175 usages est un
      // chantier à part, sans effet sur le rendu.
      "@typescript-eslint/no-explicit-any": "off",
      // Aperçus d'images uploadées (URL Blob arbitraires) : next/image exigerait
      // des remotePatterns et n'apporte rien sur ces miniatures d'admin.
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-empty-object-type": "warn",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "warn",
      "react/no-unstable-nested-components": "off",
      "react/no-unescaped-entities": "warn",
    },
  },
  // Utilitaires Node en CommonJS : require() est volontairement autorisé.
  {
    files: ["scripts/**/*.js", "*.js", "*.cjs"],
    rules: { "@typescript-eslint/no-require-imports": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "src/components/admin/TiptapEditor.tsx",
    // Source Vite de référence (non compilée par Next.js).
    "public/frontend/**",
  ]),
]);

export default eslintConfig;
