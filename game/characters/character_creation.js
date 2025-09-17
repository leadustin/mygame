/**
 * character_creation.js
 * * Enthält die Logik zur Erstellung eines neuen Spielercharakters.
 */
import { CLASSES } from './classes.js';
import { RACES } from './races.js'; // NEU: Rassen importieren
import { WEAPONS } from '../../data/items/weapons.js';
import { ARMOR } from '../../data/items/armor.js';

const ALL_ITEMS = { ...WEAPONS, ...ARMOR };

export class CharacterCreator {
    /**
     * Erstellt ein neues Charakterobjekt basierend auf den übergebenen Optionen.
     * @param {object} options - Enthält name, raceId, classId, gender etc.
     * @returns {object} Das fertige Spielerobjekt.
     */
    static createCharacter({ name, raceId, classId, gender }) {
        const classData = CLASSES[classId];
        const raceData = RACES[raceId];

        if (!classData || !raceData) {
            throw new Error(`Rasse oder Klasse nicht gefunden: ${raceId}, ${classId}`);
        }

        // --- NEUE STAT-BERECHNUNG ---
        // 1. Basiswerte der Klasse als Grundlage nehmen
        const finalStats = { ...classData.baseStats };

        // 2. Rassen-Modifikatoren anwenden
        for (const stat in raceData.statModifiers) {
            if (finalStats[stat]) {
                finalStats[stat] += raceData.statModifiers[stat];
            } else {
                finalStats[stat] = raceData.statModifiers[stat];
            }
        }

        const player = {
            id: `player_${new Date().getTime()}`,
            name: name || 'Abenteurer',
            race: raceData.name, // Rasse speichern
            raceId: raceId,
            class: classData.name, // Klasse speichern
            classId: classId,
            gender: gender || 'Nicht festgelegt',
            level: 1,
            xp: 0,
            // HP/MP basieren auf den finalen Attributen
            hp: finalStats.vitality * 10,
            maxHp: finalStats.vitality * 10,
            mp: finalStats.intelligence * 10,
            maxMp: finalStats.intelligence * 10,
            stats: finalStats, // Finale, kombinierte Attribute
            inventory: [],
            equipment: {},
            spellbook: []
        };

        if (classData.spellbook) {
            player.spellbook = classData.spellbook;
        }

        if (classData.startEquipment) {
            Object.values(classData.startEquipment).forEach(itemId => {
                const item = Object.values(ALL_ITEMS).find(i => i.id === itemId);
                if (item) {
                    player.inventory.push({ ...item }); 
                }
            });
        }
        
        return player;
    }
}