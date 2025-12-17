import { GameState, getTerritoryState } from '../models/GameState';
import { areTerritoriesAdjacent } from '../data/mapData';

/**
 * Result of a single dice roll turn in battle
 */
export interface BattleRollResult {
  attackerDice: number[];
  defenderDice: number[];
  attackerLosses: number;
  defenderLosses: number;
  attackerArmiesRemaining: number;
  defenderArmiesRemaining: number;
  territoryConquered: boolean;
}

/**
 * Result of an attack (single or auto-attack)
 */
export interface AttackResult {
  success: boolean;
  rolls: BattleRollResult[];
  territoryConquered: boolean;
  error?: string;
}

/**
 * Service for resolving battles between territories
 */
export class BattleResolver {
  /**
   * Validate if an attack is legal
   */
  static validateAttack(
    gameState: GameState,
    attackingTerritoryId: string,
    defendingTerritoryId: string,
    attackingPlayerId: string
  ): { valid: boolean; error?: string } {
    // Check if territories exist
    const attackingTerritory = getTerritoryState(gameState, attackingTerritoryId);
    const defendingTerritory = getTerritoryState(gameState, defendingTerritoryId);

    if (!attackingTerritory) {
      return { valid: false, error: 'Attacking territory not found' };
    }

    if (!defendingTerritory) {
      return { valid: false, error: 'Defending territory not found' };
    }

    // Check if attacker owns the attacking territory
    if (attackingTerritory.occupiedBy !== attackingPlayerId) {
      return { valid: false, error: 'You do not own the attacking territory' };
    }

    // Check if attacking own territory
    if (defendingTerritory.occupiedBy === attackingPlayerId) {
      return { valid: false, error: 'Cannot attack your own territory' };
    }

    // Check if territories are adjacent
    if (!areTerritoriesAdjacent(attackingTerritoryId, defendingTerritoryId)) {
      return { valid: false, error: 'Territories are not adjacent' };
    }

    // Check if attacking territory has at least 2 armies
    if (attackingTerritory.armies < 2) {
      return { valid: false, error: 'Attacking territory must have at least 2 armies' };
    }

    return { valid: true };
  }

  /**
   * Perform a single attack roll
   */
  static performAttackRoll(
    gameState: GameState,
    attackingTerritoryId: string,
    defendingTerritoryId: string
  ): BattleRollResult | null {
    const attackingTerritory = getTerritoryState(gameState, attackingTerritoryId);
    const defendingTerritory = getTerritoryState(gameState, defendingTerritoryId);

    if (!attackingTerritory || !defendingTerritory) {
      return null;
    }

    // Determine number of dice
    const attackerDiceCount = this.getAttackerDiceCount(attackingTerritory.armies);
    const defenderDiceCount = this.getDefenderDiceCount(defendingTerritory.armies);

    // Roll dice
    const attackerDice = this.rollDice(attackerDiceCount);
    const defenderDice = this.rollDice(defenderDiceCount);

    // Sort dice in descending order
    const sortedAttackerDice = [...attackerDice].sort((a, b) => b - a);
    const sortedDefenderDice = [...defenderDice].sort((a, b) => b - a);

    // Compare dice and calculate losses
    let attackerLosses = 0;
    let defenderLosses = 0;

    const comparisons = Math.min(sortedAttackerDice.length, sortedDefenderDice.length);

    for (let i = 0; i < comparisons; i++) {
      if (sortedAttackerDice[i] > sortedDefenderDice[i]) {
        defenderLosses++;
      } else {
        // Ties favor defender
        attackerLosses++;
      }
    }

    // Calculate remaining armies
    const attackerArmiesRemaining = attackingTerritory.armies - attackerLosses;
    const defenderArmiesRemaining = defendingTerritory.armies - defenderLosses;

    return {
      attackerDice: sortedAttackerDice,
      defenderDice: sortedDefenderDice,
      attackerLosses,
      defenderLosses,
      attackerArmiesRemaining,
      defenderArmiesRemaining,
      territoryConquered: defenderArmiesRemaining === 0
    };
  }

  /**
   * Execute a single attack
   */
  static executeSingleAttack(
    gameState: GameState,
    attackingTerritoryId: string,
    defendingTerritoryId: string,
    attackingPlayerId: string
  ): AttackResult {
    // Validate attack
    const validation = this.validateAttack(
      gameState,
      attackingTerritoryId,
      defendingTerritoryId,
      attackingPlayerId
    );

    if (!validation.valid) {
      return {
        success: false,
        rolls: [],
        territoryConquered: false,
        error: validation.error
      };
    }

    // Perform attack roll
    const rollResult = this.performAttackRoll(gameState, attackingTerritoryId, defendingTerritoryId);

    if (!rollResult) {
      return {
        success: false,
        rolls: [],
        territoryConquered: false,
        error: 'Failed to perform attack roll'
      };
    }

    // Update game state
    const attackingTerritory = getTerritoryState(gameState, attackingTerritoryId)!;
    const defendingTerritory = getTerritoryState(gameState, defendingTerritoryId)!;

    attackingTerritory.armies = rollResult.attackerArmiesRemaining;
    defendingTerritory.armies = rollResult.defenderArmiesRemaining;

    // If territory conquered, transfer ownership
    if (rollResult.territoryConquered) {
      defendingTerritory.occupiedBy = attackingPlayerId;
      // Move 1 army to conquered territory
      defendingTerritory.armies = 1;
      attackingTerritory.armies -= 1;
    }

    return {
      success: true,
      rolls: [rollResult],
      territoryConquered: rollResult.territoryConquered,
      error: undefined
    };
  }

  /**
   * Execute auto-attack (continue until attacker wins or can't attack anymore)
   */
  static executeAutoAttack(
    gameState: GameState,
    attackingTerritoryId: string,
    defendingTerritoryId: string,
    attackingPlayerId: string
  ): AttackResult {
    // Validate initial attack
    const validation = this.validateAttack(
      gameState,
      attackingTerritoryId,
      defendingTerritoryId,
      attackingPlayerId
    );

    if (!validation.valid) {
      return {
        success: false,
        rolls: [],
        territoryConquered: false,
        error: validation.error
      };
    }

    const rolls: BattleRollResult[] = [];
    let conquered = false;

    // Continue attacking until territory is conquered or attacker can't attack
    while (true) {
      const attackingTerritory = getTerritoryState(gameState, attackingTerritoryId);
      const defendingTerritory = getTerritoryState(gameState, defendingTerritoryId);

      if (!attackingTerritory || !defendingTerritory) {
        break;
      }

      // Stop if attacker has only 1 army left
      if (attackingTerritory.armies < 2) {
        break;
      }

      // Stop if defender has no armies (already conquered)
      if (defendingTerritory.armies === 0) {
        conquered = true;
        break;
      }

      // Perform attack roll
      const rollResult = this.performAttackRoll(gameState, attackingTerritoryId, defendingTerritoryId);

      if (!rollResult) {
        break;
      }

      rolls.push(rollResult);

      // Update armies
      attackingTerritory.armies = rollResult.attackerArmiesRemaining;
      defendingTerritory.armies = rollResult.defenderArmiesRemaining;

      // Check if territory conquered
      if (rollResult.territoryConquered) {
        defendingTerritory.occupiedBy = attackingPlayerId;
        // Move 1 army to conquered territory
        defendingTerritory.armies = 1;
        attackingTerritory.armies -= 1;
        conquered = true;
        break;
      }
    }

    return {
      success: true,
      rolls,
      territoryConquered: conquered,
      error: undefined
    };
  }

  /**
   * Move additional armies to conquered territory
   */
  static moveArmiesAfterConquest(
    gameState: GameState,
    fromTerritoryId: string,
    toTerritoryId: string,
    armyCount: number
  ): { success: boolean; error?: string } {
    const fromTerritory = getTerritoryState(gameState, fromTerritoryId);
    const toTerritory = getTerritoryState(gameState, toTerritoryId);

    if (!fromTerritory || !toTerritory) {
      return { success: false, error: 'Territory not found' };
    }

    // Must belong to same player
    if (fromTerritory.occupiedBy !== toTerritory.occupiedBy) {
      return { success: false, error: 'Territories must belong to same player' };
    }

    // Must leave at least 1 army in source territory
    if (fromTerritory.armies - armyCount < 1) {
      return { success: false, error: 'Must leave at least 1 army in source territory' };
    }

    // Army count must be positive
    if (armyCount < 0) {
      return { success: false, error: 'Army count must be positive' };
    }

    // Move armies
    fromTerritory.armies -= armyCount;
    toTerritory.armies += armyCount;

    return { success: true };
  }

  /**
   * Get number of dice attacker can roll based on army count
   */
  private static getAttackerDiceCount(armyCount: number): number {
    if (armyCount < 2) return 0; // Can't attack
    if (armyCount === 2) return 1;
    if (armyCount === 3) return 2;
    return 3; // 4+ armies
  }

  /**
   * Get number of dice defender can roll based on army count
   */
  private static getDefenderDiceCount(armyCount: number): number {
    if (armyCount < 1) return 0;
    if (armyCount === 1) return 1;
    return 2; // 2+ armies
  }

  /**
   * Roll specified number of 6-sided dice
   */
  private static rollDice(count: number): number[] {
    const dice: number[] = [];
    for (let i = 0; i < count; i++) {
      dice.push(Math.floor(Math.random() * 6) + 1);
    }
    return dice;
  }
}
