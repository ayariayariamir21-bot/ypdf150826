import { describe, expect, it } from 'vitest';
import { cn } from '@pdfplatform/ui';

describe('cn (class merging)', () => {
  it('joins class names', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c');
  });

  it('filters falsy values', () => {
    expect(cn('a', false, undefined, null, 0, 'b')).toBe('a b');
  });

  it('lets the last conflicting class win', () => {
    expect(cn('bg-brand-600', 'bg-red-500')).toBe('bg-red-500');
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', 'text-lg')).toBe('text-lg');
  });

  it('merges custom color tokens', () => {
    expect(cn('bg-brand-500', 'bg-slate-800')).toBe('bg-slate-800');
    expect(cn('text-danger-500', 'text-success-400')).toBe('text-success-400');
    expect(cn('border-dark-border', 'border-slate-200')).toBe('border-slate-200');
  });

  it('keeps unrelated classes', () => {
    expect(cn('rounded-lg', 'p-4', 'bg-brand-600', 'text-white')).toBe(
      'rounded-lg p-4 bg-brand-600 text-white'
    );
  });
});
