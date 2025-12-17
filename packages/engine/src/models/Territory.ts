/**
 * Represents a single territory on the game map
 */
export interface Territory {
  id: string;
  name: string;
  continentId: string;
  adjacentTerritories: string[]; // Array of territory IDs
}

/**
 * Represents a territory's state during gameplay
 */
export interface TerritoryState {
  territoryId: string;
  occupiedBy: string | null; // Player ID or null if unoccupied
  armies: number;
}
