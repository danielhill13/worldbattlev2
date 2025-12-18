/**
 * Card types in the game (classic style)
 */
export enum CardType {
  INFANTRY = 'INFANTRY',
  CAVALRY = 'CAVALRY',
  ARTILLERY = 'ARTILLERY'
}

/**
 * Represents a single card
 */
export interface Card {
  id: string;
  type: CardType;
  territoryId?: string; // Optional: some variants have territory on cards
}

/**
 * Card set trade-in values
 * Classic: 3 cards = 4, 4 cards = 6, 5 cards = 8, 6 cards = 10, etc.
 */
export function getArmiesForCardCount(cardCount: number): number {
  if (cardCount < 3) {
    return 0;
  }
  // Formula: 2 + (2 * cardCount)
  return 2 + (2 * cardCount);
}

/**
 * Validates if a card set can be traded in
 * Valid sets:
 * - 3 or more of the same type
 * - 3 or more with at least one of each type
 */
export function isValidCardSet(cards: Card[]): boolean {
  if (cards.length < 3) {
    return false;
  }

  const typeCounts = {
    [CardType.INFANTRY]: 0,
    [CardType.CAVALRY]: 0,
    [CardType.ARTILLERY]: 0
  };

  cards.forEach(card => {
    typeCounts[card.type]++;
  });

  // Check if all same type (3 or more)
  const allSameType = Object.values(typeCounts).some(count => count === cards.length);
  
  // Check if at least one of each type
  const hasOneOfEach = Object.values(typeCounts).every(count => count >= 1);

  return allSameType || hasOneOfEach;
}
