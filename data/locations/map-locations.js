/**
 * map_locations.js
 * * Definiert alle Orte von Interesse auf der Weltkarte mit ihren Namen und Koordinaten.
 */

export const MAP_LOCATIONS = {
    GOBLIN_CAVE_ENTRANCE: {
        id: 'LOC_GOBLIN_CAVE',
        name: 'Goblin-Höhle', // Der Text, der auf der Karte angezeigt wird
        type: 'dungeon_entrance',
        position: { x: 2800, y: 1000 }, // Beispiel: Pixel-Koordinaten (im Nordosten)
        triggerRadius: 100, // Der Radius in Pixeln, in dem ein Ereignis ausgelöst wird
        targetLocationId: 'DUNGEON_GOBLIN_CAVE' // NEU: Verweis auf die tatsächliche Dungeon-ID
    },
    // Hier könnten später weitere Orte wie Städte, Ruinen etc. hinzugefügt werden
    STARTING_TOWN: {
        id: 'LOC_STARTING_TOWN',
        name: 'Anfangsdorf',
        type: 'town',
        position: { x: 2048, y: 1536 }, // In der Mitte der Karte
        triggerRadius: 150,
        targetLocationId: 'TOWN_START' // NEU: Verweis auf die tatsächliche Town-ID
    }
};