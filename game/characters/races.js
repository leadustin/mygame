/**
 * races.js
 * * Definiert die spielbaren Rassen und ihre einzigartigen Eigenschaften.
 */

export const RACES = {
    HUMAN: {
        id: 'RACE_HUMAN',
        name: 'Mensch',
        description: 'Vielseitig und anpassungsfähig. Menschen sind in allen Lebenslagen zu finden und bekannt für ihren Ehrgeiz und ihre Entschlossenheit.',
        // Stat-Modifikatoren werden auf die Basiswerte der Klasse addiert.
        statModifiers: {
            strength: 1,
            dexterity: 1
        }
    },
    ELF: {
        id: 'RACE_ELF',
        name: 'Elf',
        description: 'Anmutig, scharfsinnig und langlebig. Elfen haben eine natürliche Verbindung zur Magie und sind oft geschickte Bogenschützen oder Gelehrte.',
        statModifiers: {
            dexterity: 2,
            vitality: -1
        }
    },
    DWARF: {
        id: 'RACE_DWARF',
        name: 'Zwerg',
        description: 'Robust, widerstandsfähig und traditionsbewusst. Zwerge sind meisterhafte Handwerker und gefürchtete Krieger, die tief in den Bergen leben.',
        statModifiers: {
            vitality: 2,
            dexterity: -1
        }
    }
};