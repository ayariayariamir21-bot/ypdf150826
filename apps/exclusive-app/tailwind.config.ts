import type { Config } from 'tailwindcss';
import { tailwindPreset } from '@pdfplatform/config/tailwind';

export default {
  darkMode: 'class',
  presets: [tailwindPreset],
  content: ['./src/**/*.{ts,tsx}'],
} satisfies Config;
