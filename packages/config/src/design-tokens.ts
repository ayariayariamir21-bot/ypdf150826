export const brand = {
  50: '#eef2ff',
  100: '#e0e7ff',
  200: '#c7d2fe',
  300: '#a5b4fc',
  400: '#818cf8',
  500: '#6366f1',
  600: '#4f46e5',
  700: '#4338ca',
  800: '#3730a3',
  900: '#312e81',
  950: '#1e1b4b',
} as const;

export const slate = {
  50: '#f8fafc',
  100: '#f1f5f9',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  900: '#0f172a',
  950: '#020617',
} as const;

export const success = {
  50: '#ecfdf5',
  500: '#10b981',
  600: '#059669',
} as const;

export const warning = {
  50: '#fffbeb',
  500: '#f59e0b',
  600: '#d97706',
} as const;

export const danger = {
  50: '#fef2f2',
  500: '#ef4444',
  600: '#dc2626',
} as const;

export const premium = {
  50: '#f5f3ff',
  500: '#8b5cf6',
  600: '#7c3aed',
} as const;

export const exclusive = {
  50: '#fffbeb',
  500: '#d97706',
  600: '#b45309',
} as const;

export const dark = {
  bg: '#0a0a0f',
  'bg-secondary': '#12121a',
  'bg-elevated': '#1c1c2e',
  border: '#2a2a40',
  'border-hover': '#3f3f5f',
} as const;

export const colors = {
  brand,
  slate,
  success,
  warning,
  danger,
  premium,
  exclusive,
  dark,
} as const;

export const fontFamily: Record<'sans' | 'mono', string[]> = {
  sans: [
    'Inter',
    'ui-sans-serif',
    'system-ui',
    '-apple-system',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
  mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
};

export const spacing = {
  toolbar: '56px',
  sidebar: '200px',
  'sidebar-lg': '320px',
  statusbar: '28px',
} as const;

export const keyframes = {
  'fade-in': {
    from: { opacity: '0' },
    to: { opacity: '1' },
  },
  'fade-out': {
    from: { opacity: '1' },
    to: { opacity: '0' },
  },
  'scale-in': {
    from: { opacity: '0', transform: 'scale(0.96)' },
    to: { opacity: '1', transform: 'scale(1)' },
  },
  'scale-out': {
    from: { opacity: '1', transform: 'scale(1)' },
    to: { opacity: '0', transform: 'scale(0.96)' },
  },
  'slide-in-from-top': {
    from: { opacity: '0', transform: 'translateY(-8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-in-from-bottom': {
    from: { opacity: '0', transform: 'translateY(8px)' },
    to: { opacity: '1', transform: 'translateY(0)' },
  },
  indeterminate: {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(350%)' },
  },
  shimmer: {
    '0%': { backgroundPosition: '200% 0' },
    '100%': { backgroundPosition: '-200% 0' },
  },
} as const;

export const animation = {
  'fade-in': 'fade-in 150ms ease-out',
  'fade-out': 'fade-out 150ms ease-in forwards',
  'scale-in': 'scale-in 150ms ease-out',
  'scale-out': 'scale-out 150ms ease-in forwards',
  'slide-in-from-top': 'slide-in-from-top 160ms ease-out',
  'slide-in-from-bottom': 'slide-in-from-bottom 160ms ease-out',
  indeterminate: 'indeterminate 1.2s ease-in-out infinite',
  shimmer: 'shimmer 1.8s linear infinite',
} as const;
