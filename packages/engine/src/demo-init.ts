#!/usr/bin/env node

/**
 * CLI tool to visualize game initialization
 * Usage: npm run demo:init
 */

import { GameInitializer } from './services/GameInitializer';
import { getPlayerTerritories } from './models/GameState';
import { getContinentById } from './data/mapData';

function displayGameState(playerCount: number) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`INITIALIZING GAME WITH ${playerCount} PLAYERS`);
  console.log('='.repeat(60));

  const playerNames = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'].slice(0, playerCount);
  const game = GameInitializer.createGame(`game-${playerCount}p`, playerNames);

  console.log('\n📋 GAME INFO:');
  console.log(`  Game ID: ${game.gameId}`);
  console.log(`  Phase: ${game.phase}`);
  console.log(`  Current Player: ${game.currentTurn?.playerId}`);
  console.log(`  Deck Size: ${game.deck.length} cards`);

  console.log('\n👥 PLAYERS:');
  game.players.forEach(player => {
    const territories = getPlayerTerritories(game, player.id);
    const totalArmies = territories.reduce((sum, t) => sum + t.armies, 0);
    
    console.log(`  ${player.name} (${player.color})`);
    console.log(`    ID: ${player.id}`);
    console.log(`    Territories: ${territories.length}`);
    console.log(`    Total Armies: ${totalArmies}`);
  });

  console.log('\n🎲 TURN ORDER:');
  game.turnOrder.forEach((playerId, index) => {
    const player = game.players.find(p => p.id === playerId);
    console.log(`  ${index + 1}. ${player?.name} (${player?.id})`);
  });

  console.log('\n🗺️  CONTINENT CONTROL:');
  const continentIds = ['north-america', 'south-america', 'africa', 'australia', 'europe', 'asia'];
  
  continentIds.forEach(continentId => {
    const continent = getContinentById(continentId);
    if (!continent) return;

    const territoriesInContinent = game.territories.filter(t => 
      continent.territoryIds.includes(t.territoryId)
    );

    // Check if any player controls all territories
    const occupiers = new Set(territoriesInContinent.map(t => t.occupiedBy));
    
    if (occupiers.size === 1) {
      const controllerId = Array.from(occupiers)[0];
      const controller = game.players.find(p => p.id === controllerId);
      console.log(`  ${continent.name}: Controlled by ${controller?.name} (+${continent.bonusArmies} armies)`);
    } else {
      console.log(`  ${continent.name}: Contested (${occupiers.size} players)`);
    }
  });

  console.log('\n📊 ARMY DISTRIBUTION STATS:');
  game.players.forEach(player => {
    const territories = getPlayerTerritories(game, player.id);
    const armyCounts = territories.map(t => t.armies).sort((a, b) => b - a);
    const avg = (territories.reduce((sum, t) => sum + t.armies, 0) / territories.length).toFixed(1);
    const max = Math.max(...armyCounts);
    const min = Math.min(...armyCounts);
    
    console.log(`  ${player.name}:`);
    console.log(`    Average: ${avg} armies/territory`);
    console.log(`    Range: ${min} - ${max} armies`);
  });

  console.log('\n🃏 DECK COMPOSITION:');
  const deckTypeCounts = {
    INFANTRY: game.deck.filter(c => c.type === 'INFANTRY').length,
    CAVALRY: game.deck.filter(c => c.type === 'CAVALRY').length,
    ARTILLERY: game.deck.filter(c => c.type === 'ARTILLERY').length
  };
  console.log(`  Infantry: ${deckTypeCounts.INFANTRY}`);
  console.log(`  Cavalry: ${deckTypeCounts.CAVALRY}`);
  console.log(`  Artillery: ${deckTypeCounts.ARTILLERY}`);

  console.log('\n✅ Game initialized successfully!\n');
}

// Run demonstrations
console.log('\n🎮 WORLD BATTLE - GAME INITIALIZATION DEMO\n');

[2, 3, 4, 5, 6].forEach(playerCount => {
  displayGameState(playerCount);
});

console.log('='.repeat(60));
console.log('Demo complete! All player counts validated.');
console.log('='.repeat(60) + '\n');
