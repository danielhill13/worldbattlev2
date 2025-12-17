import { CardTradeInManager } from '../services/CardTradeInManager';
import { Card, CardType } from '../models/Card';
import { Player, ArmyColor } from '../models/Player';

describe('CardTradeInManager', () => {
  const createTestPlayer = (cards: Card[]): Player => ({
    id: 'player-1',
    name: 'Alice',
    color: ArmyColor.RED,
    isEliminated: false,
    cards
  });

  describe('mustTradeIn', () => {
    test('should return false for player with less than 5 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY }
      ]);

      expect(CardTradeInManager.mustTradeIn(player)).toBe(false);
    });

    test('should return true for player with exactly 5 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY },
        { id: '5', type: CardType.CAVALRY }
      ]);

      expect(CardTradeInManager.mustTradeIn(player)).toBe(true);
    });

    test('should return true for player with more than 5 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY },
        { id: '5', type: CardType.CAVALRY },
        { id: '6', type: CardType.ARTILLERY }
      ]);

      expect(CardTradeInManager.mustTradeIn(player)).toBe(true);
    });
  });

  describe('canTradeIn', () => {
    test('should return false for player with less than 3 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY }
      ]);

      expect(CardTradeInManager.canTradeIn(player)).toBe(false);
    });

    test('should return true for player with exactly 3 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY }
      ]);

      expect(CardTradeInManager.canTradeIn(player)).toBe(true);
    });

    test('should return true for player with more than 3 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY }
      ]);

      expect(CardTradeInManager.canTradeIn(player)).toBe(true);
    });
  });

  describe('tradeInCards', () => {
    test('should fail with less than 3 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Must trade in at least 3 cards');
      expect(result.armiesAwarded).toBe(0);
    });

    test('should fail if card not found in hand', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2', '999']);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Card 999 not found in player's hand");
    });

    test('should fail with invalid card set (2 of one type, 1 of another)', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.CAVALRY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2', '3']);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid card set: must be all same type or one of each type');
    });

    test('should succeed with 3 of the same type', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.INFANTRY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2', '3']);

      expect(result.success).toBe(true);
      expect(result.armiesAwarded).toBe(8); // 3 cards = 8 armies
      expect(result.cardsTraded).toHaveLength(3);
      expect(result.remainingCards).toHaveLength(0);
    });

    test('should succeed with one of each type', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2', '3']);

      expect(result.success).toBe(true);
      expect(result.armiesAwarded).toBe(8); // 3 cards = 8 armies
      expect(result.cardsTraded).toHaveLength(3);
      expect(result.remainingCards).toHaveLength(0);
    });

    test('should award correct armies for 4 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2', '3', '4']);

      expect(result.success).toBe(true);
      expect(result.armiesAwarded).toBe(10); // 4 cards = 10 armies
    });

    test('should award correct armies for 5 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY },
        { id: '5', type: CardType.CAVALRY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2', '3', '4', '5']);

      expect(result.success).toBe(true);
      expect(result.armiesAwarded).toBe(12); // 5 cards = 12 armies
    });

    test('should award correct armies for 6 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.CAVALRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.CAVALRY },
        { id: '4', type: CardType.CAVALRY },
        { id: '5', type: CardType.CAVALRY },
        { id: '6', type: CardType.CAVALRY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2', '3', '4', '5', '6']);

      expect(result.success).toBe(true);
      expect(result.armiesAwarded).toBe(14); // 6 cards = 14 armies
    });

    test('should leave remaining cards in hand', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY },
        { id: '5', type: CardType.CAVALRY }
      ]);

      const result = CardTradeInManager.tradeInCards(player, ['1', '2', '3']);

      expect(result.success).toBe(true);
      expect(result.remainingCards).toHaveLength(2);
      expect(result.remainingCards.map(c => c.id)).toEqual(['4', '5']);
    });
  });

  describe('getPossibleTradeSets', () => {
    test('should return empty array for less than 3 cards', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY }
      ]);

      const sets = CardTradeInManager.getPossibleTradeSets(player);
      expect(sets).toHaveLength(0);
    });

    test('should find valid 3-card set (all same type)', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.INFANTRY }
      ]);

      const sets = CardTradeInManager.getPossibleTradeSets(player);
      expect(sets.length).toBeGreaterThan(0);
      expect(sets[0]).toEqual(['1', '2', '3']);
    });

    test('should find valid 3-card set (one of each)', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY }
      ]);

      const sets = CardTradeInManager.getPossibleTradeSets(player);
      expect(sets.length).toBeGreaterThan(0);
    });

    test('should find multiple valid sets when available', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.INFANTRY },
        { id: '4', type: CardType.CAVALRY }
      ]);

      const sets = CardTradeInManager.getPossibleTradeSets(player);
      // Should have at least the 3 infantry set
      expect(sets.length).toBeGreaterThan(0);
    });

    test('should not find sets when none valid', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.CAVALRY }
      ]);

      const sets = CardTradeInManager.getPossibleTradeSets(player);
      expect(sets).toHaveLength(0);
    });
  });

  describe('getRecommendedTradeSet', () => {
    test('should return null when no valid sets', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY }
      ]);

      const recommended = CardTradeInManager.getRecommendedTradeSet(player);
      expect(recommended).toBeNull();
    });

    test('should return smallest valid set', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.INFANTRY },
        { id: '4', type: CardType.CAVALRY }
      ]);

      const recommended = CardTradeInManager.getRecommendedTradeSet(player);
      expect(recommended).not.toBeNull();
      expect(recommended?.length).toBe(3);
    });

    test('should recommend 3-card set when available', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.ARTILLERY },
        { id: '4', type: CardType.INFANTRY },
        { id: '5', type: CardType.CAVALRY }
      ]);

      const recommended = CardTradeInManager.getRecommendedTradeSet(player);
      expect(recommended).not.toBeNull();
      expect(recommended?.length).toBe(3);
    });
  });

  describe('getHandBreakdown', () => {
    test('should return correct breakdown', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.CAVALRY },
        { id: '4', type: CardType.ARTILLERY },
        { id: '5', type: CardType.ARTILLERY }
      ]);

      const breakdown = CardTradeInManager.getHandBreakdown(player);

      expect(breakdown.total).toBe(5);
      expect(breakdown.infantry).toBe(2);
      expect(breakdown.cavalry).toBe(1);
      expect(breakdown.artillery).toBe(2);
    });

    test('should return zeros for empty hand', () => {
      const player = createTestPlayer([]);

      const breakdown = CardTradeInManager.getHandBreakdown(player);

      expect(breakdown.total).toBe(0);
      expect(breakdown.infantry).toBe(0);
      expect(breakdown.cavalry).toBe(0);
      expect(breakdown.artillery).toBe(0);
    });

    test('should count all of one type correctly', () => {
      const player = createTestPlayer([
        { id: '1', type: CardType.CAVALRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.CAVALRY },
        { id: '4', type: CardType.CAVALRY }
      ]);

      const breakdown = CardTradeInManager.getHandBreakdown(player);

      expect(breakdown.total).toBe(4);
      expect(breakdown.infantry).toBe(0);
      expect(breakdown.cavalry).toBe(4);
      expect(breakdown.artillery).toBe(0);
    });
  });
});
