import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameState } from '@world-battle/engine';
import api from '../utils/api';

export default function GameLobbyPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [starting, setStarting] = useState(false);

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

      // If game has started, redirect to game page
      if (gameData.phase !== 'SETUP') {
        navigate(`/game/${gameId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  };

  const handleStartGame = async () => {
    if (!gameId || !game) return;

    setStarting(true);
    try {
      await api.startGame(gameId, 'player-1');
      // Will redirect via polling when game starts
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start game');
      setStarting(false);
    }
  };

  const copyGameCode = () => {
    if (gameId) {
      navigator.clipboard.writeText(gameId);
      // Optional: Show a toast notification
      alert('Game code copied to clipboard!');
    }
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

  const isCreator = game.players[0]?.id === 'player-1';
  const canStart = game.players.length >= 2 && game.players.length <= 6;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2">Game Lobby</h1>
          <p className="text-gray-400">Waiting for players to join...</p>
        </div>

        {/* Game Code Card */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex-1">
              <p className="text-sm text-gray-400 mb-1">Game Code</p>
              <p className="text-lg font-mono text-white break-all">
                {gameId}
              </p>
            </div>
            <button
              onClick={copyGameCode}
              className="btn btn-secondary ml-4 shrink-0"
            >
              📋 Copy
            </button>
          </div>
          <p className="text-xs text-gray-500">
            Share this code with other players to join
          </p>
        </div>

        {/* Players Card */}
        <div className="card">
          <h2 className="text-xl font-bold text-white mb-4">
            Players ({game.players.length}/6)
          </h2>
          
          <div className="space-y-3">
            {game.players.map((player, index) => (
              <div
                key={player.id}
                className="flex items-center justify-between bg-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: getPlayerColor(player.color) }}
                  ></div>
                  <div>
                    <p className="font-semibold text-white">{player.name}</p>
                    {index === 0 && (
                      <p className="text-xs text-gray-400">Creator</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-400">{player.color}</div>
              </div>
            ))}
            
            {/* Empty Slots */}
            {Array.from({ length: 6 - game.players.length }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="flex items-center bg-gray-700/50 rounded-lg p-4 border-2 border-dashed border-gray-600"
              >
                <p className="text-gray-500">Waiting for player...</p>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="card space-y-4">
          {isCreator ? (
            <>
              <button
                onClick={handleStartGame}
                disabled={!canStart || starting}
                className={`btn w-full text-lg py-3 ${
                  canStart && !starting ? 'btn-primary' : 'btn-disabled'
                }`}
              >
                {starting
                  ? 'Starting Game...'
                  : canStart
                  ? 'Start Game'
                  : 'Need 2-6 Players to Start'}
              </button>
              {!canStart && game.players.length < 2 && (
                <p className="text-sm text-gray-400 text-center">
                  Waiting for at least one more player...
                </p>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-400">
                Waiting for {game.players[0]?.name} to start the game...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-danger-500/10 border border-danger-500 text-danger-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Back Button */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

function getPlayerColor(color: string): string {
  const colors: Record<string, string> = {
    RED: '#ef4444',
    BLUE: '#3b82f6',
    GREEN: '#22c55e',
    YELLOW: '#eab308',
    BLACK: '#1f2937',
    PURPLE: '#a855f7',
  };
  return colors[color] || '#6b7280';
}
