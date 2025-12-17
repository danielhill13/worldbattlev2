# Checkpoint 1.3 - Reinforcement Calculation Setup

## What Was Built

### ReinforcementCalculator Service
- Calculate reinforcement armies from territories held (÷3, rounded down, min 3)
- Calculate continent bonus armies
- Check continent control (player owns all territories)
- Get detailed reinforcement breakdown for UI display
- Combine territory + continent bonuses

### CardTradeInManager Service
- Validate card sets (3+ same type OR 1+ of each type)
- Trade in cards for bonus armies
- Calculate army rewards (3=8, 4=10, 5=12, 6=14, etc.)
- Check mandatory trading (5+ cards)
- Get possible trade sets
- Recommend optimal trade set (smallest valid set)
- Get card hand breakdown by type

### Test Coverage
- 50 new tests added (134 total)
- Reinforcement calculation (27 tests)
- Card trade-in mechanics (23 tests)
- All scenarios validated

## Local Validation

```bash
# Navigate to engine package
cd packages/engine

# Install dependencies (if not already done)
npm install

# Run all tests
npm test

# Run reinforcement demo
npm run demo:reinforcements
```

## Expected Test Output

```
PASS src/tests/CardTradeInManager.test.ts
PASS src/tests/ReinforcementCalculator.test.ts
PASS src/tests/GameInitializer.test.ts
PASS src/tests/mapData.test.ts
PASS src/tests/Card.test.ts
PASS src/tests/DeckManager.test.ts

Test Suites: 6 passed, 6 total
Tests:       134 passed, 134 total
```

## Demo Output Sample

The `npm run demo:reinforcements` command will show:

```
🎮 WORLD BATTLE - REINFORCEMENT CALCULATION DEMO

============================================================

📊 DEMO 1: Territory-Based Reinforcements
============================================================

  6 territories → 3 armies ✅
    Under minimum (6/3 = 2, but min is 3)

  12 territories → 4 armies ✅
    Above minimum (12/3 = 4)

  19 territories → 6 armies ✅
    Rounds down (19/3 = 6.33 → 6)

🗺️  DEMO 2: Continent Bonuses
============================================================

  North America (9 territories)
    Bonus: +5 armies ✅

  Asia (12 territories)
    Bonus: +7 armies ✅

🃏 DEMO 4: Card Trading
============================================================

  Three of a kind (Infantry)
    Cards: 3
    Armies: 8 ✅

  One of each type
    Cards: 3
    Armies: 8 ✅

  Five cards (valid set)
    Cards: 5
    Armies: 12 ✅
```

## Files Created

- `packages/engine/src/services/ReinforcementCalculator.ts` - Reinforcement calculation
- `packages/engine/src/services/CardTradeInManager.ts` - Card trading mechanics
- `packages/engine/src/tests/ReinforcementCalculator.test.ts` - 27 reinforcement tests
- `packages/engine/src/tests/CardTradeInManager.test.ts` - 23 card trade tests
- `packages/engine/src/demo-reinforcements.ts` - Demo tool

## Key Implementation Details

### Territory Bonus Formula
```typescript
bonus = Math.floor(territories / 3)
return Math.max(bonus, 3) // Minimum 3
```

Examples:
- 6 territories: 6/3 = 2 → minimum 3
- 19 territories: 19/3 = 6.33 → 6 (rounded down)
- 42 territories: 42/3 = 14

### Continent Control
Player must own ALL territories in a continent:
- North America: 9 territories → +5 armies
- South America: 4 territories → +2 armies
- Africa: 6 territories → +3 armies
- Australia: 4 territories → +2 armies
- Europe: 7 territories → +5 armies
- Asia: 12 territories → +7 armies

### Card Trading Rules

**Valid Sets:**
- 3+ of the same type (e.g., 3 Infantry)
- 3+ with at least one of each type (e.g., 1 Infantry, 1 Cavalry, 1 Artillery, +any)

**Invalid Sets:**
- Less than 3 cards
- Mixed types without having all three (e.g., 2 Infantry + 1 Cavalry)

**Army Rewards (Classic Risk):**
- Formula: 2 + (2 × card_count)
- 3 cards → 8 armies
- 4 cards → 10 armies
- 5 cards → 12 armies
- 6 cards → 14 armies

**Mandatory Trading:**
- Player MUST trade in cards if they have 5 or more
- Must happen at start of turn, before reinforcement placement

## Validation Checklist

- [ ] All 134 tests pass
- [ ] Territory bonus calculation matches examples
- [ ] Continent bonuses are correct
- [ ] Card trading accepts valid sets
- [ ] Card trading rejects invalid sets
- [ ] Mandatory trading enforced at 5+ cards
- [ ] Army rewards match Classic Risk values
- [ ] Demo runs successfully

## API Design Notes

These services are pure functions that take game state and return calculations. They don't modify state - that will be handled by action services in the next checkpoint.

### ReinforcementCalculator
```typescript
// Get total reinforcements (territory + continent bonuses)
calculateReinforcements(gameState, playerId): number

// Get detailed breakdown for UI
getReinforcementBreakdown(gameState, playerId): {
  territoryBonus: number;
  continentBonus: number;
  controlledContinents: Array<{id, name, bonus}>;
  total: number;
}
```

### CardTradeInManager
```typescript
// Attempt to trade cards
tradeInCards(player, cardIds): {
  success: boolean;
  armiesAwarded: number;
  cardsTraded: Card[];
  remainingCards: Card[];
  error?: string;
}

// Check if player must/can trade
mustTradeIn(player): boolean  // 5+ cards
canTradeIn(player): boolean   // 3+ cards

// Get recommended trade set
getRecommendedTradeSet(player): string[] | null
```

## Sign-Off

Once you verify everything looks correct, we'll proceed to **Checkpoint 1.4: Attack/Defend Dice Logic** which will include:
- Dice rolling mechanics (1-6 random)
- Attack eligibility validation
- Dice count rules (attacker: 1-3, defender: 1-2)
- Battle resolution (highest vs highest, ties favor defender)
- Army deduction and territory conquest
- Card awarding on player elimination
