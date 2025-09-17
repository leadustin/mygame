/**
 * classes.js
 * * Definiert die verfügbaren Charakterklassen mit ihren Basisattributen.
 */

export const CLASSES = {
    WARRIOR: {
        id: 'CLASS_WARRIOR',
        name: 'Krieger',
        description: 'Ein Meister des Nahkampfes, robust und stark. Krieger verlassen sich auf ihre Stärke und Vitalität, um in der Schlacht zu bestehen und ihre Verbündeten zu schützen.',
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
        description: 'Gebieter über arkane Energien, aber körperlich schwach. Magier nutzen ihre hohe Intelligenz, um mächtige Zauber zu wirken, die das Schlachtfeld kontrollieren können.',
        baseStats: {
            strength: 5,
            dexterity: 8,
            intelligence: 18,
            vitality: 8
        },
        startEquipment: {
            weapon: 'WEAPON_WOODEN_STAFF',
            armor: 'ARMOR_CLOTH_ROBE'
        },
        spellbook: [
            'SPELL_FIREBALL',
            'SPELL_MINOR_HEAL'
        ]
    },
    RANGER: {
        id: 'CLASS_RANGER',
        name: 'Waldläufer',
        description: 'Ein geschickter Jäger und Überlebenskünstler, tödlich mit dem Bogen. Waldläufer nutzen ihre Geschicklichkeit, um Feinde aus der Ferne auszuschalten.',
        baseStats: {
            strength: 10,
            dexterity: 16,
            intelligence: 8,
            vitality: 10
        },
        startEquipment: {
            weapon: 'WEAPON_SHORTBOW',
            armor: 'ARMOR_LEATHER_VEST'
        }
    },
    ROGUE: {
        id: 'CLASS_ROGUE',
        name: 'Schurke',
        description: 'Ein Meister der Schatten und Täuschung, der Schwachstellen des Gegners ausnutzt. Schurken verlassen sich auf hohe Geschicklichkeit für schnelle und präzise Angriffe.',
        baseStats: {
            strength: 8,
            dexterity: 18,
            intelligence: 10,
            vitality: 9
        },
        startEquipment: {
            weapon: 'WEAPON_DAGGER',
            armor: 'ARMOR_STUDDED_LEATHER'
        }
    }
};