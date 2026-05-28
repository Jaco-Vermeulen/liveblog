import { describe, expect, it } from 'vitest';
import { buildPollActiveUntil, pollCalculations } from './pollCalculations';

describe('pollCalculations', () => {
  it('computes vote percentages', () => {
    const result = pollCalculations({
      question: 'Q?',
      active_until: new Date(Date.now() + 3600_000).toISOString(),
      answers: [
        { option: 'A', votes: 1 },
        { option: 'B', votes: 3 },
      ],
    });
    expect(result.totalVotes).toBe(4);
    expect(result.answers.reduce((s, a) => s + (a.percentage ?? 0), 0)).toBe(100);
  });
});

describe('buildPollActiveUntil', () => {
  it('returns ISO string in the future', () => {
    const iso = buildPollActiveUntil(0, 1, 0);
    expect(new Date(iso).getTime()).toBeGreaterThan(Date.now());
  });
});
