# Phase 2: API Layer - Development Plan

## Overview
Build an Express REST API that wraps the game engine and manages game sessions.

## Tech Stack
- **Express** - REST API framework
- **TypeScript** - Type safety
- **In-memory storage** - Game sessions (no database yet)
- **CORS** - Cross-origin support
- **Jest + Supertest** - API testing

## Checkpoints

### Checkpoint 2.1: Server Setup & Game Session Management
**What to build:**
- Express server with CORS
- In-memory game storage
- POST /api/games - Create new game
- POST /api/games/:gameId/join - Join game
- GET /api/games/:gameId - Get game state
- POST /api/games/:gameId/start - Start game
- GET /api/games - List all games

**Validation:**
- Server runs on localhost:3000
- Can create games with curl/Postman
- Games stored in memory
- Returns proper error codes

---

### Checkpoint 2.2: Reinforcement Phase Actions
**What to build:**
- POST /api/games/:gameId/trade-cards - Trade cards for armies
- POST /api/games/:gameId/place-reinforcements - Place armies
- GET /api/games/:gameId/reinforcements - Get reinforcement info

**Validation:**
- Can trade cards via API
- Can place reinforcements
- Validates current player
- Validates phase

---

### Checkpoint 2.3: Attack Phase Actions
**What to build:**
- POST /api/games/:gameId/attack - Execute single attack
- POST /api/games/:gameId/auto-attack - Execute auto-attack
- POST /api/games/:gameId/move-armies - Move armies after conquest
- POST /api/games/:gameId/end-attack - End attack phase

**Validation:**
- Can attack via API
- Battle results returned
- Territory conquest handled
- Phase transitions work

---

### Checkpoint 2.4: Fortify Phase & Turn Management
**What to build:**
- POST /api/games/:gameId/fortify - Move armies end of turn
- POST /api/games/:gameId/end-turn - End turn explicitly
- Automatic turn progression
- Player elimination handling
- Win condition checking

**Validation:**
- Complete turn cycle works
- Next player takes turn
- Game ends when one player wins
- All endpoints tested

---

## Architecture

### Storage Layer
```typescript
// In-memory game storage
class GameStore {
  private games: Map<string, GameState>;
  
  create(gameId: string, state: GameState): void
  get(gameId: string): GameState | null
  update(gameId: string, state: GameState): void
  delete(gameId: string): void
  list(): GameState[]
}
```

### Service Layer
```typescript
// Business logic that uses engine
class GameService {
  createGame(playerName: string): GameState
  joinGame(gameId: string, playerName: string): GameState
  startGame(gameId: string): GameState
  
  tradeCards(gameId: string, playerId: string, cardIds: string[]): GameState
  placeReinforcements(gameId: string, playerId: string, placements: Placement[]): GameState
  
  attack(gameId: string, playerId: string, from: string, to: string): AttackResult
  autoAttack(gameId: string, playerId: string, from: string, to: string): AttackResult
  
  fortify(gameId: string, playerId: string, from: string, to: string, armies: number): GameState
  endTurn(gameId: string, playerId: string): GameState
}
```

### Route Layer
```typescript
// Express routes
router.post('/games', createGameHandler);
router.post('/games/:gameId/join', joinGameHandler);
router.get('/games/:gameId', getGameHandler);
router.post('/games/:gameId/start', startGameHandler);
// ... etc
```

---

## Testing Strategy

### Unit Tests
- Service layer methods
- Validation logic
- Error handling

### Integration Tests
- Full HTTP requests using supertest
- Complete game flows
- Error scenarios

---

## Error Handling

### HTTP Status Codes
- 200 OK - Success
- 201 Created - Game created
- 400 Bad Request - Validation error
- 404 Not Found - Game/resource not found
- 409 Conflict - Invalid action (wrong phase, not your turn)

### Error Response Format
```json
{
  "error": {
    "code": "INVALID_ACTION",
    "message": "Not your turn",
    "details": {}
  }
}
```

---

## Development Flow

For each checkpoint:
1. Build service layer (business logic)
2. Build route handlers
3. Write tests
4. Run local validation
5. Test with curl/Postman
6. Sign off → next checkpoint

---

## Local Testing

```bash
# Start dev server
npm run dev

# Run tests
npm test

# Test with curl
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Alice"}'
```

---

Ready to start with Checkpoint 2.1: Server Setup & Game Session Management!
