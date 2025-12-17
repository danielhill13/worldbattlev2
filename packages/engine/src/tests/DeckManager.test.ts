import { DeckManager } from '../services/DeckManager';
import { CardType } from '../models/Card';

describe('DeckManager', () => {
  describe('createDeck', () => {
    test('should create a deck with 42 cards', () => {
      const deck = DeckManager.createDeck();
      expect(deck).toHaveLength(42);
    });

    test('should assign unique IDs to all cards', () => {
      const deck = DeckManager.createDeck();
      const ids = deck.map(card => card.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(42);
    });

    test('should distribute card types evenly', () => {
      const deck = DeckManager.createDeck();
      const counts = DeckManager.getCardTypeCounts(deck);
      
      // 42 cards / 3 types = 14 of each
      expect(counts[CardType.INFANTRY]).toBe(14);
      expect(counts[CardType.CAVALRY]).toBe(14);
      expect(counts[CardType.ARTILLERY]).toBe(14);
    });

    test('should assign territory IDs to all cards', () => {
      const deck = DeckManager.createDeck();
      
      deck.forEach(card => {
        expect(card.territoryId).toBeTruthy();
        expect(typeof card.territoryId).toBe('string');
      });
    });

    test('should shuffle the deck', () => {
      // Create multiple decks and verify they're in different orders
      const deck1 = DeckManager.createDeck();
      const deck2 = DeckManager.createDeck();
      const deck3 = DeckManager.createDeck();
      
      const order1 = deck1.map(c => c.id).join(',');
      const order2 = deck2.map(c => c.id).join(',');
      const order3 = deck3.map(c => c.id).join(',');
      
      const orders = [order1, order2, order3];
      const uniqueOrders = new Set(orders);
      
      // With very high probability, at least one order should be different
      expect(uniqueOrders.size).toBeGreaterThan(1);
    });
  });

  describe('drawCard', () => {
    test('should draw the top card from the deck', () => {
      const deck = DeckManager.createDeck();
      const topCard = deck[0];
      
      const { card, remainingDeck } = DeckManager.drawCard(deck);
      
      expect(card).toEqual(topCard);
      expect(remainingDeck).toHaveLength(41);
      expect(remainingDeck).not.toContain(topCard);
    });

    test('should return null when drawing from empty deck', () => {
      const { card, remainingDeck } = DeckManager.drawCard([]);
      
      expect(card).toBeNull();
      expect(remainingDeck).toHaveLength(0);
    });

    test('should not modify the original deck', () => {
      const deck = DeckManager.createDeck();
      const originalLength = deck.length;
      
      DeckManager.drawCard(deck);
      
      expect(deck).toHaveLength(originalLength);
    });
  });

  describe('drawCards', () => {
    test('should draw multiple cards from the deck', () => {
      const deck = DeckManager.createDeck();
      
      const { cards, remainingDeck } = DeckManager.drawCards(deck, 5);
      
      expect(cards).toHaveLength(5);
      expect(remainingDeck).toHaveLength(37);
    });

    test('should draw cards in order from top of deck', () => {
      const deck = DeckManager.createDeck();
      const expectedCards = deck.slice(0, 3);
      
      const { cards } = DeckManager.drawCards(deck, 3);
      
      expect(cards).toEqual(expectedCards);
    });

    test('should draw all remaining cards if count exceeds deck size', () => {
      const deck = DeckManager.createDeck();
      
      const { cards, remainingDeck } = DeckManager.drawCards(deck, 100);
      
      expect(cards).toHaveLength(42);
      expect(remainingDeck).toHaveLength(0);
    });

    test('should return empty array when drawing from empty deck', () => {
      const { cards, remainingDeck } = DeckManager.drawCards([], 5);
      
      expect(cards).toHaveLength(0);
      expect(remainingDeck).toHaveLength(0);
    });
  });

  describe('returnCardsToDeck', () => {
    test('should add cards back to the deck', () => {
      const deck = DeckManager.createDeck();
      const { cards, remainingDeck } = DeckManager.drawCards(deck, 5);
      
      const newDeck = DeckManager.returnCardsToDeck(remainingDeck, cards);
      
      expect(newDeck).toHaveLength(42);
    });

    test('should shuffle the deck after returning cards', () => {
      const deck = DeckManager.createDeck();
      const { cards, remainingDeck } = DeckManager.drawCards(deck, 5);
      
      const newDeck1 = DeckManager.returnCardsToDeck(remainingDeck, cards);
      const newDeck2 = DeckManager.returnCardsToDeck(remainingDeck, cards);
      
      const order1 = newDeck1.map(c => c.id).join(',');
      const order2 = newDeck2.map(c => c.id).join(',');
      
      // With high probability, the shuffled decks should be in different orders
      expect(order1).not.toBe(order2);
    });

    test('should not modify original deck or cards', () => {
      const deck = DeckManager.createDeck();
      const cards = [deck[0], deck[1]];
      const originalDeckLength = deck.length;
      const originalCardsLength = cards.length;
      
      DeckManager.returnCardsToDeck(deck, cards);
      
      expect(deck).toHaveLength(originalDeckLength);
      expect(cards).toHaveLength(originalCardsLength);
    });
  });

  describe('getCardTypeCounts', () => {
    test('should count card types correctly', () => {
      const cards = [
        { id: '1', type: CardType.INFANTRY },
        { id: '2', type: CardType.INFANTRY },
        { id: '3', type: CardType.CAVALRY },
        { id: '4', type: CardType.ARTILLERY },
        { id: '5', type: CardType.ARTILLERY }
      ];
      
      const counts = DeckManager.getCardTypeCounts(cards);
      
      expect(counts[CardType.INFANTRY]).toBe(2);
      expect(counts[CardType.CAVALRY]).toBe(1);
      expect(counts[CardType.ARTILLERY]).toBe(2);
    });

    test('should return zero counts for empty array', () => {
      const counts = DeckManager.getCardTypeCounts([]);
      
      expect(counts[CardType.INFANTRY]).toBe(0);
      expect(counts[CardType.CAVALRY]).toBe(0);
      expect(counts[CardType.ARTILLERY]).toBe(0);
    });

    test('should count all cards of single type', () => {
      const cards = [
        { id: '1', type: CardType.CAVALRY },
        { id: '2', type: CardType.CAVALRY },
        { id: '3', type: CardType.CAVALRY }
      ];
      
      const counts = DeckManager.getCardTypeCounts(cards);
      
      expect(counts[CardType.INFANTRY]).toBe(0);
      expect(counts[CardType.CAVALRY]).toBe(3);
      expect(counts[CardType.ARTILLERY]).toBe(0);
    });
  });
});
