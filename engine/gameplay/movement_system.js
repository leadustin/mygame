/**
 * movement_system.js
 * * Kümmert sich um die Bewegung von Entitäten auf der Weltkarte.
 */
export class MovementSystem {
    constructor() {
        this.targetPosition = null;
        this.movementSpeed = 50; // Pixel pro Sekunde
    }

    setTarget(target) {
        this.targetPosition = target;
    }

    hasTarget() {
        return this.targetPosition !== null;
    }

    /**
     * Aktualisiert die Spielerposition in jedem Frame.
     * @param {object} player - Das Spieler-Objekt, das bewegt wird.
     * @param {number} deltaTime - Die Zeit seit dem letzten Frame in Sekunden.
     */
    update(player, deltaTime) {
        if (!this.hasTarget() || !player) return;

        const currentPos = player.mapPosition;
        const targetPos = this.targetPosition;

        const dx = targetPos.x - currentPos.x;
        const dy = targetPos.y - currentPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Wenn wir nah genug am Ziel sind, stoppen wir die Bewegung.
        if (distance < 5) {
            this.targetPosition = null;
            return;
        }

        const moveAmount = this.movementSpeed * deltaTime;
        
        // Bewege den Spieler in Richtung des Ziels
        currentPos.x += (dx / distance) * moveAmount;
        currentPos.y += (dy / distance) * moveAmount;
    }
}

