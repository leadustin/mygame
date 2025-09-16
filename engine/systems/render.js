/**
 * render.js
 * * Verantwortlich für das Darstellen des Spielzustands im DOM.
 * Dieses System hört auf 'state:updated' und zeichnet die UI basierend auf dem neuen Zustand neu.
 */

export class RenderSystem {
    constructor() {
        this.container = document.getElementById('game-container');
    }

    /**
     * Haupt-Render-Funktion. Leert den Container und rendert die aktuelle Ansicht.
     * @param {object} state - Der aktuelle Spielzustand.
     */
    render(state) {
        this.container.innerHTML = ''; // Leert den Container für ein sauberes Neuzeichnen.

        switch (state.currentView) {
            case 'map':
                this.renderMapView(state);
                break;
            case 'combat':
                this.renderCombatView(state);
                break;
            // Weitere Ansichten hier hinzufügen (inventory, character, etc.)
            default:
                this.renderMapView(state);
        }

        // Rendert allgemeine UI-Elemente, die immer sichtbar sind (z.B. Log)
        this.renderLog(state.log);
    }

    /**
     * Rendert die Kartenansicht.
     * @param {object} state 
     */
    renderMapView(state) {
        const location = state.currentLocation;
        let html = `
            <h2>${location.name}</h2>
            <p>${location.description}</p>
            <div class="actions">
        `;
        
        // Füge Aktionen basierend auf dem Ortstyp hinzu
        if (location.type === 'town') {
             html += `<button id="enter-dungeon-btn">Dungeon betreten</button>`;
        }
        
        html += `</div>`;
        this.container.innerHTML = html;

        // Event Listener für die Buttons hinzufügen
        if (location.type === 'town') {
            document.getElementById('enter-dungeon-btn').addEventListener('click', () => {
                // Hier würde die Logik zum Starten eines Kampfes oder Betreten eines Dungeons kommen.
                console.log("Starte Kampf...");
                // Dies sollte über den EventBus geschehen, um die Logik zu entkoppeln.
                // z.B. eventBus.publish('game:startCombat');
            });
        }
    }

    /**
     * Rendert die Kampfansicht.
     * @param {object} state 
     */
    renderCombatView(state) {
        // Implementierung der Kampfansicht...
        const combatState = state.combat;
        if (!combatState) return;

        let html = `
            <div id="combat-screen">
                <div class="monster-area">
                    <h3>${combatState.monster.name}</h3>
                    <p>HP: ${combatState.monster.hp} / ${combatState.monster.maxHp}</p>
                </div>
                <div class="player-area">
                     <h3>${state.player.name}</h3>
                    <p>HP: ${state.player.hp} / ${state.player.maxHp}</p>
                    <p>MP: ${state.player.mp} / ${state.player.maxMp}</p>
                </div>
                <div class="actions">
                    <button id="attack-btn">Angriff</button>
                    <button>Zauber</button>
                    <button>Item</button>
                    <button>Fliehen</button>
                </div>
            </div>
        `;
        this.container.innerHTML = html;
    }
    
    /**
     * Rendert das Nachrichtenlog.
     * @param {string[]} logMessages - Array von Nachrichten.
     */
    renderLog(logMessages) {
        let logWindow = document.getElementById('log-window');
        if (!logWindow) {
            logWindow = document.createElement('div');
            logWindow.id = 'log-window';
            document.body.appendChild(logWindow);
        }

        logWindow.innerHTML = logMessages
            .slice(-10) // Zeigt nur die letzten 10 Nachrichten an
            .map(msg => `<div class="log-message">${msg}</div>`)
            .join('');
        
        logWindow.scrollTop = logWindow.scrollHeight; // Auto-scroll
    }
}