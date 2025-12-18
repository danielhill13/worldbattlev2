import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameState } from '@world-battle/engine';
import api from '../utils/api';
import WorldMap from '../components/WorldMap';
import ReinforcementPanel from '../components/ReinforcementPanel';
import AttackPanel from '../components/AttackPanel';
import FortifyPanel from '../components/FortifyPanel';

export default function GamePage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string>('');

  // Get player ID from localStorage or default to first player for testing
  useEffect(() => {
    const storedPlayerId = localStorage.getItem(`player-${gameId}`);
    if (storedPlayerId) {
      setPlayerId(storedPlayerId);
    } else if (game && game.players.length > 0) {
      // Default to first player if not stored (for testing)
      setPlayerId(game.players[0].id);
      localStorage.setItem(`player-${gameId}`, game.players[0].id);
    }
  }, [gameId, game]);

  useEffect(() => {
    loadGame();
    
    // Poll for updates every 2 seconds
    const interval = setInterval(loadGame, 2000);
    return () => clearInterval(interval);
  }, [gameId]);

  const loadGame = async () => {
    if (!gameId) return;

    try {
      const { game: gameData } = await api.getGame(gameId);
      setGame(gameData);
      setError('');

      // If game not started yet, redirect to lobby
      if (gameData.phase === 'SETUP') {
        navigate(`/lobby/${gameId}`);
      }

      // If game over, show game over state
      if (gameData.phase === 'GAME_OVER') {
        // Will be handled in render
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = () => {
    loadGame();
  };

  const handleTerritoryClick = (territoryId: string) => {
    console.log('Territory clicked:', territoryId);
    setSelectedTerritory(territoryId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading game...</p>
        </div>
      </div>
    );
  }

  if (error || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-md w-full">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Error</h2>
            <p className="text-gray-400 mb-6">{error || 'Game not found'}</p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Game Over
  if (game.phase === 'GAME_OVER') {
    const winner = game.players.find(p => p.id === game.winner);
    const isWinner = game.winner === playerId;

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="card max-w-2xl w-full text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            {isWinner ? '🎉 Victory!' : '💀 Defeated'}
          </h1>
          <h2 className="text-3xl text-gray-300 mb-6">
            {winner?.name} wins the game!
          </h2>
          
          <div className="bg-gray-700 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-white mb-4">Final Standings</h3>
            <div className="space-y-3">
              {game.players
                .sort((a, b) => {
                  const aCount = game.territories.filter(t => t.occupiedBy === a.id).length;
                  const bCount = game.territories.filter(t => t.occupiedBy === b.id).length;
                  return bCount - aCount;
                })
                .map((player, idx) => {
                  const territoryCount = game.territories.filter(t => t.occupiedBy === player.id).length;
                  return (
                    <div key={player.id} className="flex justify-between items-center">
                      <span className="text-white">
                        {idx + 1}. {player.name}
                        {player.id === game.winner && ' 👑'}
                      </span>
                      <span className="text-gray-400">
                        {territoryCount} {territoryCount === 1 ? 'territory' : 'territories'}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>

          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const currentPlayer = game.players.find(p => p.id === game.currentTurn?.playerId);
  const isCurrentPlayer = game.currentTurn?.playerId === playerId;
  const myPlayer = game.players.find(p => p.id === playerId);

  // Get selectable territories based on phase
  const getSelectableTerritories = (): string[] => {
    if (!isCurrentPlayer || !gameId) return [];
    
    if (game.phase === 'REINFORCE') {
      // Can select any owned territory to reinforce
      return game.territories
        .filter(t => t.occupiedBy === playerId)
        .map(t => t.territoryId);
    }
    
    if (game.phase === 'ATTACK') {
      // Can select territories with 2+ armies to attack from
      // Or adjacent enemies if already selected attacker
      return game.territories
        .filter(t => t.occupiedBy === playerId && t.armies >= 2)
        .map(t => t.territoryId);
    }
    
    if (game.phase === 'FORTIFY') {
      // Can select territories with 2+ armies to fortify from
      return game.territories
        .filter(t => t.occupiedBy === playerId && t.armies >= 2)
        .map(t => t.territoryId);
    }
    
    return [];
  };

  const handleMapTerritoryClick = (territoryId: string) => {
    setSelectedTerritory(territoryId);
    handleTerritoryClick(territoryId);
  };

  return (
    <div className="min-h-screen p-4 space-y-4">
      {/* Header */}
      <div className="card">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">World Battle</h1>
            <p className="text-gray-400">
              Phase: <span className="text-primary-500 font-semibold">{game.phase}</span>
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-gray-400">Current Turn</p>
            <p className="text-lg font-bold text-white">
              {currentPlayer?.name || 'Unknown'}
            </p>
            {isCurrentPlayer && (
              <span className="text-xs text-primary-500">← Your turn!</span>
            )}
            {!isCurrentPlayer && !myPlayer?.isEliminated && (
              <span className="text-xs text-gray-500">Waiting...</span>
            )}
            {myPlayer?.isEliminated && (
              <span className="text-xs text-danger-500">Eliminated</span>
            )}
          </div>
        </div>
      </div>

      {/* Game Board */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Map - Takes 3 columns on large screens */}
        <div className="lg:col-span-3">
          <div className="card p-0" style={{ height: '600px' }}>
            <WorldMap
              game={game}
              currentPlayerId={playerId}
              onTerritoryClick={handleMapTerritoryClick}
              selectedTerritory={selectedTerritory}
              selectableTerritories={getSelectableTerritories()}
            />
          </div>
        </div>

        {/* Sidebar - Takes 1 column */}
        <div className="space-y-4">
          {/* Phase-specific Actions */}
          {playerId && isCurrentPlayer && !myPlayer?.isEliminated && (
            <div className="card">
              {game.phase === 'REINFORCE' && gameId && (
                <ReinforcementPanel
                  game={game}
                  gameId={gameId}
                  playerId={playerId}
                  onUpdate={handleUpdate}
                  selectedTerritory={selectedTerritory}
                />
              )}

              {game.phase === 'ATTACK' && gameId && (
                <AttackPanel
                  game={game}
                  gameId={gameId}
                  playerId={playerId}
                  selectedTerritory={selectedTerritory}
                  onUpdate={handleUpdate}
                  onTerritorySelect={setSelectedTerritory}
                />
              )}

              {game.phase === 'FORTIFY' && gameId && (
                <FortifyPanel
                  game={game}
                  gameId={gameId}
                  playerId={playerId}
                  selectedTerritory={selectedTerritory}
                  onUpdate={handleUpdate}
                  onTerritorySelect={setSelectedTerritory}
                />
              )}
            </div>
          )}

          {/* Loading Player Info */}
          {!playerId && (
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">🔄</div>
              <p className="text-white font-semibold">Loading player data...</p>
            </div>
          )}

          {/* Waiting State */}
          {!isCurrentPlayer && !myPlayer?.isEliminated && (
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">⏳</div>
              <p className="text-white font-semibold mb-1">Waiting for turn</p>
              <p className="text-gray-400 text-sm">
                {currentPlayer?.name} is playing...
              </p>
            </div>
          )}

          {/* Eliminated State */}
          {myPlayer?.isEliminated && (
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">💀</div>
              <p className="text-white font-semibold mb-1">You've been eliminated</p>
              <p className="text-gray-400 text-sm">
                Watch the rest of the game unfold
              </p>
            </div>
          )}

          {/* Player Stats */}
          {myPlayer && !myPlayer.isEliminated && (
            <div className="card">
              <h3 className="font-bold text-white mb-3">Your Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Territories:</span>
                  <span className="text-white font-semibold">
                    {game.territories.filter(t => t.occupiedBy === playerId).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Armies:</span>
                  <span className="text-white font-semibold">
                    {game.territories
                      .filter(t => t.occupiedBy === playerId)
                      .reduce((sum, t) => sum + t.armies, 0)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cards:</span>
                  <span className="text-white font-semibold">
                    {myPlayer.cards.length}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Leave Game */}
          <div className="card">
            <button
              className="btn btn-secondary w-full text-sm"
              onClick={() => {
                if (confirm('Are you sure you want to leave?')) {
                  navigate('/');
                }
              }}
            >
              Leave Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
