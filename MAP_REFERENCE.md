# World Battle Map Reference

## Continents & Territories

### North America (9 territories, 5 bonus armies)
1. Greenland → Iceland, Quebec, NW Territory
2. Quebec → Greenland, Eastern US, Ontario
3. Eastern US → Quebec, Central America, Western US, Ontario
4. Western US → Eastern US, Central America, Ontario, Alberta
5. Alberta → Alaska, NW Territory, Ontario, Western US
6. Ontario → Quebec, Eastern US, Western US, Alberta, NW Territory
7. NW Territory → Alaska, Alberta, Ontario, Greenland
8. Alaska → Kamchatka, NW Territory, Alberta
9. Central America → Western US, Eastern US, Venezuela

### South America (4 territories, 2 bonus armies)
1. Venezuela → Central America, Peru, Brazil
2. Peru → Venezuela, Brazil, Argentina
3. Brazil → Venezuela, Peru, Argentina, North Africa
4. Argentina → Brazil, Peru

### Africa (6 territories, 3 bonus armies)
1. Madagascar → East Africa, South Africa
2. South Africa → Congo, East Africa, Madagascar
3. Congo → South Africa, East Africa, North Africa
4. East Africa → Egypt, Middle East, North Africa, Congo, South Africa, Madagascar
5. North Africa → Brazil, Western Europe, Southern Europe, Egypt, East Africa, Congo
6. Egypt → East Africa, North Africa, Southern Europe, Middle East

### Australia (4 territories, 2 bonus armies)
1. Indonesia → New Guinea, West Australia, Thailand
2. New Guinea → Indonesia, West Australia, East Australia
3. East Australia → West Australia, New Guinea
4. West Australia → East Australia, New Guinea, Indonesia

### Europe (7 territories, 5 bonus armies)
1. Western Europe → Great Britain, Northern Europe, Southern Europe, North Africa
2. Southern Europe → Egypt, Middle East, Ukraine, Northern Europe, Western Europe, North Africa
3. Northern Europe → Scandinavia, Southern Europe, Ukraine, Great Britain, Western Europe
4. Ukraine → Scandinavia, Northern Europe, Southern Europe, Middle East, Afghanistan, Ural
5. Scandinavia → Ukraine, Northern Europe, Iceland, Great Britain
6. Iceland → Greenland, Great Britain, Scandinavia
7. Great Britain → Iceland, Scandinavia, Western Europe, Northern Europe

### Asia (12 territories, 7 bonus armies)
1. Afghanistan → Ural, Ukraine, Middle East, India, China
2. Middle East → Egypt, East Africa, Southern Europe, Ukraine, Afghanistan, India
3. India → Thailand, China, Afghanistan, Middle East
4. Thailand → Indonesia, China, India
5. China → Thailand, India, Afghanistan, Ural, Siberia, Mongolia
6. Mongolia → Japan, China, Irkutsk, Kamchatka, Siberia
7. Japan → Kamchatka, Mongolia
8. Ural → Ukraine, Afghanistan, Siberia, China
9. Kamchatka → Alaska, Yakutsk, Irkutsk, Mongolia, Japan
10. Yakutsk → Kamchatka, Irkutsk, Siberia
11. Irkutsk → Yakutsk, Mongolia, Kamchatka, Siberia
12. Siberia → Ural, China, Mongolia, Irkutsk, Yakutsk

## Critical Cross-Continent Connections
- **Alaska ↔ Kamchatka** (North America ↔ Asia)
- **Brazil ↔ North Africa** (South America ↔ Africa)
- **Greenland ↔ Iceland** (North America ↔ Europe)
- **Egypt ↔ Southern Europe** (Africa ↔ Europe)
- **Middle East** connects Africa, Europe, and Asia
- **Indonesia ↔ Thailand** (Australia ↔ Asia)

## Territory ID Format
All territory IDs use kebab-case:
- "Eastern US" → `eastern-us`
- "NW Territory" → `northwest-territory`
- "Middle East" → `middle-east`

## Total Count Verification
- **Total Territories**: 42
- **North America**: 9
- **South America**: 4
- **Africa**: 6
- **Australia**: 4
- **Europe**: 7
- **Asia**: 12
- **Sum**: 9 + 4 + 6 + 4 + 7 + 12 = 42 ✓
