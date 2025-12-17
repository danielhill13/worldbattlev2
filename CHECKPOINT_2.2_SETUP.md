# Checkpoint 2.2 - Reinforcement Phase Actions

## ✅ What Was Built

### Services
- **GameActionService**: Business logic for game actions
  - Trade cards for armies
  - Place reinforcements with validation
  - Get reinforcement info
  - End reinforcement phase
  - Turn and phase validation

### API Endpoints (4 New Routes)

#### POST /api/games/:gameId/trade-cards
Trade in cards for bonus armies
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/trade-cards \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "cardIds": ["card-1", "card-2", "card-3"]
  }'
```

**Requirements:**
- Must be player's turn
- Must be in REINFORCE phase
- Must provide 3+ card IDs
- Cards must form valid set (3+ same type OR 1+ of each type)
- Armies added to reinforcements remaining

#### POST /api/games/:gameId/place-reinforcements
Place armies on owned territories
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/place-reinforcements \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "placements": [
      {"territoryId": "alaska", "armies": 3},
      {"territoryId": "alberta", "armies": 2}
    ]
  }'
```

**Requirements:**
- Must be player's turn
- Must be in REINFORCE phase
- Must own all territories in placements
- Total armies <= reinforcements remaining
- Each placement must be >= 1 army

#### GET /api/games/:gameId/reinforcements?playerId=player-1
Get reinforcement information for current turn
```bash
curl "http://localhost:3000/api/games/{gameId}/reinforcements?playerId=player-1"
```

**Response:**
```json
{
  "territoryBonus": 5,
  "continentBonus": 2,
  "cardBonus": 0,
  "total": 7,
  "reinforcementsRemaining": 7,
  "controlledContinents": [
    {"id": "australia", "name": "Australia", "bonus": 2}
  ],
  "canTradeCards": false,
  "mustTradeCards": false,
  "possibleCardSets": []
}
```

#### POST /api/games/:gameId/end-reinforcement
End reinforcement phase and move to attack phase
```bash
curl -X POST http://localhost:3000/api/games/{gameId}/end-reinforcement \
  -H "Content-Type: application/json" \
  -d '{"playerId": "player-1"}'
```

**Requirements:**
- Must be player's turn
- Must be in REINFORCE phase
- Must have placed all reinforcements (reinforcementsRemaining = 0)
- Must have traded cards if holding 5+

## Test Results

✅ **35 tests passing** (15 new)

```
Reinforcement Actions API
  GET /api/games/:gameId/reinforcements
    ✓ should get reinforcement info for current player
    ✓ should reject getting info without player ID
    ✓ should reject getting info when not your turn

  POST /api/games/:gameId/place-reinforcements
    ✓ should place reinforcements on owned territory
    ✓ should place all reinforcements across multiple territories
    ✓ should reject placing on non-owned territory
    ✓ should reject placing more armies than available
    ✓ should reject placing when not your turn
    ✓ should reject placing without placements array

  POST /api/games/:gameId/trade-cards
    ✓ should reject trading when player has no cards
    ✓ should reject trading less than 3 cards
    ✓ should reject trading when not your turn

  POST /api/games/:gameId/end-reinforcement
    ✓ should reject ending reinforcement with armies remaining
    ✓ should end reinforcement phase when all armies placed
    ✓ should reject ending when not your turn
```

## Validation Rules

### Turn Validation
- Validates it's the player's turn before any action
- Returns 409 Conflict if not player's turn

### Phase Validation
- Validates game is in expected phase
- REINFORCE phase required for all reinforcement actions
- Returns 409 Conflict if wrong phase

### Card Trading
- Minimum 3 cards required
- Must form valid set (see Phase 1 card rules)
- Adds armies to reinforcements remaining
- Player must trade if holding 5+ cards before ending phase

### Reinforcement Placement
- Must own territory
- Must have reinforcements available
- Can place across multiple territories in single request
- Armies must be >= 1
- Updates territory army counts immediately

### Phase Transition
- Can only end reinforcement when:
  - All reinforcements placed
  - Mandatory card trades completed (if 5+ cards)
- Transitions to ATTACK phase

## Game Flow

1. **Game starts** → Player 1 in REINFORCE phase
2. **GET reinforcements** → See available armies
3. **(Optional) Trade cards** → If have 3+ cards (mandatory if 5+)
4. **Place reinforcements** → Distribute armies across territories
5. **End reinforcement** → Move to ATTACK phase

## Local Testing

### Start Dev Server
```bash
cd packages/api
npm run dev
```

### Complete Reinforcement Flow

1. **Create & start game:**
```bash
# Create
GAME=$(curl -s -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Alice"}' | jq -r '.gameId')

# Join
curl -X POST http://localhost:3000/api/games/$GAME/join \
  -H "Content-Type: application/json" \
  -d '{"playerName":"Bob"}'

# Start
curl -X POST http://localhost:3000/api/games/$GAME/start \
  -H "Content-Type: application/json" \
  -d '{"playerId":"player-1"}'
```

2. **Check reinforcements:**
```bash
curl "http://localhost:3000/api/games/$GAME/reinforcements?playerId=player-1"
```

3. **Get game state to find owned territory:**
```bash
curl http://localhost:3000/api/games/$GAME | jq '.game.territories[] | select(.occupiedBy == "player-1") | .territoryId' | head -1
```

4. **Place reinforcements:**
```bash
curl -X POST http://localhost:3000/api/games/$GAME/place-reinforcements \
  -H "Content-Type: application/json" \
  -d '{
    "playerId": "player-1",
    "placements": [
      {"territoryId": "alaska", "armies": 3}
    ]
  }'
```

5. **End reinforcement phase:**
```bash
curl -X POST http://localhost:3000/api/games/$GAME/end-reinforcement \
  -H "Content-Type: application/json" \
  -d '{"playerId": "player-1"}'
```

## Error Handling

### HTTP Status Codes
- **200 OK**: Action successful
- **400 Bad Request**: Invalid input
- **404 Not Found**: Game/resource not found
- **409 Conflict**: Wrong turn, wrong phase, or invalid state

### Common Errors
- `Not your turn` - 409
- `Invalid phase` - 409
- `Must place all reinforcements` - 409
- `Not enough reinforcements` - 400
- `You do not own territory` - 400

## Architecture Updates

```
packages/api/src/
├── services/
│   ├── GameStore.ts
│   ├── GameService.ts
│   └── GameActionService.ts    # NEW - Game actions
├── routes/
│   ├── games.ts
│   └── actions.ts               # NEW - Action endpoints
└── tests/
    ├── games.test.ts
    └── actions.test.ts          # NEW - 15 action tests
```

## Files Created

- `src/services/GameActionService.ts` - Action business logic
- `src/routes/actions.ts` - 4 new endpoints
- `src/routes/actions.test.ts` - 15 new tests

## Sign-Off Checklist

- [ ] All 35 tests pass
- [ ] Can get reinforcement info via API
- [ ] Can place reinforcements via API
- [ ] Can end reinforcement phase via API
- [ ] Turn validation works (409 when not your turn)
- [ ] Phase validation works (409 when wrong phase)
- [ ] Reinforcement calculation matches engine

---

## Next: Checkpoint 2.3 - Attack Phase Actions

Will implement:
- POST /api/games/:gameId/attack (single attack)
- POST /api/games/:gameId/auto-attack
- POST /api/games/:gameId/move-armies (after conquest)
- POST /api/games/:gameId/end-attack
- Battle resolution
- Territory conquest handling

Ready to proceed? ✅
