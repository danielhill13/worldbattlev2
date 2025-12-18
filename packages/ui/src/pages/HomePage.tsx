import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

export default function HomePage() {
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [gameCode, setGameCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { gameId } = await api.createGame(playerName.trim());
      navigate(`/lobby/${gameId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create game');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!gameCode.trim()) {
      setError('Please enter a game code');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Attempting to join game:', gameCode.trim());
      await api.joinGame(gameCode.trim(), playerName.trim());
      console.log('Join successful, navigating to lobby');
      navigate(`/lobby/${gameCode.trim()}`);
    } catch (err) {
      console.error('Join game error:', err);
      const message = err instanceof Error ? err.message : 'Failed to join game';
      setError(`${message} (Game ID: ${gameCode.trim().substring(0, 8)}...)`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-5xl font-bold text-white mb-2">
            🎮 World Battle
          </h1>
          <p className="text-gray-400 text-lg">
            Conquer the world in this Risk-like strategy game
          </p>
        </div>

        {/* Main Card */}
        <div className="card space-y-6">
          {/* Player Name Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              className="input w-full"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Create Game Button */}
          <button
            onClick={handleCreateGame}
            disabled={loading}
            className="btn btn-primary w-full text-lg py-3"
          >
            {loading ? 'Creating...' : 'Create New Game'}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800 text-gray-400">OR</span>
            </div>
          </div>

          {/* Join Game Section */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Game Code
            </label>
            <input
              type="text"
              className="input w-full font-mono text-sm"
              placeholder="Paste game code here"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.trim())}
            />
            <p className="text-xs text-gray-500 mt-1">
              Full game code from lobby (e.g., 550e8400-e29b-41d4-a716-446655440000)
            </p>
          </div>

          <button
            onClick={handleJoinGame}
            disabled={loading}
            className="btn btn-secondary w-full text-lg py-3"
          >
            {loading ? 'Joining...' : 'Join Game'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-danger-500/10 border border-danger-500 text-danger-500 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>2-6 players • Turn-based strategy</p>
        </div>
      </div>
    </div>
  );
}
