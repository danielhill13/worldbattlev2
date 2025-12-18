import { GameState } from '@world-battle/engine';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * API client for World Battle backend
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log(`API Request: ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log(`API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ 
        error: { message: 'Request failed' } 
      }));
      console.error('API Error:', error);
      throw new Error(error.error?.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Game Management
  async createGame(playerName: string): Promise<{
    gameId: string;
    gameCode: string;
    game: GameState;
  }> {
    return this.request('/games', {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
  }

  async joinGame(gameId: string, playerName: string): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/join`, {
      method: 'POST',
      body: JSON.stringify({ playerName }),
    });
  }

  async startGame(gameId: string, playerId: string): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/start`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  async getGame(gameId: string): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}`);
  }

  async listGames(): Promise<{ games: any[] }> {
    return this.request('/games');
  }

  // Reinforcement Phase
  async getReinforcementInfo(gameId: string, playerId: string): Promise<any> {
    return this.request(`/games/${gameId}/reinforcements?playerId=${playerId}`);
  }

  async tradeCards(
    gameId: string,
    playerId: string,
    cardIds: string[]
  ): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/trade-cards`, {
      method: 'POST',
      body: JSON.stringify({ playerId, cardIds }),
    });
  }

  async placeReinforcements(
    gameId: string,
    playerId: string,
    placements: Array<{ territoryId: string; armies: number }>
  ): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/place-reinforcements`, {
      method: 'POST',
      body: JSON.stringify({ playerId, placements }),
    });
  }

  async endReinforcement(
    gameId: string,
    playerId: string
  ): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/end-reinforcement`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  // Attack Phase
  async attack(
    gameId: string,
    playerId: string,
    from: string,
    to: string
  ): Promise<{ game: GameState; attackResult: any }> {
    return this.request(`/games/${gameId}/attack`, {
      method: 'POST',
      body: JSON.stringify({ playerId, from, to }),
    });
  }

  async autoAttack(
    gameId: string,
    playerId: string,
    from: string,
    to: string
  ): Promise<{ game: GameState; attackResult: any }> {
    return this.request(`/games/${gameId}/auto-attack`, {
      method: 'POST',
      body: JSON.stringify({ playerId, from, to }),
    });
  }

  async moveArmies(
    gameId: string,
    playerId: string,
    from: string,
    to: string,
    armies: number
  ): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/move-armies`, {
      method: 'POST',
      body: JSON.stringify({ playerId, from, to, armies }),
    });
  }

  async endAttack(gameId: string, playerId: string): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/end-attack`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }

  // Fortify Phase
  async fortify(
    gameId: string,
    playerId: string,
    from: string,
    to: string,
    armies: number
  ): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/fortify`, {
      method: 'POST',
      body: JSON.stringify({ playerId, from, to, armies }),
    });
  }

  async endTurn(gameId: string, playerId: string): Promise<{ game: GameState }> {
    return this.request(`/games/${gameId}/end-turn`, {
      method: 'POST',
      body: JSON.stringify({ playerId }),
    });
  }
}

export const api = new ApiClient();
export default api;
