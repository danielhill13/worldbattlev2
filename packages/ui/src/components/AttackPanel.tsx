import { useState, useEffect } from 'react';
import { GameState } from '@world-battle/engine';
import api from '../utils/api';
import { areTerritoriesAdjacentUI } from '../utils/adjacency';

interface AttackPanelProps {
  game: GameState;
  gameId: string;
  playerId: string;
  selectedTerritory: string | null;
  onUpdate: () => void;
  onTerritorySelect: (territoryId: string) => void;
}

export default function AttackPanel({
  game,
  gameId,
  playerId,
  selectedTerritory,
  onUpdate,
  onTerritorySelect
}: AttackPanelProps) {
  const [attackFrom, setAttackFrom] = useState<string | null>(null);
  const [attackTo, setAttackTo] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [moveArmies, setMoveArmies] = useState(1);

  const myTerritories = game.territories.filter(t => t.occupiedBy === playerId);
  const attackableTerritories = myTerritories.filter(t => t.armies >= 2);

  // Handle map territory selection
  useEffect(() => {
    if (!selectedTerritory) return;
    
    const territory = game.territories.find(t => t.territoryId === selectedTerritory);
    if (!territory) return;
    
    // If it's our territory with 2+ armies and no attacker selected yet
    if (!attackFrom && territory.occupiedBy === playerId && territory.armies >= 2) {
      handleSelectAttacker(selectedTerritory);
    }
    // If attacker already selected and this is an enemy territory
    else if (attackFrom && territory.occupiedBy !== playerId) {
      const adjacentEnemies = getAdjacentEnemies(attackFrom);
      if (adjacentEnemies.some(t => t.territoryId === selectedTerritory)) {
        handleSelectDefender(selectedTerritory);
      }
    }
  }, [selectedTerritory]);

  const getAdjacentEnemies = (fromTerritoryId: string) => {
    return game.territories.filter(
      t => t.occupiedBy !== playerId && 
      areTerritoriesAdjacentUI(fromTerritoryId, t.territoryId)
    );
  };

  const handleSelectAttacker = (territoryId: string) => {
    setAttackFrom(territoryId);
    setAttackTo(null);
    setLastResult(null);
    onTerritorySelect(territoryId);
  };

  const handleSelectDefender = (territoryId: string) => {
    setAttackTo(territoryId);
    onTerritorySelect(territoryId);
  };

  const handleAttack = async (autoAttack = false) => {
    if (!attackFrom || !attackTo) return;

    setLoading(true);
    setError('');

    try {
      const result = autoAttack
        ? await api.autoAttack(gameId, playerId, attackFrom, attackTo)
        : await api.attack(gameId, playerId, attackFrom, attackTo);

      setLastResult(result.attackResult);
      
      if (result.attackResult.territoryConquered) {
        // Set default move armies to maximum available (all but 1)
        const fromTerritory = result.game.territories.find(t => t.territoryId === attackFrom);
        if (fromTerritory) {
          setMoveArmies(fromTerritory.armies - 1);
        }
      } else {
        setAttackFrom(null);
        setAttackTo(null);
      }
      
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Attack failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMoveArmies = async () => {
    if (!attackFrom || !attackTo) return;

    setLoading(true);
    setError('');

    try {
      await api.moveArmies(gameId, playerId, attackFrom, attackTo, moveArmies);
      setAttackFrom(null);
      setAttackTo(null);
      setLastResult(null);
      setMoveArmies(1);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move armies');
    } finally {
      setLoading(false);
    }
  };

  const handleEndPhase = async () => {
    setLoading(true);
    setError('');

    try {
      await api.endAttack(gameId, playerId);
      setAttackFrom(null);
      setAttackTo(null);
      setLastResult(null);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end attack phase');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-bold text-white mb-2">Attack Phase</h3>
        <p className="text-gray-400 text-sm">
          {!attackFrom && 'Select a territory to attack from (2+ armies required)'}
          {attackFrom && !attackTo && 'Select an adjacent enemy territory to attack'}
          {attackFrom && attackTo && 'Choose attack type or select different territories'}
        </p>
      </div>

      {/* Select Attacker */}
      {!attackFrom && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Your Territories (2+ armies)</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {attackableTerritories.length > 0 ? (
              attackableTerritories.slice(0, 10).map(territory => (
                <button
                  key={territory.territoryId}
                  onClick={() => handleSelectAttacker(territory.territoryId)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-600 rounded p-2 transition"
                >
                  <p className="text-white text-sm font-medium">
                    {territory.territoryId.replace(/-/g, ' ')}
                  </p>
                  <p className="text-gray-400 text-xs">Armies: {territory.armies}</p>
                </button>
              ))
            ) : (
              <p className="text-gray-400 text-sm">No territories can attack (need 2+ armies)</p>
            )}
          </div>
        </div>
      )}

      {/* Select Defender */}
      {attackFrom && !attackTo && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">
            Adjacent Enemies from {attackFrom.replace(/-/g, ' ')}
          </h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {getAdjacentEnemies(attackFrom).map(territory => {
              const owner = game.players.find(p => p.id === territory.occupiedBy);
              return (
                <button
                  key={territory.territoryId}
                  onClick={() => handleSelectDefender(territory.territoryId)}
                  className="w-full text-left bg-gray-800 hover:bg-gray-600 rounded p-2 transition"
                >
                  <p className="text-white text-sm font-medium">
                    {territory.territoryId.replace(/-/g, ' ')}
                  </p>
                  <p className="text-gray-400 text-xs">
                    Owner: {owner?.name} • Armies: {territory.armies}
                  </p>
                </button>
              );
            })}
          </div>
          
          <button
            onClick={() => setAttackFrom(null)}
            className="btn btn-secondary w-full mt-3 text-sm"
          >
            ← Choose Different Territory
          </button>
        </div>
      )}

      {/* Attack Controls */}
      {attackFrom && attackTo && !lastResult?.territoryConquered && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-3">Execute Attack</h4>
          
          <div className="bg-gray-800 rounded p-3 mb-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-400 text-sm">From:</span>
              <span className="text-white font-medium">{attackFrom.replace(/-/g, ' ')}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">To:</span>
              <span className="text-white font-medium">{attackTo.replace(/-/g, ' ')}</span>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleAttack(false)}
              disabled={loading}
              className="btn btn-danger w-full"
            >
              {loading ? 'Attacking...' : 'Single Attack'}
            </button>
            
            <button
              onClick={() => handleAttack(true)}
              disabled={loading}
              className="btn btn-danger w-full"
            >
              {loading ? 'Attacking...' : 'Auto-Attack (Until Conquest)'}
            </button>

            <button
              onClick={() => {
                setAttackFrom(null);
                setAttackTo(null);
              }}
              className="btn btn-secondary w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Battle Result */}
      {lastResult && !lastResult.territoryConquered && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Battle Result</h4>
          
          {lastResult.rolls.slice(-1).map((roll: any, idx: number) => (
            <div key={idx} className="space-y-2 text-sm">
              <div>
                <p className="text-gray-400">Attacker Dice:</p>
                <p className="text-white">{roll.attackerDice.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-400">Defender Dice:</p>
                <p className="text-white">{roll.defenderDice.join(', ')}</p>
              </div>
              <div>
                <p className="text-gray-400">Losses:</p>
                <p className="text-white">
                  Attacker: {roll.attackerLosses} • Defender: {roll.defenderLosses}
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={() => {
              setLastResult(null);
              setAttackFrom(null);
              setAttackTo(null);
            }}
            className="btn btn-secondary w-full mt-3 text-sm"
          >
            Continue
          </button>
        </div>
      )}

      {/* Move Armies After Conquest */}
      {lastResult?.territoryConquered && attackFrom && attackTo && (
        <div className="bg-green-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">🎉 Territory Conquered!</h4>
          <p className="text-gray-200 text-sm mb-3">
            Move additional armies to {attackTo.replace(/-/g, ' ')}
          </p>

          <div className="flex items-center justify-between bg-gray-800 rounded p-3 mb-3">
            <button
              onClick={() => setMoveArmies(Math.max(1, moveArmies - 1))}
              className="w-10 h-10 rounded bg-gray-600 hover:bg-gray-500"
            >
              -
            </button>
            <span className="text-white text-lg font-bold">{moveArmies}</span>
            <button
              onClick={() => setMoveArmies(moveArmies + 1)}
              className="w-10 h-10 rounded bg-gray-600 hover:bg-gray-500"
            >
              +
            </button>
          </div>

          <button
            onClick={handleMoveArmies}
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? 'Moving...' : `Move ${moveArmies} Armies`}
          </button>
        </div>
      )}

      {/* End Phase */}
      <button
        onClick={handleEndPhase}
        disabled={loading}
        className="btn btn-secondary w-full"
      >
        End Attack Phase
      </button>

      {error && (
        <div className="bg-danger-500/10 border border-danger-500 text-danger-500 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
