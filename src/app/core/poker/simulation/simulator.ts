import { createDeck, removeCards, shuffle } from '../deck/deck';
import { compareScores, evaluateBestHand } from '../evaluator/evaluator';
import {
  CATEGORY_LABELS,
  Card,
  DistributionEntry,
  HAND_CATEGORIES,
  SimulationConfig,
  SimulationResult,
} from '../models/poker.models';

export type RandomSource = () => number;

export function runSimulation(config: SimulationConfig, onProgress?: (completed: number) => void, random: RandomSource = Math.random): SimulationResult {
  validateSimulationConfig(config);
  const startedAt = Date.now();
  const counts = new Map(HAND_CATEGORIES.map(category => [category, 0]));
  const lossCounts = new Map(HAND_CATEGORIES.map(category => [category, 0]));
  let wins = 0;
  let ties = 0;
  let losses = 0;
  let equity = 0;
  const baseDeck = removeCards(createDeck(), [...config.heroCards, ...config.communityCards]);

  for (let iteration = 1; iteration <= config.iterations; iteration += 1) {
    const draw = shuffle(baseDeck, random);
    const neededBoardCards = 5 - config.communityCards.length;
    const board = [...config.communityCards, ...draw.slice(0, neededBoardCards)];
    let cursor = neededBoardCards;
    const heroScore = evaluateBestHand([...config.heroCards, ...board]);
    counts.set(heroScore.category, (counts.get(heroScore.category) ?? 0) + 1);
    const opponentScores = [];
    for (let opponent = 0; opponent < config.opponents; opponent += 1) {
      const cards = draw.slice(cursor, cursor + 2);
      cursor += 2;
      opponentScores.push(evaluateBestHand([...cards, ...board]));
    }
    const bestOpponent = opponentScores.length > 0 ? opponentScores.reduce((best, current) => compareScores(current, best) > 0 ? current : best) : undefined;
    const comparison = bestOpponent ? compareScores(heroScore, bestOpponent) : 1;
    if (comparison > 0) {
      wins += 1;
      equity += 1;
    } else if (comparison === 0) {
      ties += 1;
      const winners = opponentScores.filter(score => compareScores(score, heroScore) === 0).length + 1;
      equity += 1 / winners;
    } else {
      losses += 1;
      if (bestOpponent) {
        lossCounts.set(bestOpponent.category, (lossCounts.get(bestOpponent.category) ?? 0) + 1);
      }
    }
    if (onProgress && (iteration === config.iterations || iteration % 250 === 0)) {
      onProgress(iteration);
    }
  }

  const percentage = (value: number) => (value / config.iterations) * 100;
  const distribution: DistributionEntry[] = HAND_CATEGORIES.map(category => ({
    category,
    count: counts.get(category) ?? 0,
    percentage: percentage(counts.get(category) ?? 0),
  }));
  const lossDistribution: DistributionEntry[] = HAND_CATEGORIES.map(category => ({
    category,
    count: lossCounts.get(category) ?? 0,
    percentage: losses === 0 ? 0 : ((lossCounts.get(category) ?? 0) / losses) * 100,
  }));
  return {
    iterations: config.iterations,
    wins,
    ties,
    losses,
    winPercentage: percentage(wins),
    tiePercentage: percentage(ties),
    lossPercentage: percentage(losses),
    equityPercentage: percentage(equity),
    distribution,
    lossDistribution,
    elapsedMs: Date.now() - startedAt,
  };
}

function validateSimulationConfig(config: SimulationConfig): void {
  if (config.heroCards.length !== 2) {
    throw new Error('Selecione exatamente duas cartas particulares.');
  }
  if (![0, 3, 4, 5].includes(config.communityCards.length)) {
    throw new Error('A mesa deve ter 0, 3, 4 ou 5 cartas comunitárias.');
  }
  if (config.opponents < 1 || config.opponents > 9) {
    throw new Error('O número de adversários deve estar entre 1 e 9.');
  }
  if (config.iterations < 1) {
    throw new Error('A simulação precisa de pelo menos uma iteração.');
  }
  const ids = [...config.heroCards, ...config.communityCards].map(card => card.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error('A mesma carta não pode aparecer mais de uma vez.');
  }
  const unknownCards = 2 * config.opponents + (5 - config.communityCards.length);
  if (unknownCards > 52 - ids.length) {
    throw new Error('Não há cartas suficientes para distribuir esta configuração.');
  }
}
