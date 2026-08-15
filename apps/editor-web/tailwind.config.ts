import type { Config } from 'tailwindcss';
import { tailwindPreset } from '@pdfplatform/config/tailwind';

export default {
  presets: [tailwindPreset],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    '../packages/ui/src/**/*.{ts,tsx}',
  ],
} satisfies Config;
