/**
 * input.js
 * * Verarbeitet Tastatur- und Mauseingaben.
 * Löst Events aus, auf die andere Systeme reagieren können.
 * Ist komplett von der Spiellogik entkoppelt.
 */
import { eventBus } from "../core/state_manager.js";

export class InputSystem {
  constructor() {
    // Wir verwenden den global exportierten EventBus
    this.eventBus = eventBus;
  }

  init() {
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  handleKeyDown(event) {
    // Verhindert Standard-Browser-Aktionen für diese Tasten
    const key = event.key.toLowerCase();
    const hotkeys = ["i", "m", "c"];

    if (hotkeys.includes(key)) {
      event.preventDefault();
    }

    switch (key) {
      case "i":
        this.eventBus.publish("input:toggleInventory");
        break;
      case "m":
        this.eventBus.publish("input:toggleMap");
        break;
      case "c":
        this.eventBus.publish("input:toggleCharacter");
        break;
      case "escape":
        this.eventBus.publish("input:closeAllWindows");
        break;
    }
    switch (
      event.key // Hier event.key statt key, um F-Tasten zu erkennen
    ) {
      case "F2":
        event.preventDefault();
        this.eventBus.publish("game:save");
        break;
      case "F9":
        event.preventDefault();
        this.eventBus.publish("game:load");
        break;
    }
  }
}
