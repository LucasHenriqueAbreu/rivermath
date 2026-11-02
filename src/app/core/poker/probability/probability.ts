import { Card, HandCategory, HandScore, STREET_COMMUNITY_COUNT, Street } from '../models/poker.models';
import { createDeck, removeCards } from '../deck/deck';
import { evaluateBestHand } from '../evaluator/evaluator';

export interface DrawInsight {
  readonly outs: number;
  readonly flushCompletion: number | null;
  readonly straightCompletion: number | null;
  readonly improveNextCard: number | null;
  readonly improveByRiver: number | null;
}

export function estimateDrawInsight(heroCards: readonly Card[], communityCards: readonly Card[], street: Street): DrawInsight {
  const knownCards = [...heroCards, ...communityCards];
  const remaining = removeCards(createDeck(), knownCards);
  const currentScore = knownCards.length >= 5 ? evaluateBestHand(knownCards) : undefined;
  const outs = currentScore ? remaining.filter(card => improvesHand([...knownCards, card], currentScore.category)).length : countStraightOrFlushOuts(knownCards, remaining);
  const cardsToCome = 5 - STREET_COMMUNITY_COUNT[street];
  return {
    outs,
    flushCompletion: completionPercentage(knownCards, remaining, cardsToCome, drawn => hasFlush([...knownCards, ...drawn])),
    straightCompletion: completionPercentage(knownCards, remaining, cardsToCome, drawn => hasStraight([...knownCards, ...drawn])),
    improveNextCard: currentScore ? (outs / remaining.length) * 100 : null,
    improveByRiver: currentScore ? probabilityByRiver(remaining.length, outs, cardsToCome) : null,
  };
}

function improvesHand(cards: readonly Card[], currentCategory: HandCategory): boolean {
  return evaluateBestHand(cards).rank > categoryRank(currentCategory);
}

function categoryRank(category: HandCategory): number {
  const ranks: Record<HandCategory, number> = {
    'high-card': 0, pair: 1, 'two-pair': 2, 'three-of-a-kind': 3, straight: 4,
    flush: 5, 'full-house': 6, 'four-of-a-kind': 7, 'straight-flush': 8, 'royal-flush': 9,
  };
  return ranks[category];
}

function hasFlush(cards: readonly Card[]): boolean {
  return cards.some(card => cards.filter(candidate => candidate.suit === card.suit).length >= 5);
}

function hasStraight(cards: readonly Card[]): boolean {
  const ranks = new Set<number>(cards.map(card => card.rank));
  if (ranks.has(14)) ranks.add(1);
  return [...ranks].some(rank => [0, 1, 2, 3, 4].every(offset => ranks.has(rank - offset)));
}

function completionPercentage(_knownCards: readonly Card[], deck: readonly Card[], cardsToCome: number, predicate: (cards: readonly Card[]) => boolean): number | null {
  if (cardsToCome <= 0) return null;
  if (cardsToCome > 2) return null;
  if (cardsToCome === 1) return (deck.filter(card => predicate([card])).length / deck.length) * 100;
  let successfulCombinations = 0;
  let totalCombinations = 0;
  for (let first = 0; first < deck.length - 1; first += 1) {
    for (let second = first + 1; second < deck.length; second += 1) {
      totalCombinations += 1;
      if (predicate([deck[first], deck[second]])) successfulCombinations += 1;
    }
  }
  return totalCombinations === 0 ? null : (successfulCombinations / totalCombinations) * 100;
}

function probabilityByRiver(remainingCards: number, outs: number, cardsToCome: number): number {
  if (outs <= 0 || cardsToCome <= 0) return 0;
  let missProbability = 1;
  for (let draw = 0; draw < cardsToCome; draw += 1) {
    missProbability *= (remainingCards - outs - draw) / (remainingCards - draw);
  }
  return (1 - missProbability) * 100;
}

function countStraightOrFlushOuts(knownCards: readonly Card[], remaining: readonly Card[]): number {
  return remaining.filter(card => hasStraight([...knownCards, card]) || hasFlush([...knownCards, card])).length;
}
