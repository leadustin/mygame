/**
 * character_creation.js
 * * Enthält die Logik zur Erstellung eines neuen Spielercharakters. (Korrigierte Version)
 */
import { CLASSES } from './classes.js';
import { WEAPONS } from '../../data/items/weapons.js';
import { ARMOR } from '../../data/items/armor.js';

// Kombiniere alle Item-Daten in einem durchsuchbaren Katalog.
const ALL_ITEMS = { ...WEAPONS, ...ARMOR };

export class CharacterCreator {
    /**
     * Erstellt ein neues Charakterobjekt basierend auf den übergebenen Optionen.
     * @param {object} options - Enthält name, classId etc.
     * @returns {object} Das fertige Spielerobjekt.
     */
    static createCharacter({ name, classId }) {
        const characterClass = CLASSES[classId];
        if (!characterClass) {
            throw new Error(`Klasse mit ID ${classId} nicht gefunden.`);
        }

        const player = {
            id: `player_${new Date().getTime()}`,
            name: name || 'Abenteurer',
            class: characterClass.name,
            classId: classId,
            level: 1,
            xp: 0,
            hp: characterClass.baseStats.vitality * 10,
            maxHp: characterClass.baseStats.vitality * 10,
            mp: characterClass.baseStats.intelligence * 10,
            maxMp: characterClass.baseStats.intelligence * 10,
            stats: { ...characterClass.baseStats },
            inventory: [],
            equipment: {},
        };

        // Startausrüstung hinzufügen
        if (characterClass.startEquipment) {
            // Wir iterieren über die IDs in der Startausrüstung
            Object.values(characterClass.startEquipment).forEach(itemId => {
                
                // KORRIGIERTE LOGIK: Finde das Item, dessen 'id'-Eigenschaft mit der gesuchten itemId übereinstimmt.
                const item = Object.values(ALL_ITEMS).find(i => i.id === itemId);

                if (item) {
                    console.log(`Item gefunden und hinzugefügt: ${item.name}`);
                    // Wichtig: Wir pushen eine Kopie des Items, damit Originaldaten nicht verändert werden.
                    player.inventory.push({ ...item }); 
                } else {
                    console.warn(`Start-Item mit ID '${itemId}' wurde nicht im Item-Katalog gefunden!`);
                }
            });
        }
        
        return player;
    }
}