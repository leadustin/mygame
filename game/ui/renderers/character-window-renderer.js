import { Draggable } from '../../../engine/ui-helpers/draggable.js';
import { eventBus } from '../../../engine/core/state-manager.js';
import { RACES } from '../../characters/races.js';
import { CLASSES } from '../../characters/classes.js';
import { CharacterSystem } from '../../characters/characters.js';

export class CharacterWindowRenderer {
    constructor() {
        this.template = document.getElementById('character-window-template');
        this.tempStats = {};
        this.tempUnspentPoints = 0;
        this.originalStats = {};
    }

    render(state) {
        const player = state.player;
        if (!player) return null;
        
        this.originalStats = JSON.parse(JSON.stringify(player.stats));
        this.tempStats = JSON.parse(JSON.stringify(player.stats));
        this.tempUnspentPoints = player.unspentStatPoints;

        const windowEl = document.createElement('div');
        windowEl.id = 'character-window';
        windowEl.className = 'window active draggable-window';
        windowEl.style.left = '50%';
        windowEl.style.top = '50px';
        windowEl.style.transform = 'translateX(-50%)';
        windowEl.style.width = '900px';

        const content = this.template.content.cloneNode(true);
        windowEl.appendChild(content);

        this.updateStatsDisplay(windowEl, player);
        this.renderEquipmentAndInventory(windowEl, player);
        
        this.attachEventListeners(windowEl, player);
        new Draggable(windowEl);
        return windowEl;
    }
    
    updateStatsDisplay(windowEl, player) {
        const statsPanel = windowEl.querySelector("#character-stats-panel");
        if (!statsPanel) return;

        const xpNeeded = CharacterSystem.getXpForNextLevel(player.level);
        const xpPercent = xpNeeded > 0 ? (player.xp / xpNeeded) * 100 : 0;
        const hpPercent = player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 0;
        const mpPercent = player.maxMp > 0 ? (player.mp / player.maxMp) * 100 : 0;

        let primaryStatsHtml = "";
        const primaryStats = ["strength", "dexterity", "intelligence", "vitality"];
        primaryStats.forEach((stat) => {
            const value = this.tempStats[stat] || 0;
            const baseValue = this.originalStats[stat] || 0;
            const decreaseBtn = this.tempStats[stat] > baseValue ? `<button class="decrease-stat-btn stat-mod-btn" data-stat="${stat}">-</button>` : "";
            const increaseBtn = this.tempUnspentPoints > 0 ? `<button class="increase-stat-btn stat-mod-btn" data-stat="${stat}">+</button>` : "";
            primaryStatsHtml += `<div class="stat-line"><span>${stat.charAt(0).toUpperCase() + stat.slice(1)}</span><div class="stat-value-controls"><span>${value}</span>${decreaseBtn}${increaseBtn}</div></div>`;
        });

        let secondaryStatsHtml = "";
        const secondaryStats = ["defense", "magicDefense"];
        secondaryStats.forEach((stat) => {
            if (this.tempStats[stat] !== undefined)
                secondaryStatsHtml += `<div class="stat-line"><span>${stat.charAt(0).toUpperCase() + stat.slice(1)}</span><span>${this.tempStats[stat]}</span></div>`;
        });

        const pointsDisplay = player.unspentStatPoints > 0 ? `<div class="stat-points-display">Verfügbare Punkte: ${this.tempUnspentPoints}</div>` : "";
        const confirmButton = this.tempUnspentPoints < player.unspentStatPoints ? `<button class="confirm-stats-btn">Punkte bestätigen</button>` : "";

        statsPanel.innerHTML = `
            <div id="character-info-header"><h4>${player.name}</h4><p>Level ${player.level} ${player.race} ${player.class}</p></div>
            <div class="resource-bar-container"><div class="resource-bar-fill hp" style="width: ${hpPercent}%;"></div><div class="resource-bar-text">HP: ${player.hp} / ${player.maxHp}</div></div>
            <div class="resource-bar-container"><div class="resource-bar-fill mp" style="width: ${mpPercent}%;"></div><div class="resource-bar-text">MP: ${player.mp} / ${player.maxMp}</div></div>
            <div class="resource-bar-container"><div class="resource-bar-fill xp" style="width: ${xpPercent}%;"></div><div class="resource-bar-text">XP: ${player.xp} / ${xpNeeded}</div></div>
            <hr>
            <div class="stat-line"><span><img src="assets/images/icons/gold_coins.png" alt="Gold">Gold</span><span>${player.gold}</span></div>
            ${pointsDisplay}
            <hr>
            <h4>Primärattribute</h4>${primaryStatsHtml}<hr><h4>Kampfwerte</h4>${secondaryStatsHtml}${confirmButton}`;
    }

    renderEquipmentAndInventory(windowEl, player) {
        const equipmentPanel = windowEl.querySelector('#character-equipment-panel');
        const inventoryPanel = windowEl.querySelector('#character-filtered-inventory-panel');
        if (!equipmentPanel || !inventoryPanel) return;

        const equipmentSlots = [
            "head", "cloak", "armor", "amulet", "hand", "belt", "foot",
            "artifact", "ring1", "ring2", "weapon", "offhand", "ranged",
        ];
        
        let armorHtml = "";
        let weaponHtml = "";
        equipmentSlots.forEach((slotName) => {
            const item = player.equipment[slotName];
            let slotContent = `<span class="slot-name">${slotName.replace(/\d/g, "")}</span>`;
            if (item) {
                slotContent = `<img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}" draggable="true" data-source="equipment" data-slot="${slotName}">`;
            }
            const slotHtml = `<div class="equipment-slot drop-target" data-slot="${slotName}">${slotContent}</div>`;
            if (["weapon", "offhand", "ranged"].includes(slotName)) {
                weaponHtml += slotHtml;
            } else {
                armorHtml += slotHtml;
            }
        });
        equipmentPanel.innerHTML = `<div class="equipment-group">${armorHtml}</div><div class="equipment-group weapons">${weaponHtml}</div>`;

        const equippableItems = player.inventory.filter(
            (item) => item && equipmentSlots.some((slot) => slot.startsWith(item.type))
        );
        let filteredInventoryHtml = "";
        for (let i = 0; i < 20; i++) {
            const item = equippableItems[i];
            if (item) {
                const originalIndex = player.inventory.indexOf(item);
                filteredInventoryHtml += `<div class="inventory-slot drop-target" data-index="${originalIndex}"><img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}" draggable="true" data-source="inventory" data-index="${originalIndex}"></div>`;
            } else {
                filteredInventoryHtml += `<div class="inventory-slot drop-target"></div>`;
            }
        }
        inventoryPanel.innerHTML = `<h4>Ausrüstbare Items</h4><div id="filtered-inventory-grid">${filteredInventoryHtml}</div>`;
    }
    
    attachEventListeners(windowEl, player) {
        windowEl.querySelector(".window-close-btn").addEventListener("click", (e) => eventBus.publish("ui:closeWindow", e.target.dataset.window));
        
        windowEl.querySelector("#character-stats-panel").addEventListener("click", (e) => {
            const stat = e.target.dataset.stat;
            if (e.target.matches(".increase-stat-btn") && this.tempUnspentPoints > 0) {
                this.tempUnspentPoints--;
                this.tempStats[stat]++;
                this.updateStatsDisplay(windowEl, player);
            }
            if (e.target.matches(".decrease-stat-btn") && this.tempStats[stat] > this.originalStats[stat]) {
                this.tempUnspentPoints++;
                this.tempStats[stat]--;
                this.updateStatsDisplay(windowEl, player);
            }
            if (e.target.matches(".confirm-stats-btn")) {
                eventBus.publish("character:confirm_stats", {
                    newStats: this.tempStats,
                    remainingPoints: this.tempUnspentPoints,
                });
            }
        });
    }
}