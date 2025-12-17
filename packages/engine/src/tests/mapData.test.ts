import { TERRITORIES, CONTINENTS, getTerritoryById, getContinentById, areTerritoriesAdjacent } from '../data/mapData';

describe('Map Data Validation', () => {
  describe('Territories', () => {
    test('should have exactly 42 territories', () => {
      expect(TERRITORIES).toHaveLength(42);
    });

    test('all territories should have unique IDs', () => {
      const ids = TERRITORIES.map(t => t.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(TERRITORIES.length);
    });

    test('all territories should have names', () => {
      TERRITORIES.forEach(territory => {
        expect(territory.name).toBeTruthy();
        expect(territory.name.length).toBeGreaterThan(0);
      });
    });

    test('all territories should belong to a continent', () => {
      TERRITORIES.forEach(territory => {
        expect(territory.continentId).toBeTruthy();
        const continent = getContinentById(territory.continentId);
        expect(continent).toBeDefined();
      });
    });

    test('all territories should have at least one adjacent territory', () => {
      TERRITORIES.forEach(territory => {
        expect(territory.adjacentTerritories.length).toBeGreaterThan(0);
      });
    });

    test('adjacencies should be bidirectional', () => {
      TERRITORIES.forEach(territory => {
        territory.adjacentTerritories.forEach(adjacentId => {
          const adjacentTerritory = getTerritoryById(adjacentId);
          expect(adjacentTerritory).toBeDefined();
          expect(adjacentTerritory!.adjacentTerritories).toContain(territory.id);
        });
      });
    });

    test('territories should not be adjacent to themselves', () => {
      TERRITORIES.forEach(territory => {
        expect(territory.adjacentTerritories).not.toContain(territory.id);
      });
    });

    test('all adjacent territory IDs should reference valid territories', () => {
      TERRITORIES.forEach(territory => {
        territory.adjacentTerritories.forEach(adjacentId => {
          const adjacentTerritory = getTerritoryById(adjacentId);
          expect(adjacentTerritory).toBeDefined();
        });
      });
    });
  });

  describe('Continents', () => {
    test('should have exactly 6 continents', () => {
      expect(CONTINENTS).toHaveLength(6);
    });

    test('all continents should have unique IDs', () => {
      const ids = CONTINENTS.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(CONTINENTS.length);
    });

    test('North America should have 9 territories', () => {
      const northAmerica = getContinentById('north-america');
      expect(northAmerica).toBeDefined();
      expect(northAmerica!.territoryIds).toHaveLength(9);
      expect(northAmerica!.bonusArmies).toBe(5);
    });

    test('South America should have 4 territories', () => {
      const southAmerica = getContinentById('south-america');
      expect(southAmerica).toBeDefined();
      expect(southAmerica!.territoryIds).toHaveLength(4);
      expect(southAmerica!.bonusArmies).toBe(2);
    });

    test('Africa should have 6 territories', () => {
      const africa = getContinentById('africa');
      expect(africa).toBeDefined();
      expect(africa!.territoryIds).toHaveLength(6);
      expect(africa!.bonusArmies).toBe(3);
    });

    test('Australia should have 4 territories', () => {
      const australia = getContinentById('australia');
      expect(australia).toBeDefined();
      expect(australia!.territoryIds).toHaveLength(4);
      expect(australia!.bonusArmies).toBe(2);
    });

    test('Europe should have 7 territories', () => {
      const europe = getContinentById('europe');
      expect(europe).toBeDefined();
      expect(europe!.territoryIds).toHaveLength(7);
      expect(europe!.bonusArmies).toBe(5);
    });

    test('Asia should have 12 territories', () => {
      const asia = getContinentById('asia');
      expect(asia).toBeDefined();
      expect(asia!.territoryIds).toHaveLength(12);
      expect(asia!.bonusArmies).toBe(7);
    });

    test('all continent territory IDs should reference valid territories', () => {
      CONTINENTS.forEach(continent => {
        continent.territoryIds.forEach(territoryId => {
          const territory = getTerritoryById(territoryId);
          expect(territory).toBeDefined();
          expect(territory!.continentId).toBe(continent.id);
        });
      });
    });

    test('all territories should belong to exactly one continent', () => {
      const allContinentTerritories = CONTINENTS.flatMap(c => c.territoryIds);
      expect(allContinentTerritories).toHaveLength(42);
      
      const uniqueTerritories = new Set(allContinentTerritories);
      expect(uniqueTerritories.size).toBe(42);
    });
  });

  describe('Specific Territory Adjacencies', () => {
    test('Alaska should be adjacent to Kamchatka (cross-continent)', () => {
      expect(areTerritoriesAdjacent('alaska', 'kamchatka')).toBe(true);
      expect(areTerritoriesAdjacent('kamchatka', 'alaska')).toBe(true);
    });

    test('Brazil should be adjacent to North Africa (cross-continent)', () => {
      expect(areTerritoriesAdjacent('brazil', 'north-africa')).toBe(true);
      expect(areTerritoriesAdjacent('north-africa', 'brazil')).toBe(true);
    });

    test('Greenland should be adjacent to Iceland (cross-continent)', () => {
      expect(areTerritoriesAdjacent('greenland', 'iceland')).toBe(true);
      expect(areTerritoriesAdjacent('iceland', 'greenland')).toBe(true);
    });

    test('sample territories should have correct adjacencies', () => {
      // Ontario should be adjacent to 5 territories
      const ontario = getTerritoryById('ontario');
      expect(ontario!.adjacentTerritories).toHaveLength(5);
      expect(ontario!.adjacentTerritories).toContain('quebec');
      expect(ontario!.adjacentTerritories).toContain('eastern-us');
      expect(ontario!.adjacentTerritories).toContain('western-us');
      expect(ontario!.adjacentTerritories).toContain('alberta');
      expect(ontario!.adjacentTerritories).toContain('northwest-territory');
    });
  });

  describe('Helper Functions', () => {
    test('getTerritoryById should return territory when valid ID provided', () => {
      const alaska = getTerritoryById('alaska');
      expect(alaska).toBeDefined();
      expect(alaska!.name).toBe('Alaska');
    });

    test('getTerritoryById should return undefined for invalid ID', () => {
      const invalid = getTerritoryById('not-a-territory');
      expect(invalid).toBeUndefined();
    });

    test('getContinentById should return continent when valid ID provided', () => {
      const asia = getContinentById('asia');
      expect(asia).toBeDefined();
      expect(asia!.name).toBe('Asia');
    });

    test('getContinentById should return undefined for invalid ID', () => {
      const invalid = getContinentById('not-a-continent');
      expect(invalid).toBeUndefined();
    });

    test('areTerritoriesAdjacent should return true for adjacent territories', () => {
      expect(areTerritoriesAdjacent('alaska', 'alberta')).toBe(true);
    });

    test('areTerritoriesAdjacent should return false for non-adjacent territories', () => {
      expect(areTerritoriesAdjacent('alaska', 'argentina')).toBe(false);
    });

    test('areTerritoriesAdjacent should return false for invalid territory', () => {
      expect(areTerritoriesAdjacent('invalid', 'alaska')).toBe(false);
    });
  });
});
