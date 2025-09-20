import { CharacterWindowRenderer } from './renderers/character-window-renderer.js';
import { InventoryWindowRenderer } from './renderers/inventory-window-renderer.js';

export class WindowManager {
    constructor(container) {
        this.container = container; // Das ist der #game-container
        this.activeWindows = new Map(); // Speichert Instanzen der aktiven Fenster-Renderer

        this.windowRenderers = {
            'character': new CharacterWindowRenderer(),
            'inventory': new InventoryWindowRenderer(),
        };
    }

    render(state) {
        // Zuerst alle alten Fenster entfernen
        this.container.querySelectorAll('.window').forEach(win => win.remove());
        this.activeWindows.clear();

        if (!state.activeWindows || state.activeWindows.length === 0) {
            return;
        }

        // Rendere jedes aktive Fenster
        state.activeWindows.forEach(windowName => {
            const renderer = this.windowRenderers[windowName];
            if (renderer) {
                const windowElement = renderer.render(state);
                this.container.appendChild(windowElement);
                this.activeWindows.set(windowName, renderer);
            }
        });
    }
}