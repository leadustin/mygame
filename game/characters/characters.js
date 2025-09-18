/**
 * characters.js
 * * Enthält Logik, die direkt mit dem Spielercharakter zu tun hat, wie z.B. Level-Ups.
 */
export class CharacterSystem {
    /**
     * Berechnet die benötigten XP für das nächste Level.
     * @param {number} level - Das aktuelle Level.
     * @returns {number} Die XP-Schwelle für das nächste Level.
     */
    static getXpForNextLevel(level) {
        // Einfache Formel: 100 XP für Level 2, 200 für Level 3, etc.
        return level * 100;
    }

    /**
     * Prüft, ob der Spieler genug XP für ein Level-Up hat und führt es ggf. durch.
     * @param {object} player - Das Spieler-Objekt.
     * @returns {{player: object, leveledUp: boolean, log: string[]}} - Das aktualisierte Spielerobjekt und Log-Nachrichten.
     */
    static checkForLevelUp(player) {
        const xpNeeded = this.getXpForNextLevel(player.level);
        let leveledUp = false;
        let log = [];

        if (player.xp >= xpNeeded) {
            player.level++;
            player.xp -= xpNeeded;
            leveledUp = true;
            
            // --- GEÄNDERTE LOGIK ---
            // Anstatt Stats direkt zu erhöhen, vergeben wir Punkte.
            const pointsGained = 3; // Beispiel: 3 Punkte pro Level-Up
            player.unspentStatPoints = (player.unspentStatPoints || 0) + pointsGained;
            
            // Ein kleiner Bonus auf HP/MP beim Level-Up ist trotzdem nett.
            player.maxHp += 5; 
            player.maxMp += 5;

            // Volle Heilung
            player.hp = player.maxHp;
            player.mp = player.maxMp;

            log.push(`LEVEL UP! Du bist jetzt Level ${player.level} und hast ${pointsGained} Punkte zum Verteilen!`);
        }

        return { player, leveledUp, log };
    }
}