/**
 * inventory.js
 * * Enthält die Spiellogik für das Verwalten von Inventar und Ausrüstung. (Korrigierte Version)
 */
import { CLASSES } from '../../characters/classes.js';

export class InventorySystem {

    static equipItem(player, itemToEquip) {
        const slot = itemToEquip.type;
        if (!slot) return { player, log: 'Dieses Item kann nicht ausgerüstet werden.' };

        const itemIndex = player.inventory.findIndex(i => i.id === itemToEquip.id);
        if (itemIndex > -1) {
            player.inventory.splice(itemIndex, 1);
        }

        if (player.equipment[slot]) {
            player.inventory.push(player.equipment[slot]);
        }

        player.equipment[slot] = itemToEquip;
        player = this.recalculateStats(player); // Werte neu berechnen

        return { player, log: `${itemToEquip.name} wurde ausgerüstet.` };
    }
    
    static useItem(player, itemToUse) {
        if (itemToUse.type !== 'potion') return { player, log: "Das kann nicht benutzt werden." };

        if (itemToUse.effect.type === 'heal') {
            player.hp = Math.min(player.maxHp, player.hp + itemToUse.effect.amount);
        }
        
        const itemIndex = player.inventory.findIndex(i => i.id === itemToUse.id);
        if (itemIndex > -1) {
            player.inventory.splice(itemIndex, 1);
        }

        return { player, log: `${itemToUse.name} wurde benutzt. Du heilst ${itemToUse.effect.amount} HP.` };
    }

    /**
     * Berechnet die Gesamtwerte des Spielers neu (Basiswerte + Ausrüstung).
     */
    static recalculateStats(player) {
        // KORRIGIERTE LOGIK: Benutze die classId für eine zuverlässige Suche
        const characterClassData = CLASSES[player.classId];
        if (!characterClassData) {
            console.error(`Klassendaten für ID ${player.classId} nicht gefunden!`);
            return player;
        }
        
        const baseStats = characterClassData.baseStats;
        player.stats = { ...baseStats };

        for (const slot in player.equipment) {
            const item = player.equipment[slot];
            if (item && item.stats) {
                for (const stat in item.stats) {
                    player.stats[stat] = (player.stats[stat] || 0) + item.stats[stat];
                }
            }
        }
        return player;
    }
}