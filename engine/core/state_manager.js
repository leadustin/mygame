/**
 * state_manager.js
 * * Verwaltet den globalen Zustand des Spiels.
 * Jede Änderung am Spielzustand sollte über diesen Manager laufen.
 * Er benachrichtigt Listener (wie das Render-System), wenn sich der Zustand ändert.
 */
import EventBus from './event_bus.js';

// Wir erstellen eine globale Instanz des EventBus, die von allen Modulen genutzt werden kann.
// Dies ist ein einfacher Weg, um eine einzige Instanz sicherzustellen, ohne auf komplexe DI-Muster zurückzugreifen.
const eventBus = new EventBus();

class StateManager {
    constructor() {
        this.gameState = {};
        // Wir verwenden hier direkt die globale eventBus Instanz.
        this.eventBus = eventBus;
    }

    /**
     * Gibt eine Kopie des aktuellen Spielzustands zurück.
     * @returns {object} Der aktuelle Spielzustand.
     */
    getState() {
        // Gibt eine tiefe Kopie zurück, um versehentliche Mutationen zu verhindern.
        return JSON.parse(JSON.stringify(this.gameState));
    }

    /**
     * Setzt den gesamten Spielzustand.
     * @param {object} newState - Der neue Zustand.
     */
    setState(newState) {
        this.gameState = newState;
        this.eventBus.publish('state:updated', this.gameState);
        console.log("State wurde aktualisiert:", this.gameState);
    }

    /**
     * Aktualisiert einen Teil des Spielzustands.
     * @param {string} key - Der Schlüssel des Zustands, der aktualisiert werden soll (z.B. 'player').
     * @param {*} value - Der neue Wert.
     */
    updateState(key, value) {
        this.gameState[key] = value;
        this.eventBus.publish('state:updated', this.gameState);
        console.log(`State-Teil '${key}' wurde aktualisiert:`, value);
    }
}

// Exportiere die StateManager-Klasse und die globale eventBus-Instanz.
export default StateManager;
export { eventBus };