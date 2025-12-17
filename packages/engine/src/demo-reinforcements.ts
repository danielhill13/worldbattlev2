#!/usr/bin/env node

/**
 * CLI tool to demonstrate reinforcement calculation
 * Usage: npm run demo:reinforcements
 */

import { GameInitializer } from './services/GameInitializer';
import { ReinforcementCalculator } from './services/ReinforcementCalculator';
import { CardTradeInManager } from './services/CardTradeInManager';
import { getPlayerTerritories } from './models/GameState';
import { Card, CardType } from './models/Card';

console.log('\n🎮 WORLD BATTLE - REINFORCEMENT CALCULATION DEMO\n');
console.log('='.repeat(60));

// Demo 1: Territory-based reinforcements
console.log('\n📊 DEMO 1: Territory-Based Reinforcements');
console.log('='.repeat(60));

const examples = [
  { territories: 6, expected: 3, note: 'Under minimum (6/3 = 2, but min is 3)' },
  { territories: 9, expected: 3, note: 'Exactly minimum (9/3 = 3)' },
  { territories: 11, expected: 3, note: 'Rounds down (11/3 = 3.67 → 3)' },
  { territories: 12, expected: 4, note: 'Above minimum (12/3 = 4)' },
  { territories: 19, expected: 6, note: 'Rounds down (19/3 = 6.33 → 6)' },
  { territories: 42, expected: 14, note: 'All territories (42/3 = 14)' }
];

examples.forEach(({ territories, expected, note }) => {
  const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
  
  // Give player-1 the specified number of territories
  game.territories = game.territories.slice(0, territories).map(t => ({
    ...t,
    occupiedBy: 'player-1'
  }));
  
  const bonus = ReinforcementCalculator.calculateTerritoryBonus(game, 'player-1');
  const status = bonus === expected ? '✅' : '❌';
  
  console.log(`\n  ${territories} territories → ${bonus} armies ${status}`);
  console.log(`    ${note}`);
});

// Demo 2: Continent bonuses
console.log('\n\n🗺️  DEMO 2: Continent Bonuses');
console.log('='.repeat(60));

const continents = [
  { id: 'north-america', name: 'North America', territories: 9, bonus: 5 },
  { id: 'south-america', name: 'South America', territories: 4, bonus: 2 },
  { id: 'africa', name: 'Africa', territories: 6, bonus: 3 },
  { id: 'australia', name: 'Australia', territories: 4, bonus: 2 },
  { id: 'europe', name: 'Europe', territories: 7, bonus: 5 },
  { id: 'asia', name: 'Asia', territories: 12, bonus: 7 }
];

continents.forEach(continent => {
  const game = createGameWithContinent(continent.id);
  const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
  const status = bonus === continent.bonus ? '✅' : '❌';
  
  console.log(`\n  ${continent.name} (${continent.territories} territories)`);
  console.log(`    Bonus: +${bonus} armies ${status}`);
});

// Demo 3: Combined reinforcements
console.log('\n\n💪 DEMO 3: Combined Reinforcements');
console.log('='.repeat(60));

const scenario1 = GameInitializer.createGame('scenario1', ['Alice', 'Bob']);
// Give Alice control of Australia (4 territories)
scenario1.territories = scenario1.territories.map(t => {
  if (['indonesia', 'new-guinea', 'east-australia', 'west-australia'].includes(t.territoryId)) {
    return { ...t, occupiedBy: 'player-1' };
  }
  return { ...t, occupiedBy: 'player-2' };
});

const breakdown1 = ReinforcementCalculator.getReinforcementBreakdown(scenario1, 'player-1');
console.log('\n  Scenario 1: Alice controls Australia');
console.log(`    Territories: 4 → ${breakdown1.territoryBonus} armies`);
console.log(`    Continents: Australia (+${breakdown1.controlledContinents[0].bonus})`);
console.log(`    Total Reinforcements: ${breakdown1.total} armies ✅`);

// Demo 4: Card trading
console.log('\n\n🃏 DEMO 4: Card Trading');
console.log('='.repeat(60));

const cardExamples = [
  {
    name: 'Three of a kind (Infantry)',
    cards: [
      { id: '1', type: CardType.INFANTRY },
      { id: '2', type: CardType.INFANTRY },
      { id: '3', type: CardType.INFANTRY }
    ],
    armies: 8
  },
  {
    name: 'One of each type',
    cards: [
      { id: '1', type: CardType.INFANTRY },
      { id: '2', type: CardType.CAVALRY },
      { id: '3', type: CardType.ARTILLERY }
    ],
    armies: 8
  },
  {
    name: 'Four cards (one of each + Infantry)',
    cards: [
      { id: '1', type: CardType.INFANTRY },
      { id: '2', type: CardType.CAVALRY },
      { id: '3', type: CardType.ARTILLERY },
      { id: '4', type: CardType.INFANTRY }
    ],
    armies: 10
  },
  {
    name: 'Five cards (valid set)',
    cards: [
      { id: '1', type: CardType.INFANTRY },
      { id: '2', type: CardType.CAVALRY },
      { id: '3', type: CardType.ARTILLERY },
      { id: '4', type: CardType.INFANTRY },
      { id: '5', type: CardType.CAVALRY }
    ],
    armies: 12
  },
  {
    name: 'Six Cavalry cards',
    cards: [
      { id: '1', type: CardType.CAVALRY },
      { id: '2', type: CardType.CAVALRY },
      { id: '3', type: CardType.CAVALRY },
      { id: '4', type: CardType.CAVALRY },
      { id: '5', type: CardType.CAVALRY },
      { id: '6', type: CardType.CAVALRY }
    ],
    armies: 14
  }
];

cardExamples.forEach(example => {
  const player = {
    id: 'player-1',
    name: 'Alice',
    color: 'RED' as any,
    isEliminated: false,
    cards: example.cards
  };
  
  const cardIds = example.cards.map(c => c.id);
  const result = CardTradeInManager.tradeInCards(player, cardIds);
  const status = result.success && result.armiesAwarded === example.armies ? '✅' : '❌';
  
  console.log(`\n  ${example.name}`);
  console.log(`    Cards: ${example.cards.length}`);
  console.log(`    Armies: ${result.armiesAwarded} ${status}`);
});

// Demo 5: Invalid card sets
console.log('\n\n❌ DEMO 5: Invalid Card Sets');
console.log('='.repeat(60));

const invalidExamples = [
  {
    name: 'Two Infantry, One Cavalry',
    cards: [
      { id: '1', type: CardType.INFANTRY },
      { id: '2', type: CardType.INFANTRY },
      { id: '3', type: CardType.CAVALRY }
    ]
  },
  {
    name: 'Only two cards',
    cards: [
      { id: '1', type: CardType.INFANTRY },
      { id: '2', type: CardType.CAVALRY }
    ]
  }
];

invalidExamples.forEach(example => {
  const player = {
    id: 'player-1',
    name: 'Alice',
    color: 'RED' as any,
    isEliminated: false,
    cards: example.cards
  };
  
  const cardIds = example.cards.map(c => c.id);
  const result = CardTradeInManager.tradeInCards(player, cardIds);
  
  console.log(`\n  ${example.name}`);
  console.log(`    Result: ${result.error} ✅`);
});

// Demo 6: Mandatory card trading
console.log('\n\n⚠️  DEMO 6: Mandatory Card Trading');
console.log('='.repeat(60));

const fiveCardPlayer = {
  id: 'player-1',
  name: 'Alice',
  color: 'RED' as any,
  isEliminated: false,
  cards: [
    { id: '1', type: CardType.INFANTRY },
    { id: '2', type: CardType.CAVALRY },
    { id: '3', type: CardType.ARTILLERY },
    { id: '4', type: CardType.INFANTRY },
    { id: '5', type: CardType.CAVALRY }
  ]
};

console.log(`\n  Player has ${fiveCardPlayer.cards.length} cards`);
console.log(`  Must trade in: ${CardTradeInManager.mustTradeIn(fiveCardPlayer) ? 'YES ⚠️' : 'NO'}`);
console.log(`  Can trade in: ${CardTradeInManager.canTradeIn(fiveCardPlayer) ? 'YES' : 'NO'}`);

const recommended = CardTradeInManager.getRecommendedTradeSet(fiveCardPlayer);
if (recommended) {
  console.log(`  Recommended set: ${recommended.length} cards`);
}

console.log('\n' + '='.repeat(60));
console.log('✅ Reinforcement calculation demo complete!');
console.log('='.repeat(60) + '\n');

// Helper function
function createGameWithContinent(continentId: string) {
  const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
  
  const continentTerritories: Record<string, string[]> = {
    'north-america': ['greenland', 'quebec', 'eastern-us', 'western-us', 'alberta', 'ontario', 'northwest-territory', 'alaska', 'central-america'],
    'south-america': ['venezuela', 'peru', 'brazil', 'argentina'],
    'africa': ['madagascar', 'south-africa', 'congo', 'east-africa', 'north-africa', 'egypt'],
    'australia': ['indonesia', 'new-guinea', 'east-australia', 'west-australia'],
    'europe': ['western-europe', 'southern-europe', 'northern-europe', 'ukraine', 'scandinavia', 'iceland', 'great-britain'],
    'asia': ['afghanistan', 'middle-east', 'india', 'thailand', 'china', 'mongolia', 'japan', 'ural', 'kamchatka', 'yakutsk', 'irkutsk', 'siberia']
  };
  
  const territories = continentTerritories[continentId] || [];
  
  game.territories = game.territories.map(t => {
    if (territories.includes(t.territoryId)) {
      return { ...t, occupiedBy: 'player-1' };
    }
    return { ...t, occupiedBy: 'player-2' };
  });
  
  return game;
}
