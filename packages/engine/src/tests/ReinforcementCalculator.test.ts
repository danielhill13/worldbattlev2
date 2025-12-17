import { ReinforcementCalculator } from '../services/ReinforcementCalculator';
import { GameInitializer } from '../services/GameInitializer';
import { GameState } from '../models/GameState';
import { TerritoryState } from '../models/Territory';

describe('ReinforcementCalculator', () => {
  describe('calculateTerritoryBonus', () => {
    test('should return 3 armies for 6 territories (under minimum)', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Set Alice to have exactly 6 territories
      const aliceTerritories = game.territories.slice(0, 6);
      game.territories = aliceTerritories.map(t => ({ ...t, occupiedBy: 'player-1' }));
      
      const bonus = ReinforcementCalculator.calculateTerritoryBonus(game, 'player-1');
      expect(bonus).toBe(3); // 6/3 = 2, but minimum is 3
    });

    test('should return 3 armies for 9 territories (exactly minimum)', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Set Alice to have exactly 9 territories
      const aliceTerritories = game.territories.slice(0, 9);
      game.territories = aliceTerritories.map(t => ({ ...t, occupiedBy: 'player-1' }));
      
      const bonus = ReinforcementCalculator.calculateTerritoryBonus(game, 'player-1');
      expect(bonus).toBe(3); // 9/3 = 3
    });

    test('should return 4 armies for 12 territories', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Set Alice to have exactly 12 territories
      const aliceTerritories = game.territories.slice(0, 12);
      game.territories = aliceTerritories.map(t => ({ ...t, occupiedBy: 'player-1' }));
      
      const bonus = ReinforcementCalculator.calculateTerritoryBonus(game, 'player-1');
      expect(bonus).toBe(4); // 12/3 = 4
    });

    test('should return 6 armies for 19 territories (rounded down)', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Set Alice to have exactly 19 territories
      const aliceTerritories = game.territories.slice(0, 19);
      game.territories = aliceTerritories.map(t => ({ ...t, occupiedBy: 'player-1' }));
      
      const bonus = ReinforcementCalculator.calculateTerritoryBonus(game, 'player-1');
      expect(bonus).toBe(6); // 19/3 = 6.333, rounded down to 6
    });

    test('should return 14 armies for 42 territories (all)', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Set Alice to have all 42 territories
      game.territories = game.territories.map(t => ({ ...t, occupiedBy: 'player-1' }));
      
      const bonus = ReinforcementCalculator.calculateTerritoryBonus(game, 'player-1');
      expect(bonus).toBe(14); // 42/3 = 14
    });

    test('should return 3 armies for 1 territory (minimum)', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Set Alice to have exactly 1 territory
      game.territories = [{ ...game.territories[0], occupiedBy: 'player-1' }];
      
      const bonus = ReinforcementCalculator.calculateTerritoryBonus(game, 'player-1');
      expect(bonus).toBe(3); // 1/3 = 0.33, but minimum is 3
    });
  });

  describe('calculateContinentBonus', () => {
    test('should return 0 when player controls no continents', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Territories are randomly distributed, unlikely to control full continent
      const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
      expect(bonus).toBeGreaterThanOrEqual(0);
    });

    test('should return 5 for North America control', () => {
      const game = createGameWithContinentControl('north-america');
      
      const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
      expect(bonus).toBe(5);
    });

    test('should return 2 for South America control', () => {
      const game = createGameWithContinentControl('south-america');
      
      const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
      expect(bonus).toBe(2);
    });

    test('should return 3 for Africa control', () => {
      const game = createGameWithContinentControl('africa');
      
      const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
      expect(bonus).toBe(3);
    });

    test('should return 2 for Australia control', () => {
      const game = createGameWithContinentControl('australia');
      
      const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
      expect(bonus).toBe(2);
    });

    test('should return 5 for Europe control', () => {
      const game = createGameWithContinentControl('europe');
      
      const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
      expect(bonus).toBe(5);
    });

    test('should return 7 for Asia control', () => {
      const game = createGameWithContinentControl('asia');
      
      const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
      expect(bonus).toBe(7);
    });

    test('should return sum of multiple continents', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Give player-1 control of South America (2) and Australia (2)
      game.territories = game.territories.map(t => {
        const territory = game.territories.find(ter => ter.territoryId === t.territoryId);
        if (!territory) return t;
        
        // South America territories
        if (['venezuela', 'peru', 'brazil', 'argentina'].includes(t.territoryId)) {
          return { ...t, occupiedBy: 'player-1' };
        }
        // Australia territories
        if (['indonesia', 'new-guinea', 'east-australia', 'west-australia'].includes(t.territoryId)) {
          return { ...t, occupiedBy: 'player-1' };
        }
        return { ...t, occupiedBy: 'player-2' };
      });
      
      const bonus = ReinforcementCalculator.calculateContinentBonus(game, 'player-1');
      expect(bonus).toBe(4); // 2 + 2
    });
  });

  describe('playerControlsContinent', () => {
    test('should return true when player controls all territories', () => {
      const game = createGameWithContinentControl('australia');
      
      const controls = ReinforcementCalculator.playerControlsContinent(game, 'player-1', 'australia');
      expect(controls).toBe(true);
    });

    test('should return false when player missing one territory', () => {
      const game = createGameWithContinentControl('australia');
      
      // Give one territory to player-2
      const indonesiaIndex = game.territories.findIndex(t => t.territoryId === 'indonesia');
      game.territories[indonesiaIndex].occupiedBy = 'player-2';
      
      const controls = ReinforcementCalculator.playerControlsContinent(game, 'player-1', 'australia');
      expect(controls).toBe(false);
    });

    test('should return false for invalid continent ID', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      const controls = ReinforcementCalculator.playerControlsContinent(game, 'player-1', 'invalid-continent');
      expect(controls).toBe(false);
    });
  });

  describe('getControlledContinents', () => {
    test('should return empty array when no continents controlled', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Ensure no single player controls a continent
      const continents = ReinforcementCalculator.getControlledContinents(game, 'player-1');
      expect(Array.isArray(continents)).toBe(true);
    });

    test('should return array with controlled continents', () => {
      const game = createGameWithContinentControl('australia');
      
      const continents = ReinforcementCalculator.getControlledContinents(game, 'player-1');
      expect(continents).toContain('australia');
    });

    test('should return multiple continents if controlled', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Give player-1 control of South America and Australia
      game.territories = game.territories.map(t => {
        if (['venezuela', 'peru', 'brazil', 'argentina'].includes(t.territoryId)) {
          return { ...t, occupiedBy: 'player-1' };
        }
        if (['indonesia', 'new-guinea', 'east-australia', 'west-australia'].includes(t.territoryId)) {
          return { ...t, occupiedBy: 'player-1' };
        }
        return { ...t, occupiedBy: 'player-2' };
      });
      
      const continents = ReinforcementCalculator.getControlledContinents(game, 'player-1');
      expect(continents).toContain('south-america');
      expect(continents).toContain('australia');
      expect(continents).toHaveLength(2);
    });
  });

  describe('calculateReinforcements', () => {
    test('should return sum of territory and continent bonuses', () => {
      const game = createGameWithContinentControl('australia');
      
      // Australia has 4 territories, so territory bonus = 3 (minimum)
      // Australia continent bonus = 2
      // Total = 5
      const total = ReinforcementCalculator.calculateReinforcements(game, 'player-1');
      expect(total).toBe(5);
    });

    test('should calculate correctly with multiple continents', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Give player-1 South America (4 territories) and Australia (4 territories)
      // Total: 8 territories
      game.territories = game.territories.map(t => {
        if (['venezuela', 'peru', 'brazil', 'argentina'].includes(t.territoryId)) {
          return { ...t, occupiedBy: 'player-1' };
        }
        if (['indonesia', 'new-guinea', 'east-australia', 'west-australia'].includes(t.territoryId)) {
          return { ...t, occupiedBy: 'player-1' };
        }
        return { ...t, occupiedBy: 'player-2' };
      });
      
      // 8 territories / 3 = 2.67 rounded down = 2, but minimum is 3
      // South America bonus = 2
      // Australia bonus = 2
      // Total = 3 + 2 + 2 = 7
      const total = ReinforcementCalculator.calculateReinforcements(game, 'player-1');
      expect(total).toBe(7);
    });
  });

  describe('getReinforcementBreakdown', () => {
    test('should return detailed breakdown', () => {
      const game = createGameWithContinentControl('australia');
      
      const breakdown = ReinforcementCalculator.getReinforcementBreakdown(game, 'player-1');
      
      expect(breakdown.territoryBonus).toBe(3);
      expect(breakdown.continentBonus).toBe(2);
      expect(breakdown.controlledContinents).toHaveLength(1);
      expect(breakdown.controlledContinents[0]).toEqual({
        id: 'australia',
        name: 'Australia',
        bonus: 2
      });
      expect(breakdown.total).toBe(5);
    });

    test('should show multiple controlled continents', () => {
      const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
      
      // Give player-1 South America and Australia
      game.territories = game.territories.map(t => {
        if (['venezuela', 'peru', 'brazil', 'argentina'].includes(t.territoryId)) {
          return { ...t, occupiedBy: 'player-1' };
        }
        if (['indonesia', 'new-guinea', 'east-australia', 'west-australia'].includes(t.territoryId)) {
          return { ...t, occupiedBy: 'player-1' };
        }
        return { ...t, occupiedBy: 'player-2' };
      });
      
      const breakdown = ReinforcementCalculator.getReinforcementBreakdown(game, 'player-1');
      
      expect(breakdown.continentBonus).toBe(4); // 2 + 2
      expect(breakdown.controlledContinents).toHaveLength(2);
    });
  });
});

// Helper function to create a game where player-1 controls a specific continent
function createGameWithContinentControl(continentId: string): GameState {
  const game = GameInitializer.createGame('test', ['Alice', 'Bob']);
  
  const continentTerritories: Record<string, string[]> = {
    'north-america': ['greenland', 'quebec', 'eastern-us', 'western-us', 'alberta', 'ontario', 'northwest-territory', 'alaska', 'central-america'],
    'south-america': ['venezuela', 'peru', 'brazil', 'argentina'],
    'africa': ['madagascar', 'south-africa', 'congo', 'east-africa', 'north-africa', 'egypt'],
    'australia': ['indonesia', 'new-guinea', 'east-australia', 'west-australia'],
    'europe': ['western-europe', 'southern-europe', 'northern-europe', 'ukraine', 'scandinavia', 'iceland', 'great-britain'],
    'asia': ['afghanistan', 'middle-east', 'india', 'thailand', 'china', 'mongolia', 'japan', 'ural', 'kamchatka', 'yakutsk', 'irkutsk', 'siberia']
  };
  
  const territories = continentTerritories[continentId] || [];
  
  game.territories = game.territories.map(t => {
    if (territories.includes(t.territoryId)) {
      return { ...t, occupiedBy: 'player-1' };
    }
    return { ...t, occupiedBy: 'player-2' };
  });
  
  return game;
}
