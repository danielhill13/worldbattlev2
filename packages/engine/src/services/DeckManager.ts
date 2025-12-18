import { Card, CardType } from '../models/Card';
import { TERRITORIES } from '../data/mapData';

/**
 * Service for managing the card deck
 */
export class DeckManager {
  /**
   * Create a shuffled deck with cards for all territories
   * Classic: 42 territory cards, 2 wild cards
   * For MVP: Just territory cards with types distributed evenly
   */
  static createDeck(): Card[] {
    const cards: Card[] = [];
    const cardTypes = [CardType.INFANTRY, CardType.CAVALRY, CardType.ARTILLERY];

    // Create one card per territory, cycling through card types
    TERRITORIES.forEach((territory, index) => {
      cards.push({
        id: `card-${index + 1}`,
        type: cardTypes[index % cardTypes.length],
        territoryId: territory.id
      });
    });

    // Shuffle the deck
    return this.shuffleDeck(cards);
  }

  /**
   * Draw a card from the deck
   */
  static drawCard(deck: Card[]): { card: Card | null; remainingDeck: Card[] } {
    if (deck.length === 0) {
      return { card: null, remainingDeck: [] };
    }

    const [card, ...remainingDeck] = deck;
    return { card, remainingDeck };
  }

  /**
   * Draw multiple cards from the deck
   */
  static drawCards(deck: Card[], count: number): { cards: Card[]; remainingDeck: Card[] } {
    const drawnCards: Card[] = [];
    let currentDeck = [...deck];

    for (let i = 0; i < count && currentDeck.length > 0; i++) {
      const { card, remainingDeck } = this.drawCard(currentDeck);
      if (card) {
        drawnCards.push(card);
        currentDeck = remainingDeck;
      }
    }

    return { cards: drawnCards, remainingDeck: currentDeck };
  }

  /**
   * Return cards to the deck (when player is eliminated)
   */
  static returnCardsToDeck(deck: Card[], cards: Card[]): Card[] {
    const newDeck = [...deck, ...cards];
    return this.shuffleDeck(newDeck);
  }

  /**
   * Shuffle the deck using Fisher-Yates algorithm
   */
  private static shuffleDeck(deck: Card[]): Card[] {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get card type distribution in a set of cards
   */
  static getCardTypeCounts(cards: Card[]): Record<CardType, number> {
    return {
      [CardType.INFANTRY]: cards.filter(c => c.type === CardType.INFANTRY).length,
      [CardType.CAVALRY]: cards.filter(c => c.type === CardType.CAVALRY).length,
      [CardType.ARTILLERY]: cards.filter(c => c.type === CardType.ARTILLERY).length
    };
  }
}
