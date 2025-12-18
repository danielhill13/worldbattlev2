import { useState, useEffect } from 'react';
import { GameState } from '@world-battle/engine';
import api from '../utils/api';
import { TERRITORY_ADJACENCIES } from '../utils/adjacency';

interface FortifyPanelProps {
  game: GameState;
  gameId: string;
  playerId: string;
  selectedTerritory: string | null;
  onUpdate: () => void;
  onTerritorySelect: (territoryId: string) => void;
}

export default function FortifyPanel({
  game,
  gameId,
  playerId,
  selectedTerritory,
  onUpdate,
  onTerritorySelect
}: FortifyPanelProps) {
  const [fortifyFrom, setFortifyFrom] = useState<string | null>(null);
  const [fortifyTo, setFortifyTo] = useState<string | null>(null);
  const [armiesCount, setArmiesCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasFortified, setHasFortified] = useState(false);

  const myTerritories = game.territories.filter(t => t.occupiedBy === playerId);
  const movableTerritories = myTerritories.filter(t => t.armies >= 2);

  // Handle map clicks
  useEffect(() => {
    if (!selectedTerritory || hasFortified) return;
    
    const territory = myTerritories.find(t => t.territoryId === selectedTerritory);
    if (!territory) return;
    
    // Select source
    if (!fortifyFrom && territory.armies >= 2) {
      handleSelectSource(selectedTerritory);
    }
    // Select destination
    else if (fortifyFrom && selectedTerritory !== fortifyFrom) {
      const connectedTerritories = getConnectedTerritories(fortifyFrom);
      if (connectedTerritories.includes(selectedTerritory)) {
        handleSelectDestination(selectedTerritory);
      }
    }
  }, [selectedTerritory]);

  // Get territories connected to source through owned territories (BFS)
  const getConnectedTerritories = (fromTerritoryId: string): string[] => {
    const visited = new Set<string>();
    const queue = [fromTerritoryId];
    const connected: string[] = [];
    
    visited.add(fromTerritoryId);
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      
      // Get adjacent territories that we own
      const adjacencies = TERRITORY_ADJACENCIES[current] || [];
      for (const adjId of adjacencies) {
        if (visited.has(adjId)) continue;
        
        const territory = myTerritories.find(t => t.territoryId === adjId);
        if (territory) {
          visited.add(adjId);
          queue.push(adjId);
          if (adjId !== fromTerritoryId) {
            connected.push(adjId);
          }
        }
      }
    }
    
    return connected;
  };

  const handleSelectSource = (territoryId: string) => {
    setFortifyFrom(territoryId);
    setFortifyTo(null);
    setArmiesCount(1);
    onTerritorySelect(territoryId);
  };

  const handleSelectDestination = (territoryId: string) => {
    setFortifyTo(territoryId);
    onTerritorySelect(territoryId);
  };

  const handleFortify = async () => {
    if (!fortifyFrom || !fortifyTo) return;

    setLoading(true);
    setError('');

    try {
      await api.fortify(gameId, playerId, fortifyFrom, fortifyTo, armiesCount);
      setHasFortified(true);
      setFortifyFrom(null);
      setFortifyTo(null);
      setArmiesCount(1);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Fortify failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEndTurn = async () => {
    setLoading(true);
    setError('');

    try {
      await api.endTurn(gameId, playerId);
      setFortifyFrom(null);
      setFortifyTo(null);
      setArmiesCount(1);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end turn');
    } finally {
      setLoading(false);
    }
  };

  const getMaxArmies = () => {
    if (!fortifyFrom) return 1;
    const territory = game.territories.find(t => t.territoryId === fortifyFrom);
    return territory ? territory.armies - 1 : 1;
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-bold text-white mb-2">Fortify Phase</h3>
        <p className="text-gray-400 text-sm">
          {hasFortified && 'Fortify complete. End your turn.'}
          {!hasFortified && !fortifyFrom && 'Select a territory to move armies from (optional)'}
          {!hasFortified && fortifyFrom && !fortifyTo && 'Select a connected territory to move armies to'}
          {!hasFortified && fortifyFrom && fortifyTo && 'Choose how many armies to move'}
        </p>
      </div>

      {/* Already Fortified */}
      {hasFortified && (
        <div className="bg-green-700 rounded-lg p-4">
          <p className="text-white text-center">✅ Fortify complete!</p>
          <p className="text-gray-200 text-sm text-center mt-2">Click "End Turn" to finish</p>
        </div>
      )}

      {/* Select Source */}
      {!hasFortified && !fortifyFrom && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Your Territories (2+ armies)</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {movableTerritories.length > 0 ? (
              movableTerritories.slice(0, 10).map(territory => (
                <button
                  key={territory.territoryId}
                  onClick={() => handleSelectSource(territory.territoryId)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-600 rounded p-2 transition"
                >
                  <p className="text-white text-sm font-medium">
                    {territory.territoryId.replace(/-/g, ' ')}
                  </p>
                  <p className="text-gray-400 text-xs">Armies: {territory.armies}</p>
                </button>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No territories can fortify (need 2+ armies)</p>
            )}
          </div>
        </div>
      )}

      {/* Select Destination */}
      {!hasFortified && fortifyFrom && !fortifyTo && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">
            Connected to {fortifyFrom.replace(/-/g, ' ')}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getConnectedTerritories(fortifyFrom)
              .slice(0, 15)
              .map(territoryId => {
                const territory = game.territories.find(t => t.territoryId === territoryId);
                if (!territory) return null;
                return (
                  <button
                    key={territoryId}
                    onClick={() => handleSelectDestination(territoryId)}
                    className="w-full text-left bg-gray-800 hover:bg-gray-600 rounded p-2 transition"
                  >
                    <p className="text-white text-sm font-medium">
                      {territoryId.replace(/-/g, ' ')}
                    </p>
                    <p className="text-gray-400 text-xs">Armies: {territory.armies}</p>
                  </button>
                );
              })}
          </div>

          <button
            onClick={() => setFortifyFrom(null)}
            className="btn btn-secondary w-full mt-3 text-sm"
          >
            ← Choose Different Territory
          </button>
        </div>
      )}

      {/* Fortify Controls */}
      {!hasFortified && fortifyFrom && fortifyTo && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Move Armies</h4>

          <div className="bg-gray-800 rounded p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">From:</span>
              <span className="text-white font-medium">{fortifyFrom.replace(/-/g, ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">To:</span>
              <span className="text-white font-medium">{fortifyTo.replace(/-/g, ' ')}</span>
            </div>
          </div>

          <div className="flex items-center justify-between bg-gray-800 rounded p-3 mb-3">
            <button
              onClick={() => setArmiesCount(Math.max(1, armiesCount - 1))}
              className="w-10 h-10 rounded bg-gray-600 hover:bg-gray-500"
            >
              -
            </button>
            <div className="text-center">
              <p className="text-white text-lg font-bold">{armiesCount}</p>
              <p className="text-gray-400 text-xs">Max: {getMaxArmies()}</p>
            </div>
            <button
              onClick={() => setArmiesCount(Math.min(getMaxArmies(), armiesCount + 1))}
              className="w-10 h-10 rounded bg-gray-600 hover:bg-gray-500"
            >
              +
            </button>
          </div>

          <div className="space-y-2">
            <button
              onClick={handleFortify}
              disabled={loading}
              className="btn btn-primary w-full"
            >
              {loading ? 'Moving...' : `Move ${armiesCount} ${armiesCount === 1 ? 'Army' : 'Armies'}`}
            </button>

            <button
              onClick={() => {
                setFortifyFrom(null);
                setFortifyTo(null);
                setArmiesCount(1);
              }}
              className="btn btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* End Turn */}
      <button
        onClick={handleEndTurn}
        disabled={loading}
        className="btn btn-primary w-full"
      >
        {loading ? 'Ending Turn...' : 'End Turn'}
      </button>

      <p className="text-gray-400 text-xs text-center">
        You can fortify once or skip to end your turn
      </p>

      {error && (
        <div className="bg-danger-500/10 border border-danger-500 text-danger-500 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
