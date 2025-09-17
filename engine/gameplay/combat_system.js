import { LOOT_TABLES } from '../../data/items/loot_tables.js';
import { CharacterSystem } from '../../game/characters/characters.js';

export class CombatSystem {

    calculateDamage(attacker, defender) {
        const baseDamage = attacker.stats.strength || attacker.stats.attack || 5;
        const defense = defender.stats.defense || 2;
        const damage = Math.max(1, baseDamage - defense);
        const randomFactor = (Math.random() * 0.4) + 0.8;
        return Math.round(damage * randomFactor);
    }

    performAction(state, action) {
        let player = state.player;
        const monster = state.combat.monster;
        let log = [];

        if (action === 'attack') {
            const damageDealt = this.calculateDamage(player, monster);
            monster.hp -= damageDealt;
            log.push(`${player.name} greift ${monster.name} an und verursacht ${damageDealt} Schaden.`);
        }

        if (monster.hp <= 0) {
            monster.hp = 0;
            log.push(`${monster.name} wurde besiegt!`);
            
            // --- NEUE BELOHNUNGSLOGIK ---
            // 1. XP vergeben
            const xpGained = monster.xpValue || 0;
            player.xp += xpGained;
            log.push(`Du erhältst ${xpGained} Erfahrungspunkte.`);

            // 2. Auf Level-Up prüfen
            const levelUpResult = CharacterSystem.checkForLevelUp(player);
            player = levelUpResult.player; // Spieler-Objekt aktualisieren
            if (levelUpResult.leveledUp) {
                log.push(...levelUpResult.log);
            }

            // 3. Loot generieren
            const lootTable = LOOT_TABLES[monster.lootPool];
            if (lootTable) {
                lootTable.items.forEach(lootItem => {
                    if (Math.random() < lootItem.chance) {
                        const item = { ...lootItem.item }; // Kopie erstellen
                        player.inventory.push(item);
                        log.push(`Du hast gefunden: ${item.name}!`);
                    }
                });
            }
            
            // Zustand nach dem Kampf zurückgeben
            return {
                updatedState: { ...state, player, currentView: 'map', combat: null },
                log,
            };
        }

        const damageTaken = this.calculateDamage(monster, player);
        player.hp -= damageTaken;
        log.push(`${monster.name} greift ${player.name} an und verursacht ${damageTaken} Schaden.`);

        if (player.hp <= 0) {
            player.hp = 0;
            log.push(`Du wurdest besiegt! Game Over.`);
            return {
                updatedState: { ...state, player, currentView: 'game_over', combat: null },
                log,
            };
        }
        
        return {
            updatedState: { ...state, player, combat: { ...state.combat, monster } },
            log,
        };
    }
}