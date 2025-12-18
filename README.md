# World Battle - A Strategy Game

A web-based strategy game, built with TypeScript, Node.js, and React.

## Project Structure

```
world-battle/
├── packages/
│   ├── engine/          # Pure game logic (Phase 1 Complete)
│   ├── api/             # Express REST API (Phase 2)
│   └── ui/              # React frontend (Phase 3)
└── package.json         # Workspace root
```

## Development Status

### Phase 1: Game Engine Core

All four checkpoints completed with **162 tests passing**:

- **Checkpoint 1.1**: Data Models & Map Setup (39 tests)
- **Checkpoint 1.2**: Game Initialization (84 tests total, 45 new)
- **Checkpoint 1.3**: Reinforcement Calculation (134 tests total, 50 new)
- **Checkpoint 1.4**: Attack/Defend Dice Logic (162 tests total, 28 new)

**Phase 1 Complete!** The game engine core is fully functional with comprehensive test coverage.

## Features Implemented

###  Map & Territories
- 42 territories across 6 continents
- Bidirectional adjacency validation
- Cross-continent connections (Alaska↔Kamchatka, Brazil↔North Africa, etc.)

###  Player Management
- 2-6 player support
- Unique colors (RED, BLUE, GREEN, YELLOW, BLACK, PURPLE)
- Player elimination tracking

###  Game Initialization
- Random territory distribution (round-robin)
- Initial army allocation (40/35/30/25/20 by player count)
- Random army placement across owned territories
- Shuffled turn order

###  Reinforcements
- Territory-based bonuses (÷3, min 3)
- Continent control bonuses (2-7 armies)
- Card trading system (3+ cards → armies)
- Mandatory trading at 5+ cards

###  Battle System
- Dice-based combat (1-6 per die)
- Attack validation (adjacency, army count, ownership)
- Dice count rules:
  - Attacker: 1-3 dice (based on army count)
  - Defender: 1-2 dice (based on army count)
- Battle resolution (highest vs highest, ties favor defender)
- Single attack and auto-attack modes
- Territory conquest mechanics
- Army movement after conquest

###  Card System
- Three card types (Infantry, Cavalry, Artillery)
- Card trading validation
- Classic rewards (3=8, 4=10, 5=12, 6=14, etc.)
- Trade set recommendations

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

**Expected output:** ✅ 162 tests passing

#### Run tests in watch mode:
```bash
npm run test:watch
```

#### Run tests with coverage:
```bash
npm run test:coverage
```

### Interactive Demos

#### 1. Game Initialization
```bash
npm run demo:init
```
**Shows:** Player setup, territory distribution, army placement, turn order, continent control

#### 2. Reinforcement Calculation
```bash
npm run demo:reinforcements
```
**Shows:** Territory bonuses (6 examples), continent bonuses (all 6), card trading (valid/invalid sets)

#### 3. Battle Mechanics
```bash
npm run demo:battle
```
**Shows:** Dice rules, attack validation, battle examples, auto-attack, conquest, army movement

## Test Coverage Summary

```
Test Suites: 7 passed, 7 total
Tests:       162 passed, 162 total

Test Files:
  ✓ mapData.test.ts               (39 tests)  - Map structure
  ✓ Card.test.ts                  (15 tests)  - Card mechanics
  ✓ DeckManager.test.ts           (9 tests)   - Deck operations
  ✓ GameInitializer.test.ts       (36 tests)  - Game setup
  ✓ ReinforcementCalculator.test.ts (27 tests)  - Reinforcements
  ✓ CardTradeInManager.test.ts    (23 tests)  - Card trading
  ✓ BattleResolver.test.ts        (28 tests)  - Battle mechanics
```

## Architecture

### Pure Game Logic
The engine is framework-agnostic with no external dependencies:
- No database required
- No API coupling
- All state passed as parameters
- Pure functions for calculations
- Easy to test and integrate

### Services
- **GameInitializer**: Create and setup new games
- **DeckManager**: Card deck operations
- **ReinforcementCalculator**: Calculate bonus armies
- **CardTradeInManager**: Validate and process card trades
- **BattleResolver**: Execute attacks and resolve battles

### Models
- **GameState**: Complete game state
- **Player**: Player information and cards
- **Territory/TerritoryState**: Map data and current state
- **Card**: Card types and trading logic
- **Continent**: Continent bonuses

## Next Steps

### Phase 2: API Layer (Ready to Build!)

Will implement:
- Express REST API server
- Game session management endpoints
- Player action endpoints (reinforce, attack, fortify)
- WebSocket support for real-time updates
- Error handling and validation
- In-memory game storage (Phase 2), database (later)

### Phase 3: UI Layer

Will implement:
- React + TypeScript frontend
- Interactive map visualization
- Player action UI (reinforcement, attack, fortify)
- Real-time game state updates
- Game lobby and matchmaking
- Mobile-responsive design

## Documentation

- **README.md** - This file
- **MAP_REFERENCE.md** - Complete territory and continent reference
- **CHECKPOINT_1.1_SETUP.md** - Map and models setup guide
- **CHECKPOINT_1.2_SETUP.md** - Game initialization guide
- **CHECKPOINT_1.3_SETUP.md** - Reinforcement calculation guide
- **CHECKPOINT_1.4_SETUP.md** - Battle mechanics guide

## Phase 1 Achievements

✅ **162 comprehensive tests** covering all game mechanics  
✅ **Complete game engine** with all core features  
✅ **Zero external dependencies** - pure TypeScript  
✅ **Full validation** for all player actions  
✅ **Three interactive demos** for visualization  
✅ **Production-ready code** with error handling  

The game engine is fully functional and ready for API integration!

---

## Quick Start

```bash
# Install
cd world-battle/packages/engine && npm install

# Test
npm test

# Demo
npm run demo:init
npm run demo:reinforcements
npm run demo:battle
```

All Phase 1 checkpoints complete! Ready for Phase 2: API Layer 🚀
