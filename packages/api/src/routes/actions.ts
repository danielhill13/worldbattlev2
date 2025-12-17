import { Router, Request, Response } from 'express';
import { gameActionService } from '../services/GameActionService';

export const actionRoutes = Router();

/**
 * Trade in cards for armies
 * POST /api/games/:gameId/trade-cards
 */
actionRoutes.post('/:gameId/trade-cards', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { playerId, cardIds } = req.body;

    if (!playerId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PLAYER_ID',
          message: 'Player ID is required'
        }
      });
    }

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length < 3) {
      return res.status(400).json({
        error: {
          code: 'INVALID_CARD_IDS',
          message: 'Must provide at least 3 card IDs'
        }
      });
    }

    const gameState = gameActionService.tradeCards(gameId, playerId, cardIds);

    res.status(200).json({
      game: gameState
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to trade cards';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'TRADE_CARDS_FAILED',
        message
      }
    });
  }
});

/**
 * Place reinforcement armies
 * POST /api/games/:gameId/place-reinforcements
 */
actionRoutes.post('/:gameId/place-reinforcements', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { playerId, placements } = req.body;

    if (!playerId) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PLAYER_ID',
          message: 'Player ID is required'
        }
      });
    }

    if (!placements || !Array.isArray(placements)) {
      return res.status(400).json({
        error: {
          code: 'INVALID_PLACEMENTS',
          message: 'Placements must be an array'
        }
      });
    }

    const gameState = gameActionService.placeReinforcements(gameId, playerId, placements);

    res.status(200).json({
      game: gameState
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to place reinforcements';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'PLACE_REINFORCEMENTS_FAILED',
        message
      }
    });
  }
});

/**
 * Get reinforcement information
 * GET /api/games/:gameId/reinforcements
 */
actionRoutes.get('/:gameId/reinforcements', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { playerId } = req.query;

    if (!playerId || typeof playerId !== 'string') {
      return res.status(400).json({
        error: {
          code: 'MISSING_PLAYER_ID',
          message: 'Player ID is required as query parameter'
        }
      });
    }

    const info = gameActionService.getReinforcementInfo(gameId, playerId);

    res.status(200).json(info);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to get reinforcement info';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'GET_REINFORCEMENTS_FAILED',
        message
      }
    });
  }
});

/**
 * End reinforcement phase
 * POST /api/games/:gameId/end-reinforcement
 */
actionRoutes.post('/:gameId/end-reinforcement', (req: Request, res: Response) => {
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

    const gameState = gameActionService.endReinforcementPhase(gameId, playerId);

    res.status(200).json({
      game: gameState
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to end reinforcement phase';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') || message.includes('Must place') || message.includes('Must trade') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'END_REINFORCEMENT_FAILED',
        message
      }
    });
  }
});

/**
 * Execute a single attack
 * POST /api/games/:gameId/attack
 */
actionRoutes.post('/:gameId/attack', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { playerId, from, to } = req.body;

    if (!playerId || !from || !to) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'playerId, from, and to are required'
        }
      });
    }

    const result = gameActionService.attack(gameId, playerId, from, to);

    res.status(200).json({
      game: result.game,
      attackResult: result.attackResult
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Attack failed';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'ATTACK_FAILED',
        message
      }
    });
  }
});

/**
 * Execute auto-attack (attack until conquest or can't attack)
 * POST /api/games/:gameId/auto-attack
 */
actionRoutes.post('/:gameId/auto-attack', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { playerId, from, to } = req.body;

    if (!playerId || !from || !to) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'playerId, from, and to are required'
        }
      });
    }

    const result = gameActionService.autoAttack(gameId, playerId, from, to);

    res.status(200).json({
      game: result.game,
      attackResult: result.attackResult
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Auto-attack failed';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'AUTO_ATTACK_FAILED',
        message
      }
    });
  }
});

/**
 * Move armies after conquest
 * POST /api/games/:gameId/move-armies
 */
actionRoutes.post('/:gameId/move-armies', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { playerId, from, to, armies } = req.body;

    if (!playerId || !from || !to || armies === undefined) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'playerId, from, to, and armies are required'
        }
      });
    }

    if (typeof armies !== 'number' || armies < 0) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ARMIES',
          message: 'armies must be a non-negative number'
        }
      });
    }

    const gameState = gameActionService.moveArmies(gameId, playerId, from, to, armies);

    res.status(200).json({
      game: gameState
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to move armies';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'MOVE_ARMIES_FAILED',
        message
      }
    });
  }
});

/**
 * End attack phase
 * POST /api/games/:gameId/end-attack
 */
actionRoutes.post('/:gameId/end-attack', (req: Request, res: Response) => {
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

    const gameState = gameActionService.endAttackPhase(gameId, playerId);

    res.status(200).json({
      game: gameState
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to end attack phase';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'END_ATTACK_FAILED',
        message
      }
    });
  }
});

/**
 * Fortify - move armies between owned territories
 * POST /api/games/:gameId/fortify
 */
actionRoutes.post('/:gameId/fortify', (req: Request, res: Response) => {
  try {
    const { gameId } = req.params;
    const { playerId, from, to, armies } = req.body;

    if (!playerId || !from || !to || armies === undefined) {
      return res.status(400).json({
        error: {
          code: 'MISSING_PARAMETERS',
          message: 'playerId, from, to, and armies are required'
        }
      });
    }

    if (typeof armies !== 'number' || armies < 1) {
      return res.status(400).json({
        error: {
          code: 'INVALID_ARMIES',
          message: 'armies must be a positive number'
        }
      });
    }

    const gameState = gameActionService.fortify(gameId, playerId, from, to, armies);

    res.status(200).json({
      game: gameState
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fortify';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'FORTIFY_FAILED',
        message
      }
    });
  }
});

/**
 * End turn and progress to next player
 * POST /api/games/:gameId/end-turn
 */
actionRoutes.post('/:gameId/end-turn', (req: Request, res: Response) => {
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

    const gameState = gameActionService.endTurn(gameId, playerId);

    res.status(200).json({
      game: gameState,
      message: `Turn ended. Now ${gameState.currentTurn?.playerId}'s turn.`
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to end turn';
    const statusCode = message.includes('not found') ? 404 
      : message.includes('Not your turn') || message.includes('Invalid phase') ? 409 
      : 400;

    res.status(statusCode).json({
      error: {
        code: 'END_TURN_FAILED',
        message
      }
    });
  }
});
