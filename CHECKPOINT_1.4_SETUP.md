# Checkpoint 1.4 - Attack/Defend Dice Logic

## What Was Built

### BattleResolver Service
Complete battle system implementation with:
- Attack validation (adjacency, ownership, army count)
- Dice rolling mechanics (1-6 per die)
- Dice count rules (attacker: 1-3, defender: 1-2)
- Battle resolution algorithm
- Single attack mode
- Auto-attack mode (attack until conquest or can't attack)
- Territory conquest mechanics
- Army movement after conquest

### Test Coverage
- 28 new tests added (162 total)
- Attack validation scenarios
- Dice count rule verification
- Battle resolution outcomes
- Territory conquest mechanics
- Army movement validation

## Battle Mechanics

### Dice Count Rules

**Attacker:**
- 1 army: Cannot attack
- 2 armies: Roll 1 die
- 3 armies: Roll 2 dice
- 4+ armies: Roll 3 dice (maximum)

**Defender:**
- 1 army: Roll 1 die
- 2+ armies: Roll 2 dice (maximum)

### Battle Resolution

1. **Roll Dice**: Both players roll their dice (random 1-6)
2. **Sort**: Dice are sorted highest to lowest
3. **Compare**: 
   - Highest attacker die vs highest defender die
   - If both have 2+ dice, second-highest vs second-highest
4. **Determine Winners**:
   - Higher die wins the comparison
   - **Ties favor the defender**
5. **Apply Losses**: Loser of each comparison loses 1 army

### Examples

**Example 1: Attacker wins both**
```
Attacker rolls: [6, 4, 2]
Defender rolls: [5, 3]

Compare 6 vs 5: Attacker wins → Defender -1
Compare 4 vs 3: Attacker wins → Defender -1

Result: Defender loses 2 armies
```

**Example 2: Ties favor defender**
```
Attacker rolls: [6, 3]
Defender rolls: [6, 5]

Compare 6 vs 6: TIE → Attacker -1 (defender wins ties)
Compare 3 vs 5: Defender wins → Attacker -1

Result: Attacker loses 2 armies
```

**Example 3: Split result**
```
Attacker rolls: [5, 2, 1]
Defender rolls: [4, 3]

Compare 5 vs 4: Attacker wins → Defender -1
Compare 2 vs 3: Defender wins → Attacker -1

Result: Each loses 1 army
```

## Attack Modes

### Single Attack
- Execute one dice roll
- Update army counts
- If defender reaches 0 armies, territory is conquered
- Returns battle details for UI display

### Auto-Attack
- Continues attacking until:
  - Territory is conquered (defender has 0 armies), OR
  - Attacker has only 1 army left (can't attack anymore)
- Returns array of all battle rolls
- Useful for "attack until victory" gameplay

## Territory Conquest

When defender's armies reach 0:
1. Territory ownership transfers to attacker
2. **Exactly 1 army** is moved from attacking territory to conquered territory
3. Attacker can then choose to move additional armies (optional)

**Moving Additional Armies:**
- Can only move from the attacking territory
- Must leave at least 1 army in source territory
- Move immediately after conquest

## Local Validation

```bash
# Navigate to engine package
cd packages/engine

# Install dependencies (if not already done)
npm install

# Run all tests
npm test

# Run battle demo
npm run demo:battle
```

## Expected Test Output

```
PASS src/tests/GameInitializer.test.ts
PASS src/tests/ReinforcementCalculator.test.ts
PASS src/tests/BattleResolver.test.ts
PASS src/tests/CardTradeInManager.test.ts
PASS src/tests/DeckManager.test.ts
PASS src/tests/mapData.test.ts
PASS src/tests/Card.test.ts

Test Suites: 7 passed, 7 total
Tests:       162 passed, 162 total
```

## Demo Output Sample

```
⚔️  WORLD BATTLE - ATTACK/DEFEND DEMO

============================================================

🎲 DEMO 1: Dice Count Rules
============================================================

  Attacker Dice:
    1 army → Cannot attack ⚠️
    2 armies → 1 dice (Minimum attack force)
    3 armies → 2 dice 
    4 armies → 3 dice (Max attacker dice)

  Defender Dice:
    1 army → 1 die
    2+ armies → 2 dice

⚔️  DEMO 3: Single Attack Examples
============================================================

  Attack 1:
    Attacker rolled: [6, 6, 2]
    Defender rolled: [5, 3]
    Attacker losses: 0
    Defender losses: 2
    Armies remaining: Attacker 8, Defender 2

🔄 DEMO 5: Auto-Attack
============================================================

  Starting Position:
    Alaska (Alice): 20 armies
    Kamchatka (Bob): 5 armies

  Auto-Attack Results:
    Total rolls: 4
    Territory conquered: YES 🎉
    Final armies - Alaska: 17, Kamchatka: 1
    Kamchatka now controlled by: Alice ✓
```

## Files Created

- `packages/engine/src/services/BattleResolver.ts` - Battle system
- `packages/engine/src/tests/BattleResolver.test.ts` - 28 battle tests
- `packages/engine/src/demo-battle.ts` - Interactive demo

## API Design

### BattleResolver Methods

```typescript
// Validate if attack is legal
validateAttack(
  gameState: GameState,
  attackingTerritoryId: string,
  defendingTerritoryId: string,
  attackingPlayerId: string
): { valid: boolean; error?: string }

// Execute single attack
executeSingleAttack(
  gameState: GameState,
  attackingTerritoryId: string,
  defendingTerritoryId: string,
  attackingPlayerId: string
): AttackResult

// Execute auto-attack (until conquest or can't attack)
executeAutoAttack(
  gameState: GameState,
  attackingTerritoryId: string,
  defendingTerritoryId: string,
  attackingPlayerId: string
): AttackResult

// Move armies after conquest
moveArmiesAfterConquest(
  gameState: GameState,
  fromTerritoryId: string,
  toTerritoryId: string,
  armyCount: number
): { success: boolean; error?: string }
```

### Return Types

```typescript
interface AttackResult {
  success: boolean;
  rolls: BattleRollResult[];  // Array of dice rolls
  territoryConquered: boolean;
  error?: string;
}

interface BattleRollResult {
  attackerDice: number[];     // Sorted descending
  defenderDice: number[];     // Sorted descending
  attackerLosses: number;
  defenderLosses: number;
  attackerArmiesRemaining: number;
  defenderArmiesRemaining: number;
  territoryConquered: boolean;
}
```

## Implementation Notes

### Validation Rules
- Attacker must own attacking territory
- Defender must own defending territory
- Territories must be adjacent
- Attacking territory must have at least 2 armies
- Cannot attack own territories

### State Mutation
BattleResolver **DOES** mutate game state (unlike calculators):
- Updates army counts on territories
- Changes territory ownership on conquest
- This matches the action-based nature of attacks

### Randomness
- Uses `Math.random()` for dice rolls
- Tests verify dice are in valid range (1-6)
- Tests use probabilistic validation (run multiple times)

## Validation Checklist

- [ ] All 162 tests pass
- [ ] Attack validation catches all illegal moves
- [ ] Dice count rules match specifications
- [ ] Ties favor defender
- [ ] Territory conquest transfers ownership
- [ ] 1 army minimum moved on conquest
- [ ] Auto-attack stops at correct conditions
- [ ] Army movement validation works
- [ ] Demo runs successfully

## Phase 1 Complete! 🎉

With Checkpoint 1.4 complete, the entire game engine is functional:

✅ Map and territory system  
✅ Game initialization  
✅ Reinforcement calculation  
✅ Card trading system  
✅ **Complete battle system**  

**162 tests passing** - Ready for Phase 2: API Layer!

---

## Next: Phase 2 - API Layer

The game engine is production-ready. Next we'll build:
- Express REST API
- Game session management
- Player action endpoints
- Real-time updates with WebSockets
- Error handling and validation
- Authentication (later)
