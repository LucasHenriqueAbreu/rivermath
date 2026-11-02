import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideX } from '@ng-icons/lucide';

import { createCard } from '@/core/poker/deck/deck';
import { Card, RANKS, RANK_LABELS, SUITS, SUIT_LABELS, SUIT_SYMBOLS, Suit } from '@/core/poker/models/poker.models';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardPopoverImports } from '@/shared/components/popover/popover.imports';
import { PlayingCardComponent } from '../playing-card/playing-card.component';

@Component({
  selector: 'app-card-selector',
  imports: [NgIcon, ZardButtonComponent, ...ZardPopoverImports, PlayingCardComponent],
  template: `
    <button
      type="button"
      zPopover
      [zContent]="picker"
      [zVisible]="isOpen()"
      (zVisibleChange)="isOpen.set($event)"
      class="card-selector-trigger"
      [attr.aria-label]="card() ? 'Substituir ' + cardLabel() : label()"
      (click)="openPicker()"
    >
      <app-playing-card [card]="card()" size="md" />
      @if (card()) {
        <span class="card-selector-trigger__remove" (click)="$event.stopPropagation(); removeCard()" aria-label="Remover carta">
          <ng-icon name="lucideX" />
        </span>
      }
    </button>

    <ng-template #picker>
      <div class="card-picker" role="dialog" [attr.aria-label]="label()">
        <div class="card-picker__header">
          <div>
            <p class="eyebrow">Selecionar carta</p>
            <h3>{{ label() }}</h3>
          </div>
          @if (card()) {
            <button type="button" z-button zType="ghost" zSize="icon-sm" aria-label="Limpar carta" (click)="removeCard()">
              <ng-icon name="lucideX" />
            </button>
          }
        </div>
        <div class="suit-filter" role="tablist" aria-label="Escolha o naipe">
          @for (suit of suits; track suit) {
            <button type="button" class="suit-filter__button" [class.suit-filter__button--active]="selectedSuit() === suit" [class.suit-filter__button--red]="isRedSuit(suit)" role="tab" [attr.aria-selected]="selectedSuit() === suit" (click)="selectedSuit.set(suit)">
              <span class="suit-filter__symbol">{{ suitSymbols[suit] }}</span><span>{{ suitLabels[suit] }}</span>
            </button>
          }
        </div>
        <div class="card-picker__suit" [attr.data-suit]="selectedSuit()">
          <span class="card-picker__suit-label">{{ suitSymbols[selectedSuit()] }} {{ suitLabels[selectedSuit()] }} · escolha um valor</span>
          <div class="card-picker__cards">
            @for (rank of ranks; track rank) {
              @let option = cardFor(rank, selectedSuit());
              <button
                type="button"
                class="card-option"
                [class.card-option--red]="isRedSuit(selectedSuit())"
                [class.card-option--selected]="card()?.id === option.id"
                [class.card-option--disabled]="isUnavailable(option)"
                [disabled]="isUnavailable(option)"
                [attr.aria-label]="cardLabelFor(option)"
                (click)="choose(option)"
              >
                <span>{{ rankLabels[rank] }}</span><span>{{ suitSymbols[selectedSuit()] }}</span>
                @if (card()?.id === option.id) { <ng-icon name="lucideCheck" /> }
              </button>
            }
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    :host { display: inline-flex; }
    .card-selector-trigger { position: relative; display: inline-flex; padding: 0; border: 0; background: transparent; border-radius: 8px; cursor: pointer; }.card-selector-trigger:focus-visible { outline: 2px solid var(--ring); outline-offset: 3px; }.card-selector-trigger__remove { position: absolute; top: -6px; right: -6px; display: grid; place-items: center; width: 17px; height: 17px; border: 1px solid var(--border); border-radius: 999px; color: var(--muted-foreground); background: var(--background); }.card-selector-trigger__remove ng-icon { width: 11px; height: 11px; }
    .card-picker { width: min(440px, calc(100vw - 28px)); max-height: min(70vh, 500px); overflow: auto; padding: 13px; color: var(--foreground); background: var(--popover); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 16px 36px rgb(15 23 42 / 16%); }.card-picker__header { display: flex; align-items: start; justify-content: space-between; gap: 10px; margin-bottom: 12px; }.card-picker__header h3 { margin: 2px 0 0; font-size: 13px; }.card-picker__suit { display: grid; gap: 8px; }.card-picker__suit-label { color: var(--muted-foreground); font-size: 10px; font-weight: 650; }.card-picker__cards { display: grid; grid-template-columns: repeat(13, minmax(27px, 1fr)); gap: 5px; }.suit-filter { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 13px; }.suit-filter__button { display: flex; align-items: center; justify-content: center; gap: 5px; min-height: 36px; padding: 5px 6px; border: 1px solid var(--border); border-radius: 7px; background: var(--background); color: var(--muted-foreground); cursor: pointer; font-size: 10px; font-weight: 650; }.suit-filter__button:hover, .suit-filter__button--active { border-color: #84cc16; background: color-mix(in srgb, #84cc16 12%, var(--background)); color: var(--foreground); }.suit-filter__button--active .suit-filter__symbol, .suit-filter__button--red .suit-filter__symbol { color: #be123c; }.suit-filter__button:not(.suit-filter__button--red) .suit-filter__symbol { color: #0f172a; }.suit-filter__symbol { font-size: 18px; line-height: 1; }.card-option { position: relative; min-width: 0; min-height: 48px; display: grid; place-items: center; gap: 2px; padding: 4px 1px; border: 1px solid var(--border); border-radius: 6px; background: var(--background); color: #0f172a; cursor: pointer; font-size: 13px; font-weight: 750; line-height: 1; }.card-option span:last-of-type { font-size: 16px; opacity: .85; }.card-option--red { color: #be123c; }.card-option:hover:not(:disabled), .card-option--selected { border-color: #84cc16; background: color-mix(in srgb, #84cc16 14%, var(--background)); }.card-option--disabled { opacity: .32; cursor: not-allowed; }.card-option ng-icon { position: absolute; right: 3px; bottom: 3px; width: 10px; height: 10px; color: #65a30d; }
    @media (max-width: 520px) { .card-picker__cards { grid-template-columns: repeat(7, minmax(34px, 1fr)); gap: 5px; }.suit-filter__button { min-height: 42px; flex-direction: column; gap: 2px; }.card-picker { width: min(360px, calc(100vw - 20px)); } }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideCheck, lucideX })],
})
export class CardSelectorComponent {
  readonly card = input<Card | null>(null);
  readonly disabledCards = input<readonly Card[]>([]);
  readonly label = input('Carta');
  readonly cardChange = output<Card | null>();
  protected readonly isOpen = signal(false);
  protected readonly selectedSuit = signal<Suit>('spades');
  protected readonly suits = SUITS;
  protected readonly ranks = RANKS;
  protected readonly rankLabels = RANK_LABELS;
  protected readonly suitLabels = SUIT_LABELS;
  protected readonly suitSymbols = SUIT_SYMBOLS;
  protected readonly cardLabel = computed(() => (this.card() ? this.cardLabelFor(this.card()!) : this.label()));

  protected cardFor(rank: (typeof RANKS)[number], suit: (typeof SUITS)[number]): Card {
    return createCard(rank, suit);
  }

  protected openPicker(): void {
    this.selectedSuit.set(this.card()?.suit ?? 'spades');
  }

  protected isRedSuit(suit: Suit): boolean {
    return suit === 'hearts' || suit === 'diamonds';
  }

  protected cardLabelFor(card: Card): string {
    return `${RANK_LABELS[card.rank]} de ${SUIT_LABELS[card.suit]}`;
  }

  protected isUnavailable(card: Card): boolean {
    return this.disabledCards().some(disabled => disabled.id === card.id && disabled.id !== this.card()?.id);
  }

  protected choose(card: Card): void {
    if (this.isUnavailable(card)) return;
    this.cardChange.emit(card);
    this.isOpen.set(false);
  }

  protected removeCard(): void {
    this.cardChange.emit(null);
    this.isOpen.set(false);
  }
}
