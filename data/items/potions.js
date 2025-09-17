export const POTIONS = {
    MINOR_HEALING_POTION: {
        id: 'POTION_HEAL_MINOR',
        name: 'Kleiner Heiltrank',
        type: 'potion',
        rarity: 'common',
        icon: 'assets/images/items/placeholder_potion.webp', // Korrigiert
        value: 10,
        stackable: true,
        effect: {
            type: 'heal',
            amount: 25
        }
    }
};