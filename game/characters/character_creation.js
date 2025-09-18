import { CLASSES } from './classes.js';
import { RACES } from './races.js';
import { WEAPONS } from '../../data/items/weapons.js';
import { ARMOR } from '../../data/items/armor.js';
import { CLOAKS } from '../../data/items/cloaks.js';
import { BELTS } from '../../data/items/belts.js';
import { JEWELRY } from '../../data/items/jewelry.js';
import { HANDS } from '../../data/items/hands.js';
import { FEET } from '../../data/items/feet.js'; // Oder feet.js, je nach deinem Dateinamen
import { ARTIFACTS } from '../../data/items/artifacts.js';
import { SHIELDS } from '../../data/items/shields.js';
import { MATERIALS } from '../../data/items/materials.js';

const ALL_ITEMS = { ...WEAPONS, ...ARMOR, ...CLOAKS, ...BELTS, ...JEWELRY, ...HANDS, ...FEET, ...ARTIFACTS, ...SHIELDS, ...MATERIALS };

export class CharacterCreator {
    /**
     * Erstellt ein neues Charakterobjekt basierend auf den übergebenen Optionen.
     */
    static createCharacter({ name, raceId, classId, gender }) {
        const classData = CLASSES[classId];
        const raceData = RACES[raceId];

        if (!classData || !raceData) {
            throw new Error(`Rasse oder Klasse nicht gefunden: ${raceId}, ${classId}`);
        }

        const finalStats = { ...classData.baseStats };
        for (const stat in raceData.statModifiers) {
            finalStats[stat] = (finalStats[stat] || 0) + raceData.statModifiers[stat];
        }

        const player = {
            id: `player_${new Date().getTime()}`,
            name: name || 'Abenteurer',
            race: raceData.name,
            raceId: raceId,
            class: classData.name,
            classId: classId,
            gender: gender || 'Nicht festgelegt',
            level: 1,
            xp: 0,
            unspentStatPoints: 0,
            mapPosition: { x: 2048, y: 1536 }, // HIER IST DIE FEHLENDE EIGENSCHAFT
            hp: finalStats.vitality * 10,
            maxHp: finalStats.vitality * 10,
            mp: finalStats.intelligence * 10,
            maxMp: finalStats.intelligence * 10,
            stats: finalStats,
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