/**
 * common.js
 * * Definiert gewöhnliche Monster.
 */

export const COMMON_MONSTERS = {
    GOBLIN: {
        id: 'MONSTER_GOBLIN',
        name: 'Goblin',
        type: 'common',
        level: 1,
        xpValue: 25,
        hp: 30,
        maxHp: 30,
        stats: {
            attack: 5,
            defense: 2
        },
        lootPool: 'LOOT_TABLE_GOBLIN' // Verweis auf eine Loot-Tabelle
    },
    GIANT_RAT: {
        id: 'MONSTER_GIANT_RAT',
        name: 'Riesenratte',
        type: 'common',
        level: 1,
        xpValue: 15,
        hp: 20,
        maxHp: 20,
        stats: {
            attack: 4,
            defense: 1
        },
        lootPool: 'LOOT_TABLE_RAT'
    }
};