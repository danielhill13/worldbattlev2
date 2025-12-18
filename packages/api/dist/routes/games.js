"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameRoutes = void 0;
const express_1 = require("express");
const GameService_1 = require("../services/GameService");
exports.gameRoutes = (0, express_1.Router)();
/**
 * Create a new game
 * POST /api/games
 */
exports.gameRoutes.post('/', (req, res) => {
    try {
        const { playerName } = req.body;
        if (!playerName) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_PLAYER_NAME',
                    message: 'Player name is required'
                }
            });
        }
        const { gameId, gameCode, gameState } = GameService_1.gameService.createGame(playerName);
        res.status(201).json({
            gameId,
            gameCode,
            game: gameState
        });
    }
    catch (error) {
        res.status(400).json({
            error: {
                code: 'CREATE_GAME_FAILED',
                message: error instanceof Error ? error.message : 'Failed to create game'
            }
        });
    }
});
/**
 * Join an existing game
 * POST /api/games/:gameId/join
 */
exports.gameRoutes.post('/:gameId/join', (req, res) => {
    try {
        const { gameId } = req.params;
        const { playerName } = req.body;
        if (!playerName) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_PLAYER_NAME',
                    message: 'Player name is required'
                }
            });
        }
        const gameState = GameService_1.gameService.joinGame(gameId, playerName);
        res.status(200).json({
            game: gameState
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to join game';
        const statusCode = message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            error: {
                code: 'JOIN_GAME_FAILED',
                message
            }
        });
    }
});
/**
 * Start a game
 * POST /api/games/:gameId/start
 */
exports.gameRoutes.post('/:gameId/start', (req, res) => {
    try {
        const { gameId } = req.params;
        const { playerId } = req.body;
        if (!playerId) {
            return res.status(400).json({
                error: {
                    code: 'MISSING_PLAYER_ID',
                    message: 'Player ID is required'
                }
            });
        }
        const gameState = GameService_1.gameService.startGame(gameId, playerId);
        res.status(200).json({
            game: gameState
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to start game';
        const statusCode = message.includes('not found') ? 404 : 400;
        res.status(statusCode).json({
            error: {
                code: 'START_GAME_FAILED',
                message
            }
        });
    }
});
/**
 * Get game state
 * GET /api/games/:gameId
 */
exports.gameRoutes.get('/:gameId', (req, res) => {
    try {
        const { gameId } = req.params;
        const gameState = GameService_1.gameService.getGame(gameId);
        res.status(200).json({
            game: gameState
        });
    }
    catch (error) {
        res.status(404).json({
            error: {
                code: 'GAME_NOT_FOUND',
                message: error instanceof Error ? error.message : 'Game not found'
            }
        });
    }
});
/**
 * List all games
 * GET /api/games
 */
exports.gameRoutes.get('/', (req, res) => {
    try {
        const games = GameService_1.gameService.listGames();
        res.status(200).json({
            games
        });
    }
    catch (error) {
        res.status(500).json({
            error: {
                code: 'LIST_GAMES_FAILED',
                message: error instanceof Error ? error.message : 'Failed to list games'
            }
        });
    }
});
//# sourceMappingURL=games.js.map