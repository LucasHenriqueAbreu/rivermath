import { describe, expect, it } from 'vitest';
import { createCard } from '../deck/deck';
import { compareScores, evaluateBestHand, evaluateFiveCards } from './evaluator';

const c = (rank: Parameters<typeof createCard>[0], suit: Parameters<typeof createCard>[1]) => createCard(rank, suit);

describe('hand evaluator', () => {
  const cases = [
    { cards: [[10, 'spades'], [11, 'spades'], [12, 'spades'], [13, 'spades'], [14, 'spades']], expected: 'royal-flush' },
    { cards: [[9, 'hearts'], [10, 'hearts'], [11, 'hearts'], [12, 'hearts'], [13, 'hearts']], expected: 'straight-flush' },
    { cards: [[14, 'clubs'], [14, 'diamonds'], [14, 'hearts'], [14, 'spades'], [2, 'clubs']], expected: 'four-of-a-kind' },
    { cards: [[13, 'clubs'], [13, 'diamonds'], [13, 'hearts'], [8, 'spades'], [8, 'clubs']], expected: 'full-house' },
    { cards: [[2, 'hearts'], [5, 'hearts'], [8, 'hearts'], [11, 'hearts'], [14, 'hearts']], expected: 'flush' },
    { cards: [[5, 'clubs'], [4, 'diamonds'], [3, 'hearts'], [2, 'spades'], [14, 'clubs']], expected: 'straight' },
    { cards: [[7, 'clubs'], [7, 'diamonds'], [7, 'hearts'], [12, 'spades'], [2, 'clubs']], expected: 'three-of-a-kind' },
    { cards: [[10, 'clubs'], [10, 'diamonds'], [6, 'hearts'], [6, 'spades'], [14, 'clubs']], expected: 'two-pair' },
    { cards: [[10, 'clubs'], [10, 'diamonds'], [6, 'hearts'], [4, 'spades'], [14, 'clubs']], expected: 'pair' },
    { cards: [[14, 'clubs'], [11, 'diamonds'], [8, 'hearts'], [6, 'spades'], [2, 'clubs']], expected: 'high-card' },
  ] as const;

  for (const testCase of cases) {
    it(`detects ${testCase.expected}`, () => {
      const score = evaluateFiveCards(testCase.cards.map(([rank, suit]) => c(rank as Parameters<typeof createCard>[0], suit as Parameters<typeof createCard>[1])));
      expect(score.category).toBe(testCase.expected);
    });
  }

  it('chooses the best five cards from seven and handles the wheel', () => {
    const score = evaluateBestHand([c(14, 'clubs'), c(2, 'diamonds'), c(3, 'hearts'), c(4, 'spades'), c(5, 'clubs'), c(9, 'diamonds'), c(13, 'hearts')]);
    expect(score.category).toBe('straight');
    expect(score.tiebreakers[0]).toBe(5);
  });

  it('uses kickers and does not use suit as a tiebreaker', () => {
    const aceKicker = evaluateFiveCards([c(14, 'clubs'), c(14, 'diamonds'), c(9, 'hearts'), c(7, 'spades'), c(2, 'clubs')]);
    const kingKicker = evaluateFiveCards([c(14, 'clubs'), c(14, 'diamonds'), c(8, 'hearts'), c(7, 'spades'), c(2, 'clubs')]);
    const sameRanksDifferentSuits = evaluateFiveCards([c(14, 'clubs'), c(13, 'diamonds'), c(11, 'hearts'), c(9, 'spades'), c(2, 'clubs')]);
    const sameRanksOtherSuits = evaluateFiveCards([c(14, 'diamonds'), c(13, 'clubs'), c(11, 'spades'), c(9, 'hearts'), c(2, 'diamonds')]);
    expect(compareScores(aceKicker, kingKicker)).toBeGreaterThan(0);
    expect(compareScores(sameRanksDifferentSuits, sameRanksOtherSuits)).toBe(0);
  });

  it('builds a full house from two separate trips', () => {
    const score = evaluateBestHand([c(13, 'clubs'), c(13, 'diamonds'), c(13, 'hearts'), c(8, 'clubs'), c(8, 'diamonds'), c(8, 'hearts'), c(2, 'spades')]);
    expect(score.category).toBe('full-house');
    expect(score.tiebreakers).toEqual([13, 8]);
  });
});
