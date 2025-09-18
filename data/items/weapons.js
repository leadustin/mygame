export const WEAPONS = {
    RUSTY_SWORD: {
        id: 'WEAPON_RUSTY_SWORD',
        name: 'Rostiges Schwert',
        type: 'weapon', // Dies ist der Nahkampf-Slot
        rarity: 'common',
        icon: 'assets/images/items/placeholder_weapon.webp',
        value: 5,
        stats: { strength: 3 },
        dismantleYields: {
            'MAT_IRON_INGOT': { chance: 1.0, quantity: [1, 1] }, // 100% Chance auf 1 Eisenbarren
            'MAT_WOOD_PLANK': { chance: 0.5, quantity: [1, 1] }  // 50% Chance auf 1 Holzbrett
        }
    },
    WOODEN_STAFF: {
        id: 'WEAPON_WOODEN_STAFF',
        name: 'Holzstab',
        type: 'weapon', // Nahkampf-Slot
        rarity: 'common',
        icon: 'assets/images/items/placeholder_weapon.webp',
        value: 5,
        stats: { intelligence: 3 }
    },
    SHORTBOW: {
        id: 'WEAPON_SHORTBOW',
        name: 'Kurzbogen',
        type: 'ranged', // GEÄNDERT
        rarity: 'common',
        icon: 'assets/images/items/placeholder_weapon.webp',
        value: 12,
        stats: { dexterity: 4 }
    },
    DAGGER: {
        id: 'WEAPON_DAGGER',
        name: 'Dolch',
        type: 'weapon', // Nahkampf-Slot
        rarity: 'common',
        icon: 'assets/images/items/placeholder_weapon.webp',
        value: 8,
        stats: { dexterity: 3 }
    }
};