// in /engine/gameplay/trading_system.js

export class TradingSystem {
    /**
     * Der Spieler kauft einen Gegenstand vom Händler.
     */
    static playerBuysItem(player, merchant, item) {
        const itemPrice = item.value || 0;

        if (player.gold >= itemPrice) {
            // Gold transferieren
            player.gold -= itemPrice;
            merchant.gold += itemPrice;

            // Gegenstand aus dem Händlerinventar entfernen und dem Spieler hinzufügen
            const itemIndex = merchant.inventory.findIndex(i => i.id === item.id);
            if (itemIndex > -1) {
                const purchasedItem = merchant.inventory.splice(itemIndex, 1)[0];
                player.inventory.push(purchasedItem);
            }
            
            return { success: true, player, merchant };
        }
        return { success: false, log: "Nicht genug Gold!" };
    }

    /**
     * Der Spieler verkauft einen Gegenstand an den Händler.
     */
    static playerSellsItem(player, merchant, item, itemIndex) {
        const itemPrice = Math.floor((item.value || 0) / 2); // Händler zahlt die Hälfte

        if (merchant.gold >= itemPrice) {
            // Gold transferieren
            player.gold += itemPrice;
            merchant.gold -= itemPrice;

            // Gegenstand aus dem Spielerinventar entfernen
            const soldItem = player.inventory.splice(itemIndex, 1)[0];
            
            // Gegenstand in die Rückkauf-Liste des Händlers legen
            merchant.buyBack.unshift(soldItem); // unshift fügt es am Anfang hinzu
            if (merchant.buyBack.length > 8) merchant.buyBack.pop(); // Limitiere die Liste

            return { success: true, player, merchant };
        }
        return { success: false, log: "Der Händler hat nicht genug Gold!" };
    }
    
    /**
     * Der Spieler kauft einen Gegenstand aus der Rückkauf-Liste zurück.
     */
    static playerBuysBackItem(player, merchant, item) {
        const itemPrice = Math.floor((item.value || 0) / 2); // Derselbe Preis wie beim Verkauf

        if (player.gold >= itemPrice) {
            // Gold transferieren
            player.gold -= itemPrice;
            merchant.gold += itemPrice;
            
            // Gegenstand aus der Rückkauf-Liste entfernen und dem Spieler hinzufügen
            const itemIndex = merchant.buyBack.findIndex(i => i.id === item.id);
            if(itemIndex > -1){
                const boughtBackItem = merchant.buyBack.splice(itemIndex, 1)[0];
                player.inventory.push(boughtBackItem);
            }
            
            return { success: true, player, merchant };
        }
        return { success: false, log: "Nicht genug Gold!" };
    }
}