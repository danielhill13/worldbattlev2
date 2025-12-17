import { GameState } from '@world-battle/engine';

/**
 * In-memory game storage
 * For MVP - will replace with database in future
 */
export class GameStore {
  private games: Map<string, GameState> = new Map();

  /**
   * Store a new game
   */
  create(gameId: string, state: GameState): void {
    if (this.games.has(gameId)) {
      throw new Error(`Game ${gameId} already exists`);
    }
    this.games.set(gameId, state);
  }

  /**
   * Get a game by ID
   */
  get(gameId: string): GameState | null {
    return this.games.get(gameId) || null;
  }

  /**
   * Update an existing game
   */
  update(gameId: string, state: GameState): void {
    if (!this.games.has(gameId)) {
      throw new Error(`Game ${gameId} not found`);
    }
    this.games.set(gameId, state);
  }

  /**
   * Delete a game
   */
  delete(gameId: string): void {
    this.games.delete(gameId);
  }

  /**
   * List all games
   */
  list(): GameState[] {
    return Array.from(this.games.values());
  }

  /**
   * Check if game exists
   */
  exists(gameId: string): boolean {
    return this.games.has(gameId);
  }

  /**
   * Get game count
   */
  count(): number {
    return this.games.size;
  }

  /**
   * Clear all games (for testing)
   */
  clear(): void {
    this.games.clear();
  }
}

// Singleton instance
export const gameStore = new GameStore();
