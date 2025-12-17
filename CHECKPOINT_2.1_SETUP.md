# Checkpoint 2.1 - Server Setup & Game Session Management

## ✅ What Was Built

### Infrastructure
- Express REST API server with TypeScript
- CORS enabled for cross-origin requests
- In-memory game storage (GameStore)
- Request logging middleware
- Error handling

### Services
- **GameStore**: In-memory storage for game sessions
  - CRUD operations for games
  - Singleton pattern for easy access
  
- **GameService**: Business logic layer
  - Create games
  - Join games (2-6 players)
  - Start games (territory distribution)
  - List games
  - Validation logic

### API Endpoints

#### POST /api/games
Create a new game
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Alice"}'
```

**Response:**
```json
{
  "gameId": "uuid",
  "gameCode": "XY7K",
  "game": { ... }
}
```

#### POST /api/games/:gameId/join
Join an existing game
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/join \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Bob"}'
```

#### POST /api/games/:gameId/start
Start a game (creator only, min 2 players)
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/start \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

#### GET /api/games/:gameId
Get current game state
```bash
curl http://localhost:3000/api/games/{gameId}
```

#### GET /api/games
List all games
```bash
curl http://localhost:3000/api/games
```

#### GET /health
Health check endpoint
```bash
curl http://localhost:3000/health
```

## Test Results

✅ **20 tests passing**

```
POST /api/games
  ✓ should create a new game
  ✓ should reject game creation without player name
  ✓ should reject player name longer than 20 characters
  ✓ should trim whitespace from player name

POST /api/games/:gameId/join
  ✓ should allow player to join game
  ✓ should reject joining without player name
  ✓ should reject joining with duplicate name
  ✓ should reject joining non-existent game
  ✓ should allow up to 6 players
  ✓ should reject 7th player

POST /api/games/:gameId/start
  ✓ should start game with minimum 2 players
  ✓ should reject starting without player ID
  ✓ should reject starting by non-creator
  ✓ should reject starting with only 1 player
  ✓ should reject starting already started game

GET /api/games/:gameId
  ✓ should get game state
  ✓ should return 404 for non-existent game

GET /api/games
  ✓ should list all games
  ✓ should return empty array when no games

GET /health
  ✓ should return health status
```

## Validation Rules

### Create Game
- Player name required
- Player name max 20 characters
- Whitespace trimmed

### Join Game
- Player name required
- Player name max 20 characters
- Game must exist
- Game must not be started
- Max 6 players
- No duplicate names (case-insensitive)

### Start Game
- Min 2 players required
- Only creator (player-1) can start
- Game must not already be started
- Initializes territories and armies using engine

## Local Testing

### Start Dev Server
```bash
cd packages/api
npm run dev
```

Server runs on http://localhost:3000

### Run Tests
```bash
npm test
```

### Manual Testing with curl

1. **Create a game:**
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Alice"}'
```

Copy the `gameId` from response

2. **Join the game:**
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/join \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Bob"}'
```

3. **Start the game:**
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/start \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

4. **Get game state:**
```bash
curl http://localhost:3000/api/games/{gameId}
```

You should see 42 territories distributed among players!

## Error Handling

### HTTP Status Codes
- **200 OK**: Success
- **201 Created**: Game created
- **400 Bad Request**: Validation error
- **404 Not Found**: Game/resource not found
- **500 Internal Server Error**: Unexpected error

### Error Response Format
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message"
  }
}
```

## Architecture

```
packages/api/
├── src/
│   ├── index.ts                 # Express server setup
│   ├── routes/
│   │   └── games.ts             # Game endpoints
│   ├── services/
│   │   ├── GameStore.ts         # In-memory storage
│   │   └── GameService.ts       # Business logic
│   └── tests/
│       └── games.test.ts        # Integration tests
├── package.json
├── tsconfig.json
└── jest.config.js
```

## Files Created

- `src/index.ts` - Express server
- `src/routes/games.ts` - Game endpoints (5 routes)
- `src/services/GameStore.ts` - In-memory storage
- `src/services/GameService.ts` - Business logic
- `src/routes/games.test.ts` - 20 integration tests

## Sign-Off Checklist

- [ ] All 20 tests pass
- [ ] Server starts on http://localhost:3000
- [ ] Can create game via curl
- [ ] Can join game via curl
- [ ] Can start game via curl
- [ ] Can get game state via curl
- [ ] Error responses are correct

---

## Next: Checkpoint 2.2 - Reinforcement Phase Actions

Will implement:
- Trade cards endpoint
- Place reinforcements endpoint
- Get reinforcement info endpoint
- Phase validation
- Turn validation

Ready to proceed? ✅
