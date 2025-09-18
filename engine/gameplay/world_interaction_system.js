import { eventBus } from '../core/state_manager.js';
import { MAP_LOCATIONS } from '../../data/locations/map_locations.js';

/**
 * world_interaction_system.js
 * * Überprüft die Spielerposition und löst Ereignisse aus, wenn Orte erreicht werden.
 */
export class WorldInteractionSystem {
    constructor() {
        // Merkt sich, in welchem Ort sich der Spieler gerade befindet,
        // um das Event nicht 60x pro Sekunde auszulösen.
        this.currentLocationId = null;
    }

    /**
     * Prüft in jedem Frame, ob der Spieler einen Ort betreten oder verlassen hat.
     * @param {object} player - Das Spieler-Objekt.
     */
    update(player) {
        if (!player) return;

        let locationFound = false;

        for (const key in MAP_LOCATIONS) {
            const location = MAP_LOCATIONS[key];
            const playerPos = player.mapPosition;
            const locationPos = location.position;

            // Berechne die Distanz zwischen Spieler und Ort
            const dx = playerPos.x - locationPos.x;
            const dy = playerPos.y - locationPos.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Prüfe, ob der Spieler im Trigger-Radius ist
            if (distance < location.triggerRadius) {
                locationFound = true;
                // Wenn der Spieler diesen Ort NEU betritt...
                if (this.currentLocationId !== location.id) {
                    this.currentLocationId = location.id;
                    console.log(`Ort betreten: ${location.name}`);
                    // ...löse ein Event mit den gesamten Orts-Daten aus.
                    eventBus.publish('world:location_entered', location);
                }
                break; // Beende die Schleife, da der Spieler nur an einem Ort sein kann.
            }
        }

        // Wenn der Spieler in keinem Radius mehr ist, setze den Standort zurück.
        if (!locationFound && this.currentLocationId !== null) {
            console.log(`Ort verlassen.`);
            this.currentLocationId = null;
        }
    }
}
