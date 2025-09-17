export const SPELLS = {
    FIREBALL: {
        id: 'SPELL_FIREBALL',
        name: 'Feuerball',
        type: 'spell',
        icon: 'assets/images/items/placeholder_spell.webp', // Korrigiert
        costMp: 15,
        effect: {
            type: 'damage',
            school: 'fire',
            amount: 20
        }
    },
    MINOR_HEAL: {
        id: 'SPELL_MINOR_HEAL',
        name: 'Kleine Heilung',
        type: 'spell',
        icon: 'assets/images/items/placeholder_spell.webp', // Korrigiert
        costMp: 10,
        effect: {
            type: 'heal',
            amount: 30
        }
    }
};