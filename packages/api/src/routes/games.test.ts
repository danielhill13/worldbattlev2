import request from 'supertest';
import { app } from '../index';
import { gameStore } from '../services/GameStore';

describe('Game API', () => {
  // Clear games before each test
  beforeEach(() => {
    gameStore.clear();
  });

  describe('POST /api/games', () => {
    test('should create a new game', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ playerName: 'Alice' })
        .expect(201);

      expect(response.body.gameId).toBeDefined();
      expect(response.body.gameCode).toBeDefined();
      expect(response.body.game).toBeDefined();
      expect(response.body.game.players).toHaveLength(1);
      expect(response.body.game.players[0].name).toBe('Alice');
    });

    test('should reject game creation without player name', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({})
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.code).toBe('MISSING_PLAYER_NAME');
    });

    test('should reject player name longer than 20 characters', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ playerName: 'A'.repeat(21) })
        .expect(400);

      expect(response.body.error.message).toContain('20 characters');
    });

    test('should trim whitespace from player name', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ playerName: '  Alice  ' })
        .expect(201);

      expect(response.body.game.players[0].name).toBe('Alice');
    });
  });

  describe('POST /api/games/:gameId/join', () => {
    let gameId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ playerName: 'Alice' });
      
      gameId = response.body.gameId;
    });

    test('should allow player to join game', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/join`)
        .send({ playerName: 'Bob' })
        .expect(200);

      expect(response.body.game.players).toHaveLength(2);
      expect(response.body.game.players[1].name).toBe('Bob');
    });

    test('should reject joining without player name', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/join`)
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_PLAYER_NAME');
    });

    test('should reject joining with duplicate name', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/join`)
        .send({ playerName: 'Alice' })
        .expect(400);

      expect(response.body.error.message).toContain('already taken');
    });

    test('should reject joining non-existent game', async () => {
      const response = await request(app)
        .post('/api/games/invalid-id/join')
        .send({ playerName: 'Bob' })
        .expect(404);

      expect(response.body.error.message).toContain('not found');
    });

    test('should allow up to 6 players', async () => {
      const players = ['Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
      
      for (const name of players) {
        await request(app)
          .post(`/api/games/${gameId}/join`)
          .send({ playerName: name })
          .expect(200);
      }

      const response = await request(app)
        .get(`/api/games/${gameId}`)
        .expect(200);

      expect(response.body.game.players).toHaveLength(6);
    });

    test('should reject 7th player', async () => {
      const players = ['Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
      
      for (const name of players) {
        await request(app)
          .post(`/api/games/${gameId}/join`)
          .send({ playerName: name });
      }

      const response = await request(app)
        .post(`/api/games/${gameId}/join`)
        .send({ playerName: 'George' })
        .expect(400);

      expect(response.body.error.message).toContain('full');
    });
  });

  describe('POST /api/games/:gameId/start', () => {
    let gameId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ playerName: 'Alice' });
      
      gameId = response.body.gameId;

      await request(app)
        .post(`/api/games/${gameId}/join`)
        .send({ playerName: 'Bob' });
    });

    test('should start game with minimum 2 players', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/start`)
        .send({ playerId: 'player-1' })
        .expect(200);

      expect(response.body.game.phase).toBe('REINFORCE');
      expect(response.body.game.territories).toHaveLength(42);
    });

    test('should reject starting without player ID', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/start`)
        .send({})
        .expect(400);

      expect(response.body.error.code).toBe('MISSING_PLAYER_ID');
    });

    test('should reject starting by non-creator', async () => {
      const response = await request(app)
        .post(`/api/games/${gameId}/start`)
        .send({ playerId: 'player-2' })
        .expect(400);

      expect(response.body.error.message).toContain('creator');
    });

    test('should reject starting with only 1 player', async () => {
      const response = await request(app)
        .post('/api/games')
        .send({ playerName: 'Solo' });

      const soloGameId = response.body.gameId;

      const startResponse = await request(app)
        .post(`/api/games/${soloGameId}/start`)
        .send({ playerId: 'player-1' })
        .expect(400);

      expect(startResponse.body.error.message).toContain('at least 2 players');
    });

    test('should reject starting already started game', async () => {
      await request(app)
        .post(`/api/games/${gameId}/start`)
        .send({ playerId: 'player-1' });

      const response = await request(app)
        .post(`/api/games/${gameId}/start`)
        .send({ playerId: 'player-1' })
        .expect(400);

      expect(response.body.error.message).toContain('already started');
    });
  });

  describe('GET /api/games/:gameId', () => {
    test('should get game state', async () => {
      const createResponse = await request(app)
        .post('/api/games')
        .send({ playerName: 'Alice' });

      const gameId = createResponse.body.gameId;

      const response = await request(app)
        .get(`/api/games/${gameId}`)
        .expect(200);

      expect(response.body.game).toBeDefined();
      expect(response.body.game.gameId).toBe(gameId);
    });

    test('should return 404 for non-existent game', async () => {
      const response = await request(app)
        .get('/api/games/invalid-id')
        .expect(404);

      expect(response.body.error.code).toBe('GAME_NOT_FOUND');
    });
  });

  describe('GET /api/games', () => {
    test('should list all games', async () => {
      await request(app)
        .post('/api/games')
        .send({ playerName: 'Alice' });

      await request(app)
        .post('/api/games')
        .send({ playerName: 'Bob' });

      const response = await request(app)
        .get('/api/games')
        .expect(200);

      expect(response.body.games).toHaveLength(2);
      expect(response.body.games[0].creatorName).toBe('Alice');
      expect(response.body.games[1].creatorName).toBe('Bob');
    });

    test('should return empty array when no games', async () => {
      const response = await request(app)
        .get('/api/games')
        .expect(200);

      expect(response.body.games).toHaveLength(0);
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
