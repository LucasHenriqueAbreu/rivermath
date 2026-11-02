import { computed, effect, Injectable, signal, type WritableSignal } from '@angular/core';

import { createCard } from '@/core/poker/deck/deck';
import {
  Card,
  ITERATIONS_BY_PRECISION,
  Precision,
  SimulationResult,
  SimulationWorkerMessage,
  Street,
  STREET_COMMUNITY_COUNT,
} from '@/core/poker/models/poker.models';
import { runSimulation } from '@/core/poker/simulation/simulator';

@Injectable({ providedIn: 'root' })
export class CalculatorStateService {
  readonly heroCards = signal<readonly (Card | null)[]>([
    createCard(14, 'spades'),
    createCard(14, 'hearts'),
  ]);
  readonly communityCards = signal<readonly (Card | null)[]>([]);
  readonly street = signal<Street>('preflop');
  readonly opponents = signal(1);
  readonly precision = signal<Precision>(this.readPrecision());
  readonly isCalculating = signal(false);
  readonly progress = signal(0);
  readonly result = signal<SimulationResult | null>(null);
  readonly error = signal<string | null>(null);
  readonly activeCommunityCards = computed(() => {
    const count = STREET_COMMUNITY_COUNT[this.street()];
    return this.communityCards().slice(0, count).filter((card): card is Card => card !== null);
  });
  readonly selectedCards = computed(() => [...this.heroCards(), ...this.activeCommunityCards()].filter((card): card is Card => card !== null));
  readonly iterations = computed(() => ITERATIONS_BY_PRECISION[this.precision()]);

  private worker: Worker | null = null;
  private requestId = 0;

  constructor() {
    effect(() => this.persistPrecision(this.precision()));
  }

  setStreet(street: Street): void {
    this.street.set(street);
    this.communityCards.update(cards => cards.slice(0, STREET_COMMUNITY_COUNT[street]));
    this.invalidateResult();
  }

  setPrecision(precision: Precision): void {
    this.precision.set(precision);
    this.invalidateResult();
  }

  setOpponents(opponents: number): void {
    const safeValue = Number.isFinite(opponents) ? Math.min(9, Math.max(1, Math.round(opponents))) : 1;
    this.opponents.set(safeValue);
    this.invalidateResult();
  }

  setHeroCard(index: number, card: Card | null): void {
    this.setCard(this.heroCards, index, card);
  }

  setCommunityCard(index: number, card: Card | null): void {
    if (index >= STREET_COMMUNITY_COUNT[this.street()]) return;
    this.setCard(this.communityCards, index, card);
  }

  clearTable(): void {
    this.heroCards.set([null, null]);
    this.communityCards.set([]);
    this.invalidateResult();
  }

  calculate(): void {
    this.cancel(false);
    this.error.set(null);
    this.result.set(null);
    this.progress.set(0);
    this.isCalculating.set(true);
    const currentRequestId = ++this.requestId;
    const config = {
      heroCards: this.heroCards().filter((card): card is Card => card !== null),
      communityCards: this.activeCommunityCards(),
      opponents: this.opponents(),
      iterations: this.iterations(),
    };
    try {
      this.worker = new Worker(new URL('../../../core/poker/workers/simulation.worker', import.meta.url), { type: 'module' });
      this.worker.onmessage = ({ data }: MessageEvent<SimulationWorkerMessage>) => this.handleWorkerMessage(currentRequestId, data);
      this.worker.onerror = () => this.handleWorkerFailure(currentRequestId, 'Ocorreu um erro no processamento da simulação.');
      this.worker.postMessage({ type: 'run', requestId: currentRequestId, config });
    } catch {
      this.runOnMainThread(currentRequestId, config);
    }
  }

  cancel(showMessage = true): void {
    if (!this.isCalculating()) return;
    this.requestId += 1;
    this.worker?.terminate();
    this.worker = null;
    this.isCalculating.set(false);
    if (showMessage) this.error.set('Simulação cancelada.');
  }

  loadConfiguration(config: { heroCards: Card[]; communityCards: Card[]; street: Street; opponents: number }): void {
    this.cancel(false);
    this.heroCards.set(config.heroCards);
    this.street.set(config.street);
    this.communityCards.set(config.communityCards);
    this.opponents.set(config.opponents);
    this.invalidateResult();
  }

  private handleWorkerMessage(expectedRequestId: number, message: SimulationWorkerMessage): void {
    if (expectedRequestId !== this.requestId || message.requestId !== expectedRequestId) return;
    if (message.type === 'progress') {
      this.progress.set((message.completed / message.total) * 100);
      return;
    }
    if (message.type === 'result') {
      this.result.set(message.result);
      this.isCalculating.set(false);
      this.progress.set(100);
      this.worker?.terminate();
      this.worker = null;
      return;
    }
    this.handleWorkerFailure(expectedRequestId, message.message);
  }

  private handleWorkerFailure(expectedRequestId: number, message: string): void {
    if (expectedRequestId !== this.requestId) return;
    this.worker?.terminate();
    this.worker = null;
    this.isCalculating.set(false);
    this.error.set(message);
  }

  private runOnMainThread(expectedRequestId: number, config: { heroCards: Card[]; communityCards: Card[]; opponents: number; iterations: number }): void {
    setTimeout(() => {
      if (expectedRequestId !== this.requestId) return;
      try {
        const result = runSimulation(config, completed => this.progress.set((completed / config.iterations) * 100));
        this.result.set(result);
        this.isCalculating.set(false);
      } catch (error) {
        this.handleWorkerFailure(expectedRequestId, error instanceof Error ? error.message : 'Não foi possível calcular.');
      }
    });
  }

  private setCard(source: WritableSignal<readonly (Card | null)[]>, index: number, card: Card | null): void {
    if (index < 0) return;
    const current = [...source()];
    while (current.length <= index) current.push(null);
    if (card && this.selectedCards().some(existing => existing.id === card.id && existing.id !== current[index]?.id)) return;
    current[index] = card;
    source.set(current);
    this.invalidateResult();
  }

  private invalidateResult(): void {
    this.result.set(null);
    this.error.set(null);
  }

  private readPrecision(): Precision {
    try {
      const value = localStorage.getItem('rivermath-precision');
      if (value === 'quick' || value === 'standard' || value === 'precise') return value;
    } catch {
      // Preferences are optional.
    }
    return 'standard';
  }

  private persistPrecision(precision: Precision): void {
    try {
      localStorage.setItem('rivermath-precision', precision);
    } catch {
      // Preferences are optional.
    }
  }
}
