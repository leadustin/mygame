import { CLASSES } from '../../characters/classes.js';
import { RACES } from '../../characters/races.js';

export class InventorySystem {
    /**
     * Verarbeitet die Bewegung eines Items, ausgelöst durch Drag & Drop.
     */
    static handleItemMove(player, source, target) {
        // Hole das Item von der Quelle (kann auch 'undefined' sein)
        let sourceItem = null;
        if (source.source === 'inventory') {
            sourceItem = player.inventory[source.index];
        } else {
            sourceItem = player.equipment[source.slot];
        }

        // Hole das Item vom Ziel (kann auch 'undefined' sein)
        let targetItem = null;
        if (target.type === 'inventory') {
            targetItem = player.inventory[target.index];
        } else {
            targetItem = player.equipment[target.slot];
        }

        // Validierung: Passt das gezogene Item an den Zielort?
        if (sourceItem && target.type === 'equipment' && !target.slot.startsWith(sourceItem.type)) {
            return { player, log: [] };
        }
        // Validierung: Passt das Ziel-Item (falls vorhanden) an den Ursprungsort?
        if (targetItem && source.source === 'equipment' && !source.slot.startsWith(targetItem.type)) {
            return { player, log: [] };
        }

        // --- Führe den Tausch (Swap) durch ---
        // Setze das Ziel-Item an den Quellort
        if (source.source === 'inventory') {
            player.inventory[source.index] = targetItem;
        } else {
            player.equipment[source.slot] = targetItem;
        }

        // Setze das Quell-Item an den Zielort
        if (target.type === 'inventory') {
            // Wenn der Ziel-Index nicht definiert ist (Drop auf leeren Bereich), finde den ersten leeren Platz
            if (target.index === undefined || target.index === null) {
                const emptyIndex = player.inventory.findIndex(i => i === undefined || i === null);
                if (emptyIndex !== -1) {
                    player.inventory[emptyIndex] = sourceItem;
                } else {
                    player.inventory.push(sourceItem); // Wenn kein Platz, ans Ende
                }
            } else {
                 player.inventory[target.index] = sourceItem;
            }
        } else {
            player.equipment[target.slot] = sourceItem;
        }
        
        // Werte neu berechnen, falls sich die Ausrüstung geändert hat
        if (source.source === 'equipment' || target.type === 'equipment') {
            player = this.recalculateStats(player);
        }
        
        return { player, log: [] };
    }

    /**
     * Berechnet die Gesamtwerte des Spielers neu.
     */
    static recalculateStats(player) {
        const classData = CLASSES[player.classId];
        const raceData = RACES[player.raceId];
        if (!classData || !raceData) return player;
        
        const finalBaseStats = { ...classData.baseStats };
        for (const stat in raceData.statModifiers) {
            finalBaseStats[stat] = (finalBaseStats[stat] || 0) + raceData.statModifiers[stat];
        }
        player.stats = finalBaseStats;

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