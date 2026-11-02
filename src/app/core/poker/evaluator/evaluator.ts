import { Card, HandCategory, HandScore } from '../models/poker.models';

const CATEGORY_RANK: Record<HandCategory, number> = {
  'high-card': 0,
  pair: 1,
  'two-pair': 2,
  'three-of-a-kind': 3,
  straight: 4,
  flush: 5,
  'full-house': 6,
  'four-of-a-kind': 7,
  'straight-flush': 8,
  'royal-flush': 9,
};

export function compareScores(left: HandScore, right: HandScore): number {
  if (left.rank !== right.rank) {
    return left.rank - right.rank;
  }
  const length = Math.max(left.tiebreakers.length, right.tiebreakers.length);
  for (let index = 0; index < length; index += 1) {
    const difference = (left.tiebreakers[index] ?? 0) - (right.tiebreakers[index] ?? 0);
    if (difference !== 0) {
      return difference;
    }
  }
  return 0;
}

export function evaluateBestHand(cards: readonly Card[]): HandScore {
  if (cards.length < 5) {
    throw new Error('São necessárias pelo menos cinco cartas para avaliar uma mão.');
  }
  let bestScore: HandScore | undefined;
  for (const combination of combinations(cards, 5)) {
    const score = evaluateFiveCards(combination);
    if (!bestScore || compareScores(score, bestScore) > 0) {
      bestScore = score;
    }
  }
  return bestScore!;
}

export function evaluateFiveCards(cards: readonly Card[]): HandScore {
  if (cards.length !== 5) {
    throw new Error('A avaliação de uma mão simples exige exatamente cinco cartas.');
  }
  const sortedRanks = cards.map(card => card.rank).sort((a, b) => b - a);
  const counts = new Map<number, number>();
  for (const rank of sortedRanks) {
    counts.set(rank, (counts.get(rank) ?? 0) + 1);
  }
  const groups = [...counts.entries()].sort((left, right) => right[1] - left[1] || right[0] - left[0]);
  const flush = cards.every(card => card.suit === cards[0].suit);
  const straightHigh = findStraightHigh(sortedRanks);

  if (flush && straightHigh) {
    const category = straightHigh === 14 ? 'royal-flush' : 'straight-flush';
    return score(category, [straightHigh], cards);
  }
  if (groups[0][1] === 4) {
    return score('four-of-a-kind', [groups[0][0], groups[1][0]], cards);
  }
  if (groups[0][1] === 3 && groups[1][1] === 2) {
    return score('full-house', [groups[0][0], groups[1][0]], cards);
  }
  if (flush) {
    return score('flush', sortedRanks, cards);
  }
  if (straightHigh) {
    return score('straight', [straightHigh], cards);
  }
  if (groups[0][1] === 3) {
    return score('three-of-a-kind', [groups[0][0], ...groups.slice(1).map(group => group[0]).sort((a, b) => b - a)], cards);
  }
  if (groups[0][1] === 2 && groups[1][1] === 2) {
    const pairs = [groups[0][0], groups[1][0]].sort((a, b) => b - a);
    return score('two-pair', [...pairs, groups[2][0]], cards);
  }
  if (groups[0][1] === 2) {
    return score('pair', [groups[0][0], ...groups.slice(1).map(group => group[0]).sort((a, b) => b - a)], cards);
  }
  return score('high-card', sortedRanks, cards);
}

function score(category: HandCategory, tiebreakers: readonly number[], cards: readonly Card[]): HandScore {
  return { category, rank: CATEGORY_RANK[category], tiebreakers, cards };
}

function findStraightHigh(sortedRanks: readonly number[]): number | undefined {
  const uniqueRanks = [...new Set(sortedRanks)];
  if (uniqueRanks.includes(14)) {
    uniqueRanks.push(1);
  }
  for (let index = 0; index <= uniqueRanks.length - 5; index += 1) {
    const window = uniqueRanks.slice(index, index + 5);
    if (window.every((rank, offset) => rank === window[0] - offset)) {
      return window[0] === 1 ? 5 : window[0];
    }
  }
  return undefined;
}

function* combinations<T>(values: readonly T[], size: number, start = 0, chosen: T[] = []): Generator<T[]> {
  if (chosen.length === size) {
    yield [...chosen];
    return;
  }
  const remaining = size - chosen.length;
  for (let index = start; index <= values.length - remaining; index += 1) {
    chosen.push(values[index]);
    yield* combinations(values, size, index + 1, chosen);
    chosen.pop();
  }
}
