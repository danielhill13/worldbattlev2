# Checkpoint 2.3 - Attack Phase Actions

## ✅ What Was Built

### Services
- **GameActionService Extensions**: Attack phase logic
  - Execute single attacks
  - Execute auto-attacks (attack until conquest)
  - Move armies after conquest
  - End attack phase
  - Player elimination detection
  - Card awarding on elimination
  - Victory detection

### API Endpoints (4 New Routes)

#### POST /api/games/:gameId/attack
Execute a single attack
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/attack \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "from": "alaska",
    "to": "kamchatka"
  }'
```

**Response:**
```json
{
  "game": { ... },
  "attackResult": {
    "success": true,
    "rolls": [
      {
        "attackerDice": [6, 4, 2],
        "defenderDice": [5, 3],
        "attackerLosses": 0,
        "defenderLosses": 2,
        "attackerArmiesRemaining": 8,
        "defenderArmiesRemaining": 1,
        "territoryConquered": false
      }
    ],
    "territoryConquered": false
  }
}
```

#### POST /api/games/:gameId/auto-attack
Execute auto-attack (continues until conquest or can't attack)
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/auto-attack \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "from": "alaska",
    "to": "kamchatka"
  }'
```

**Response includes multiple rolls:**
```json
{
  "game": { ... },
  "attackResult": {
    "success": true,
    "rolls": [
      { ... },
      { ... },
      { ... }
    ],
    "territoryConquered": true
  }
}
```

#### POST /api/games/:gameId/move-armies
Move additional armies after conquering a territory
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/move-armies \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "from": "alaska",
    "to": "kamchatka",
    "armies": 3
  }'
```

**Requirements:**
- Must be player's turn
- Must be in ATTACK phase
- Territories must belong to same player
- Must leave at least 1 army in source territory

#### POST /api/games/:gameId/end-attack
End attack phase and move to fortify phase
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/end-attack \
  -H "Content-Type: application/json" \
  -d '{"playerId": "player-1"}'
```

**Awards card if territory was conquered this turn**

## Test Results

✅ **43 tests passing** (8 new)

```
Attack Phase API
  POST /api/games/:gameId/attack
    ✓ should reject attack with missing parameters
    ✓ should reject attack when not your turn
    ✓ should execute valid attack

  POST /api/games/:gameId/auto-attack
    ✓ should execute auto-attack

  POST /api/games/:gameId/move-armies
    ✓ should reject move with missing parameters
    ✓ should reject invalid armies value

  POST /api/games/:gameId/end-attack
    ✓ should end attack phase
    ✓ should reject ending when not your turn
```

## Battle Mechanics

### Attack Validation
- Must be player's turn
- Must be in ATTACK phase
- Must own attacking territory
- Cannot attack own territory
- Territories must be adjacent
- Attacking territory must have 2+ armies

### Dice Resolution
- Uses engine's BattleResolver
- Random dice rolls (1-6)
- Dice count based on army count:
  - Attacker: 1-3 dice
  - Defender: 1-2 dice
- Highest vs highest comparison
- **Ties favor defender**
- Loser of each comparison loses 1 army

### Territory Conquest
- When defender reaches 0 armies:
  - Ownership transfers to attacker
  - 1 army automatically moved
  - Attacker can move additional armies
  - Marks `conqueredTerritoryThisTurn = true`

### Player Elimination
- Checks after each attack
- Player eliminated when owning 0 territories
- All eliminated player's cards transfer to attacker
- Eliminated player marked `isEliminated = true`

### Victory Condition
- Checks after each attack
- Game ends when only 1 active player remains
- Game transitions to GAME_OVER phase
- Winner recorded in game state

### Card Awarding
- Card awarded when ending attack phase
- Only if player conquered ≥1 territory this turn
- Drawn from deck
- Added to player's hand

## Game Flow (Complete Turn)

1. **REINFORCE Phase**
   - Calculate reinforcements
   - Trade cards (optional, mandatory if 5+)
   - Place reinforcements
   - End reinforcement → ATTACK

2. **ATTACK Phase** ← NEW
   - Attack enemy territories (optional)
   - Move armies after conquest
   - End attack → FORTIFY
   - Award card if conquered territory

3. **FORTIFY Phase** (Coming in 2.4)
   - Move armies between owned territories (optional)
   - End turn → Next player's REINFORCE

## Local Testing

### Complete Attack Flow

```bash
# Assumes game already started and in ATTACK phase

GAME="your-game-id"

# 1. Execute attack
curl -X POST http://localhost:3000/api/games/$GAME/attack \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "from": "alaska",
    "to": "kamchatka"
  }'

# 2. If conquered, move additional armies
curl -X POST http://localhost:3000/api/games/$GAME/move-armies \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "from": "alaska",
    "to": "kamchatka",
    "armies": 3
  }'

# 3. Continue attacking or end phase
curl -X POST http://localhost:3000/api/games/$GAME/end-attack \
  -H "Content-Type: application/json" \
  -d '{"playerId": "player-1"}'
```

## Error Handling

### Attack Errors (400 Bad Request)
- Missing parameters (from, to, playerId)
- Invalid territory IDs
- Territories not adjacent
- Attacking own territory
- Not enough armies (need 2+)

### Move Errors (400 Bad Request)
- Invalid armies value (must be number)
- Not enough armies to move
- Must leave 1+ army in source

### Phase/Turn Errors (409 Conflict)
- Not your turn
- Wrong phase
- Invalid game state

## Implementation Highlights

### Player Elimination
```typescript
private checkPlayerElimination(game: GameState): string | null {
  for (const player of game.players) {
    if (player.isEliminated) continue;
    
    const territories = getPlayerTerritories(game, player.id);
    if (territories.length === 0) {
      player.isEliminated = true;
      return player.id;
    }
  }
  return null;
}
```

### Card Transfer on Elimination
```typescript
if (eliminatedPlayerId) {
  const eliminatedPlayer = game.players.find(p => p.id === eliminatedPlayerId);
  const attackingPlayer = game.players.find(p => p.id === playerId);
  
  if (eliminatedPlayer && attackingPlayer) {
    attackingPlayer.cards.push(...eliminatedPlayer.cards);
    eliminatedPlayer.cards = [];
  }
}
```

### Victory Check
```typescript
const activePlayers = game.players.filter(p => !p.isEliminated);
if (activePlayers.length === 1) {
  game.phase = GamePhase.GAME_OVER;
  game.winner = activePlayers[0].id;
}
```

## Files Updated

- `src/services/GameActionService.ts` - Added 5 attack methods
- `src/routes/actions.ts` - Added 4 attack endpoints
- `src/routes/actions.test.ts` - Added 8 attack tests

## Sign-Off Checklist

- [ ] All 43 tests pass
- [ ] Can execute single attacks
- [ ] Can execute auto-attacks
- [ ] Can move armies after conquest
- [ ] Can end attack phase
- [ ] Player elimination works
- [ ] Card transfer on elimination works
- [ ] Victory detection works
- [ ] Card awarded on conquest

---

## Next: Checkpoint 2.4 - Fortify Phase & Turn Management

Will implement:
- POST /api/games/:gameId/fortify
- POST /api/games/:gameId/end-turn
- Turn progression to next player
- New turn initialization
- Complete turn cycle

Ready to proceed? ✅
