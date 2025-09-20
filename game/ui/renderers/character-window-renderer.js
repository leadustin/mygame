import { Draggable } from '../../engine/ui-helpers/draggable.js';
import { eventBus } from '../../engine/core/state-manager.js';
import { RACES } from '../../game/characters/races.js';
import { CLASSES } from '../../game/characters/classes.js';
import { CharacterSystem } from '../../game/characters/characters.js';

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
        
        // Temporären Status für Attributsänderungen initialisieren
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
        this.renderEquipment(windowEl, player);
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

    renderEquipment(windowEl, player) {
        // Code für `renderCharacterWindow` (Ausrüstungsteil) hier einfügen
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
        
        // Drag & Drop Listener
        // this.attachDragDropListeners(windowEl.querySelector('.window-content'));
    }
}