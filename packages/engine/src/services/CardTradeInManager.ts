import { Card, CardType, isValidCardSet, getArmiesForCardCount } from '../models/Card';
import { Player } from '../models/Player';

/**
 * Result of a card trade-in attempt
 */
export interface CardTradeInResult {
  success: boolean;
  armiesAwarded: number;
  cardsTraded: Card[];
  remainingCards: Card[];
  error?: string;
}

/**
 * Service for managing card trade-ins
 */
export class CardTradeInManager {
  /**
   * Check if a player must trade in cards (5+ cards)
   */
  static mustTradeIn(player: Player): boolean {
    return player.cards.length >= 5;
  }

  /**
   * Check if a player can trade in cards (3+ cards)
   */
  static canTradeIn(player: Player): boolean {
    return player.cards.length >= 3;
  }

  /**
   * Attempt to trade in cards for armies
   * @param player - Player trading in cards
   * @param cardIds - IDs of cards to trade in (must be 3+)
   * @returns Result of the trade-in attempt
   */
  static tradeInCards(player: Player, cardIds: string[]): CardTradeInResult {
    // Validate minimum card count
    if (cardIds.length < 3) {
      return {
        success: false,
        armiesAwarded: 0,
        cardsTraded: [],
        remainingCards: player.cards,
        error: 'Must trade in at least 3 cards'
      };
    }

    // Find the cards to trade
    const cardsToTrade: Card[] = [];
    for (const cardId of cardIds) {
      const card = player.cards.find(c => c.id === cardId);
      if (!card) {
        return {
          success: false,
          armiesAwarded: 0,
          cardsTraded: [],
          remainingCards: player.cards,
          error: `Card ${cardId} not found in player's hand`
        };
      }
      cardsToTrade.push(card);
    }

    // Validate the card set
    if (!isValidCardSet(cardsToTrade)) {
      return {
        success: false,
        armiesAwarded: 0,
        cardsTraded: [],
        remainingCards: player.cards,
        error: 'Invalid card set: must be all same type or one of each type'
      };
    }

    // Calculate armies awarded
    const armiesAwarded = getArmiesForCardCount(cardsToTrade.length);

    // Remove traded cards from player's hand
    const remainingCards = player.cards.filter(c => !cardIds.includes(c.id));

    return {
      success: true,
      armiesAwarded,
      cardsTraded: cardsToTrade,
      remainingCards,
      error: undefined
    };
  }

  /**
   * Get all possible valid card sets a player can trade in
   * Returns array of card ID arrays representing valid sets
   */
  static getPossibleTradeSets(player: Player): string[][] {
    const cards = player.cards;
    if (cards.length < 3) {
      return [];
    }

    const validSets: string[][] = [];

    // Check all combinations of 3+ cards
    // For efficiency, we'll check the most common cases:
    // 1. Sets of exactly 3 cards
    // 2. Sets of 4+ cards if player has 5+ (mandatory trade)

    // Generate all combinations of 3 cards
    for (let i = 0; i < cards.length - 2; i++) {
      for (let j = i + 1; j < cards.length - 1; j++) {
        for (let k = j + 1; k < cards.length; k++) {
          const set = [cards[i], cards[j], cards[k]];
          if (isValidCardSet(set)) {
            validSets.push(set.map(c => c.id));
          }
        }
      }
    }

    // If player has 4+ cards, also check 4-card combinations
    if (cards.length >= 4) {
      for (let i = 0; i < cards.length - 3; i++) {
        for (let j = i + 1; j < cards.length - 2; j++) {
          for (let k = j + 1; k < cards.length - 1; k++) {
            for (let l = k + 1; l < cards.length; l++) {
              const set = [cards[i], cards[j], cards[k], cards[l]];
              if (isValidCardSet(set)) {
                validSets.push(set.map(c => c.id));
              }
            }
          }
        }
      }
    }

    // If player has 5+ cards, also check 5-card combinations
    if (cards.length >= 5) {
      for (let i = 0; i < cards.length - 4; i++) {
        for (let j = i + 1; j < cards.length - 3; j++) {
          for (let k = j + 1; k < cards.length - 2; k++) {
            for (let l = k + 1; l < cards.length - 1; l++) {
              for (let m = l + 1; m < cards.length; m++) {
                const set = [cards[i], cards[j], cards[k], cards[l], cards[m]];
                if (isValidCardSet(set)) {
                  validSets.push(set.map(c => c.id));
                }
              }
            }
          }
        }
      }
    }

    return validSets;
  }

  /**
   * Get a recommended card set to trade in
   * Prioritizes smallest valid set (to keep more cards)
   */
  static getRecommendedTradeSet(player: Player): string[] | null {
    const possibleSets = this.getPossibleTradeSets(player);
    
    if (possibleSets.length === 0) {
      return null;
    }

    // Return the smallest valid set (usually 3 cards)
    return possibleSets.reduce((smallest, current) => {
      return current.length < smallest.length ? current : smallest;
    });
  }

  /**
   * Get card type breakdown for a player's hand
   */
  static getHandBreakdown(player: Player): {
    total: number;
    infantry: number;
    cavalry: number;
    artillery: number;
  } {
    return {
      total: player.cards.length,
      infantry: player.cards.filter(c => c.type === CardType.INFANTRY).length,
      cavalry: player.cards.filter(c => c.type === CardType.CAVALRY).length,
      artillery: player.cards.filter(c => c.type === CardType.ARTILLERY).length
    };
  }
}
