# Checkpoint 1.1 - Local Setup Instructions

## Download & Extract

1. Download `world-battle-checkpoint-1.1.tar.gz`
2. Extract the archive:
   ```bash
   tar -xzf world-battle-checkpoint-1.1.tar.gz
   cd world-battle
   ```

## Install & Run Tests

```bash
# Install root dependencies
npm install

# Navigate to engine package
cd packages/engine

# Install engine dependencies
npm install

# Run tests
npm test
```

## Expected Output

You should see:
```
PASS src/tests/Card.test.ts
PASS src/tests/mapData.test.ts

Test Suites: 2 passed, 2 total
Tests:       39 passed, 39 total
```

## What's Validated

### Map Structure ✅
- 42 territories across 6 continents
- All adjacencies are bidirectional
- Cross-continent connections (Alaska↔Kamchatka, Brazil↔North Africa, etc.)

### Continent Bonuses ✅
- North America: 5 armies
- South America: 2 armies
- Africa: 3 armies
- Australia: 2 armies
- Europe: 5 armies
- Asia: 7 armies

### Card System ✅
- Three card types (Infantry, Cavalry, Artillery)
- Valid sets: 3+ same type OR 1+ of each type
- Army rewards: 3 cards = 8, 4 cards = 10, 5 cards = 12, etc.

## Files to Review

- `packages/engine/src/data/mapData.ts` - All territory & continent definitions
- `packages/engine/src/models/` - TypeScript models for game entities
- `packages/engine/src/tests/` - Comprehensive test suite
- `MAP_REFERENCE.md` - Human-readable map reference

## Sign-Off Checklist

- [ ] All 39 tests pass
- [ ] Map data matches game rules document
- [ ] Continent bonuses are correct
- [ ] Card trading logic is correct

Once you sign off, we'll proceed to **Checkpoint 1.2: Game Initialization**!
