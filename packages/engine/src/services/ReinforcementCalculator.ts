import { GameState, getPlayerTerritories } from '../models/GameState';
import { CONTINENTS } from '../data/mapData';

/**
 * Service for calculating reinforcement armies at the start of a turn
 */
export class ReinforcementCalculator {
  /**
   * Calculate total reinforcement armies for a player
   * Includes: territory count bonus + continent bonuses
   */
  static calculateReinforcements(gameState: GameState, playerId: string): number {
    const territoryBonus = this.calculateTerritoryBonus(gameState, playerId);
    const continentBonus = this.calculateContinentBonus(gameState, playerId);
    
    return territoryBonus + continentBonus;
  }

  /**
   * Calculate bonus armies from territories held
   * Formula: territories / 3, rounded down, minimum 3
   */
  static calculateTerritoryBonus(gameState: GameState, playerId: string): number {
    const territories = getPlayerTerritories(gameState, playerId);
    const territoryCount = territories.length;
    
    const bonus = Math.floor(territoryCount / 3);
    
    // Minimum 3 armies
    return Math.max(bonus, 3);
  }

  /**
   * Calculate bonus armies from continents controlled
   * A player controls a continent if they own ALL territories in it
   */
  static calculateContinentBonus(gameState: GameState, playerId: string): number {
    let totalBonus = 0;

    for (const continent of CONTINENTS) {
      if (this.playerControlsContinent(gameState, playerId, continent.id)) {
        totalBonus += continent.bonusArmies;
      }
    }

    return totalBonus;
  }

  /**
   * Check if a player controls all territories in a continent
   */
  static playerControlsContinent(
    gameState: GameState,
    playerId: string,
    continentId: string
  ): boolean {
    const continent = CONTINENTS.find(c => c.id === continentId);
    if (!continent) return false;

    // Check if player owns all territories in the continent
    for (const territoryId of continent.territoryIds) {
      const territory = gameState.territories.find(t => t.territoryId === territoryId);
      if (!territory || territory.occupiedBy !== playerId) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get list of continents controlled by a player
   */
  static getControlledContinents(gameState: GameState, playerId: string): string[] {
    return CONTINENTS
      .filter(continent => this.playerControlsContinent(gameState, playerId, continent.id))
      .map(continent => continent.id);
  }

  /**
   * Get detailed reinforcement breakdown for display
   */
  static getReinforcementBreakdown(gameState: GameState, playerId: string): {
    territoryBonus: number;
    continentBonus: number;
    controlledContinents: Array<{ id: string; name: string; bonus: number }>;
    total: number;
  } {
    const territoryBonus = this.calculateTerritoryBonus(gameState, playerId);
    const continentBonus = this.calculateContinentBonus(gameState, playerId);
    
    const controlledContinents = CONTINENTS
      .filter(continent => this.playerControlsContinent(gameState, playerId, continent.id))
      .map(continent => ({
        id: continent.id,
        name: continent.name,
        bonus: continent.bonusArmies
      }));

    return {
      territoryBonus,
      continentBonus,
      controlledContinents,
      total: territoryBonus + continentBonus
    };
  }
}
