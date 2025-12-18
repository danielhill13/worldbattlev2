import { TerritoryState } from '@world-battle/engine';
import { TerritoryDisplayData } from '../types/mapData';

interface TerritoryProps {
  displayData: TerritoryDisplayData;
  gameData?: TerritoryState;
  isSelected: boolean;
  isHighlighted: boolean;
  canSelect: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  getPlayerColor: (playerId: string) => string;
}

export default function Territory({
  displayData,
  gameData,
  isSelected,
  isHighlighted,
  canSelect,
  onClick,
  onMouseEnter,
  onMouseLeave,
  getPlayerColor
}: TerritoryProps) {
  // Determine territory fill color
  const getFillColor = () => {
    if (!gameData || !gameData.occupiedBy) {
      return '#4b5563'; // gray-600 for unowned
    }
    
    const baseColor = getPlayerColor(gameData.occupiedBy);
    
    if (isSelected) {
      return baseColor; // Full color when selected
    }
    
    if (isHighlighted) {
      // Lighter shade when highlighted
      return adjustColorBrightness(baseColor, 1.3);
    }
    
    // Darker shade by default
    return adjustColorBrightness(baseColor, 0.7);
  };

  // Determine stroke style
  const getStroke = () => {
    if (isSelected) {
      return { stroke: '#ffffff', strokeWidth: 3 };
    }
    if (isHighlighted) {
      return { stroke: '#fbbf24', strokeWidth: 2.5 };
    }
    return { stroke: '#1f2937', strokeWidth: 1.5 };
  };

  const cursor = canSelect ? 'pointer' : 'default';
  const opacity = canSelect || isSelected || isHighlighted ? 1 : 0.8;

  return (
    <g
      className="territory"
      onClick={canSelect ? onClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor }}
    >
      {/* Territory path */}
      <path
        d={displayData.path}
        fill={getFillColor()}
        {...getStroke()}
        opacity={opacity}
        className="transition-all duration-200"
      />
      
      {/* Army count display */}
      {gameData && gameData.armies > 0 && (
        <>
          {/* Background circle for army count */}
          <circle
            cx={displayData.centerX}
            cy={displayData.centerY}
            r={18}
            fill="rgba(0, 0, 0, 0.7)"
            stroke="#ffffff"
            strokeWidth={1.5}
          />
          
          {/* Army count text */}
          <text
            x={displayData.centerX}
            y={displayData.centerY}
            textAnchor="middle"
            dominantBaseline="central"
            fill="#ffffff"
            fontSize="14"
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {gameData.armies}
          </text>
        </>
      )}
    </g>
  );
}

/**
 * Adjust color brightness
 */
function adjustColorBrightness(hex: string, factor: number): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Parse RGB
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  // Adjust brightness
  const newR = Math.min(255, Math.round(r * factor));
  const newG = Math.min(255, Math.round(g * factor));
  const newB = Math.min(255, Math.round(b * factor));
  
  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}
