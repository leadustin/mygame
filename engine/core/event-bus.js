/**
 * event_bus.js
 * * Ein einfaches Publish/Subscribe-System.
 * Ermöglicht die Kommunikation zwischen verschiedenen Modulen, ohne dass sie direkte Abhängigkeiten voneinander haben.
 * Z.B. kann das Input-System ein 'keyPressed' Event auslösen, und das UI-System kann darauf reagieren.
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }

    /**
     * Registriert einen Listener für ein bestimmtes Event.
     * @param {string} event - Der Name des Events.
     * @param {Function} callback - Die Funktion, die bei dem Event aufgerufen wird.
     */
    subscribe(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    /**
     * Löst ein Event aus und benachrichtigt alle registrierten Listener.
     * @param {string} event - Der Name des Events.
     * @param {*} data - Die Daten, die an die Listener übergeben werden.
     */
    publish(event, data) {
        if (!this.listeners[event]) {
            return;
        }
        this.listeners[event].forEach(callback => callback(data));
    }
}

export default EventBus;