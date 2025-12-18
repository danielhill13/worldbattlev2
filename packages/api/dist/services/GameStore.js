"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameStore = exports.GameStore = void 0;
/**
 * In-memory game storage
 * For MVP - will replace with database in future
 */
class GameStore {
    constructor() {
        this.games = new Map();
    }
    /**
     * Store a new game
     */
    create(gameId, state) {
        if (this.games.has(gameId)) {
            throw new Error(`Game ${gameId} already exists`);
        }
        this.games.set(gameId, state);
    }
    /**
     * Get a game by ID
     */
    get(gameId) {
        return this.games.get(gameId) || null;
    }
    /**
     * Update an existing game
     */
    update(gameId, state) {
        if (!this.games.has(gameId)) {
            throw new Error(`Game ${gameId} not found`);
        }
        this.games.set(gameId, state);
    }
    /**
     * Delete a game
     */
    delete(gameId) {
        this.games.delete(gameId);
    }
    /**
     * List all games
     */
    list() {
        return Array.from(this.games.values());
    }
    /**
     * Check if game exists
     */
    exists(gameId) {
        return this.games.has(gameId);
    }
    /**
     * Get game count
     */
    count() {
        return this.games.size;
    }
    /**
     * Clear all games (for testing)
     */
    clear() {
        this.games.clear();
    }
}
exports.GameStore = GameStore;
// Singleton instance
exports.gameStore = new GameStore();
//# sourceMappingURL=GameStore.js.map