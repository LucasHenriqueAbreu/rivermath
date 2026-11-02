import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { Card, RANK_LABELS, SUIT_LABELS, SUIT_SYMBOLS } from '@/core/poker/models/poker.models';

export type PlayingCardSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-playing-card',
  template: `
    @if (card(); as selectedCard) {
      <span class="playing-card__corner" aria-hidden="true">
        <span>{{ rankLabel() }}</span>
        <span class="playing-card__suit">{{ suitSymbol() }}</span>
      </span>
      <span class="playing-card__center" aria-hidden="true">{{ suitSymbol() }}</span>
      <span class="sr-only">{{ accessibleLabel() }}</span>
    } @else {
      <span class="playing-card__empty" aria-hidden="true">+</span>
      <span class="sr-only">Carta vazia</span>
    }
  `,
  styles: `
    :host { position: relative; display: inline-flex; flex: none; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; border: 1px solid rgb(15 23 42 / 16%); border-radius: 7px; background: #fff; box-shadow: 0 2px 4px rgb(15 23 42 / 12%), 0 1px 1px rgb(15 23 42 / 8%); font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-weight: 800; }
    :host(.playing-card--sm) { width: 31px; height: 43px; border-radius: 5px; font-size: 11px; }
    :host(.playing-card--md) { width: 48px; height: 66px; font-size: 16px; }
    :host(.playing-card--lg) { width: 60px; height: 82px; font-size: 19px; }
    :host(.playing-card--red) { color: #be123c; }:host(.playing-card--black) { color: #0f172a; }:host(.playing-card--disabled) { opacity: .45; }
    .playing-card__corner { position: absolute; top: 4px; left: 5px; display: grid; line-height: .95; text-align: center; }.playing-card__suit { font-size: .82em; }.playing-card__center { font-size: 1.4em; opacity: .16; }.playing-card__empty { color: var(--muted-foreground); font-size: 19px; font-weight: 400; }.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0; }
    @media (prefers-color-scheme: dark) { .playing-card { border-color: rgb(255 255 255 / 17%); } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[attr.aria-label]': 'accessibleLabel()',
    '[attr.data-empty]': '!card() ? "true" : null',
  },
})
export class PlayingCardComponent {
  readonly card = input<Card | null>(null);
  readonly size = input<PlayingCardSize>('md');
  readonly disabled = input(false);

  protected readonly rankLabel = computed(() => {
    const card = this.card();
    return card ? RANK_LABELS[card.rank] : '';
  });
  protected readonly suitSymbol = computed(() => {
    const card = this.card();
    return card ? SUIT_SYMBOLS[card.suit] : '';
  });
  protected readonly accessibleLabel = computed(() => {
    const card = this.card();
    return card ? `${this.rankLabel()} de ${SUIT_LABELS[card.suit]}` : 'Carta vazia';
  });
  protected readonly classes = computed(() => {
    const card = this.card();
    const tone = card?.suit === 'hearts' || card?.suit === 'diamonds' ? 'playing-card--red' : 'playing-card--black';
    return `playing-card playing-card--${this.size()} ${tone} ${this.disabled() ? 'playing-card--disabled' : ''}`;
  });
}
