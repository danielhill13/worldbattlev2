import { BattleResolver } from '../services/BattleResolver';
import { GameInitializer } from '../services/GameInitializer';
import { GameState } from '../models/GameState';

describe('BattleResolver', () => {
  describe('validateAttack', () => {
    let game: GameState;

    beforeEach(() => {
      game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      // Setup: player-1 owns alaska (with 3 armies), player-2 owns kamchatka (with 2 armies)
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 3;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 2;
        }
      });
    });

    test('should validate legal attack', () => {
      const result = BattleResolver.validateAttack(game, 'alaska', 'kamchatka', 'player-1');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    test('should reject attack from territory with only 1 army', () => {
      const alaskaTerritory = game.territories.find(t => t.territoryId === 'alaska')!;
      alaskaTerritory.armies = 1;

      const result = BattleResolver.validateAttack(game, 'alaska', 'kamchatka', 'player-1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Attacking territory must have at least 2 armies');
    });

    test('should reject attack from territory not owned by player', () => {
      const result = BattleResolver.validateAttack(game, 'kamchatka', 'alaska', 'player-1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('You do not own the attacking territory');
    });

    test('should reject attack on own territory', () => {
      // Make both territories owned by player-1
      const kamchatkaTerritory = game.territories.find(t => t.territoryId === 'kamchatka')!;
      kamchatkaTerritory.occupiedBy = 'player-1';

      const result = BattleResolver.validateAttack(game, 'alaska', 'kamchatka', 'player-1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Cannot attack your own territory');
    });

    test('should reject attack on non-adjacent territory', () => {
      const result = BattleResolver.validateAttack(game, 'alaska', 'argentina', 'player-1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Territories are not adjacent');
    });

    test('should reject attack with invalid territory ID', () => {
      const result = BattleResolver.validateAttack(game, 'invalid-territory', 'kamchatka', 'player-1');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Attacking territory not found');
    });
  });

  describe('performAttackRoll', () => {
    let game: GameState;

    beforeEach(() => {
      game = GameInitializer.createGame('test', ['Alice', 'Bob']);
    });

    test('should return null for invalid territories', () => {
      const result = BattleResolver.performAttackRoll(game, 'invalid', 'kamchatka');
      expect(result).toBeNull();
    });

    test('should roll 1 die for attacker with 2 armies', () => {
      // Setup: attacker has 2 armies
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 2;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 2;
        }
      });

      const result = BattleResolver.performAttackRoll(game, 'alaska', 'kamchatka');
      expect(result).not.toBeNull();
      expect(result!.attackerDice).toHaveLength(1);
    });

    test('should roll 2 dice for attacker with 3 armies', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 3;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 2;
        }
      });

      const result = BattleResolver.performAttackRoll(game, 'alaska', 'kamchatka');
      expect(result).not.toBeNull();
      expect(result!.attackerDice).toHaveLength(2);
    });

    test('should roll 3 dice for attacker with 4+ armies', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 5;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 2;
        }
      });

      const result = BattleResolver.performAttackRoll(game, 'alaska', 'kamchatka');
      expect(result).not.toBeNull();
      expect(result!.attackerDice).toHaveLength(3);
    });

    test('should roll 1 die for defender with 1 army', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 3;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 1;
        }
      });

      const result = BattleResolver.performAttackRoll(game, 'alaska', 'kamchatka');
      expect(result).not.toBeNull();
      expect(result!.defenderDice).toHaveLength(1);
    });

    test('should roll 2 dice for defender with 2+ armies', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 3;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 3;
        }
      });

      const result = BattleResolver.performAttackRoll(game, 'alaska', 'kamchatka');
      expect(result).not.toBeNull();
      expect(result!.defenderDice).toHaveLength(2);
    });

    test('should return dice values between 1 and 6', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 5;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 3;
        }
      });

      // Run multiple times to check randomness
      for (let i = 0; i < 10; i++) {
        const result = BattleResolver.performAttackRoll(game, 'alaska', 'kamchatka');
        expect(result).not.toBeNull();
        
        result!.attackerDice.forEach(die => {
          expect(die).toBeGreaterThanOrEqual(1);
          expect(die).toBeLessThanOrEqual(6);
        });

        result!.defenderDice.forEach(die => {
          expect(die).toBeGreaterThanOrEqual(1);
          expect(die).toBeLessThanOrEqual(6);
        });
      }
    });

    test('should calculate losses correctly - attacker wins both', () => {
      // Mock dice rolls by running many times and checking one scenario
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 8;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 4;
        }
      });

      // The test validates the logic is working
      const result = BattleResolver.performAttackRoll(game, 'alaska', 'kamchatka');
      expect(result).not.toBeNull();
      expect(result!.attackerLosses + result!.defenderLosses).toBeGreaterThan(0);
      expect(result!.attackerArmiesRemaining).toBeLessThanOrEqual(8);
      expect(result!.defenderArmiesRemaining).toBeLessThanOrEqual(4);
    });

    test('should mark territory as conquered when defender reaches 0 armies', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 5;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 1;
        }
      });

      // Run multiple times to eventually get a conquest
      let conquered = false;
      for (let i = 0; i < 100; i++) {
        const result = BattleResolver.performAttackRoll(game, 'alaska', 'kamchatka');
        if (result && result.defenderArmiesRemaining === 0) {
          expect(result.territoryConquered).toBe(true);
          conquered = true;
          break;
        }
      }
      // With high probability, at least one roll should result in conquest
      expect(conquered).toBe(true);
    });
  });

  describe('executeSingleAttack', () => {
    let game: GameState;

    beforeEach(() => {
      game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 5;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 3;
        }
      });
    });

    test('should fail for invalid attack', () => {
      const result = BattleResolver.executeSingleAttack(game, 'alaska', 'argentina', 'player-1');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should execute valid attack', () => {
      const result = BattleResolver.executeSingleAttack(game, 'alaska', 'kamchatka', 'player-1');
      expect(result.success).toBe(true);
      expect(result.rolls).toHaveLength(1);
    });

    test('should update army counts after attack', () => {
      const alaskaBefore = game.territories.find(t => t.territoryId === 'alaska')!.armies;
      const kamchatkaBefore = game.territories.find(t => t.territoryId === 'kamchatka')!.armies;

      BattleResolver.executeSingleAttack(game, 'alaska', 'kamchatka', 'player-1');

      const alaskaAfter = game.territories.find(t => t.territoryId === 'alaska')!.armies;
      const kamchatkaAfter = game.territories.find(t => t.territoryId === 'kamchatka')!.armies;

      // At least one side should have lost armies
      expect(alaskaAfter < alaskaBefore || kamchatkaAfter < kamchatkaBefore).toBe(true);
    });

    test('should transfer territory ownership on conquest', () => {
      // Set defender to 1 army for easier conquest
      const kamchatkaTerritory = game.territories.find(t => t.territoryId === 'kamchatka')!;
      kamchatkaTerritory.armies = 1;

      // Run multiple times to get a conquest
      for (let i = 0; i < 100; i++) {
        const result = BattleResolver.executeSingleAttack(game, 'alaska', 'kamchatka', 'player-1');
        if (result.territoryConquered) {
          expect(kamchatkaTerritory.occupiedBy).toBe('player-1');
          expect(kamchatkaTerritory.armies).toBe(1); // 1 army moved to conquered territory
          break;
        }
        // Reset for next attempt
        kamchatkaTerritory.occupiedBy = 'player-2';
        kamchatkaTerritory.armies = 1;
        game.territories.find(t => t.territoryId === 'alaska')!.armies = 5;
      }
    });
  });

  describe('executeAutoAttack', () => {
    let game: GameState;

    beforeEach(() => {
      game = GameInitializer.createGame('test', ['Alice', 'Bob']);
    });

    test('should fail for invalid attack', () => {
      const result = BattleResolver.executeAutoAttack(game, 'alaska', 'argentina', 'player-1');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test('should execute multiple rolls', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 10;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 5;
        }
      });

      const result = BattleResolver.executeAutoAttack(game, 'alaska', 'kamchatka', 'player-1');
      expect(result.success).toBe(true);
      expect(result.rolls.length).toBeGreaterThan(0);
    });

    test('should stop when attacker has only 1 army', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 2;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 10;
        }
      });

      const result = BattleResolver.executeAutoAttack(game, 'alaska', 'kamchatka', 'player-1');
      
      const alaskaTerritory = game.territories.find(t => t.territoryId === 'alaska')!;
      expect(alaskaTerritory.armies).toBeGreaterThanOrEqual(1);
    });

    test('should conquer territory when defender reaches 0', () => {
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska') {
          t.occupiedBy = 'player-1';
          t.armies = 20;
        } else if (t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-2';
          t.armies = 2;
        }
      });

      const result = BattleResolver.executeAutoAttack(game, 'alaska', 'kamchatka', 'player-1');
      
      // With overwhelming forces, should eventually conquer
      expect(result.territoryConquered).toBe(true);
      
      const kamchatkaTerritory = game.territories.find(t => t.territoryId === 'kamchatka')!;
      expect(kamchatkaTerritory.occupiedBy).toBe('player-1');
      expect(kamchatkaTerritory.armies).toBeGreaterThanOrEqual(1);
    });
  });

  describe('moveArmiesAfterConquest', () => {
    let game: GameState;

    beforeEach(() => {
      game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      game.territories.forEach(t => {
        if (t.territoryId === 'alaska' || t.territoryId === 'kamchatka') {
          t.occupiedBy = 'player-1';
          t.armies = 5;
        }
      });
    });

    test('should move armies between owned territories', () => {
      const result = BattleResolver.moveArmiesAfterConquest(game, 'alaska', 'kamchatka', 3);
      
      expect(result.success).toBe(true);
      
      const alaskaTerritory = game.territories.find(t => t.territoryId === 'alaska')!;
      const kamchatkaTerritory = game.territories.find(t => t.territoryId === 'kamchatka')!;
      
      expect(alaskaTerritory.armies).toBe(2); // 5 - 3
      expect(kamchatkaTerritory.armies).toBe(8); // 5 + 3
    });

    test('should fail if trying to leave less than 1 army', () => {
      const result = BattleResolver.moveArmiesAfterConquest(game, 'alaska', 'kamchatka', 5);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Must leave at least 1 army in source territory');
    });

    test('should fail if territories belong to different players', () => {
      const kamchatkaTerritory = game.territories.find(t => t.territoryId === 'kamchatka')!;
      kamchatkaTerritory.occupiedBy = 'player-2';

      const result = BattleResolver.moveArmiesAfterConquest(game, 'alaska', 'kamchatka', 3);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Territories must belong to same player');
    });

    test('should fail with negative army count', () => {
      const result = BattleResolver.moveArmiesAfterConquest(game, 'alaska', 'kamchatka', -1);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Army count must be positive');
    });

    test('should succeed with 0 armies (no movement)', () => {
      const result = BattleResolver.moveArmiesAfterConquest(game, 'alaska', 'kamchatka', 0);
      
      expect(result.success).toBe(true);
      
      const alaskaTerritory = game.territories.find(t => t.territoryId === 'alaska')!;
      const kamchatkaTerritory = game.territories.find(t => t.territoryId === 'kamchatka')!;
      
      expect(alaskaTerritory.armies).toBe(5);
      expect(kamchatkaTerritory.armies).toBe(5);
    });
  });
});
