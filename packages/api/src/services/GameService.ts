import { v4 as uuidv4 } from 'uuid';
import { GameInitializer, GameState, GamePhase, ReinforcementCalculator } from '@world-battle/engine';
import { gameStore } from './GameStore';

/**
 * Game metadata for lobby
 */
export interface GameInfo {
  gameId: string;
  gameCode: string;
  creatorName: string;
  playerCount: number;
  maxPlayers: number;
  status: 'waiting' | 'in-progress' | 'finished';
  phase: GamePhase;
  currentPlayerName?: string;
  winner?: string;
}

/**
 * Service for managing games
 */
export class GameService {
  /**
   * Create a new game
   */
  createGame(playerName: string): { gameId: string; gameCode: string; gameState: GameState } {
    // Validate player name
    if (!playerName || playerName.trim().length === 0) {
      throw new Error('Player name is required');
    }

    if (playerName.length > 20) {
      throw new Error('Player name must be 20 characters or less');
    }

    // Generate unique game ID and code
    const gameId = uuidv4();
    const gameCode = this.generateGameCode();

    // Create game with single player (not initialized yet)
    // Game will be initialized when started
    const gameState: GameState = {
      gameId,
      phase: GamePhase.SETUP,
      players: [{
        id: 'player-1',
        name: playerName.trim(),
        color: 'RED' as any,
        isEliminated: false,
        cards: []
      }],
      turnOrder: ['player-1'],
      currentPlayerIndex: 0,
      territories: [],
      deck: [],
      currentTurn: null,
      winner: null,
      createdAt: new Date(),
      lastModified: new Date()
    };

    gameStore.create(gameId, gameState);

    return { gameId, gameCode, gameState };
  }

  /**
   * Join an existing game
   */
  joinGame(gameId: string, playerName: string): GameState {
    // Validate player name
    if (!playerName || playerName.trim().length === 0) {
      throw new Error('Player name is required');
    }

    if (playerName.length > 20) {
      throw new Error('Player name must be 20 characters or less');
    }

    // Get game
    const game = gameStore.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Check if game already started
    if (game.phase !== GamePhase.SETUP) {
      throw new Error('Game has already started');
    }

    // Check if game is full
    if (game.players.length >= 6) {
      throw new Error('Game is full (max 6 players)');
    }

    // Check for duplicate names
    const nameTaken = game.players.some(p => 
      p.name.toLowerCase() === playerName.trim().toLowerCase()
    );
    if (nameTaken) {
      throw new Error('Player name already taken');
    }

    // Add player
    const colors = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BLACK', 'PURPLE'];
    const playerId = `player-${game.players.length + 1}`;
    
    game.players.push({
      id: playerId,
      name: playerName.trim(),
      color: colors[game.players.length] as any,
      isEliminated: false,
      cards: []
    });

    game.turnOrder.push(playerId);
    game.lastModified = new Date();

    gameStore.update(gameId, game);

    return game;
  }

  /**
   * Start a game
   */
  startGame(gameId: string, requestingPlayerId: string): GameState {
    const game = gameStore.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }

    // Check if game already started
    if (game.phase !== GamePhase.SETUP) {
      throw new Error('Game has already started');
    }

    // Check if requesting player is the creator
    if (requestingPlayerId !== 'player-1') {
      throw new Error('Only the game creator can start the game');
    }

    // Check minimum players
    if (game.players.length < 2) {
      throw new Error('Need at least 2 players to start');
    }

    // Initialize the game using the engine
    const playerNames = game.players.map((p: any) => p.name);
    const initializedGame = GameInitializer.createGame(gameId, playerNames);

    // Calculate initial reinforcements for first player
    const firstPlayerId = initializedGame.turnOrder[0];
    const reinforcements = ReinforcementCalculator.calculateReinforcements(
      initializedGame,
      firstPlayerId
    );

    // Set initial turn state with reinforcements
    initializedGame.currentTurn = {
      playerId: firstPlayerId,
      reinforcementsRemaining: reinforcements,
      conqueredTerritoryThisTurn: false
    };

    // Update stored game
    gameStore.update(gameId, initializedGame);

    return initializedGame;
  }

  /**
   * Get a game by ID
   */
  getGame(gameId: string): GameState {
    const game = gameStore.get(gameId);
    if (!game) {
      throw new Error('Game not found');
    }
    return game;
  }

  /**
   * List all games (for lobby)
   */
  listGames(): GameInfo[] {
    const games = gameStore.list();
    
    return games.map(game => {
      const status = game.phase === GamePhase.SETUP 
        ? 'waiting' 
        : game.phase === GamePhase.GAME_OVER 
          ? 'finished' 
          : 'in-progress';

      const currentPlayer = game.currentTurn 
        ? game.players.find(p => p.id === game.currentTurn?.playerId)
        : undefined;

      return {
        gameId: game.gameId,
        gameCode: this.getGameCode(game.gameId), // Would need to store this
        creatorName: game.players[0]?.name || 'Unknown',
        playerCount: game.players.length,
        maxPlayers: 6,
        status,
        phase: game.phase,
        currentPlayerName: currentPlayer?.name,
        winner: game.winner ? game.players.find(p => p.id === game.winner)?.name : undefined
      };
    });
  }

  /**
   * Generate a random 4-character game code
   */
  private generateGameCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Get game code (placeholder - would need to store mapping)
   */
  private getGameCode(gameId: string): string {
    // For MVP, just use first 4 chars of game ID
    return gameId.substring(0, 4).toUpperCase();
  }
}

// Singleton instance
export const gameService = new GameService();
