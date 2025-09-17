/**
 * save.js
 * * Verwaltet das Speichern und Laden des Spielzustands via LocalStorage.
 */

const SAVE_KEY = 'rpg_savegame'; // Der Schlüssel, unter dem das Spiel gespeichert wird

export class SaveSystem {

    /**
     * Speichert den aktuellen Spielzustand im LocalStorage.
     * @param {object} state - Der zu speichernde Spielzustand.
     * @returns {boolean} - True bei Erfolg, false bei einem Fehler.
     */
    static saveGame(state) {
        try {
            const jsonState = JSON.stringify(state);
            localStorage.setItem(SAVE_KEY, jsonState);
            console.log("Spielstand erfolgreich gespeichert.");
            return true;
        } catch (error) {
            console.error("Fehler beim Speichern des Spielstands:", error);
            return false;
        }
    }

    /**
     * Lädt den Spielzustand aus dem LocalStorage.
     * @returns {object|null} - Das geladene State-Objekt oder null, wenn kein Spielstand existiert.
     */
    static loadGame() {
        try {
            const jsonState = localStorage.getItem(SAVE_KEY);
            if (jsonState === null) {
                console.log("Kein Spielstand zum Laden gefunden.");
                return null;
            }
            const state = JSON.parse(jsonState);
            console.log("Spielstand erfolgreich geladen:", state);
            return state;
        } catch (error) {
            console.error("Fehler beim Laden des Spielstands:", error);
            return null;
        }
    }
    
    /**
     * Prüft, ob ein Spielstand existiert.
     * @returns {boolean}
     */
    static saveExists() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }
}