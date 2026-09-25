import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
    },
    // Untyped JSON (form answers, scraper payloads, stored rules) is typed as any on purpose.
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    // These modules deliberately export hooks/helpers next to components.
    files: ['src/utils.tsx', 'src/price-estimator/content/CopyProvider.tsx', 'src/components/FormRenderer.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
