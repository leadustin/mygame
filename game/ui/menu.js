/**
 * menu.js
 * * Verwaltet das Öffnen und Schließen von UI-Fenstern (Inventar, Charakter, Karte etc.).
 * Hört auf Input-Events und aktualisiert den globalen Spielzustand entsprechend.
 */
import { eventBus } from '../../engine/core/state_manager.js';

export class UIManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
        this.initEventListeners();
    }

    initEventListeners() {
        eventBus.subscribe('input:toggleInventory', () => this.toggleWindow('inventory'));
        eventBus.subscribe('input:toggleCharacter', () => this.toggleWindow('character'));
        eventBus.subscribe('input:toggleMap', () => this.toggleWindow('map'));
        eventBus.subscribe('input:closeAllWindows', () => this.closeAllWindows());
    }

    toggleWindow(windowName) {
        const state = this.stateManager.getState();
        const activeWindows = new Set(state.activeWindows || []);

        if (activeWindows.has(windowName)) {
            activeWindows.delete(windowName);
        } else {
            activeWindows.add(windowName);
        }

        this.stateManager.updateState('activeWindows', Array.from(activeWindows));
    }

    closeAllWindows() {
        this.stateManager.updateState('activeWindows', []);
    }
}