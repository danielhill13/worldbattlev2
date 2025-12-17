/**
 * Represents a continent on the game map
 */
export interface Continent {
  id: string;
  name: string;
  territoryIds: string[]; // Array of territory IDs in this continent
  bonusArmies: number; // Bonus armies for controlling entire continent
}
