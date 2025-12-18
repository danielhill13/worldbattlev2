import { useState } from 'react';
import { GameState } from '@world-battle/engine';
import Territory from './Territory';
import { TERRITORY_PATHS, TerritoryDisplayData } from '../types/mapData';

interface WorldMapProps {
  game: GameState;
  currentPlayerId?: string;
  onTerritoryClick?: (territoryId: string) => void;
  highlightTerritories?: string[];
  selectableTerritories?: string[];
  selectedTerritory?: string | null;
}

export default function WorldMap({
  game,
  currentPlayerId,
  onTerritoryClick,
  highlightTerritories = [],
  selectableTerritories = [],
  selectedTerritory = null
}: WorldMapProps) {
  const [hoveredTerritory, setHoveredTerritory] = useState<string | null>(null);

  /**
   * Get player color from army color
   */
  const getPlayerColor = (playerId: string): string => {
    const player = game.players.find(p => p.id === playerId);
    if (!player) return '#6b7280';

    const colors: Record<string, string> = {
      RED: '#ef4444',
      BLUE: '#3b82f6',
      GREEN: '#22c55e',
      YELLOW: '#eab308',
      BLACK: '#1f2937',
      PURPLE: '#a855f7',
    };

    return colors[player.color] || '#6b7280';
  };

  /**
   * Handle territory click
   */
  const handleTerritoryClick = (territoryId: string) => {
    if (onTerritoryClick && selectableTerritories.includes(territoryId)) {
      onTerritoryClick(territoryId);
    }
  };

  /**
   * Get territory game data
   */
  const getTerritoryGameData = (territoryId: string) => {
    return game.territories.find(t => t.territoryId === territoryId);
  };

  /**
   * Get hovered territory info
   */
  const hoveredInfo = hoveredTerritory ? {
    displayData: TERRITORY_PATHS[hoveredTerritory],
    gameData: getTerritoryGameData(hoveredTerritory)
  } : null;

  return (
    <div className="relative w-full h-full bg-gray-800 rounded-lg overflow-hidden">
      {/* SVG Map */}
      <svg
        viewBox="0 0 1000 550"
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      >
        {/* Background */}
        <rect width="1000" height="550" fill="#1f2937" />
        
        {/* Territories */}
        {Object.entries(TERRITORY_PATHS).map(([territoryId, displayData]) => {
          const gameData = getTerritoryGameData(territoryId);
          
          return (
            <Territory
              key={territoryId}
              displayData={displayData}
              gameData={gameData}
              isSelected={selectedTerritory === territoryId}
              isHighlighted={
                highlightTerritories.includes(territoryId) ||
                hoveredTerritory === territoryId
              }
              canSelect={selectableTerritories.includes(territoryId)}
              onClick={() => handleTerritoryClick(territoryId)}
              onMouseEnter={() => setHoveredTerritory(territoryId)}
              onMouseLeave={() => setHoveredTerritory(null)}
              getPlayerColor={getPlayerColor}
            />
          );
        })}
      </svg>

      {/* Territory Info Tooltip */}
      {hoveredInfo && (
        <div className="absolute bottom-4 left-4 bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl max-w-xs">
          <h3 className="font-bold text-white text-lg mb-2">
            {hoveredInfo.displayData.name}
          </h3>
          
          {hoveredInfo.gameData ? (
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Owner:</span>
                <span className="text-white font-semibold">
                  {game.players.find(p => p.id === hoveredInfo.gameData?.occupiedBy)?.name || 'Unknown'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Armies:</span>
                <span className="text-white font-semibold">
                  {hoveredInfo.gameData.armies}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Continent:</span>
                <span className="text-white capitalize">
                  {hoveredInfo.displayData.continent.replace('-', ' ')}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-sm">Unoccupied</p>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
        <h4 className="font-bold text-white text-sm mb-2">Players</h4>
        <div className="space-y-1">
          {game.players.filter(p => !p.isEliminated).map(player => {
            const territoryCount = game.territories.filter(
              t => t.occupiedBy === player.id
            ).length;
            
            return (
              <div key={player.id} className="flex items-center gap-2 text-sm">
                <div
                  className="w-4 h-4 rounded-full border border-gray-600"
                  style={{ backgroundColor: getPlayerColor(player.id) }}
                />
                <span className={`${currentPlayerId === player.id ? 'text-white font-bold' : 'text-gray-400'}`}>
                  {player.name}
                </span>
                <span className="text-gray-500 text-xs">({territoryCount})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
