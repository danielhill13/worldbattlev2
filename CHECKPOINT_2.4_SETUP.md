# Checkpoint 2.4 - Fortify Phase & Turn Management

## ✅ What Was Built

### Services
- **GameActionService Extensions**: Turn cycle completion
  - Fortify armies between owned territories
  - End turn and progress to next player
  - Skip eliminated players
  - Initialize new turn with reinforcements
  - Territory connectivity validation (BFS pathfinding)

### API Endpoints (2 New Routes)

#### POST /api/games/:gameId/fortify
Move armies between owned territories
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/fortify \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "from": "alaska",
    "to": "alberta",
    "armies": 3
  }'
```

**Requirements:**
- Must be player's turn
- Must be in FORTIFY phase
- Must own both territories
- Territories must be connected through owned territories
- Must move at least 1 army
- Must leave at least 1 army in source territory

**Territory Connectivity:**
Uses BFS (Breadth-First Search) to verify territories are connected through player's owned territories. You can't fortify across enemy territory!

#### POST /api/games/:gameId/end-turn
End turn and progress to next player
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/end-turn \
  -H "Content-Type: application/json" \
  -d '{"playerId": "player-1"}'
```

**Can be called from:**
- ATTACK phase (skips fortify)
- FORTIFY phase

**Response:**
```json
{
  "game": { ... },
  "message": "Turn ended. Now player-2's turn."
}
```

**Turn Progression:**
1. Awards card if territory conquered (if from ATTACK phase)
2. Increments player index
3. Skips eliminated players
4. Calculates reinforcements for next player
5. Initializes new turn state
6. Sets phase to REINFORCE

## Test Results

✅ **50 tests passing** (7 new)

```
Fortify and Turn Management API
  POST /api/games/:gameId/fortify
    ✓ should reject fortify with missing parameters
    ✓ should reject invalid armies value
    ✓ should fortify between connected owned territories
    ✓ should reject fortify when not your turn

  POST /api/games/:gameId/end-turn
    ✓ should end turn and progress to next player
    ✓ should reject ending turn when not your turn
    ✓ should allow ending turn from attack phase
```

## Complete Turn Cycle

### Full Turn Flow
1. **REINFORCE Phase**
   - `GET /reinforcements` - Check available armies
   - `POST /trade-cards` - Trade cards (optional/mandatory)
   - `POST /place-reinforcements` - Place armies
   - `POST /end-reinforcement` - Move to ATTACK

2. **ATTACK Phase**
   - `POST /attack` - Single attack (optional)
   - `POST /auto-attack` - Auto-attack (optional)
   - `POST /move-armies` - Move after conquest (if conquered)
   - `POST /end-attack` - Move to FORTIFY (awards card)
   - `POST /end-turn` - Skip to next player (awards card)

3. **FORTIFY Phase**
   - `POST /fortify` - Move armies (optional)
   - `POST /end-turn` - Next player's turn

4. **Next Player**
   - Automatically enters REINFORCE phase
   - Reinforcements calculated
   - Turn state initialized

## Fortify Implementation Details

### Territory Connectivity (BFS)
```typescript
private areTerritoriesConnected(
  game: GameState,
  playerId: string,
  fromTerritoryId: string,
  toTerritoryId: string
): boolean {
  // BFS to find path through owned territories
  const visited = new Set<string>();
  const queue = [fromTerritoryId];

  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current === toTerritoryId) {
      return true;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    // Find adjacent owned territories
    for (const otherTerritory of game.territories) {
      if (otherTerritory.occupiedBy === playerId && 
          !visited.has(otherTerritory.territoryId) &&
          areTerritoriesAdjacent(current, otherTerritory.territoryId)) {
        queue.push(otherTerritory.territoryId);
      }
    }
  }

  return false;
}
```

### Turn Progression Logic
```typescript
// Progress to next player
game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.turnOrder.length;

// Skip eliminated players
let attempts = 0;
while (attempts < game.players.length) {
  const nextPlayerId = game.turnOrder[game.currentPlayerIndex];
  const nextPlayer = game.players.find(p => p.id === nextPlayerId);
  
  if (nextPlayer && !nextPlayer.isEliminated) {
    break;
  }

  game.currentPlayerIndex = (game.currentPlayerIndex + 1) % game.turnOrder.length;
  attempts++;
}

// Calculate reinforcements for next player
const nextPlayerId = game.turnOrder[game.currentPlayerIndex];
const reinforcements = ReinforcementCalculator.calculateReinforcements(game, nextPlayerId);

// Initialize new turn
game.currentTurn = {
  playerId: nextPlayerId,
  reinforcementsRemaining: reinforcements,
  conqueredTerritoryThisTurn: false
};
```

## Complete Game Example

```bash
# Setup
GAME=$(curl -s -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Alice"}' | jq -r '.gameId')

curl -X POST http://localhost:3000/api/games/$GAME/join \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Bob"}'

curl -X POST http://localhost:3000/api/games/$GAME/start \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'

# Player 1's Turn - REINFORCE
curl -X POST http://localhost:3000/api/games/$GAME/place-reinforcements \
  -H "Content-Type: application/json" \
  -d '{
    "playerId":"player-1",
    "placements":[{"territoryId":"alaska","armies":3}]
  }'

curl -X POST http://localhost:3000/api/games/$GAME/end-reinforcement \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'

# Player 1's Turn - ATTACK
curl -X POST http://localhost:3000/api/games/$GAME/attack \
  -H "Content-Type: application/json" \
  -d '{
    "playerId":"player-1",
    "from":"alaska",
    "to":"kamchatka"
  }'

curl -X POST http://localhost:3000/api/games/$GAME/end-attack \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'

# Player 1's Turn - FORTIFY
curl -X POST http://localhost:3000/api/games/$GAME/fortify \
  -H "Content-Type: application/json" \
  -d '{
    "playerId":"player-1",
    "from":"alaska",
    "to":"alberta",
    "armies":2
  }'

curl -X POST http://localhost:3000/api/games/$GAME/end-turn \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'

# Now it's Player 2's turn automatically!
```

## Error Handling

### Fortify Errors (400 Bad Request)
- Missing parameters
- Invalid armies (must be positive number)
- Not enough armies to move
- Must leave 1+ army in source
- Territories not connected

### Turn Management Errors (409 Conflict)
- Not your turn
- Wrong phase
- Can't end turn from REINFORCE or SETUP

## Validation Rules

### Fortify Requirements
- ✅ Both territories owned by player
- ✅ Territories connected through owned territories (BFS)
- ✅ At least 1 army moved
- ✅ At least 1 army left in source
- ✅ Must be FORTIFY phase

### End Turn Requirements
- ✅ Must be your turn
- ✅ Must be ATTACK or FORTIFY phase
- ✅ Awards card if conquered territory
- ✅ Skips eliminated players
- ✅ Initializes next player's turn

## Files Updated

- `src/services/GameActionService.ts` - Added fortify, endTurn, BFS connectivity
- `src/routes/actions.ts` - Added 2 new endpoints
- `src/routes/actions.test.ts` - Added 7 new tests

## Sign-Off Checklist

- [x] All 50 tests pass
- [x] Can fortify between connected territories
- [x] Connectivity validation works (BFS)
- [x] Can end turn from ATTACK or FORTIFY
- [x] Turn progresses to next player
- [x] Eliminated players skipped
- [x] Reinforcements calculated for next player
- [x] Card awarded on turn end (if conquered)
- [x] Complete turn cycle works

---

## Phase 2 Complete! 🎉

All API endpoints implemented:
- ✅ Game session management (5 endpoints)
- ✅ Reinforcement phase (4 endpoints)
- ✅ Attack phase (4 endpoints)
- ✅ Fortify phase & turn management (2 endpoints)

**Total: 15 API endpoints, 50 tests passing**

---

## Next: Phase 3 - UI Layer

Will implement:
- React + Vite frontend
- Game lobby
- Interactive map
- Turn-based gameplay UI
- Real-time game state updates
- Player hand & card trading
- Battle animations

Ready to start Phase 3? ✅
