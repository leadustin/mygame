// in /engine/gameplay/world_interaction_system.js

import { eventBus } from '../core/state-manager.js'; // KORREKTUR: Import von der richtigen Datei
import { MAP_LOCATIONS } from '../../data/locations/map-locations.js';

export class WorldInteractionSystem {
    constructor() {
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

            if (distance < location.triggerRadius) {
                locationFound = true;
                
                if (!player.discoveredLocations.includes(location.id) && this.recentlyTriggeredId !== location.id) {
                    this.recentlyTriggeredId = location.id;
                    eventBus.publish('ui:show_location_prompt', location);
                }
                break;
            }
        }

        if (!locationFound) {
            this.recentlyTriggeredId = null;
        }
    }
}