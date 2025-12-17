import { Territory } from '../models/Territory';
import { Continent } from '../models/Continent';

/**
 * All territories on the World Battle map
 */
export const TERRITORIES: Territory[] = [
  // North America (9 territories)
  {
    id: 'greenland',
    name: 'Greenland',
    continentId: 'north-america',
    adjacentTerritories: ['iceland', 'quebec', 'northwest-territory']
  },
  {
    id: 'quebec',
    name: 'Quebec',
    continentId: 'north-america',
    adjacentTerritories: ['greenland', 'eastern-us', 'ontario']
  },
  {
    id: 'eastern-us',
    name: 'Eastern US',
    continentId: 'north-america',
    adjacentTerritories: ['quebec', 'central-america', 'western-us', 'ontario']
  },
  {
    id: 'western-us',
    name: 'Western US',
    continentId: 'north-america',
    adjacentTerritories: ['eastern-us', 'central-america', 'ontario', 'alberta']
  },
  {
    id: 'alberta',
    name: 'Alberta',
    continentId: 'north-america',
    adjacentTerritories: ['alaska', 'northwest-territory', 'ontario', 'western-us']
  },
  {
    id: 'ontario',
    name: 'Ontario',
    continentId: 'north-america',
    adjacentTerritories: ['quebec', 'eastern-us', 'western-us', 'alberta', 'northwest-territory']
  },
  {
    id: 'northwest-territory',
    name: 'NW Territory',
    continentId: 'north-america',
    adjacentTerritories: ['alaska', 'alberta', 'ontario', 'greenland']
  },
  {
    id: 'alaska',
    name: 'Alaska',
    continentId: 'north-america',
    adjacentTerritories: ['kamchatka', 'northwest-territory', 'alberta']
  },
  {
    id: 'central-america',
    name: 'Central America',
    continentId: 'north-america',
    adjacentTerritories: ['western-us', 'eastern-us', 'venezuela']
  },

  // South America (4 territories)
  {
    id: 'venezuela',
    name: 'Venezuela',
    continentId: 'south-america',
    adjacentTerritories: ['central-america', 'peru', 'brazil']
  },
  {
    id: 'peru',
    name: 'Peru',
    continentId: 'south-america',
    adjacentTerritories: ['venezuela', 'brazil', 'argentina']
  },
  {
    id: 'brazil',
    name: 'Brazil',
    continentId: 'south-america',
    adjacentTerritories: ['venezuela', 'peru', 'argentina', 'north-africa']
  },
  {
    id: 'argentina',
    name: 'Argentina',
    continentId: 'south-america',
    adjacentTerritories: ['brazil', 'peru']
  },

  // Africa (6 territories)
  {
    id: 'madagascar',
    name: 'Madagascar',
    continentId: 'africa',
    adjacentTerritories: ['east-africa', 'south-africa']
  },
  {
    id: 'south-africa',
    name: 'South Africa',
    continentId: 'africa',
    adjacentTerritories: ['congo', 'east-africa', 'madagascar']
  },
  {
    id: 'congo',
    name: 'Congo',
    continentId: 'africa',
    adjacentTerritories: ['south-africa', 'east-africa', 'north-africa']
  },
  {
    id: 'east-africa',
    name: 'East Africa',
    continentId: 'africa',
    adjacentTerritories: ['egypt', 'middle-east', 'north-africa', 'congo', 'south-africa', 'madagascar']
  },
  {
    id: 'north-africa',
    name: 'North Africa',
    continentId: 'africa',
    adjacentTerritories: ['brazil', 'western-europe', 'southern-europe', 'egypt', 'east-africa', 'congo']
  },
  {
    id: 'egypt',
    name: 'Egypt',
    continentId: 'africa',
    adjacentTerritories: ['east-africa', 'north-africa', 'southern-europe', 'middle-east']
  },

  // Australia (4 territories)
  {
    id: 'indonesia',
    name: 'Indonesia',
    continentId: 'australia',
    adjacentTerritories: ['new-guinea', 'west-australia', 'thailand']
  },
  {
    id: 'new-guinea',
    name: 'New Guinea',
    continentId: 'australia',
    adjacentTerritories: ['indonesia', 'west-australia', 'east-australia']
  },
  {
    id: 'east-australia',
    name: 'East Australia',
    continentId: 'australia',
    adjacentTerritories: ['west-australia', 'new-guinea']
  },
  {
    id: 'west-australia',
    name: 'West Australia',
    continentId: 'australia',
    adjacentTerritories: ['east-australia', 'new-guinea', 'indonesia']
  },

  // Europe (7 territories)
  {
    id: 'western-europe',
    name: 'Western Europe',
    continentId: 'europe',
    adjacentTerritories: ['great-britain', 'northern-europe', 'southern-europe', 'north-africa']
  },
  {
    id: 'southern-europe',
    name: 'Southern Europe',
    continentId: 'europe',
    adjacentTerritories: ['egypt', 'middle-east', 'ukraine', 'northern-europe', 'western-europe', 'north-africa']
  },
  {
    id: 'northern-europe',
    name: 'Northern Europe',
    continentId: 'europe',
    adjacentTerritories: ['scandinavia', 'southern-europe', 'ukraine', 'great-britain', 'western-europe']
  },
  {
    id: 'ukraine',
    name: 'Ukraine',
    continentId: 'europe',
    adjacentTerritories: ['scandinavia', 'northern-europe', 'southern-europe', 'middle-east', 'afghanistan', 'ural']
  },
  {
    id: 'scandinavia',
    name: 'Scandinavia',
    continentId: 'europe',
    adjacentTerritories: ['ukraine', 'northern-europe', 'iceland', 'great-britain']
  },
  {
    id: 'iceland',
    name: 'Iceland',
    continentId: 'europe',
    adjacentTerritories: ['greenland', 'great-britain', 'scandinavia']
  },
  {
    id: 'great-britain',
    name: 'Great Britain',
    continentId: 'europe',
    adjacentTerritories: ['iceland', 'scandinavia', 'western-europe', 'northern-europe']
  },

  // Asia (12 territories)
  {
    id: 'afghanistan',
    name: 'Afghanistan',
    continentId: 'asia',
    adjacentTerritories: ['ural', 'ukraine', 'middle-east', 'india', 'china']
  },
  {
    id: 'middle-east',
    name: 'Middle East',
    continentId: 'asia',
    adjacentTerritories: ['egypt', 'east-africa', 'southern-europe', 'ukraine', 'afghanistan', 'india']
  },
  {
    id: 'india',
    name: 'India',
    continentId: 'asia',
    adjacentTerritories: ['thailand', 'china', 'afghanistan', 'middle-east']
  },
  {
    id: 'thailand',
    name: 'Thailand',
    continentId: 'asia',
    adjacentTerritories: ['indonesia', 'china', 'india']
  },
  {
    id: 'china',
    name: 'China',
    continentId: 'asia',
    adjacentTerritories: ['thailand', 'india', 'afghanistan', 'ural', 'siberia', 'mongolia']
  },
  {
    id: 'mongolia',
    name: 'Mongolia',
    continentId: 'asia',
    adjacentTerritories: ['japan', 'china', 'irkutsk', 'kamchatka', 'siberia']
  },
  {
    id: 'japan',
    name: 'Japan',
    continentId: 'asia',
    adjacentTerritories: ['kamchatka', 'mongolia']
  },
  {
    id: 'ural',
    name: 'Ural',
    continentId: 'asia',
    adjacentTerritories: ['ukraine', 'afghanistan', 'siberia', 'china']
  },
  {
    id: 'kamchatka',
    name: 'Kamchatka',
    continentId: 'asia',
    adjacentTerritories: ['alaska', 'yakutsk', 'irkutsk', 'mongolia', 'japan']
  },
  {
    id: 'yakutsk',
    name: 'Yakutsk',
    continentId: 'asia',
    adjacentTerritories: ['kamchatka', 'irkutsk', 'siberia']
  },
  {
    id: 'irkutsk',
    name: 'Irkutsk',
    continentId: 'asia',
    adjacentTerritories: ['yakutsk', 'mongolia', 'kamchatka', 'siberia']
  },
  {
    id: 'siberia',
    name: 'Siberia',
    continentId: 'asia',
    adjacentTerritories: ['ural', 'china', 'mongolia', 'irkutsk', 'yakutsk']
  }
];

/**
 * All continents on the World Battle map
 */
export const CONTINENTS: Continent[] = [
  {
    id: 'north-america',
    name: 'North America',
    bonusArmies: 5,
    territoryIds: [
      'greenland',
      'quebec',
      'eastern-us',
      'western-us',
      'alberta',
      'ontario',
      'northwest-territory',
      'alaska',
      'central-america'
    ]
  },
  {
    id: 'south-america',
    name: 'South America',
    bonusArmies: 2,
    territoryIds: ['venezuela', 'peru', 'brazil', 'argentina']
  },
  {
    id: 'africa',
    name: 'Africa',
    bonusArmies: 3,
    territoryIds: [
      'madagascar',
      'south-africa',
      'congo',
      'east-africa',
      'north-africa',
      'egypt'
    ]
  },
  {
    id: 'australia',
    name: 'Australia',
    bonusArmies: 2,
    territoryIds: ['indonesia', 'new-guinea', 'east-australia', 'west-australia']
  },
  {
    id: 'europe',
    name: 'Europe',
    bonusArmies: 5,
    territoryIds: [
      'western-europe',
      'southern-europe',
      'northern-europe',
      'ukraine',
      'scandinavia',
      'iceland',
      'great-britain'
    ]
  },
  {
    id: 'asia',
    name: 'Asia',
    bonusArmies: 7,
    territoryIds: [
      'afghanistan',
      'middle-east',
      'india',
      'thailand',
      'china',
      'mongolia',
      'japan',
      'ural',
      'kamchatka',
      'yakutsk',
      'irkutsk',
      'siberia'
    ]
  }
];

/**
 * Helper to get territory by ID
 */
export function getTerritoryById(territoryId: string): Territory | undefined {
  return TERRITORIES.find(t => t.id === territoryId);
}

/**
 * Helper to get continent by ID
 */
export function getContinentById(continentId: string): Continent | undefined {
  return CONTINENTS.find(c => c.id === continentId);
}

/**
 * Helper to check if two territories are adjacent
 */
export function areTerritoriesAdjacent(territoryId1: string, territoryId2: string): boolean {
  const territory = getTerritoryById(territoryId1);
  if (!territory) return false;
  return territory.adjacentTerritories.includes(territoryId2);
}
