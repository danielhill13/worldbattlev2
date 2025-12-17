import { GameInitializer } from '../services/GameInitializer';
import { GamePhase } from '../models/GameState';
import { ArmyColor } from '../models/Player';

describe('GameInitializer', () => {
  describe('createGame', () => {
    test('should throw error for less than 2 players', () => {
      expect(() => GameInitializer.createGame('game-1', ['Alice'])).toThrow(
        'Game must have 2-6 players'
      );
    });

    test('should throw error for more than 6 players', () => {
      const players = ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7'];
      expect(() => GameInitializer.createGame('game-1', players)).toThrow(
        'Game must have 2-6 players'
      );
    });

    test('should throw error for duplicate player names', () => {
      expect(() => GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Alice'])).toThrow(
        'Player names must be unique'
      );
    });

    test('should create game with 2 players', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);

      expect(game.gameId).toBe('game-1');
      expect(game.players).toHaveLength(2);
      expect(game.turnOrder).toHaveLength(2);
      expect(game.territories).toHaveLength(42);
      expect(game.phase).toBe(GamePhase.REINFORCE);
      expect(game.currentPlayerIndex).toBe(0);
    });

    test('should create game with 6 players', () => {
      const players = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank'];
      const game = GameInitializer.createGame('game-1', players);

      expect(game.players).toHaveLength(6);
      expect(game.turnOrder).toHaveLength(6);
      expect(game.territories).toHaveLength(42);
    });

    test('should assign unique colors to players', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie']);
      
      const colors = game.players.map(p => p.color);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(3);
      
      // Verify colors come from valid set
      colors.forEach(color => {
        expect(Object.values(ArmyColor)).toContain(color);
      });
    });

    test('should assign sequential player IDs', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie']);
      
      expect(game.players[0].id).toBe('player-1');
      expect(game.players[1].id).toBe('player-2');
      expect(game.players[2].id).toBe('player-3');
    });

    test('should initialize all players as not eliminated', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      
      game.players.forEach(player => {
        expect(player.isEliminated).toBe(false);
      });
    });

    test('should initialize all players with empty card hands', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      
      game.players.forEach(player => {
        expect(player.cards).toEqual([]);
      });
    });

    test('should create a shuffled deck of 42 cards', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      
      expect(game.deck).toHaveLength(42);
      
      // Verify all cards have IDs and types
      game.deck.forEach(card => {
        expect(card.id).toBeTruthy();
        expect(card.type).toBeTruthy();
      });
    });
  });

  describe('Territory Distribution', () => {
    test('should distribute all 42 territories to 2 players (21 each)', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      
      const player1Territories = game.territories.filter(t => t.occupiedBy === 'player-1');
      const player2Territories = game.territories.filter(t => t.occupiedBy === 'player-2');
      
      expect(player1Territories).toHaveLength(21);
      expect(player2Territories).toHaveLength(21);
    });

    test('should distribute all 42 territories to 3 players (14 each)', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie']);
      
      const player1Territories = game.territories.filter(t => t.occupiedBy === 'player-1');
      const player2Territories = game.territories.filter(t => t.occupiedBy === 'player-2');
      const player3Territories = game.territories.filter(t => t.occupiedBy === 'player-3');
      
      expect(player1Territories).toHaveLength(14);
      expect(player2Territories).toHaveLength(14);
      expect(player3Territories).toHaveLength(14);
    });

    test('should distribute territories to 4 players (extras by turn order)', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie', 'Diana']);
      
      // 42 territories / 4 players = 10 each, with 2 extras
      const territoryCounts = game.players.map(player => {
        return game.territories.filter(t => t.occupiedBy === player.id).length;
      });

      // Total should be 42
      expect(territoryCounts.reduce((a, b) => a + b, 0)).toBe(42);
      
      // Some players should have 10, some 11 (depending on turn order)
      expect(territoryCounts.every(count => count === 10 || count === 11)).toBe(true);
    });

    test('should ensure all territories are occupied', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie']);
      
      game.territories.forEach(territory => {
        expect(territory.occupiedBy).toBeTruthy();
        expect(territory.occupiedBy).toMatch(/^player-\d+$/);
      });
    });

    test('should place at least 1 army on each territory', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      
      game.territories.forEach(territory => {
        expect(territory.armies).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Initial Army Distribution', () => {
    test('should give 2 players 40 armies each', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      
      const player1Armies = game.territories
        .filter(t => t.occupiedBy === 'player-1')
        .reduce((sum, t) => sum + t.armies, 0);
      const player2Armies = game.territories
        .filter(t => t.occupiedBy === 'player-2')
        .reduce((sum, t) => sum + t.armies, 0);
      
      expect(player1Armies).toBe(40);
      expect(player2Armies).toBe(40);
    });

    test('should give 3 players 35 armies each', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie']);
      
      for (let i = 1; i <= 3; i++) {
        const playerArmies = game.territories
          .filter(t => t.occupiedBy === `player-${i}`)
          .reduce((sum, t) => sum + t.armies, 0);
        expect(playerArmies).toBe(35);
      }
    });

    test('should give 4 players 30 armies each', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie', 'Diana']);
      
      for (let i = 1; i <= 4; i++) {
        const playerArmies = game.territories
          .filter(t => t.occupiedBy === `player-${i}`)
          .reduce((sum, t) => sum + t.armies, 0);
        expect(playerArmies).toBe(30);
      }
    });

    test('should give 5 players 25 armies each', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve']);
      
      for (let i = 1; i <= 5; i++) {
        const playerArmies = game.territories
          .filter(t => t.occupiedBy === `player-${i}`)
          .reduce((sum, t) => sum + t.armies, 0);
        expect(playerArmies).toBe(25);
      }
    });

    test('should give 6 players 20 armies each', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank']);
      
      for (let i = 1; i <= 6; i++) {
        const playerArmies = game.territories
          .filter(t => t.occupiedBy === `player-${i}`)
          .reduce((sum, t) => sum + t.armies, 0);
        expect(playerArmies).toBe(20);
      }
    });
  });

  describe('Turn Order', () => {
    test('should randomize turn order', () => {
      // Create multiple games and check that turn orders differ
      const game1 = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie']);
      const game2 = GameInitializer.createGame('game-2', ['Alice', 'Bob', 'Charlie']);
      const game3 = GameInitializer.createGame('game-3', ['Alice', 'Bob', 'Charlie']);
      
      const orders = [
        game1.turnOrder.join(','),
        game2.turnOrder.join(','),
        game3.turnOrder.join(',')
      ];
      
      // At least one should be different (with very high probability)
      const uniqueOrders = new Set(orders);
      expect(uniqueOrders.size).toBeGreaterThan(1);
    });

    test('should set current player to first in turn order', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie']);
      
      expect(game.currentPlayerIndex).toBe(0);
      expect(game.currentTurn?.playerId).toBe(game.turnOrder[0]);
    });

    test('should include all players in turn order', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob', 'Charlie']);
      
      const playerIds = game.players.map(p => p.id).sort();
      const turnOrderIds = [...game.turnOrder].sort();
      
      expect(turnOrderIds).toEqual(playerIds);
    });
  });

  describe('Game State Initialization', () => {
    test('should initialize game in REINFORCE phase', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      expect(game.phase).toBe(GamePhase.REINFORCE);
    });

    test('should set winner to null', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      expect(game.winner).toBeNull();
    });

    test('should set conqueredTerritoryThisTurn to false', () => {
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      expect(game.currentTurn?.conqueredTerritoryThisTurn).toBe(false);
    });

    test('should set createdAt and lastModified timestamps', () => {
      const before = new Date();
      const game = GameInitializer.createGame('game-1', ['Alice', 'Bob']);
      const after = new Date();

      expect(game.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(game.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(game.lastModified.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(game.lastModified.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });
});
