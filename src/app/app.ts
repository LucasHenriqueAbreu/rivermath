import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCheck, lucideCircleHelp, lucideCode2, lucideInfo, lucideMoon,
  lucidePlay, lucideRotateCcw, lucideShieldCheck, lucideSigma, lucideSun, lucideX,
} from '@ng-icons/lucide';

import { calculatePotOdds } from '@/core/poker/pot-odds/pot-odds';
import { CATEGORY_LABELS, Card, Precision, STREET_COMMUNITY_COUNT, Street } from '@/core/poker/models/poker.models';
import { CalculatorStateService } from '@/features/calculator/state/calculator-state.service';
import { ZardAccordionImports } from '@/shared/components/accordion/accordion.imports';
import { ZardAvatarComponent } from '@/shared/components/avatar/avatar.component';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardImports } from '@/shared/components/card/card.imports';
import { ZardFieldImports } from '@/shared/components/field/field.imports';
import { ZardInputComponent } from '@/shared/components/input/input.component';
import { ZardProgressComponent } from '@/shared/components/progress/progress.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { ZardSonnerComponent } from '@/shared/components/sonner/sonner.component';
import { ZardTabsImports } from '@/shared/components/tabs/tabs.imports';
import { ZardSeparatorComponent } from '@/shared/components/separator/separator.component';
import { ZardDarkMode, EDarkModes } from '@/shared/services/dark-mode';
import { CardSelectorComponent } from '@/features/calculator/components/card-selector/card-selector.component';
import { PlayingCardComponent } from '@/features/calculator/components/playing-card/playing-card.component';
import { estimateDrawInsight } from '@/core/poker/probability/probability';

type View = 'calculator' | 'learn' | 'about';

@Component({
  selector: 'app-root',
  imports: [DecimalPipe, NgIcon, ZardAccordionImports, ZardAvatarComponent, ZardBadgeComponent, ZardButtonComponent, ZardCardImports, ZardFieldImports, ZardInputComponent, ZardProgressComponent, ZardSelectImports, ZardSeparatorComponent, ZardSonnerComponent, ZardTabsImports, CardSelectorComponent, PlayingCardComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [provideIcons({ lucideCheck, lucideCircleHelp, lucideCode2, lucideInfo, lucideMoon, lucidePlay, lucideRotateCcw, lucideShieldCheck, lucideSigma, lucideSun, lucideX })],
})
export class App {
  protected readonly calculator = inject(CalculatorStateService);
  protected readonly darkMode = inject(ZardDarkMode);
  protected readonly activeView = signal<View>('calculator');
  protected readonly pot = signal(100);
  protected readonly call = signal(25);
  protected readonly communitySlots = computed(() => Array.from({ length: STREET_COMMUNITY_COUNT[this.calculator.street()] }, (_, index) => index));
  protected readonly heroCards = computed(() => this.calculator.heroCards());
  protected readonly potOdds = computed(() => calculatePotOdds(this.pot(), this.call(), this.calculator.result()?.equityPercentage ?? null));
  protected readonly drawInsight = computed(() => estimateDrawInsight(this.calculator.heroCards().filter((card): card is Card => card !== null), this.calculator.activeCommunityCards(), this.calculator.street()));
  protected readonly canCalculate = computed(() => this.heroCards().every(card => card !== null) && this.calculator.activeCommunityCards().length === STREET_COMMUNITY_COUNT[this.calculator.street()]);
  protected readonly categoryLabels = CATEGORY_LABELS;
  protected readonly streetLabels: Record<Street, string> = { preflop: 'Pré-flop', flop: 'Flop', turn: 'Turn', river: 'River' };
  protected readonly EDarkModes = EDarkModes;

  protected setView(view: View): void { this.activeView.set(view); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  protected toggleTheme(): void { this.darkMode.toggleTheme(); }
  protected onStageTabChange(index: number): void { this.calculator.setStreet((['preflop', 'flop', 'turn', 'river'] as const)[index] ?? 'preflop'); }
  protected setHeroCard(index: number, card: Card | null): void { this.calculator.setHeroCard(index, card); }
  protected setCommunityCard(index: number, card: Card | null): void { this.calculator.setCommunityCard(index, card); }
  protected onOpponentsInput(event: Event): void { this.calculator.setOpponents(Number((event.target as HTMLInputElement).value)); }
  protected onPotInput(event: Event): void { this.pot.set(Number((event.target as HTMLInputElement).value) || 0); }
  protected onCallInput(event: Event): void { this.call.set(Number((event.target as HTMLInputElement).value) || 0); }
  protected onPrecisionChange(value: string | string[]): void { if (value === 'quick' || value === 'standard' || value === 'precise') this.calculator.setPrecision(value); }
  protected formatPercent(value: number | null | undefined): string { return `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(value ?? 0)}%`; }
  protected formatCurrency(value: number): string { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 2 }).format(value); }
  protected potOddsFormula(): string { return `${this.formatCurrency(this.call())} ÷ (${this.formatCurrency(this.pot())} + ${this.formatCurrency(this.call())})`; }
  protected categoryBarClass(category: string): string { return `distribution-bar distribution-bar--${category}`; }
  protected card(rank: number, suit: Card['suit']): Card { return { id: `${rank}-${suit}`, rank: rank as Card['rank'], suit }; }
}
