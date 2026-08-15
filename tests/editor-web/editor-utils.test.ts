import { describe, expect, it } from 'vitest';
import { capitalize, clamp, errorMessage, formatBytes, formatDate, formatPriceCents, uid } from '@/lib/utils';

describe('clamp', () => {
  it('clamps values within bounds', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-1, 0, 10)).toBe(0);
    expect(clamp(11, 0, 10)).toBe(10);
  });
});

describe('formatBytes', () => {
  it('formats byte sizes with sensible units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.00 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.00 MB');
    expect(formatBytes(1.5 * 1024 * 1024)).toBe('1.50 MB');
    expect(formatBytes(2 * 1024 * 1024 * 1024)).toBe('2.00 GB');
  });
});

describe('formatPriceCents', () => {
  it('formats cent values as USD', () => {
    expect(formatPriceCents(0)).toBe('$0.00');
    expect(formatPriceCents(1299)).toBe('$12.99');
    expect(formatPriceCents(2999)).toBe('$29.99');
  });
});

describe('formatDate', () => {
  it('formats dates deterministically', () => {
    expect(formatDate(new Date('2026-08-15T12:00:00Z'))).toBe('Aug 15, 2026');
  });
});

describe('capitalize', () => {
  it('capitalizes the first character', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('')).toBe('');
  });
});

describe('errorMessage', () => {
  it('extracts a message from common error shapes', () => {
    expect(errorMessage(new Error('boom'))).toBe('boom');
    expect(errorMessage('plain string')).toBe('plain string');
    expect(errorMessage(42)).toBe('Something went wrong');
    expect(errorMessage(null)).toBe('Something went wrong');
  });
});

describe('uid', () => {
  it('generates unique identifiers', () => {
    const seen = new Set<string>();
    for (let index = 0; index < 1000; index += 1) {
      const id = uid();
      expect(id.length).toBeGreaterThan(0);
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    }
  });
});
