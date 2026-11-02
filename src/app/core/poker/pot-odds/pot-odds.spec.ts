import { describe, expect, it } from 'vitest';
import { calculatePotOdds } from './pot-odds';

describe('pot odds', () => {
  it('calculates a 20% call for a 100 pot and 25 call', () => {
    const result = calculatePotOdds(100, 25);
    expect(result.valid).toBe(true);
    expect(result.requiredEquity).toBe(20);
    expect(result.potAfterCall).toBe(125);
  });

  it.each([[-1, 25], [100, 0], [100, -5], [Number.NaN, 25]])('rejects invalid values %s / %s', (pot, call) => {
    expect(calculatePotOdds(pot, call).valid).toBe(false);
  });
});
