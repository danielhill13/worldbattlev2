import { Card, CardType, getArmiesForCardCount, isValidCardSet } from '../models/Card';

describe('Card Model', () => {
  describe('getArmiesForCardCount', () => {
    test('should return 0 for less than 3 cards', () => {
      expect(getArmiesForCardCount(0)).toBe(0);
      expect(getArmiesForCardCount(1)).toBe(0);
      expect(getArmiesForCardCount(2)).toBe(0);
    });

    test('should return correct army count for card trades (Classic)', () => {
      expect(getArmiesForCardCount(3)).toBe(8); // 2 + (2 * 3) = 8
      expect(getArmiesForCardCount(4)).toBe(10); // 2 + (2 * 4) = 10
      expect(getArmiesForCardCount(5)).toBe(12); // 2 + (2 * 5) = 12
      expect(getArmiesForCardCount(6)).toBe(14); // 2 + (2 * 6) = 14
    });
  });

  describe('isValidCardSet', () => {
    const infantryCard: Card = { id: '1', type: CardType.INFANTRY };
    const cavalryCard: Card = { id: '2', type: CardType.CAVALRY };
    const artilleryCard: Card = { id: '3', type: CardType.ARTILLERY };

    test('should return false for less than 3 cards', () => {
      expect(isValidCardSet([])).toBe(false);
      expect(isValidCardSet([infantryCard])).toBe(false);
      expect(isValidCardSet([infantryCard, cavalryCard])).toBe(false);
    });

    test('should return true for 3 of the same type', () => {
      const threeInfantry: Card[] = [
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.INFANTRY }
      ];
      expect(isValidCardSet(threeInfantry)).toBe(true);
    });

    test('should return true for one of each type', () => {
      const oneOfEach: Card[] = [infantryCard, cavalryCard, artilleryCard];
      expect(isValidCardSet(oneOfEach)).toBe(true);
    });

    test('should return false for invalid sets (2 of one type, 1 of another)', () => {
      const invalid: Card[] = [
        { id: '1', type: CardType.CAVALRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.INFANTRY }
      ];
      expect(isValidCardSet(invalid)).toBe(false);
    });

    test('should return true for 4 cards with at least one of each type', () => {
      const fourCards: Card[] = [
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY }
      ];
      expect(isValidCardSet(fourCards)).toBe(true);
    });

    test('should return true for 4 of the same type', () => {
      const fourCavalry: Card[] = [
        { id: '1', type: CardType.CAVALRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.CAVALRY },
        { id: '4', type: CardType.CAVALRY }
      ];
      expect(isValidCardSet(fourCavalry)).toBe(true);
    });

    test('should return false for 4 cards without one of each type', () => {
      const invalid: Card[] = [
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.CAVALRY },
        { id: '4', type: CardType.CAVALRY }
      ];
      expect(isValidCardSet(invalid)).toBe(false);
    });

    test('should return true for 5+ cards with one of each type', () => {
      const fiveCards: Card[] = [
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY },
        { id: '5', type: CardType.CAVALRY }
      ];
      expect(isValidCardSet(fiveCards)).toBe(true);
    });
  });
});
