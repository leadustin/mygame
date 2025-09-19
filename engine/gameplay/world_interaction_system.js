// in /engine/gameplay/world_interaction_system.js

import { eventBus } from '../core/event_bus.js';
import { MAP_LOCATIONS } from '../../data/locations/map_locations.js';

export class WorldInteractionSystem {
    constructor() {
        // Dieses Gedächtnis stellt sicher, dass das Entdeckungs-Event nur einmal pro Annäherung ausgelöst wird.
        this.recentlyTriggeredId = null; 
    }

    update(player) {
        if (!player) return;

        let locationFound = false;

        for (const key in MAP_LOCATIONS) {
            const location = MAP_LOCATIONS[key];
            const playerPos = player.mapPosition;

            const dx = playerPos.x - location.position.x;
            const dy = playerPos.y - location.position.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Prüfen, ob der Spieler im Radius ist
            if (distance < location.triggerRadius) {
                locationFound = true;
                
                // Prüfen, ob der Ort NEU entdeckt wurde UND nicht gerade erst getriggert wurde
                if (!player.discoveredLocations.includes(location.id) && this.recentlyTriggeredId !== location.id) {
                    this.recentlyTriggeredId = location.id; // Für diese Annäherung merken
                    // Statt direkt zu wechseln, lösen wir das Event zum Anzeigen des Fensters aus
                    eventBus.publish('ui:show_location_prompt', location);
                }
                break;
            }
        }

        // Wenn der Spieler keinen Ort mehr in der Nähe hat, das Gedächtnis zurücksetzen
        if (!locationFound) {
            this.recentlyTriggeredId = null;
        }
    }
}