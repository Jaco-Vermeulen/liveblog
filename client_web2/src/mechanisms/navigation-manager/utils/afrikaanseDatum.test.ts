import { describe, expect, it } from 'vitest';
import { afrikaanseDatum } from './afrikaanseDatum';

describe('afrikaanseDatum', () => {
  it('formats a known date in Afrikaans', () => {
    expect(afrikaanseDatum(new Date(2026, 4, 26))).toBe('Dinsdag, 26 Mei 2026');
  });
});
