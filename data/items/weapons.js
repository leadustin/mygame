/**
 * weapons.js
 * * Definiert alle Waffen im Spiel.
 */

export const WEAPONS = {
    RUSTY_SWORD: {
        id: 'WEAPON_RUSTY_SWORD',
        name: 'Rostiges Schwert',
        type: 'weapon',
        rarity: 'common',
        value: 5,
        stackable: false,
        stats: {
            damage: 3
        }
    },
    WOODEN_STAFF: {
        id: 'WEAPON_WOODEN_STAFF',
        name: 'Holzstab',
        type: 'weapon',
        rarity: 'common',
        value: 5,
        stackable: false,
        stats: {
            magicPower: 4
        }
    }
};