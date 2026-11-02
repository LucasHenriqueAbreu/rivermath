import { describe, expect, it } from 'vitest';
import { createDeck, createCard, removeCards, shuffle } from './deck';

describe('deck', () => {
  it('creates a standard deck of 52 unique cards', () => {
    const deck = createDeck();
    expect(deck).toHaveLength(52);
    expect(new Set(deck.map(card => card.id)).size).toBe(52);
    expect(new Set(deck.map(card => card.suit)).size).toBe(4);
    expect(new Set(deck.map(card => card.rank)).size).toBe(13);
  });

  it('removes known cards without duplicating the rest', () => {
    const remaining = removeCards(createDeck(), [createCard(14, 'spades'), createCard(13, 'hearts')]);
    expect(remaining).toHaveLength(50);
    expect(remaining.some(card => card.id === '14-spades')).toBe(false);
    expect(remaining.some(card => card.id === '13-hearts')).toBe(false);
  });

  it('supports deterministic shuffling through an injected random source', () => {
    const deck = createDeck();
    expect(shuffle(deck, () => 0)).toEqual(shuffle(deck, () => 0));
    expect(new Set(shuffle(deck, () => 0).map(card => card.id)).size).toBe(52);
  });
});
