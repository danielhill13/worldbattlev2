import { Card } from './Card';

/**
 * Available army colors for players
 */
export enum ArmyColor {
  RED = 'RED',
  BLUE = 'BLUE',
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  BLACK = 'BLACK',
  PURPLE = 'PURPLE'
}

/**
 * Represents a player in the game
 */
export interface Player {
  id: string;
  name: string;
  color: ArmyColor;
  isEliminated: boolean;
  cards: Card[];
}

/**
 * Player state during their turn
 */
export interface PlayerTurnState {
  playerId: string;
  reinforcementsRemaining: number;
  conqueredTerritoryThisTurn: boolean; // For card eligibility
}
