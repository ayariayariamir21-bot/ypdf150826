import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const customColorNames = [
  'brand',
  'slate',
  'success',
  'warning',
  'danger',
  'premium',
  'exclusive',
  'dark',
] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'bg-color': [{ bg: customColorNames }],
      'text-color': [{ text: customColorNames }],
      'border-color': [{ border: customColorNames }],
      'border-color-x': [{ 'border-x': customColorNames }],
      'border-color-y': [{ 'border-y': customColorNames }],
      'border-color-t': [{ 'border-t': customColorNames }],
      'border-color-r': [{ 'border-r': customColorNames }],
      'border-color-b': [{ 'border-b': customColorNames }],
      'border-color-l': [{ 'border-l': customColorNames }],
      'ring-color': [{ ring: customColorNames }],
      'divide-color': [{ divide: customColorNames }],
      'outline-color': [{ outline: customColorNames }],
      'shadow-color': [{ shadow: customColorNames }],
      accent: [{ accent: customColorNames }],
      'caret-color': [{ caret: customColorNames }],
      fill: [{ fill: customColorNames }],
      stroke: [{ stroke: customColorNames }],
      'gradient-from': [{ from: customColorNames }],
      'gradient-via': [{ via: customColorNames }],
      'gradient-to': [{ to: customColorNames }],
    },
  },
});

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
