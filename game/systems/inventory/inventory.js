export class InventorySystem {
    /**
     * Verarbeitet die Bewegung eines Items, ausgelöst durch Drag & Drop.
     * @param {object} player - Das aktuelle Spieler-Objekt.
     * @param {object} source - Das Quellobjekt, von dem das Item kommt.
     * @param {object} target - Das Zielobjekt, wohin das Item verschoben wird.
     */
    static handleItemMove(player, source, target) {
        // Holen der korrekten Engine-Instanz aus dem globalen Scope
        const engine = window.gameEngine;

        // --- HANDELSLOGIK ---
        
        // VERKAUFEN: Item aus Inventar/Ausrüstung wird zum Händler gezogen.
        if ((source.source === 'inventory' || source.source === 'equipment') && (target.type === 'merchant' || target.type === 'shop')) {
            let itemToSell;
            let sellData = {
                item: null,
                source: source.source
            };

            if (source.source === 'inventory') {
                itemToSell = player.inventory[source.index];
                sellData.item = itemToSell;
                sellData.index = source.index;
            } else {
                itemToSell = player.equipment[source.slot];
                sellData.item = itemToSell;
                sellData.slot = source.slot;
            }

            if (itemToSell) {
                // Verwende die korrekten Methodennamen aus engine.js
                engine.handleSell(sellData);
                return; // Die Engine kümmert sich um das State-Update.
            }
        }

        // KAUFEN / ZURÜCKKAUFEN: Item vom Händler wird ins Inventar gezogen.
        if ((source.source === 'merchant' || source.source === 'buyback') && target.type === 'inventory') {
            const state = engine.stateManager.getState();
            if (!state.activeTradeSession) return { player, log: [] };
            
            const merchant = state.activeTradeSession.merchant;
            let itemToBuy;

            if (source.source === 'merchant') {
                itemToBuy = merchant.inventory.find(i => i.id === source.itemId);
                if (itemToBuy) engine.handleBuy(itemToBuy);
            } else { // 'buyback'
                itemToBuy = merchant.buyBack.find(i => i.id === source.itemId);
                if (itemToBuy) engine.handleBuyBack(itemToBuy);
            }
            return; // Die Engine kümmert sich um das State-Update.
        }
       
        // --- INVENTAR & AUSRÜSTUNG LOGIK ---
        
        let sourceItem = null;
        if (source.source === 'inventory') {
            sourceItem = player.inventory[source.index];
        } else {
            sourceItem = player.equipment[source.slot];
        }

        let targetItem = null;
        if (target.type === 'inventory') {
            targetItem = player.inventory[target.index];
        } else {
            targetItem = player.equipment[target.slot];
        }

        if (sourceItem && target.type === 'equipment' && !target.slot.startsWith(sourceItem.type)) {
            return { player, log: [] };
        }
        if (targetItem && source.source === 'equipment' && !source.slot.startsWith(targetItem.type)) {
            return { player, log: [] };
        }

        if (source.source === 'inventory') {
            player.inventory[source.index] = targetItem;
        } else {
            player.equipment[source.slot] = targetItem;
        }

        if (target.type === 'inventory') {
            if (target.index === undefined || target.index === null) {
                const emptyIndex = player.inventory.findIndex(i => i === undefined || i === null);
                if (emptyIndex !== -1) {
                    player.inventory[emptyIndex] = sourceItem;
                } else {
                    player.inventory.push(sourceItem);
                }
            } else {
                 player.inventory[target.index] = sourceItem;
            }
        } else {
            player.equipment[target.slot] = sourceItem;
        }
        
        if (source.source === 'equipment' || target.type === 'equipment') {
            player = CharacterSystem.recalculateStats(player);
        }
        
        return { player, log: [] };
    }

    /**
     * Berechnet die Gesamtwerte des Spielers neu. (Unverändert)
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