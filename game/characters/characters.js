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
            
            // Werte verbessern
            player.stats.strength += 2;
            player.stats.vitality += 1;
            player.maxHp += 10;
            player.hp = player.maxHp; // Volle Heilung beim Level-Up
            player.mp = player.maxMp;

            log.push(`LEVEL UP! Du bist jetzt Level ${player.level}!`);
        }

        return { player, leveledUp, log };
    }
}