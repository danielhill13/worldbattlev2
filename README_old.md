# World Battle - Risk-like Strategy Game

A web-based strategy game inspired by Risk, built with TypeScript, Node.js, and React.

## Project Structure

```
world-battle/
├── packages/
│   ├── engine/          # Pure game logic (no dependencies)
│   ├── api/             # Express REST API (coming in Phase 2)
│   └── ui/              # React frontend (coming in Phase 3)
└── package.json         # Workspace root
```

## Development Status

### ✅ Phase 1: Game Engine Core - COMPLETE!

All four checkpoints completed with **162 tests passing**:

#### Checkpoint 1.1: Data Models & Map Setup ✅
- 42 territories, 6 continents, card system
- 39 tests

#### Checkpoint 1.2: Game Initialization ✅  
- Territory distribution, army placement, turn order
- 84 tests (45 new)

#### Checkpoint 1.3: Reinforcement Calculation ✅
- Territory/continent bonuses, card trading
- 134 tests (50 new)

#### Checkpoint 1.4: Attack/Defend Dice Logic ✅
- Battle resolution, dice mechanics, conquest
- 162 tests (28 new)

**Phase 1 Complete!** The game engine core is fully functional with comprehensive test coverage.

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Installation

```bash
# Clone/navigate to the project
cd world-battle

# Install all dependencies
npm install

# Install engine dependencies specifically
cd packages/engine
npm install
```

### Running Tests

#### Run all engine tests:
```bash
cd packages/engine
npm test
```

#### Run tests in watch mode (auto-reruns on file changes):
```bash
npm run test:watch
```

#### Run tests with coverage:
```bash
npm run test:coverage
```

### Demos

#### Visualize Game Initialization
```bash
cd packages/engine
npm run demo:init
```

Shows:
- Player assignments and colors
- Territory distribution
- Army placement
- Turn order
- Continent control status
- Deck composition

#### Visualize Reinforcement Calculation
```bash
cd packages/engine
npm run demo:reinforcements
```

Shows:
- Territory-based reinforcements (all scenarios)
- Continent bonus calculations
- Combined reinforcement examples
- Card trading mechanics (valid and invalid)
- Mandatory trading scenarios

### Expected Test Output

You should see:
```
Test Suites: 6 passed, 6 total
Tests:       134 passed, 134 total
```

All tests validate:
- Map structure (42 territories, 6 continents)
- Bidirectional adjacencies
- Continent membership
- Card trading rules
- Game initialization (all player counts)
- Territory distribution
- Army placement
- Deck creation
- Reinforcement calculations
- Card trade-in mechanics

## Checkpoint 1.3 Validation ✅

### Reinforcement Calculation
- **Territory Bonus**: territories ÷ 3, rounded down, minimum 3 ✓
  - 6 territories → 3 armies (minimum applied)
  - 12 territories → 4 armies
  - 19 territories → 6 armies (rounds down from 6.33)
  - 42 territories → 14 armies

### Continent Bonuses
- **North America**: +5 armies ✓
- **South America**: +2 armies ✓
- **Africa**: +3 armies ✓
- **Australia**: +2 armies ✓
- **Europe**: +5 armies ✓
- **Asia**: +7 armies ✓

### Card Trading
- **Valid Sets**: 
  - 3+ of same type ✓
  - 3+ with one of each type ✓
- **Army Rewards**:
  - 3 cards → 8 armies ✓
  - 4 cards → 10 armies ✓
  - 5 cards → 12 armies ✓
  - 6 cards → 14 armies ✓
- **Mandatory Trading**: Player with 5+ cards must trade ✓
- **Invalid Sets**: Properly rejected ✓

## Next Steps

**Ready for Checkpoint 1.4**: Attack/Defend Dice Logic
- Dice rolling (1-6 random)
- Attack eligibility (must have 2+ armies)
- Dice count rules (attacker: 1-3, defender: 1-2)
- Comparison logic (highest vs highest, ties favor defender)
- Army deduction
- Territory conquest
- Card awarding on elimination

---

## Sign-Off Question for Checkpoint 1.3

**Ready to proceed to attack/defend dice logic?**

Please review:
1. Run `npm test` and confirm all 134 tests pass
2. Run `npm run demo:reinforcements` to see calculations in action
3. Verify reinforcement and card trading logic matches game rules

Once you sign off, we'll proceed to Checkpoint 1.4: Attack/Defend Dice Logic!
