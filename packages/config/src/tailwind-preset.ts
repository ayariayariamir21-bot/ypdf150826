import type { Config } from 'tailwindcss';
import { animation, colors, fontFamily, keyframes, spacing } from './design-tokens';

export const tailwindPreset: Config = {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      colors,
      fontFamily,
      spacing,
      keyframes,
      animation,
      boxShadow: {
        card: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        elevated: '0 4px 12px -2px rgb(0 0 0 / 0.12)',
        float: '0 8px 24px -4px rgb(0 0 0 / 0.2)',
      },
    },
  },
};
