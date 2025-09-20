import EventBus from './event-bus.js';

// Erstelle eine einzige, globale Instanz, die im ganzen Spiel verwendet wird.
const eventBus = new EventBus();

class StateManager {
    constructor() {
        this.gameState = {};
        // Der StateManager nutzt intern die globale Instanz.
        this.eventBus = eventBus;
    }

    /**
     * Gibt eine sichere Kopie des aktuellen Spielzustands zurück.
     * @returns {object} Der aktuelle Spielzustand.
     */
    getState() {
        return JSON.parse(JSON.stringify(this.gameState));
    }
    
    /**
     * Gibt eine direkte Referenz auf den Spielzustand zurück.
     * Nur für den Game Loop verwenden, um Performance zu sparen.
     * @returns {object} Der "lebende" Spielzustand.
     */
    getLiveState() {
        return this.gameState;
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
     * @param {string} key - Der Schlüssel des Zustands, der aktualisiert werden soll.
     * @param {*} value - Der neue Wert.
     */
    updateState(key, value) {
        this.gameState[key] = value;
        this.eventBus.publish('state:updated', this.gameState);
        console.log(`State-Teil '${key}' wurde aktualisiert:`, value);
    }
    /**
     * Fügt eine Nachricht zum Spiel-Log hinzu.
     * @param {string} message - Die Nachricht, die hinzugefügt werden soll.
     */
    addLog(message) {
        // Hole das aktuelle Log-Array (oder ein leeres, falls es nicht existiert)
        const currentLog = this.gameState.log || [];
        
        // Erstelle das neue Log-Array
        const newLog = [...currentLog, message];
        
        // Aktualisiere nur den 'log'-Teil des Zustands
        this.updateState('log', newLog); 
        
        console.log("Neue Log-Nachricht:", message);
    }
}

export default StateManager;
export { eventBus };