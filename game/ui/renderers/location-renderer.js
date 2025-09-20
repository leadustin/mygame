import { eventBus } from '../../../engine/core/state-manager.js'; // KORRIGIERT

export class LocationRenderer {
    constructor(container) {
        this.container = container; // Das ist die #main-view
        this.hudContainer = document.getElementById('hud-container');
    }

    render(state) {
        const location = state.currentLocation;
        if (!location || !location.mapImage) {
            this.container.innerHTML = `<h2>Fehler: Kartenbild für ${location.name} nicht gefunden.</h2>`;
            return;
        }

        // Setzt das Hintergrundbild und leert den Inhalt
        this.container.style.backgroundImage = `url(${location.mapImage})`;
        this.container.style.backgroundSize = 'cover';
        this.container.style.backgroundPosition = 'center';
        this.container.innerHTML = '';

        // Fügt NPCs hinzu, falls vorhanden
        if (location.npcs && location.npcs.length > 0) {
            let npcHtml = '';
            location.npcs.forEach((npc) => {
                npcHtml += `
                    <img src="${npc.sprite}" 
                         alt="${npc.name}" 
                         class="location-npc"
                         data-npcid="${npc.id}"
                         style="position: absolute; left: ${npc.position.x}px; top: ${npc.position.y}px; cursor: pointer; width: 64px; height: 64px;">
                `;
            });
            this.container.innerHTML = npcHtml;
        }

        this.attachEventListeners(location);
        this.renderHud();
    }

    attachEventListeners(location) {
        // Event-Listener für Klicks auf NPCs (nutzt Event Delegation)
        this.container.addEventListener('click', (e) => {
            const target = e.target;
            if (target.classList.contains('location-npc')) {
                const npcId = target.dataset.npcid;
                const npcData = location.npcs.find((n) => n.id === npcId);
                if (npcData) {
                    eventBus.publish('ui:show_dialogue', npcData);
                }
            }
        });
    }

    renderHud() {
        // Spezifische HUD für die Location-Ansicht
        this.hudContainer.innerHTML = `
            <button id="exit-location-btn" class="hud-button">Weltkarte</button>
        `;

        // Event-Listener direkt nach dem Erstellen des Buttons hinzufügen
        const exitButton = document.getElementById("exit-location-btn");
        if (exitButton) {
            exitButton.addEventListener("click", () => {
                // Style zurücksetzen, wenn wir die Location verlassen
                this.container.style.backgroundImage = "none";
                eventBus.publish("ui:exitLocation");
            });
        }
    }
}