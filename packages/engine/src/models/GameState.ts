import { Player } from './Player';
import { TerritoryState } from './Territory';
import { Card } from './Card';

/**
 * Game phases
 */
export enum GamePhase {
  SETUP = 'SETUP', // Waiting for players, initial setup
  REINFORCE = 'REINFORCE', // Placing reinforcement armies
  ATTACK = 'ATTACK', // Attack/defend phase
  FORTIFY = 'FORTIFY', // End-of-turn fortification
  GAME_OVER = 'GAME_OVER'
}

/**
 * Complete game state
 */
export interface GameState {
  gameId: string;
  phase: GamePhase;
  players: Player[];
  turnOrder: string[]; // Array of player IDs
  currentPlayerIndex: number;
  territories: TerritoryState[];
  deck: Card[]; // Remaining cards in deck
  currentTurn: {
    playerId: string;
    reinforcementsRemaining: number;
    conqueredTerritoryThisTurn: boolean;
  } | null;
  winner: string | null; // Player ID of winner
  createdAt: Date;
  lastModified: Date;
}

/**
 * Helper to get current player
 */
export function getCurrentPlayer(state: GameState): Player | null {
  if (state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.turnOrder.length) {
    return null;
  }
  const playerId = state.turnOrder[state.currentPlayerIndex];
  return state.players.find(p => p.id === playerId) || null;
}

/**
 * Helper to get territory state by ID
 */
export function getTerritoryState(state: GameState, territoryId: string): TerritoryState | null {
  return state.territories.find(t => t.territoryId === territoryId) || null;
}

/**
 * Helper to get all territories owned by a player
 */
export function getPlayerTerritories(state: GameState, playerId: string): TerritoryState[] {
  return state.territories.filter(t => t.occupiedBy === playerId);
}
