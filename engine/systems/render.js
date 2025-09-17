/**
 * render.js
 * * Verantwortlich für das Darstellen des Spielzustands im DOM.
 * Dieses System hört auf 'state:updated' und zeichnet die UI basierend auf dem neuen Zustand neu.
 */
import { eventBus } from '../core/state_manager.js';

export class RenderSystem {
    constructor() {
        this.container = document.getElementById('game-container');
    }

    /**
     * Haupt-Render-Funktion. Leert den Container und rendert die aktuelle Ansicht sowie alle aktiven UI-Fenster.
     * @param {object} state - Der aktuelle Spielzustand.
     */
    render(state) {
        this.container.innerHTML = ''; // Leert den Container für ein sauberes Neuzeichnen.

        switch (state.currentView) {
            case 'character_creation':
                this.renderCharacterCreationView(state);
                break;
            case 'map':
                this.renderMapView(state);
                break;
            case 'combat':
                this.renderCombatView(state);
                break;
            case 'game_over':
                this.renderGameOverView();
                break;
            default:
                this.container.innerHTML = `<h2>Unbekannte Ansicht: ${state.currentView}</h2>`;
        }

        // Rendere aktive UI-Fenster über der aktuellen Ansicht
        if (state.currentView !== 'character_creation') {
            this.renderActiveWindows(state);
        }

        // Rendert allgemeine UI-Elemente, die immer sichtbar sind
        this.renderLog(state.log);
    }

    /**
     * Rendert den Charaktererstellungs-Bildschirm.
     * @param {object} state
     */
    renderCharacterCreationView(state) {
        const classOptions = Object.entries(state.creationData.availableClasses)
            .map(([key, val]) => `<option value="${key}">${val.name}</option>`)
            .join('');

        let html = `
            <div style="padding: 30px; text-align: center;">
                <h2>Charaktererstellung</h2>
                <input type="text" id="char-name" placeholder="Charaktername" style="margin: 5px; padding: 10px; width: 200px;" />
                <select id="char-class" style="margin: 5px; padding: 10px;">
                    ${classOptions}
                </select>
                <button id="start-game-btn" style="margin: 5px; padding: 10px 20px;">Abenteuer beginnen</button>
            </div>
        `;
        this.container.innerHTML = html;

        document.getElementById('start-game-btn').addEventListener('click', () => {
            const name = document.getElementById('char-name').value;
            const classId = document.getElementById('char-class').value;
            if (name.trim()) {
                eventBus.publish('ui:startGame', { name, classId });
            } else {
                alert('Bitte gib einen Namen für deinen Charakter ein.');
            }
        });
    }

    /**
     * Rendert die Kartenansicht.
     * @param {object} state
     */
    renderMapView(state) {
        if (!state.currentLocation) return;
        const location = state.currentLocation;
        let html = `
            <div style="padding: 20px;">
                <h2>${location.name}</h2>
                <p>${location.description}</p>
                <button id="enter-dungeon-btn">Betrete die Goblin-Höhle</button>
            </div>
        `;
        this.container.innerHTML = html;

        document.getElementById('enter-dungeon-btn').addEventListener('click', () => {
            console.log("CHECK 1: Button-Klick registriert. Sende 'game:startCombat' Event.");
            eventBus.publish('game:startCombat');
        });
    }

    /**
     * Rendert die Kampfansicht.
     * @param {object} state
     */
    renderCombatView(state) {
        if (!state.combat || !state.player) return;
        const player = state.player;
        const monster = state.combat.monster;

        let html = `
            <div id="combat-screen" style="padding: 20px; text-align: center;">
                <div class="monster-area" style="margin-bottom: 40px;">
                    <h2>${monster.name}</h2>
                    <p>HP: ${monster.hp} / ${monster.maxHp}</p>
                </div>

                <div class="player-area" style="margin-bottom: 40px;">
                    <h3>${player.name}</h3>
                    <p>HP: ${player.hp} / ${player.maxHp}</p>
                    <p>MP: ${player.mp} / ${player.maxMp}</p>
                </div>

                <div class="actions">
                    <button id="attack-btn">Angriff</button>
                    <button disabled>Zauber</button>
                    <button disabled>Item</button>
                </div>
            </div>
        `;
        this.container.innerHTML = html;

        document.getElementById('attack-btn').addEventListener('click', () => {
            eventBus.publish('combat:action', 'attack');
        });
    }
    
    /**
     * Rendert den Game-Over-Bildschirm.
     */
    renderGameOverView() {
        this.container.innerHTML = `<h2 style="padding: 20px; color: red; text-align: center;">GAME OVER</h2>`;
    }

    /**
     * Rendert alle Fenster, die im State als aktiv markiert sind.
     * @param {object} state
     */
    renderActiveWindows(state) {
        if (!state.activeWindows || !state.player) return;

        state.activeWindows.forEach(windowName => {
            const windowEl = document.createElement('div');
            windowEl.className = 'window active';
            windowEl.id = `${windowName}-window`;

            if (windowName === 'character') {
                this.renderCharacterWindow(windowEl, state.player);
            } else if (windowName === 'inventory') {
                this.renderInventoryWindow(windowEl, state.player);
            }

            this.container.appendChild(windowEl);
        });
    }

    /**
     * Füllt das Charakter-Fenster mit Spielerdaten.
     * @param {HTMLElement} windowEl - Das Container-Element des Fensters.
     * @param {object} player - Das Spielerobjekt aus dem State.
     */
    renderCharacterWindow(windowEl, player) {
        windowEl.style.left = '50px';
        windowEl.style.top = '50px';
        windowEl.style.width = '300px';

        let statsHtml = '';
        for (const [stat, value] of Object.entries(player.stats)) {
            statsHtml += `
                <div class="stat-line">
                    <span>${stat.charAt(0).toUpperCase() + stat.slice(1)}</span>
                    <span>${value}</span>
                </div>
            `;
        }
        // NEU: Ausrüstung anzeigen
        let equipmentHtml = '';
        const slots = ['weapon', 'armor', 'head', 'hands']; // Beispiel-Slots
        slots.forEach(slot => {
            const item = player.equipment[slot];
            const itemName = item ? item.name : 'Leer';
            equipmentHtml += `
                <div class="stat-line">
                    <span>${slot.charAt(0).toUpperCase() + slot.slice(1)}</span>
                    <span>${itemName}</span>
                </div>
            `;
        });

        windowEl.innerHTML = `
            <h3>${player.name}</h3>
            <p>Level ${player.level} ${player.class}</p>
            <hr>
            <div class="stat-line"><span>HP</span><span>${player.hp} / ${player.maxHp}</span></div>
            <div class="stat-line"><span>MP</span><span>${player.mp} / ${player.maxMp}</span></div>
            <hr>
            <h4>Attribute</h4>
            ${statsHtml}
        `;
    }

    /**
     * Füllt das Inventar-Fenster mit den Items des Spielers.
     * @param {HTMLElement} windowEl - Das Container-Element des Fensters.
     * @param {object} player - Das Spielerobjekt aus dem State.
     */
    renderInventoryWindow(windowEl, player) {
        windowEl.style.right = '50px';
        windowEl.style.top = '50px';
        windowEl.style.width = '600px';

        let slotsHtml = '';
        const inventorySize = 32;

        for (let i = 0; i < inventorySize; i++) {
            const item = player.inventory[i];
            if (item) {
                // WICHTIG: Wir speichern den Index des Items im data-Attribut
                slotsHtml += `
                    <div class="inventory-slot" data-item-index="${i}">
                        <div class="inventory-item">${item.name}</div>
                    </div>`;
            } else {
                slotsHtml += `<div class="inventory-slot"></div>`;
            }
        }

        windowEl.innerHTML = `
            <h3>Inventar</h3>
            <div id="inventory-grid">${slotsHtml}</div>`;
        
        // --- NEUE EVENT LISTENER LOGIK ---
        // Klick-Handler für das gesamte Grid
        windowEl.querySelector('#inventory-grid').addEventListener('contextmenu', (e) => {
            e.preventDefault(); // Verhindert das Standard-Browser-Menü
            
            const slot = e.target.closest('.inventory-slot');
            if (!slot || !slot.dataset.itemIndex) return; // Klick auf leeren Slot

            const itemIndex = parseInt(slot.dataset.itemIndex);
            const item = player.inventory[itemIndex];
            
            this.showContextMenu(e.clientX, e.clientY, item);
        });

        // Klick irgendwo anders schließt das Menü
        document.addEventListener('click', () => this.hideContextMenu(), { once: true });
    }

    // Füge diese zwei neuen Methoden zur RenderSystem-Klasse hinzu:
    showContextMenu(x, y, item) {
        this.hideContextMenu(); // Schließe altes Menü, falls vorhanden
        
        const menu = document.createElement('div');
        menu.id = 'context-menu';
        document.body.appendChild(menu);

        let menuOptions = '';
        if (item.type === 'weapon' || item.type === 'armor') {
            menuOptions += `<div class="context-menu-item" data-action="equip">Ausrüsten</div>`;
        }
        if (item.type === 'potion') {
            menuOptions += `<div class="context-menu-item" data-action="use">Benutzen</div>`;
        }
        menu.innerHTML = menuOptions;
        
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.display = 'block';

        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'equip') {
                eventBus.publish('inventory:equip', item);
            } else if (action === 'use') {
                eventBus.publish('inventory:use', item);
            }
            this.hideContextMenu();
        });
    }

    hideContextMenu() {
        const menu = document.getElementById('context-menu');
        if (menu) {
            menu.remove();
        }
    }

    /**
     * Rendert das Nachrichtenlog.
     * @param {string[]} logMessages - Array von Nachrichten.
     */
    renderLog(logMessages) {
        if (!logMessages) return;
        let logWindow = document.getElementById('log-window');
        if (!logWindow) {
            logWindow = document.createElement('div');
            logWindow.id = 'log-window';
            document.body.appendChild(logWindow);
        }

        logWindow.innerHTML = logMessages
            .slice(-10)
            .map(msg => `<div class="log-message">${msg}</div>`)
            .join('');

        logWindow.scrollTop = logWindow.scrollHeight;
    }
}