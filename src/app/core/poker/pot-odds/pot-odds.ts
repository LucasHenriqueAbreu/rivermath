export interface PotOddsResult {
  readonly valid: boolean;
  readonly potAfterCall: number;
  readonly requiredEquity: number;
  readonly edge: number | null;
}

export function calculatePotOdds(pot: number, call: number, estimatedEquity: number | null = null): PotOddsResult {
  if (!Number.isFinite(pot) || !Number.isFinite(call) || pot < 0 || call <= 0) {
    return { valid: false, potAfterCall: 0, requiredEquity: 0, edge: null };
  }
  const requiredEquity = (call / (pot + call)) * 100;
  return {
    valid: true,
    potAfterCall: pot + call,
    requiredEquity,
    edge: estimatedEquity === null ? null : estimatedEquity - requiredEquity,
  };
}
