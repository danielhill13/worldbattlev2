import { GameState, GamePhase } from '@world-battle/engine';
/**
 * Game metadata for lobby
 */
export interface GameInfo {
    gameId: string;
    gameCode: string;
    creatorName: string;
    playerCount: number;
    maxPlayers: number;
    status: 'waiting' | 'in-progress' | 'finished';
    phase: GamePhase;
    currentPlayerName?: string;
    winner?: string;
}
/**
 * Service for managing games
 */
export declare class GameService {
    /**
     * Create a new game
     */
    createGame(playerName: string): {
        gameId: string;
        gameCode: string;
        gameState: GameState;
    };
    /**
     * Join an existing game
     */
    joinGame(gameId: string, playerName: string): GameState;
    /**
     * Start a game
     */
    startGame(gameId: string, requestingPlayerId: string): GameState;
    /**
     * Get a game by ID
     */
    getGame(gameId: string): GameState;
    /**
     * List all games (for lobby)
     */
    listGames(): GameInfo[];
    /**
     * Generate a random 4-character game code
     */
    private generateGameCode;
    /**
     * Get game code (placeholder - would need to store mapping)
     */
    private getGameCode;
}
export declare const gameService: GameService;
