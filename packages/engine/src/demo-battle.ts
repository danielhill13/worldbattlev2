#!/usr/bin/env node

/**
 * CLI tool to demonstrate battle mechanics
 * Usage: npm run demo:battle
 */

import { GameInitializer } from './services/GameInitializer';
import { BattleResolver } from './services/BattleResolver';

console.log('\n⚔️  WORLD BATTLE - ATTACK/DEFEND DEMO\n');
console.log('='.repeat(60));

// Demo 1: Dice count rules
console.log('\n🎲 DEMO 1: Dice Count Rules');
console.log('='.repeat(60));

const diceExamples = [
  { armies: 1, attacker: 0, defender: 1, note: 'Cannot attack with 1 army' },
  { armies: 2, attacker: 1, defender: 1, note: 'Minimum attack force' },
  { armies: 3, attacker: 2, defender: 2, note: '' },
  { armies: 4, attacker: 3, defender: 2, note: 'Max attacker dice' },
  { armies: 10, attacker: 3, defender: 2, note: 'Still max 3 attacker dice' }
];

console.log('\n  Attacker Dice:');
diceExamples.forEach(ex => {
  if (ex.attacker > 0) {
    console.log(`    ${ex.armies} armies → ${ex.attacker} dice ${ex.note ? `(${ex.note})` : ''}`);
  } else {
    console.log(`    ${ex.armies} army → Cannot attack ⚠️`);
  }
});

console.log('\n  Defender Dice:');
console.log('    1 army → 1 die');
console.log('    2+ armies → 2 dice');

// Demo 2: Battle validation
console.log('\n\n🛡️  DEMO 2: Attack Validation');
console.log('='.repeat(60));

const game = GameInitializer.createGame('demo', ['Alice', 'Bob']);

// Setup territories for demos
game.territories.forEach(t => {
  if (t.territoryId === 'alaska') {
    t.occupiedBy = 'player-1';
    t.armies = 5;
  } else if (t.territoryId === 'kamchatka') {
    t.occupiedBy = 'player-2';
    t.armies = 3;
  } else if (t.territoryId === 'alberta') {
    t.occupiedBy = 'player-1';
    t.armies = 1;
  } else if (t.territoryId === 'argentina') {
    t.occupiedBy = 'player-2';
    t.armies = 5;
  }
});

console.log('\n  Setup:');
console.log('    Alaska (Alice): 5 armies');
console.log('    Kamchatka (Bob): 3 armies');
console.log('    Alberta (Alice): 1 army');
console.log('    Argentina (Bob): 5 armies');

console.log('\n  Validation Tests:');

// Valid attack
let validation = BattleResolver.validateAttack(game, 'alaska', 'kamchatka', 'player-1');
console.log(`    ✅ Alaska → Kamchatka: ${validation.valid ? 'VALID' : 'INVALID'}`);

// Attack with 1 army
validation = BattleResolver.validateAttack(game, 'alberta', 'ontario', 'player-1');
console.log(`    ❌ Alberta (1 army) → Ontario: ${validation.error}`);

// Non-adjacent
validation = BattleResolver.validateAttack(game, 'alaska', 'argentina', 'player-1');
console.log(`    ❌ Alaska → Argentina: ${validation.error}`);

// Own territory
const ontarioTerritory = game.territories.find(t => t.territoryId === 'ontario')!;
ontarioTerritory.occupiedBy = 'player-1';
ontarioTerritory.armies = 3;
validation = BattleResolver.validateAttack(game, 'alaska', 'ontario', 'player-1');
console.log(`    ❌ Alaska → Ontario (own): ${validation.error}`);

// Demo 3: Single attack examples
console.log('\n\n⚔️  DEMO 3: Single Attack Examples');
console.log('='.repeat(60));

for (let i = 1; i <= 3; i++) {
  // Reset territories
  const alaskaTerritory = game.territories.find(t => t.territoryId === 'alaska')!;
  const kamchatkaTerritory = game.territories.find(t => t.territoryId === 'kamchatka')!;
  alaskaTerritory.armies = 8;
  kamchatkaTerritory.armies = 4;
  kamchatkaTerritory.occupiedBy = 'player-2';

  const result = BattleResolver.executeSingleAttack(game, 'alaska', 'kamchatka', 'player-1');

  if (result.success && result.rolls.length > 0) {
    const roll = result.rolls[0];
    console.log(`\n  Attack ${i}:`);
    console.log(`    Attacker rolled: [${roll.attackerDice.join(', ')}]`);
    console.log(`    Defender rolled: [${roll.defenderDice.join(', ')}]`);
    console.log(`    Attacker losses: ${roll.attackerLosses}`);
    console.log(`    Defender losses: ${roll.defenderLosses}`);
    console.log(`    Armies remaining: Attacker ${roll.attackerArmiesRemaining}, Defender ${roll.defenderArmiesRemaining}`);
    
    if (roll.territoryConquered) {
      console.log(`    🎉 Territory CONQUERED!`);
    }
  }
}

// Demo 4: Tie scenarios
console.log('\n\n🤝 DEMO 4: Tie Scenarios (Defender Wins)');
console.log('='.repeat(60));

console.log('\n  When dice are tied, the defender wins that comparison.');
console.log('  Example scenarios:');
console.log('    Attacker [6] vs Defender [6] → Defender wins ✓');
console.log('    Attacker [5, 3] vs Defender [5, 2] → Split (Def wins high, Att wins low)');
console.log('    Attacker [4, 4] vs Defender [4, 4] → Defender wins both ✓');

// Demo 5: Auto-attack
console.log('\n\n🔄 DEMO 5: Auto-Attack');
console.log('='.repeat(60));

// Reset for auto-attack demo
const alaskaTerritory = game.territories.find(t => t.territoryId === 'alaska')!;
const kamchatkaTerritory = game.territories.find(t => t.territoryId === 'kamchatka')!;
alaskaTerritory.armies = 20;
kamchatkaTerritory.armies = 5;
kamchatkaTerritory.occupiedBy = 'player-2';

console.log('\n  Starting Position:');
console.log(`    Alaska (Alice): ${alaskaTerritory.armies} armies`);
console.log(`    Kamchatka (Bob): ${kamchatkaTerritory.armies} armies`);

const autoResult = BattleResolver.executeAutoAttack(game, 'alaska', 'kamchatka', 'player-1');

console.log(`\n  Auto-Attack Results:`);
console.log(`    Total rolls: ${autoResult.rolls.length}`);
console.log(`    Territory conquered: ${autoResult.territoryConquered ? 'YES 🎉' : 'NO'}`);

if (autoResult.territoryConquered) {
  console.log(`    Final armies - Alaska: ${alaskaTerritory.armies}, Kamchatka: ${kamchatkaTerritory.armies}`);
  console.log(`    Kamchatka now controlled by: Alice ✓`);
} else {
  console.log(`    Final armies - Alaska: ${alaskaTerritory.armies}, Kamchatka: ${kamchatkaTerritory.armies}`);
}

// Demo 6: Moving armies after conquest
console.log('\n\n🚚 DEMO 6: Moving Armies After Conquest');
console.log('='.repeat(60));

// Setup: Both territories owned by player-1
alaskaTerritory.occupiedBy = 'player-1';
alaskaTerritory.armies = 10;
kamchatkaTerritory.occupiedBy = 'player-1';
kamchatkaTerritory.armies = 1; // Just conquered (minimum 1)

console.log('\n  After conquering Kamchatka:');
console.log(`    Alaska: 10 armies`);
console.log(`    Kamchatka: 1 army (just conquered)`);

console.log('\n  Moving 5 additional armies to Kamchatka...');
const moveResult = BattleResolver.moveArmiesAfterConquest(game, 'alaska', 'kamchatka', 5);

if (moveResult.success) {
  console.log(`    ✅ Success!`);
  console.log(`    Alaska: ${alaskaTerritory.armies} armies`);
  console.log(`    Kamchatka: ${kamchatkaTerritory.armies} armies`);
}

console.log('\n  Attempting to move too many armies (leaving 0)...');
alaskaTerritory.armies = 3;
const failResult = BattleResolver.moveArmiesAfterConquest(game, 'alaska', 'kamchatka', 3);
console.log(`    ❌ ${failResult.error}`);

// Demo 7: Battle outcomes summary
console.log('\n\n📊 DEMO 7: Understanding Battle Outcomes');
console.log('='.repeat(60));

console.log('\n  Dice Comparison Rules:');
console.log('    1. Sort all dice highest to lowest');
console.log('    2. Compare highest attacker die to highest defender die');
console.log('    3. If both rolled 2+ dice, compare second-highest as well');
console.log('    4. Higher die wins; ties favor defender');
console.log('    5. Loser of each comparison loses 1 army');

console.log('\n  Examples:');
console.log('    Attacker [6, 4, 2] vs Defender [5, 3]');
console.log('      → Compare 6 vs 5: Attacker wins (Defender -1)');
console.log('      → Compare 4 vs 3: Attacker wins (Defender -1)');
console.log('      → Result: Defender loses 2 armies');

console.log('\n    Attacker [6, 3] vs Defender [6, 5]');
console.log('      → Compare 6 vs 6: Tie (Attacker -1)');
console.log('      → Compare 3 vs 5: Defender wins (Attacker -1)');
console.log('      → Result: Attacker loses 2 armies');

console.log('\n    Attacker [4, 3, 1] vs Defender [3, 2]');
console.log('      → Compare 4 vs 3: Attacker wins (Defender -1)');
console.log('      → Compare 3 vs 2: Attacker wins (Defender -1)');
console.log('      → Result: Defender loses 2 armies');

console.log('\n' + '='.repeat(60));
console.log('✅ Battle mechanics demo complete!');
console.log('='.repeat(60) + '\n');
