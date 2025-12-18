/**
 * UI-specific territory data for rendering
 */
export interface TerritoryDisplayData {
  id: string;
  name: string;
  continent: string;
  // SVG path data
  path: string;
  // Center point for army count display
  centerX: number;
  centerY: number;
}

/**
 * Simplified map data for UI rendering
 * Full game logic uses engine's mapData
 */
export const TERRITORY_PATHS: Record<string, TerritoryDisplayData> = {
  // North America
  'alaska': {
    id: 'alaska',
    name: 'Alaska',
    continent: 'north-america',
    path: 'M50,50 L100,50 L100,100 L50,100 Z',
    centerX: 75,
    centerY: 75
  },
  'northwest-territory': {
    id: 'northwest-territory',
    name: 'Northwest Territory',
    continent: 'north-america',
    path: 'M110,50 L180,50 L180,100 L110,100 Z',
    centerX: 145,
    centerY: 75
  },
  'greenland': {
    id: 'greenland',
    name: 'Greenland',
    continent: 'north-america',
    path: 'M250,40 L320,40 L320,90 L250,90 Z',
    centerX: 285,
    centerY: 65
  },
  'alberta': {
    id: 'alberta',
    name: 'Alberta',
    continent: 'north-america',
    path: 'M110,110 L160,110 L160,160 L110,160 Z',
    centerX: 135,
    centerY: 135
  },
  'ontario': {
    id: 'ontario',
    name: 'Ontario',
    continent: 'north-america',
    path: 'M170,110 L230,110 L230,160 L170,160 Z',
    centerX: 200,
    centerY: 135
  },
  'quebec': {
    id: 'quebec',
    name: 'Quebec',
    continent: 'north-america',
    path: 'M240,110 L300,110 L300,160 L240,160 Z',
    centerX: 270,
    centerY: 135
  },
  'western-us': {
    id: 'western-us',
    name: 'Western United States',
    continent: 'north-america',
    path: 'M90,170 L160,170 L160,230 L90,230 Z',
    centerX: 125,
    centerY: 200
  },
  'eastern-us': {
    id: 'eastern-us',
    name: 'Eastern United States',
    continent: 'north-america',
    path: 'M170,170 L240,170 L240,230 L170,230 Z',
    centerX: 205,
    centerY: 200
  },
  'central-america': {
    id: 'central-america',
    name: 'Central America',
    continent: 'north-america',
    path: 'M120,240 L180,240 L180,280 L120,280 Z',
    centerX: 150,
    centerY: 260
  },
  
  // South America
  'venezuela': {
    id: 'venezuela',
    name: 'Venezuela',
    continent: 'south-america',
    path: 'M200,290 L260,290 L260,340 L200,340 Z',
    centerX: 230,
    centerY: 315
  },
  'peru': {
    id: 'peru',
    name: 'Peru',
    continent: 'south-america',
    path: 'M180,350 L240,350 L240,410 L180,410 Z',
    centerX: 210,
    centerY: 380
  },
  'brazil': {
    id: 'brazil',
    name: 'Brazil',
    continent: 'south-america',
    path: 'M250,330 L320,330 L320,420 L250,420 Z',
    centerX: 285,
    centerY: 375
  },
  'argentina': {
    id: 'argentina',
    name: 'Argentina',
    continent: 'south-america',
    path: 'M200,420 L260,420 L260,500 L200,500 Z',
    centerX: 230,
    centerY: 460
  },
  
  // Europe
  'iceland': {
    id: 'iceland',
    name: 'Iceland',
    continent: 'europe',
    path: 'M340,60 L380,60 L380,90 L340,90 Z',
    centerX: 360,
    centerY: 75
  },
  'great-britain': {
    id: 'great-britain',
    name: 'Great Britain',
    continent: 'europe',
    path: 'M350,110 L400,110 L400,150 L350,150 Z',
    centerX: 375,
    centerY: 130
  },
  'scandinavia': {
    id: 'scandinavia',
    name: 'Scandinavia',
    continent: 'europe',
    path: 'M410,80 L480,80 L480,130 L410,130 Z',
    centerX: 445,
    centerY: 105
  },
  'northern-europe': {
    id: 'northern-europe',
    name: 'Northern Europe',
    continent: 'europe',
    path: 'M410,140 L480,140 L480,190 L410,190 Z',
    centerX: 445,
    centerY: 165
  },
  'western-europe': {
    id: 'western-europe',
    name: 'Western Europe',
    continent: 'europe',
    path: 'M350,160 L410,160 L410,210 L350,210 Z',
    centerX: 380,
    centerY: 185
  },
  'southern-europe': {
    id: 'southern-europe',
    name: 'Southern Europe',
    continent: 'europe',
    path: 'M420,200 L490,200 L490,240 L420,240 Z',
    centerX: 455,
    centerY: 220
  },
  'ukraine': {
    id: 'ukraine',
    name: 'Ukraine',
    continent: 'europe',
    path: 'M500,140 L570,140 L570,190 L500,190 Z',
    centerX: 535,
    centerY: 165
  },
  
  // Africa
  'north-africa': {
    id: 'north-africa',
    name: 'North Africa',
    continent: 'africa',
    path: 'M380,260 L480,260 L480,320 L380,320 Z',
    centerX: 430,
    centerY: 290
  },
  'egypt': {
    id: 'egypt',
    name: 'Egypt',
    continent: 'africa',
    path: 'M490,250 L550,250 L550,310 L490,310 Z',
    centerX: 520,
    centerY: 280
  },
  'east-africa': {
    id: 'east-africa',
    name: 'East Africa',
    continent: 'africa',
    path: 'M500,320 L570,320 L570,390 L500,390 Z',
    centerX: 535,
    centerY: 355
  },
  'congo': {
    id: 'congo',
    name: 'Congo',
    continent: 'africa',
    path: 'M430,330 L500,330 L500,390 L430,390 Z',
    centerX: 465,
    centerY: 360
  },
  'south-africa': {
    id: 'south-africa',
    name: 'South Africa',
    continent: 'africa',
    path: 'M450,400 L530,400 L530,470 L450,470 Z',
    centerX: 490,
    centerY: 435
  },
  'madagascar': {
    id: 'madagascar',
    name: 'Madagascar',
    continent: 'africa',
    path: 'M580,420 L620,420 L620,480 L580,480 Z',
    centerX: 600,
    centerY: 450
  },
  
  // Asia
  'ural': {
    id: 'ural',
    name: 'Ural',
    continent: 'asia',
    path: 'M580,100 L650,100 L650,150 L580,150 Z',
    centerX: 615,
    centerY: 125
  },
  'siberia': {
    id: 'siberia',
    name: 'Siberia',
    continent: 'asia',
    path: 'M660,80 L760,80 L760,140 L660,140 Z',
    centerX: 710,
    centerY: 110
  },
  'yakutsk': {
    id: 'yakutsk',
    name: 'Yakutsk',
    continent: 'asia',
    path: 'M770,70 L850,70 L850,130 L770,130 Z',
    centerX: 810,
    centerY: 100
  },
  'kamchatka': {
    id: 'kamchatka',
    name: 'Kamchatka',
    continent: 'asia',
    path: 'M860,60 L920,60 L920,120 L860,120 Z',
    centerX: 890,
    centerY: 90
  },
  'irkutsk': {
    id: 'irkutsk',
    name: 'Irkutsk',
    continent: 'asia',
    path: 'M710,150 L780,150 L780,200 L710,200 Z',
    centerX: 745,
    centerY: 175
  },
  'mongolia': {
    id: 'mongolia',
    name: 'Mongolia',
    continent: 'asia',
    path: 'M720,210 L800,210 L800,260 L720,260 Z',
    centerX: 760,
    centerY: 235
  },
  'japan': {
    id: 'japan',
    name: 'Japan',
    continent: 'asia',
    path: 'M860,180 L910,180 L910,240 L860,240 Z',
    centerX: 885,
    centerY: 210
  },
  'afghanistan': {
    id: 'afghanistan',
    name: 'Afghanistan',
    continent: 'asia',
    path: 'M580,200 L650,200 L650,250 L580,250 Z',
    centerX: 615,
    centerY: 225
  },
  'china': {
    id: 'china',
    name: 'China',
    continent: 'asia',
    path: 'M660,220 L750,220 L750,290 L660,290 Z',
    centerX: 705,
    centerY: 255
  },
  'middle-east': {
    id: 'middle-east',
    name: 'Middle East',
    continent: 'asia',
    path: 'M560,260 L630,260 L630,320 L560,320 Z',
    centerX: 595,
    centerY: 290
  },
  'india': {
    id: 'india',
    name: 'India',
    continent: 'asia',
    path: 'M640,280 L710,280 L710,350 L640,350 Z',
    centerX: 675,
    centerY: 315
  },
  'siam': {
    id: 'siam',
    name: 'Siam',
    continent: 'asia',
    path: 'M720,300 L780,300 L780,360 L720,360 Z',
    centerX: 750,
    centerY: 330
  },
  
  // Australia
  'indonesia': {
    id: 'indonesia',
    name: 'Indonesia',
    continent: 'australia',
    path: 'M730,370 L810,370 L810,420 L730,420 Z',
    centerX: 770,
    centerY: 395
  },
  'new-guinea': {
    id: 'new-guinea',
    name: 'New Guinea',
    continent: 'australia',
    path: 'M820,390 L880,390 L880,440 L820,440 Z',
    centerX: 850,
    centerY: 415
  },
  'western-australia': {
    id: 'western-australia',
    name: 'Western Australia',
    continent: 'australia',
    path: 'M750,440 L820,440 L820,500 L750,500 Z',
    centerX: 785,
    centerY: 470
  },
  'eastern-australia': {
    id: 'eastern-australia',
    name: 'Eastern Australia',
    continent: 'australia',
    path: 'M830,450 L900,450 L900,510 L830,510 Z',
    centerX: 865,
    centerY: 480
  }
};

/**
 * Get territory display data by ID
 */
export function getTerritoryPath(territoryId: string): TerritoryDisplayData | undefined {
  return TERRITORY_PATHS[territoryId];
}

/**
 * Get all territory IDs
 */
export function getAllTerritoryIds(): string[] {
  return Object.keys(TERRITORY_PATHS);
}
