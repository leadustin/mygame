import { eventBus } from '../../engine/core/state_manager.js';

export class UIManager {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    // Die Event-Listener sind zurück, aber lauschen auf neue "ui:" Events
    initEventListeners() {
        eventBus.subscribe('ui:toggleInventory', () => this.toggleWindow('inventory'));
        eventBus.subscribe('ui:toggleCharacter', () => this.toggleWindow('character'));
        eventBus.subscribe('ui:toggleMap', () => this.toggleWindow('map'));
        eventBus.subscribe('ui:closeAllWindows', () => this.closeAllWindows());
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