import { LOOT_TABLES } from '../../data/items/loot_tables.js';
import { CharacterSystem } from '../../game/characters/characters.js';
import { SPELLS } from '../../data/items/spells.js';
import { POTIONS } from '../../data/items/potions.js';

export class CombatSystem {

    calculateDamage(attacker, defender) {
        const baseDamage = attacker.stats.strength || attacker.stats.attack || 5;
        const defense = defender.stats.defense || 2;
        const damage = Math.max(1, baseDamage - defense);
        const randomFactor = (Math.random() * 0.4) + 0.8;
        return Math.round(damage * randomFactor);
    }

    performAction(state, action) {
        // Erstelle explizite Kopien, um sicherzustellen, dass wir mit dem Zustand arbeiten
        let player = { ...state.player };
        let monster = { ...state.combat.monster };
        let log = [];

        // Spieler-Aktion
        switch (action.type) {
            case 'attack': {
                const damageDealt = this.calculateDamage(player, monster);
                monster.hp -= damageDealt;
                log.push(`${player.name} greift an und verursacht ${damageDealt} Schaden.`);
                break;
            }
            case 'spell': {
                const spell = Object.values(SPELLS).find(s => s.id === action.spellId);
                if (spell && player.mp >= spell.costMp) {
                    player.mp -= spell.costMp;
                    if (spell.effect.type === 'damage') {
                        const damageDealt = spell.effect.amount + (player.stats.intelligence || 5);
                        monster.hp -= damageDealt;
                        log.push(`${player.name} wirkt ${spell.name} für ${damageDealt} Schaden!`);
                    } else if (spell.effect.type === 'heal') {
                        player.hp = Math.min(player.maxHp, player.hp + spell.effect.amount);
                        log.push(`${player.name} wirkt ${spell.name} und heilt ${spell.effect.amount} HP.`);
                    }
                } else {
                    log.push(`Nicht genug Mana für ${spell ? spell.name : 'diesen Zauber'}!`);
                }
                break;
            }
            case 'item': {
                const itemIndex = player.inventory.findIndex(i => i && i.id === action.itemId);
                if (itemIndex > -1) {
                    const item = player.inventory[itemIndex];
                    if (item.effect.type === 'heal') {
                        player.hp = Math.min(player.maxHp, player.hp + item.effect.amount);
                        log.push(`${player.name} benutzt ${item.name} und heilt ${item.effect.amount} HP.`);
                    }
                    player.inventory.splice(itemIndex, 1);
                }
                break;
            }
        }

        // Prüfen, ob Monster besiegt ist
        if (monster.hp <= 0) {
            monster.hp = 0;
            log.push(`${monster.name} wurde besiegt!`);
            // Komplette Belohnungslogik hier...
            const xpGained = monster.xpValue || 0;
            player.xp += xpGained;
            log.push(`Du erhältst ${xpGained} Erfahrungspunkte.`);
            const levelUpResult = CharacterSystem.checkForLevelUp(player);
            player = levelUpResult.player;
            if (levelUpResult.leveledUp) log.push(...levelUpResult.log);
            const lootTable = LOOT_TABLES[monster.lootPool];
            if (lootTable) {
                const generatedLoot = [];
                lootTable.items.forEach(lootItem => {
                    if (Math.random() < lootItem.chance) {
                        generatedLoot.push({ ...lootItem.item, lootId: `loot_${Date.now()}_${Math.random()}` });
                    }
                });
                state.postCombatState = {
                    xpGained: xpGained,
                    loot: generatedLoot,
                    originalLog: [...state.log, ...log]
                };
            }
            return { updatedState: { ...state, player, currentView: 'post_combat_loot', combat: null }, log: [] };
        }

        // Gegenangriff des Monsters
        const damageTaken = this.calculateDamage(monster, player);
        player.hp -= damageTaken;
        log.push(`${monster.name} greift zurück und verursacht ${damageTaken} Schaden.`);

        // Prüfen, ob Spieler besiegt ist
        if (player.hp <= 0) {
            player.hp = 0;
            log.push(`Du wurdest besiegt! Game Over.`);
            return { updatedState: { ...state, player, currentView: 'game_over', combat: null }, log };
        }
        
        // Finalen, aktualisierten Zustand zurückgeben
        return { 
            updatedState: { 
                ...state, 
                player, 
                combat: { ...state.combat, monster } 
            }, 
            log 
        };
    }
}