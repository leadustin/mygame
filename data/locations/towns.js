/**
 * towns.js
 * * Definiert alle Städte in der Spielwelt.
 */

export const TOWNS = {
    STARTING_TOWN: {
        id: 'TOWN_START',
        name: 'Anfangsdorf',
        type: 'town',
        description: 'Ein ruhiges kleines Dorf am Rande des Königreichs. Der perfekte Ort, um ein Abenteuer zu beginnen.',
        connectedLocations: ['DUNGEON_GOBLIN_CAVE'],
        services: ['tavern', 'shop']
    }
};