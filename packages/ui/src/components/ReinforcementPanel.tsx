import { useState, useEffect } from 'react';
import { GameState } from '@world-battle/engine';
import api from '../utils/api';

interface ReinforcementPanelProps {
  game: GameState;
  gameId: string;
  playerId: string;
  onUpdate: () => void;
  selectedTerritory: string | null;
}

export default function ReinforcementPanel({
  game,
  gameId,
  playerId,
  onUpdate,
  selectedTerritory
}: ReinforcementPanelProps) {
  const [reinforcementInfo, setReinforcementInfo] = useState<any>(null);
  const [placements, setPlacements] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const player = game.players.find(p => p.id === playerId);
  const myTerritories = game.territories.filter(t => t.occupiedBy === playerId);

  useEffect(() => {
    loadReinforcementInfo();
  }, [gameId, playerId]);

  // Handle map clicks for quick reinforcement
  useEffect(() => {
    if (selectedTerritory && remaining > 0) {
      const territory = myTerritories.find(t => t.territoryId === selectedTerritory);
      if (territory) {
        addArmy(selectedTerritory);
      }
    }
  }, [selectedTerritory]);

  const loadReinforcementInfo = async () => {
    try {
      const info = await api.getReinforcementInfo(gameId, playerId);
      setReinforcementInfo(info);
    } catch (err) {
      console.error('Failed to load reinforcement info:', err);
    }
  };

  const getTotalPlaced = () => {
    return Object.values(placements).reduce((sum, val) => sum + val, 0);
  };

  const getRemainingArmies = () => {
    if (!reinforcementInfo) return 0;
    return reinforcementInfo.reinforcementsRemaining - getTotalPlaced();
  };

  const getTradeValue = () => {
    // Card trade values increase with each trade
    const tradeCount = game.players.reduce((sum, p) => sum + p.cardSetsTraded, 0);
    return 4 + (tradeCount * 2);
  };

  const addArmy = (territoryId: string) => {
    // Validate territory is owned by player
    const territory = myTerritories.find(t => t.territoryId === territoryId);
    if (!territory) {
      setError('You do not own this territory');
      return;
    }
    
    if (getRemainingArmies() > 0) {
      setPlacements(prev => ({
        ...prev,
        [territoryId]: (prev[territoryId] || 0) + 1
      }));
      setError(''); // Clear any previous errors
    }
  };

  const removeArmy = (territoryId: string) => {
    if (placements[territoryId] && placements[territoryId] > 0) {
      setPlacements(prev => ({
        ...prev,
        [territoryId]: prev[territoryId] - 1
      }));
    }
  };

  const handlePlaceAll = async () => {
    setLoading(true);
    setError('');

    try {
      const placementArray = Object.entries(placements)
        .filter(([_, armies]) => armies > 0)
        .map(([territoryId, armies]) => ({ territoryId, armies }));

      await api.placeReinforcements(gameId, playerId, placementArray);
      setPlacements({});
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place reinforcements');
    } finally {
      setLoading(false);
    }
  };

  const handleTradeCards = async (cardIds: string[]) => {
    setLoading(true);
    setError('');

    try {
      await api.tradeCards(gameId, playerId, cardIds);
      await loadReinforcementInfo();
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to trade cards');
    } finally {
      setLoading(false);
    }
  };

  const handleEndPhase = async () => {
    setLoading(true);
    setError('');

    try {
      await api.endReinforcement(gameId, playerId);
      onUpdate();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end reinforcement phase');
    } finally {
      setLoading(false);
    }
  };

  if (!reinforcementInfo) {
    return <div className="text-gray-400">Loading...</div>;
  }

  const remaining = getRemainingArmies();
  const canEndPhase = remaining === 0 && !reinforcementInfo.mustTradeCards;

  return (
    <div className="space-y-4">
      {/* Reinforcement Summary */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-bold text-white mb-3">Reinforcements</h3>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Territory Bonus:</span>
            <span className="text-white">+{reinforcementInfo.territoryBonus}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Continent Bonus:</span>
            <span className="text-white">+{reinforcementInfo.continentBonus}</span>
          </div>
          {reinforcementInfo.cardBonus > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-400">Card Bonus:</span>
              <span className="text-white">+{reinforcementInfo.cardBonus}</span>
            </div>
          )}
          <div className="border-t border-gray-600 pt-2 mt-2 flex justify-between font-bold">
            <span className="text-white">Remaining:</span>
            <span className={remaining > 0 ? 'text-primary-500' : 'text-green-500'}>
              {remaining}
            </span>
          </div>
        </div>
      </div>

      {/* Card Trading */}
      {player && player.cards.length > 0 && (
        <div className="bg-gray-700 rounded-lg p-4">
          <h3 className="font-bold text-white mb-2">
            Your Cards ({player.cards.length})
            {reinforcementInfo.mustTradeCards && (
              <span className="text-danger-500 text-sm ml-2">MUST TRADE!</span>
            )}
          </h3>
          
          {/* Card Display */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {player.cards.map((card, idx) => (
              <div
                key={idx}
                className="bg-gray-800 rounded p-2 text-center border border-gray-600"
              >
                <div className="text-2xl mb-1">
                  {card.type === 'INFANTRY' && '🪖'}
                  {card.type === 'CAVALRY' && '🐎'}
                  {card.type === 'ARTILLERY' && '💣'}
                  {card.type === 'WILD' && '🃏'}
                </div>
                <p className="text-xs text-gray-400">{card.type}</p>
              </div>
            ))}
          </div>
          
          {/* Trade Options */}
          {player.cards.length >= 3 && (
            <div className="space-y-2">
              {reinforcementInfo.possibleCardSets.length > 0 ? (
                reinforcementInfo.possibleCardSets.slice(0, 2).map((set: string[], idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleTradeCards(set)}
                    disabled={loading}
                    className="btn btn-secondary w-full text-sm"
                  >
                    Trade Set {idx + 1} for +{getTradeValue()} Armies
                  </button>
                ))
              ) : (
                <p className="text-gray-400 text-sm">No valid card sets to trade yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Army Placement */}
      <div className="bg-gray-700 rounded-lg p-4">
        <h3 className="font-bold text-white mb-3">Place Armies</h3>
        
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {myTerritories.slice(0, 10).map(territory => (
            <div key={territory.territoryId} className="flex items-center justify-between bg-gray-800 rounded p-2">
              <div className="flex-1">
                <p className="text-white text-sm font-medium">
                  {territory.territoryId.replace(/-/g, ' ')}
                </p>
                <p className="text-gray-400 text-xs">
                  Current: {territory.armies}
                  {placements[territory.territoryId] && ` (+${placements[territory.territoryId]})`}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeArmy(territory.territoryId)}
                  disabled={!placements[territory.territoryId]}
                  className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 disabled:opacity-30"
                >
                  -
                </button>
                <span className="text-white w-6 text-center">
                  {placements[territory.territoryId] || 0}
                </span>
                <button
                  onClick={() => addArmy(territory.territoryId)}
                  disabled={remaining === 0}
                  className="w-8 h-8 rounded bg-primary-600 hover:bg-primary-700 disabled:opacity-30"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        {getTotalPlaced() > 0 && (
          <button
            onClick={handlePlaceAll}
            disabled={loading}
            className="btn btn-primary w-full mt-3"
          >
            {loading ? 'Placing...' : `Place ${getTotalPlaced()} Armies`}
          </button>
        )}
      </div>

      {/* End Phase */}
      <button
        onClick={handleEndPhase}
        disabled={!canEndPhase || loading}
        className={`btn w-full ${canEndPhase ? 'btn-primary' : 'btn-disabled'}`}
      >
        {canEndPhase ? 'End Reinforcement Phase' : 'Place All Armies First'}
      </button>

      {error && (
        <div className="bg-danger-500/10 border border-danger-500 text-danger-500 px-3 py-2 rounded text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
