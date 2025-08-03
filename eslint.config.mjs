// @ts-check

import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const config = [
  {
    ignores: [
      '**/node_modules/**',
      '**/.next/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.venv/**'
    ],
  },

  // existing configs:
  ...tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommended,
  ),

  ...compat.extends(
    'next/core-web-vitals',
    'next/typescript'
  ),
];

export default config;