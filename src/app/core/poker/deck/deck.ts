import { Card, RANKS, Rank, SUITS, Suit } from '../models/poker.models';

export function createCard(rank: Rank, suit: Suit): Card {
  return { id: `${rank}-${suit}`, rank, suit };
}

export function createDeck(): Card[] {
  return SUITS.flatMap(suit => RANKS.map(rank => createCard(rank, suit)));
}

export function removeCards(deck: readonly Card[], cards: readonly Card[]): Card[] {
  const excluded = new Set(cards.map(card => card.id));
  return deck.filter(card => !excluded.has(card.id));
}

export function shuffle<T>(values: readonly T[], random: () => number = Math.random): T[] {
  const shuffled = [...values];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function takeCards(deck: readonly Card[], count: number): { cards: Card[]; rest: Card[] } {
  return { cards: deck.slice(0, count), rest: deck.slice(count) };
}
