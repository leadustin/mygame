import { WEAPONS } from './weapons.js';
import { POTIONS } from './potions.js';

export const LOOT_TABLES = {
    LOOT_TABLE_GOBLIN: {
        items: [
            { item: WEAPONS.RUSTY_SWORD, chance: 0.05, quantity: 1 },
            { item: POTIONS.MINOR_HEALING_POTION, chance: 0.5, quantity: 1 }
        ],
        gold: { min: 5, max: 15 } // Gold wird zufällig zwischen 5 und 15 ausgewürfelt
    },
    LOOT_TABLE_RAT: {
        items: [],
        gold: { min: 1, max: 3 }
    }
};
