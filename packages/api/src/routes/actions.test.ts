import request from 'supertest';
import { app } from '../index';
import { gameStore } from '../services/GameStore';
import { CardType, areTerritoriesAdjacent } from '@world-battle/engine';

describe('Reinforcement Actions API', () => {
  let gameId: string;
  let player1Id: string;
  let player2Id: string;

  beforeEach(async () => {
    gameStore.clear();

    // Create and start a game
    const createResponse = await request(app)
      .post('/api/games')
      .send({ playerName: 'Alice' });

    gameId = createResponse.body.gameId;

    await request(app)
      .post(`/api/games/${gameId}/join`)
      .send({ playerName: 'Bob' });

    const startResponse = await request(app)
      .post(`/api/games/${gameId}/start`)
      .send({ playerId: 'player-1' });

    // Get player IDs from started game
    const game = startResponse.body.game;
    player1Id = game.turnOrder[0];
    player2Id = game.turnOrder[1];
  });

  describe('GET /api/games/:gameId/reinforcements', () => {
    test('should get reinforcement info for current player', async () => {
      const response = await request(app)
        .get(`/api/games/${gameId}/reinforcements?playerId=${player1Id}`)
        .expect(200);

      expect(response.body.territoryBonus).toBeGreaterThanOrEqual(3);
      expect(response.body.total).toBeGreaterThanOrEqual(3);
      expect(response.body.reinforcementsRemaining).toBeGreaterThanOrEqual(3);
      expect(response.body.controlledContinents).toBeDefined();
      expect(response.body.canTradeCards).toBe(false);
      expect(response.body.mustTradeCards).toBe(false);
    });

    test('should reject getting info without player ID', async () => {
      const response = await request(app)
        .get(`/api/games/${gameId}/reinforcements`)
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_PLAYER_ID');
    });

    test('should reject getting info when not your turn', async () => {
      const response = await request(app)
        .get(`/api/games/${gameId}/reinforcements?playerId=${player2Id}`)
        .expect(409);

      expect(response.body.error.message).toContain('Not your turn');
    });
  });

  describe('POST /api/games/:gameId/place-reinforcements', () => {
    test('should place reinforcements on owned territory', async () => {
      // Get game state to find a territory owned by player1
      const gameResponse = await request(app)
        .get(`/api/games/${gameId}`)
        .expect(200);

      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);

      const response = await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [
            { territoryId: ownedTerritory.territoryId, armies: 2 }
          ]
        })
        .expect(200);

      // Check that armies were placed
      const updatedTerritory = response.body.game.territories.find(
        (t: any) => t.territoryId === ownedTerritory.territoryId
      );
      expect(updatedTerritory.armies).toBe(ownedTerritory.armies + 2);

      // Check reinforcements were deducted
      expect(response.body.game.currentTurn.reinforcementsRemaining).toBeLessThan(
        game.currentTurn.reinforcementsRemaining
      );
    });

    test('should place all reinforcements across multiple territories', async () => {
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      
      const ownedTerritories = game.territories.filter((t: any) => t.occupiedBy === player1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      const response = await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [
            { territoryId: ownedTerritories[0].territoryId, armies: Math.floor(reinforcements / 2) },
            { territoryId: ownedTerritories[1].territoryId, armies: Math.ceil(reinforcements / 2) }
          ]
        })
        .expect(200);

      expect(response.body.game.currentTurn.reinforcementsRemaining).toBe(0);
    });

    test('should reject placing on non-owned territory', async () => {
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      
      const enemyTerritory = game.territories.find((t: any) => t.occupiedBy === player2Id);

      const response = await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [
            { territoryId: enemyTerritory.territoryId, armies: 1 }
          ]
        })
        .expect(400);

      expect(response.body.error.message).toContain('do not own');
    });

    test('should reject placing more armies than available', async () => {
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);

      const response = await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [
            { territoryId: ownedTerritory.territoryId, armies: 999 }
          ]
        })
        .expect(400);

      expect(response.body.error.message).toContain('Not enough reinforcements');
    });

    test('should reject placing when not your turn', async () => {
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const territory = game.territories.find((t: any) => t.occupiedBy === player2Id);

      const response = await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player2Id,
          placements: [
            { territoryId: territory.territoryId, armies: 1 }
          ]
        })
        .expect(409);

      expect(response.body.error.message).toContain('Not your turn');
    });

    test('should reject placing without placements array', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_PLACEMENTS');
    });
  });

  describe('POST /api/games/:gameId/trade-cards', () => {
    test('should reject trading when player has no cards', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/trade-cards`)
        .send({
          playerId: player1Id,
          cardIds: ['card-1', 'card-2', 'card-3']
        })
        .expect(404);

      expect(response.body.error.message).toContain('not found');
    });

    test('should reject trading less than 3 cards', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/trade-cards`)
        .send({
          playerId: player1Id,
          cardIds: ['card-1', 'card-2']
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_CARD_IDS');
    });

    test('should reject trading when not your turn', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/trade-cards`)
        .send({
          playerId: player2Id,
          cardIds: ['card-1', 'card-2', 'card-3']
        })
        .expect(409);

      expect(response.body.error.message).toContain('Not your turn');
    });
  });

  describe('POST /api/games/:gameId/end-reinforcement', () => {
    test('should reject ending reinforcement with armies remaining', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player1Id })
        .expect(409);

      expect(response.body.error.message).toContain('Must place all reinforcements');
    });

    test('should end reinforcement phase when all armies placed', async () => {
      // First, place all reinforcements
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [
            { territoryId: ownedTerritory.territoryId, armies: reinforcements }
          ]
        });

      // Now end reinforcement phase
      const response = await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player1Id })
        .expect(200);

      expect(response.body.game.phase).toBe('ATTACK');
    });

    test('should reject ending when not your turn', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player2Id })
        .expect(409);

      expect(response.body.error.message).toContain('Not your turn');
    });
  });

  describe('POST /api/games/:gameId/attack', () => {
    beforeEach(async () => {
      // Move to attack phase
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [{ territoryId: ownedTerritory.territoryId, armies: reinforcements }]
        });

      await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player1Id });
    });

    test('should reject attack with missing parameters', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/attack`)
        .send({ playerId: player1Id })
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_PARAMETERS');
    });

    test('should reject attack when not your turn', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/attack`)
        .send({
          playerId: player2Id,
          from: 'alaska',
          to: 'kamchatka'
        })
        .expect(409);

      expect(response.body.error.message).toContain('Not your turn');
    });

    test('should execute valid attack', async () => {
      // Find adjacent territories where player1 can attack player2
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;

      // Find an owned territory with 2+ armies
      const ownedTerritory = game.territories.find(
        (t: any) => t.occupiedBy === player1Id && t.armies >= 2
      );

      if (!ownedTerritory) {
        // Skip test if no valid attack territory
        return;
      }

      // Find adjacent enemy territory
      const adjacentEnemy = game.territories.find(
        (t: any) => t.occupiedBy === player2Id && 
        areTerritoriesAdjacent(ownedTerritory.territoryId, t.territoryId)
      );

      if (!adjacentEnemy) {
        // Skip test if no adjacent enemy
        return;
      }

      const response = await request(app)
        .post(`/api/games/${gameId}/attack`)
        .send({
          playerId: player1Id,
          from: ownedTerritory.territoryId,
          to: adjacentEnemy.territoryId
        })
        .expect(200);

      expect(response.body.attackResult).toBeDefined();
      expect(response.body.attackResult.success).toBe(true);
      expect(response.body.attackResult.rolls).toBeDefined();
    });
  });

  describe('POST /api/games/:gameId/auto-attack', () => {
    beforeEach(async () => {
      // Move to attack phase
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [{ territoryId: ownedTerritory.territoryId, armies: reinforcements }]
        });

      await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player1Id });
    });

    test('should execute auto-attack', async () => {
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;

      const ownedTerritory = game.territories.find(
        (t: any) => t.occupiedBy === player1Id && t.armies >= 2
      );

      if (!ownedTerritory) return;

      const adjacentEnemy = game.territories.find(
        (t: any) => t.occupiedBy === player2Id && 
        areTerritoriesAdjacent(ownedTerritory.territoryId, t.territoryId)
      );

      if (!adjacentEnemy) return;

      const response = await request(app)
        .post(`/api/games/${gameId}/auto-attack`)
        .send({
          playerId: player1Id,
          from: ownedTerritory.territoryId,
          to: adjacentEnemy.territoryId
        })
        .expect(200);

      expect(response.body.attackResult).toBeDefined();
      expect(response.body.attackResult.rolls.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/games/:gameId/move-armies', () => {
    beforeEach(async () => {
      // Move to attack phase
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [{ territoryId: ownedTerritory.territoryId, armies: reinforcements }]
        });

      await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player1Id });
    });

    test('should reject move with missing parameters', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/move-armies`)
        .send({ playerId: player1Id })
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_PARAMETERS');
    });

    test('should reject invalid armies value', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/move-armies`)
        .send({
          playerId: player1Id,
          from: 'alaska',
          to: 'alberta',
          armies: 'invalid'
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_ARMIES');
    });
  });

  describe('POST /api/games/:gameId/end-attack', () => {
    beforeEach(async () => {
      // Move to attack phase
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [{ territoryId: ownedTerritory.territoryId, armies: reinforcements }]
        });

      await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player1Id });
    });

    test('should end attack phase', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/end-attack`)
        .send({ playerId: player1Id })
        .expect(200);

      expect(response.body.game.phase).toBe('FORTIFY');
    });

    test('should reject ending when not your turn', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/end-attack`)
        .send({ playerId: player2Id })
        .expect(409);

      expect(response.body.error.message).toContain('Not your turn');
    });
  });

  describe('POST /api/games/:gameId/fortify', () => {
    beforeEach(async () => {
      // Move to fortify phase
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [{ territoryId: ownedTerritory.territoryId, armies: reinforcements }]
        });

      await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player1Id });

      await request(app)
        .post(`/api/games/${gameId}/end-attack`)
        .send({ playerId: player1Id });
    });

    test('should reject fortify with missing parameters', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/fortify`)
        .send({ playerId: player1Id })
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_PARAMETERS');
    });

    test('should reject invalid armies value', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/fortify`)
        .send({
          playerId: player1Id,
          from: 'alaska',
          to: 'alberta',
          armies: 0
        })
        .expect(400);

      expect(response.body.error.code).toBe('INVALID_ARMIES');
    });

    test('should fortify between connected owned territories', async () => {
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;

      // Find two connected territories owned by player1
      const ownedTerritories = game.territories.filter(
        (t: any) => t.occupiedBy === player1Id && t.armies >= 2
      );

      if (ownedTerritories.length < 2) {
        // Skip test if not enough territories
        return;
      }

      // Find adjacent owned territories
      let fromTerritory = null;
      let toTerritory = null;

      for (const territory of ownedTerritories) {
        const adjacent = ownedTerritories.find(
          (t: any) => t.territoryId !== territory.territoryId &&
          areTerritoriesAdjacent(territory.territoryId, t.territoryId)
        );
        if (adjacent) {
          fromTerritory = territory;
          toTerritory = adjacent;
          break;
        }
      }

      if (!fromTerritory || !toTerritory) {
        // Skip if no adjacent owned territories
        return;
      }

      const armiesToMove = 1;
      const initialFromArmies = fromTerritory.armies;
      const initialToArmies = toTerritory.armies;

      const response = await request(app)
        .post(`/api/games/${gameId}/fortify`)
        .send({
          playerId: player1Id,
          from: fromTerritory.territoryId,
          to: toTerritory.territoryId,
          armies: armiesToMove
        })
        .expect(200);

      const updatedFromTerritory = response.body.game.territories.find(
        (t: any) => t.territoryId === fromTerritory.territoryId
      );
      const updatedToTerritory = response.body.game.territories.find(
        (t: any) => t.territoryId === toTerritory.territoryId
      );

      expect(updatedFromTerritory.armies).toBe(initialFromArmies - armiesToMove);
      expect(updatedToTerritory.armies).toBe(initialToArmies + armiesToMove);
    });

    test('should reject fortify when not your turn', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/fortify`)
        .send({
          playerId: player2Id,
          from: 'alaska',
          to: 'alberta',
          armies: 1
        })
        .expect(409);

      expect(response.body.error.message).toContain('Not your turn');
    });
  });

  describe('POST /api/games/:gameId/end-turn', () => {
    beforeEach(async () => {
      // Move to fortify phase
      const gameResponse = await request(app).get(`/api/games/${gameId}`);
      const game = gameResponse.body.game;
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === player1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      await request(app)
        .post(`/api/games/${gameId}/place-reinforcements`)
        .send({
          playerId: player1Id,
          placements: [{ territoryId: ownedTerritory.territoryId, armies: reinforcements }]
        });

      await request(app)
        .post(`/api/games/${gameId}/end-reinforcement`)
        .send({ playerId: player1Id });

      await request(app)
        .post(`/api/games/${gameId}/end-attack`)
        .send({ playerId: player1Id });
    });

    test('should end turn and progress to next player', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/end-turn`)
        .send({ playerId: player1Id })
        .expect(200);

      expect(response.body.game.phase).toBe('REINFORCE');
      expect(response.body.game.currentTurn.playerId).toBe(player2Id);
      expect(response.body.game.currentTurn.reinforcementsRemaining).toBeGreaterThan(0);
      expect(response.body.game.currentTurn.conqueredTerritoryThisTurn).toBe(false);
    });

    test('should reject ending turn when not your turn', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/end-turn`)
        .send({ playerId: player2Id })
        .expect(409);

      expect(response.body.error.message).toContain('Not your turn');
    });

    test('should allow ending turn from attack phase', async () => {
      // Start fresh game and get to attack phase
      gameStore.clear();
      
      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerName: 'Alice' });

      const newGameId = createResponse.body.gameId;

      await request(app)
        .post(`/api/games/${newGameId}/join`)
        .send({ playerName: 'Bob' });

      await request(app)
        .post(`/api/games/${newGameId}/start`)
        .send({ playerId: 'player-1' });

      // Get to attack phase
      const gameResponse = await request(app).get(`/api/games/${newGameId}`);
      const game = gameResponse.body.game;
      const newPlayer1Id = game.turnOrder[0];
      const ownedTerritory = game.territories.find((t: any) => t.occupiedBy === newPlayer1Id);
      const reinforcements = game.currentTurn.reinforcementsRemaining;

      await request(app)
        .post(`/api/games/${newGameId}/place-reinforcements`)
        .send({
          playerId: newPlayer1Id,
          placements: [{ territoryId: ownedTerritory.territoryId, armies: reinforcements }]
        });

      await request(app)
        .post(`/api/games/${newGameId}/end-reinforcement`)
        .send({ playerId: newPlayer1Id });

      // Now end turn from attack phase (without going to fortify)
      const response = await request(app)
        .post(`/api/games/${newGameId}/end-turn`)
        .send({ playerId: newPlayer1Id })
        .expect(200);

      expect(response.body.game.phase).toBe('REINFORCE');
    });
  });
});
