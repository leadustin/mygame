import { WEAPONS } from './weapons.js';
import { POTIONS } from './potions.js';
// Später hier auch Potions, Materials etc. importieren

export const LOOT_TABLES = {
    LOOT_TABLE_GOBLIN: {
        // Jedes Item hat eine 'chance' (0 bis 1) und die 'quantity'.
        items: [
            { item: WEAPONS.RUSTY_SWORD, chance: 0.05, quantity: 1 }, // 5% Chance
            { item: POTIONS.MINOR_HEALING_POTION, chance: 0.5, quantity: 1 }
            // { item: POTIONS.MINOR_HEALING_POTION, chance: 0.5, quantity: [1, 2] }, // 50% Chance auf 1-2 Tränke
        ],
        gold: { min: 1, max: 5 } // Gold wird ebenfalls zufällig ausgewürfelt
    },
    LOOT_TABLE_RAT: {
        items: [
            // Ratten haben schlechteren Loot
        ],
        gold: { min: 0, max: 2 }
    }
};