"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameService = exports.GameService = void 0;
const uuid_1 = require("uuid");
const engine_1 = require("@world-battle/engine");
const GameStore_1 = require("./GameStore");
/**
 * Service for managing games
 */
class GameService {
    /**
     * Create a new game
     */
    createGame(playerName) {
        // Validate player name
        if (!playerName || playerName.trim().length === 0) {
            throw new Error('Player name is required');
        }
        if (playerName.length > 20) {
            throw new Error('Player name must be 20 characters or less');
        }
        // Generate unique game ID and code
        const gameId = (0, uuid_1.v4)();
        const gameCode = this.generateGameCode();
        // Create game with single player (not initialized yet)
        // Game will be initialized when started
        const gameState = {
            gameId,
            phase: engine_1.GamePhase.SETUP,
            players: [{
                    id: 'player-1',
                    name: playerName.trim(),
                    color: 'RED',
                    isEliminated: false,
                    cards: []
                }],
            turnOrder: ['player-1'],
            currentPlayerIndex: 0,
            territories: [],
            deck: [],
            currentTurn: null,
            winner: null,
            createdAt: new Date(),
            lastModified: new Date()
        };
        GameStore_1.gameStore.create(gameId, gameState);
        return { gameId, gameCode, gameState };
    }
    /**
     * Join an existing game
     */
    joinGame(gameId, playerName) {
        // Validate player name
        if (!playerName || playerName.trim().length === 0) {
            throw new Error('Player name is required');
        }
        if (playerName.length > 20) {
            throw new Error('Player name must be 20 characters or less');
        }
        // Get game
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        // Check if game already started
        if (game.phase !== engine_1.GamePhase.SETUP) {
            throw new Error('Game has already started');
        }
        // Check if game is full
        if (game.players.length >= 6) {
            throw new Error('Game is full (max 6 players)');
        }
        // Check for duplicate names
        const nameTaken = game.players.some(p => p.name.toLowerCase() === playerName.trim().toLowerCase());
        if (nameTaken) {
            throw new Error('Player name already taken');
        }
        // Add player
        const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'PURPLE'];
        const playerId = `player-${game.players.length + 1}`;
        game.players.push({
            id: playerId,
            name: playerName.trim(),
            color: colors[game.players.length],
            isEliminated: false,
            cards: []
        });
        game.turnOrder.push(playerId);
        game.lastModified = new Date();
        GameStore_1.gameStore.update(gameId, game);
        return game;
    }
    /**
     * Start a game
     */
    startGame(gameId, requestingPlayerId) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        // Check if game already started
        if (game.phase !== engine_1.GamePhase.SETUP) {
            throw new Error('Game has already started');
        }
        // Check if requesting player is the creator
        if (requestingPlayerId !== 'player-1') {
            throw new Error('Only the game creator can start the game');
        }
        // Check minimum players
        if (game.players.length < 2) {
            throw new Error('Need at least 2 players to start');
        }
        // Initialize the game using the engine
        const playerNames = game.players.map((p) => p.name);
        const initializedGame = engine_1.GameInitializer.createGame(gameId, playerNames);
        // Calculate initial reinforcements for first player
        const firstPlayerId = initializedGame.turnOrder[0];
        const reinforcements = engine_1.ReinforcementCalculator.calculateReinforcements(initializedGame, firstPlayerId);
        // Set initial turn state with reinforcements
        initializedGame.currentTurn = {
            playerId: firstPlayerId,
            reinforcementsRemaining: reinforcements,
            conqueredTerritoryThisTurn: false
        };
        // Update stored game
        GameStore_1.gameStore.update(gameId, initializedGame);
        return initializedGame;
    }
    /**
     * Get a game by ID
     */
    getGame(gameId) {
        const game = GameStore_1.gameStore.get(gameId);
        if (!game) {
            throw new Error('Game not found');
        }
        return game;
    }
    /**
     * List all games (for lobby)
     */
    listGames() {
        const games = GameStore_1.gameStore.list();
        return games.map(game => {
            const status = game.phase === engine_1.GamePhase.SETUP
                ? 'waiting'
                : game.phase === engine_1.GamePhase.GAME_OVER
                    ? 'finished'
                    : 'in-progress';
            const currentPlayer = game.currentTurn
                ? game.players.find(p => p.id === game.currentTurn?.playerId)
                : undefined;
            return {
                gameId: game.gameId,
                gameCode: this.getGameCode(game.gameId), // Would need to store this
                creatorName: game.players[0]?.name || 'Unknown',
                playerCount: game.players.length,
                maxPlayers: 6,
                status,
                phase: game.phase,
                currentPlayerName: currentPlayer?.name,
                winner: game.winner ? game.players.find(p => p.id === game.winner)?.name : undefined
            };
        });
    }
    /**
     * Generate a random 4-character game code
     */
    generateGameCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    /**
     * Get game code (placeholder - would need to store mapping)
     */
    getGameCode(gameId) {
        // For MVP, just use first 4 chars of game ID
        return gameId.substring(0, 4).toUpperCase();
    }
}
exports.GameService = GameService;
// Singleton instance
exports.gameService = new GameService();
//# sourceMappingURL=GameService.js.map