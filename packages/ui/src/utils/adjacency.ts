/**
 * Simple adjacency mapping for UI
 * This is a subset - the engine has the full adjacency data
 */

export const TERRITORY_ADJACENCIES: Record<string, string[]> = {
  // North America
  'alaska': ['northwest-territory', 'alberta', 'kamchatka'],
  'northwest-territory': ['alaska', 'alberta', 'ontario', 'greenland'],
  'greenland': ['northwest-territory', 'ontario', 'quebec', 'iceland'],
  'alberta': ['alaska', 'northwest-territory', 'ontario', 'western-us'],
  'ontario': ['northwest-territory', 'alberta', 'western-us', 'eastern-us', 'quebec', 'greenland'],
  'quebec': ['ontario', 'eastern-us', 'greenland'],
  'western-us': ['alberta', 'ontario', 'eastern-us', 'central-america'],
  'eastern-us': ['ontario', 'western-us', 'quebec', 'central-america'],
  'central-america': ['western-us', 'eastern-us', 'venezuela'],
  
  // South America
  'venezuela': ['central-america', 'peru', 'brazil'],
  'peru': ['venezuela', 'brazil', 'argentina'],
  'brazil': ['venezuela', 'peru', 'argentina', 'north-africa'],
  'argentina': ['peru', 'brazil'],
  
  // Europe
  'iceland': ['greenland', 'great-britain', 'scandinavia'],
  'great-britain': ['iceland', 'scandinavia', 'northern-europe', 'western-europe'],
  'scandinavia': ['iceland', 'great-britain', 'northern-europe', 'ukraine'],
  'northern-europe': ['great-britain', 'scandinavia', 'ukraine', 'southern-europe', 'western-europe'],
  'western-europe': ['great-britain', 'northern-europe', 'southern-europe', 'north-africa'],
  'southern-europe': ['western-europe', 'northern-europe', 'ukraine', 'middle-east', 'egypt', 'north-africa'],
  'ukraine': ['scandinavia', 'northern-europe', 'southern-europe', 'middle-east', 'afghanistan', 'ural'],
  
  // Africa
  'north-africa': ['brazil', 'western-europe', 'southern-europe', 'egypt', 'east-africa', 'congo'],
  'egypt': ['southern-europe', 'north-africa', 'east-africa', 'middle-east'],
  'east-africa': ['egypt', 'north-africa', 'congo', 'south-africa', 'madagascar', 'middle-east'],
  'congo': ['north-africa', 'east-africa', 'south-africa'],
  'south-africa': ['congo', 'east-africa', 'madagascar'],
  'madagascar': ['east-africa', 'south-africa'],
  
  // Asia
  'ural': ['ukraine', 'afghanistan', 'china', 'siberia'],
  'siberia': ['ural', 'china', 'mongolia', 'irkutsk', 'yakutsk'],
  'yakutsk': ['siberia', 'irkutsk', 'kamchatka'],
  'kamchatka': ['yakutsk', 'irkutsk', 'mongolia', 'japan', 'alaska'],
  'irkutsk': ['siberia', 'yakutsk', 'kamchatka', 'mongolia'],
  'mongolia': ['siberia', 'irkutsk', 'kamchatka', 'japan', 'china'],
  'japan': ['kamchatka', 'mongolia'],
  'afghanistan': ['ukraine', 'ural', 'china', 'india', 'middle-east'],
  'china': ['ural', 'siberia', 'mongolia', 'afghanistan', 'india', 'siam'],
  'middle-east': ['ukraine', 'southern-europe', 'egypt', 'east-africa', 'afghanistan', 'india'],
  'india': ['afghanistan', 'china', 'middle-east', 'siam'],
  'siam': ['china', 'india', 'indonesia'],
  
  // Australia
  'indonesia': ['siam', 'new-guinea', 'western-australia'],
  'new-guinea': ['indonesia', 'western-australia', 'eastern-australia'],
  'western-australia': ['indonesia', 'new-guinea', 'eastern-australia'],
  'eastern-australia': ['new-guinea', 'western-australia']
};

/**
 * Check if two territories are adjacent
 */
export function areTerritoriesAdjacentUI(territory1: string, territory2: string): boolean {
  const adjacencies = TERRITORY_ADJACENCIES[territory1];
  if (!adjacencies) return false;
  return adjacencies.includes(territory2);
}
