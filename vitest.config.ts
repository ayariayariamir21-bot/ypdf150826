import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const editorWebSrc = fileURLToPath(new URL('./apps/editor-web/src', import.meta.url));
const exclusiveAppSrc = fileURLToPath(new URL('./apps/exclusive-app/src', import.meta.url));
const pdfjsDist = fileURLToPath(new URL('./apps/editor-web/node_modules/pdfjs-dist', import.meta.url));
const pdfLib = fileURLToPath(new URL('./apps/editor-web/node_modules/pdf-lib', import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      '@pdfplatform/entitlements': fileURLToPath(
        new URL('./packages/entitlements/src/index.ts', import.meta.url)
      ),
      '@pdfplatform/ui': fileURLToPath(new URL('./packages/ui/src/index.ts', import.meta.url)),
      '@pdfplatform/pdf-engine-core': fileURLToPath(
        new URL('./packages/pdf-engine-core/src/index.ts', import.meta.url)
      ),
      'pdfjs-dist': pdfjsDist,
      'pdf-lib': pdfLib,
    },
  },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: 'packages',
          environment: 'node',
          include: ['tests/packages/**/*.test.ts'],
        },
      },
      {
        extends: true,
        test: {
          name: 'editor-web',
          environment: 'jsdom',
          include: ['tests/editor-web/**/*.test.{ts,tsx}'],
        },
        resolve: {
          alias: { '@': editorWebSrc },
        },
      },
      {
        extends: true,
        test: {
          name: 'exclusive-app',
          environment: 'jsdom',
          include: ['tests/exclusive-app/**/*.test.ts'],
        },
        resolve: {
          alias: { '@': exclusiveAppSrc },
        },
      },
    ],
  },
});
