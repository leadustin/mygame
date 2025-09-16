/**
 * classes.js
 * * Definiert die verfügbaren Charakterklassen mit ihren Basisattributen.
 */

export const CLASSES = {
    WARRIOR: {
        id: 'CLASS_WARRIOR',
        name: 'Krieger',
        description: 'Ein Meister des Nahkampfes, robust und stark.',
        baseStats: {
            strength: 15,
            dexterity: 10,
            intelligence: 5,
            vitality: 12
        },
        startEquipment: {
            weapon: 'WEAPON_RUSTY_SWORD',
            armor: 'ARMOR_LEATHER_VEST'
        }
    },
    MAGE: {
        id: 'CLASS_MAGE',
        name: 'Magier',
        description: 'Gebieter über arkane Energien, aber körperlich schwach.',
        baseStats: {
            strength: 5,
            dexterity: 8,
            intelligence: 18,
            vitality: 8
        },
        startEquipment: {
            weapon: 'WEAPON_WOODEN_STAFF',
            armor: 'ARMOR_CLOTH_ROBE'
        }
    }
};