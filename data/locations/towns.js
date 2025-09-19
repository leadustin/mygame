/**
 * towns.js
 * * Definiert alle Städte in der Spielwelt.
 */
import { WEAPONS } from "../items/weapons.js";
import { POTIONS } from "../items/potions.js";
export const TOWNS = {
    STARTING_TOWN: {
        id: 'TOWN_START',
        name: 'Anfangsdorf',
        type: 'town',
        description: 'Ein ruhiges kleines Dorf am Rande des Königreichs. Der perfekte Ort, um ein Abenteuer zu beginnen.',
        mapImage: 'assets/images/maps/starting_town.webp',
        connectedLocations: ['DUNGEON_GOBLIN_CAVE'],
        services: ['tavern', 'shop'],
        npcs: [
            {
                id: 'NPC_BLACKSMITH_1',
                name: 'Balthasar, der Schmied',
                position: { x: 300, y: 400 },
                sprite: 'assets/images/npcs/blacksmith.webp', // Du musst dieses Bild erstellen
                dialogue: "Seid gegrüßt, Abenteurer. Meine Klingen sind die schärfsten diesseits der Berge. Braucht Ihr etwas?",

                // --- NEUE HÄNDLER-EIGENSCHAFTEN ---
                isMerchant: true,   // Ein Schalter, um ihn als Händler zu erkennen
                gold: 500,          // Sein verfügbares Gold
                inventory: [        // Sein individuelles Verkaufssortiment
                    { ...WEAPONS.RUSTY_SWORD },
                    { ...POTIONS.MINOR_HEALING_POTION }
                ],
                buyBack: []         // Eine anfangs leere Liste für zurückgekaufte Items
            }
        ]
    }
};