import { GameState, GamePhase } from '../models/GameState';
import { Player, ArmyColor } from '../models/Player';
import { TerritoryState } from '../models/Territory';
import { TERRITORIES } from '../data/mapData';
import { DeckManager } from './DeckManager';

/**
 * Initial army counts by player count (Classic Risk)
 */
const INITIAL_ARMIES: Record<number, number> = {
  2: 40,
  3: 35,
  4: 30,
  5: 25,
  6: 20
};

/**
 * Available army colors
 */
const ARMY_COLORS = [
  ArmyColor.RED,
  ArmyColor.BLUE,
  ArmyColor.GREEN,
  ArmyColor.YELLOW,
  ArmyColor.BLACK,
  ArmyColor.PURPLE
];

/**
 * Service for initializing new games
 */
export class GameInitializer {
  /**
   * Create a new game with the specified players
   */
  static createGame(gameId: string, playerNames: string[]): GameState {
    // Validate player count
    if (playerNames.length < 2 || playerNames.length > 6) {
      throw new Error('Game must have 2-6 players');
    }

    // Validate unique player names
    const uniqueNames = new Set(playerNames);
    if (uniqueNames.size !== playerNames.length) {
      throw new Error('Player names must be unique');
    }

    // Create players with colors
    const players = this.createPlayers(playerNames);

    // Randomize turn order
    const turnOrder = this.shuffleArray(players.map(p => p.id));

    // Distribute territories
    const territories = this.distributeTerritoriesRoundRobin(players, turnOrder);

    // Calculate and place remaining armies
    const initialArmyCount = INITIAL_ARMIES[playerNames.length];
    this.distributeRemainingArmies(territories, players, initialArmyCount);

    // Create deck
    const deck = DeckManager.createDeck();

    const gameState: GameState = {
      gameId,
      phase: GamePhase.REINFORCE,
      players,
      turnOrder,
      currentPlayerIndex: 0,
      territories,
      deck,
      currentTurn: {
        playerId: turnOrder[0],
        reinforcementsRemaining: 0, // Will be calculated at start of turn
        conqueredTerritoryThisTurn: false
      },
      winner: null,
      createdAt: new Date(),
      lastModified: new Date()
    };

    return gameState;
  }

  /**
   * Create player objects with assigned colors
   */
  private static createPlayers(playerNames: string[]): Player[] {
    return playerNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name,
      color: ARMY_COLORS[index],
      isEliminated: false,
      cards: []
    }));
  }

  /**
   * Distribute territories round-robin style
   * Each player gets one territory at a time in turn order
   * Extra territories go to players in turn order
   */
  private static distributeTerritoriesRoundRobin(
    players: Player[],
    turnOrder: string[]
  ): TerritoryState[] {
    const shuffledTerritories = this.shuffleArray([...TERRITORIES]);
    const territoryStates: TerritoryState[] = [];

    let playerIndex = 0;

    for (const territory of shuffledTerritories) {
      const playerId = turnOrder[playerIndex % turnOrder.length];
      
      territoryStates.push({
        territoryId: territory.id,
        occupiedBy: playerId,
        armies: 1 // Start with 1 army on each territory
      });

      playerIndex++;
    }

    return territoryStates;
  }

  /**
   * Distribute remaining armies randomly across player territories
   * Total armies per player = INITIAL_ARMIES[playerCount]
   * Already placed 1 army on each territory, so distribute the rest
   */
  private static distributeRemainingArmies(
    territories: TerritoryState[],
    players: Player[],
    totalArmiesPerPlayer: number
  ): void {
    for (const player of players) {
      // Get all territories owned by this player
      const playerTerritories = territories.filter(t => t.occupiedBy === player.id);
      
      // Calculate remaining armies (total - 1 per territory already placed)
      const remainingArmies = totalArmiesPerPlayer - playerTerritories.length;

      // Randomly distribute remaining armies
      for (let i = 0; i < remainingArmies; i++) {
        const randomIndex = Math.floor(Math.random() * playerTerritories.length);
        playerTerritories[randomIndex].armies++;
      }
    }
  }

  /**
   * Fisher-Yates shuffle algorithm
   */
  private static shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
