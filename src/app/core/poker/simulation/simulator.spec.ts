import { describe, expect, it } from 'vitest';
import { createCard } from '../deck/deck';
import { runSimulation } from './simulator';

const c = (rank: Parameters<typeof createCard>[0], suit: Parameters<typeof createCard>[1]) => createCard(rank, suit);

describe('simulation', () => {
  it('splits a shared royal flush board into a full tie', () => {
    const result = runSimulation({
      heroCards: [c(2, 'clubs'), c(3, 'diamonds')],
      communityCards: [c(14, 'spades'), c(13, 'spades'), c(12, 'spades'), c(11, 'spades'), c(10, 'spades')],
      opponents: 3,
      iterations: 20,
    }, undefined, () => 0.42);
    expect(result.wins).toBe(0);
    expect(result.ties).toBe(20);
    expect(result.losses).toBe(0);
    expect(result.equityPercentage).toBe(25);
  });

  it('keeps the outcome distribution normalized', () => {
    const result = runSimulation({ heroCards: [c(14, 'spades'), c(14, 'hearts')], communityCards: [], opponents: 2, iterations: 80 }, undefined, () => 0.33);
    expect(result.winPercentage + result.tiePercentage + result.lossPercentage).toBeCloseTo(100, 8);
    expect(result.distribution.reduce((sum, entry) => sum + entry.percentage, 0)).toBeCloseTo(100, 8);
  });

  it('is reproducible when a deterministic random source is injected', () => {
    const config = { heroCards: [c(14, 'spades'), c(13, 'hearts')], communityCards: [], opponents: 1, iterations: 15 };
    const first = runSimulation(config, undefined, () => 0.1234);
    const second = runSimulation(config, undefined, () => 0.1234);
    expect({ ...second, elapsedMs: 0 }).toEqual({ ...first, elapsedMs: 0 });
  });
});
