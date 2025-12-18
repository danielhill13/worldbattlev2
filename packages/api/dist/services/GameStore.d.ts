import { GameState } from '@world-battle/engine';
/**
 * In-memory game storage
 * For MVP - will replace with database in future
 */
export declare class GameStore {
    private games;
    /**
     * Store a new game
     */
    create(gameId: string, state: GameState): void;
    /**
     * Get a game by ID
     */
    get(gameId: string): GameState | null;
    /**
     * Update an existing game
     */
    update(gameId: string, state: GameState): void;
    /**
     * Delete a game
     */
    delete(gameId: string): void;
    /**
     * List all games
     */
    list(): GameState[];
    /**
     * Check if game exists
     */
    exists(gameId: string): boolean;
    /**
     * Get game count
     */
    count(): number;
    /**
     * Clear all games (for testing)
     */
    clear(): void;
}
export declare const gameStore: GameStore;
