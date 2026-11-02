export const SUITS = ['spades', 'hearts', 'diamonds', 'clubs'] as const;
export type Suit = (typeof SUITS)[number];

export const RANKS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;
export type Rank = (typeof RANKS)[number];

export type Street = 'preflop' | 'flop' | 'turn' | 'river';
export type Precision = 'quick' | 'standard' | 'precise';

export interface Card {
  readonly id: string;
  readonly rank: Rank;
  readonly suit: Suit;
}

export const HAND_CATEGORIES = [
  'high-card',
  'pair',
  'two-pair',
  'three-of-a-kind',
  'straight',
  'flush',
  'full-house',
  'four-of-a-kind',
  'straight-flush',
  'royal-flush',
] as const;
export type HandCategory = (typeof HAND_CATEGORIES)[number];

export interface HandScore {
  readonly category: HandCategory;
  readonly rank: number;
  readonly tiebreakers: readonly number[];
  readonly cards: readonly Card[];
}

export interface SimulationConfig {
  readonly heroCards: readonly Card[];
  readonly communityCards: readonly Card[];
  readonly opponents: number;
  readonly iterations: number;
  readonly seed?: number;
}

export interface DistributionEntry {
  readonly category: HandCategory;
  readonly count: number;
  readonly percentage: number;
}

export interface SimulationResult {
  readonly iterations: number;
  readonly wins: number;
  readonly ties: number;
  readonly losses: number;
  readonly winPercentage: number;
  readonly tiePercentage: number;
  readonly lossPercentage: number;
  readonly equityPercentage: number;
  readonly distribution: readonly DistributionEntry[];
  readonly lossDistribution: readonly DistributionEntry[];
  readonly elapsedMs: number;
}

export interface SimulationProgress {
  readonly type: 'progress';
  readonly requestId: number;
  readonly completed: number;
  readonly total: number;
}

export interface SimulationSuccess {
  readonly type: 'result';
  readonly requestId: number;
  readonly result: SimulationResult;
}

export interface SimulationFailure {
  readonly type: 'error';
  readonly requestId: number;
  readonly message: string;
}

export type SimulationWorkerMessage = SimulationProgress | SimulationSuccess | SimulationFailure;

export const STREET_COMMUNITY_COUNT: Record<Street, number> = {
  preflop: 0,
  flop: 3,
  turn: 4,
  river: 5,
};

export const ITERATIONS_BY_PRECISION: Record<Precision, number> = {
  quick: 2_500,
  standard: 10_000,
  precise: 50_000,
};

export const CATEGORY_LABELS: Record<HandCategory, string> = {
  'high-card': 'Carta alta',
  pair: 'Par',
  'two-pair': 'Dois pares',
  'three-of-a-kind': 'Trinca',
  straight: 'Sequência',
  flush: 'Flush',
  'full-house': 'Full house',
  'four-of-a-kind': 'Quadra',
  'straight-flush': 'Straight flush',
  'royal-flush': 'Royal flush',
};

export const RANK_LABELS: Record<Rank, string> = {
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K',
  14: 'A',
};

export const SUIT_SYMBOLS: Record<Suit, string> = {
  spades: '♠',
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
};

export const SUIT_LABELS: Record<Suit, string> = {
  spades: 'Espadas',
  hearts: 'Copas',
  diamonds: 'Ouros',
  clubs: 'Paus',
};
