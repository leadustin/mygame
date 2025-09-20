import StateManager, { eventBus } from "./state-manager.js";
import { ViewManager } from "../../game/ui/view-manager.js";
import { CharacterSystem } from "../../game/characters/characters.js";
import { MovementSystem } from "../gameplay/movement-system.js";
import { CombatSystem } from "../gameplay/combat-system.js";
import { SaveSystem } from "../systems/save.js";
import { createCharacter } from "../../game/characters/character-creation.js"; // KORRIGIERT
import { InventorySystem } from "../../game/systems/inventory.js";
import { TooltipManager } from "../../game/ui/tooltip-manager.js";
import { WorldInteractionSystem } from "../gameplay/world-interaction-system.js";
import { TradingSystem } from "../gameplay/trading-system.js";
import { MapRenderer as OldMapRenderer } from "../systems/map-renderer.js";

export class GameEngine {
  constructor() {
    this.stateManager = new StateManager();
    this.viewManager = new ViewManager();
    this.characterSystem = new CharacterSystem();
    this.movementSystem = new MovementSystem();
    this.combatSystem = new CombatSystem();
    this.inventorySystem = new InventorySystem();
    this.tooltipManager = new TooltipManager();
    this.worldInteractionSystem = new WorldInteractionSystem();
    this.tradingSystem = new TradingSystem();
    this.mapRenderer = new OldMapRenderer();

    window.gameEngine = this;
  }

  init() {
    console.log("Engine initialisiert.");
    this.subscribeToEvents();

    this.stateManager.setState({
      currentView: "title_screen",
      player: null,
      activeWindows: [],
      log: ["Spiel gestartet."],
      activeDialogue: null,
      pendingInteraction: null,
      activeTradeSession: null,
    });
  }

  subscribeToEvents() {
    eventBus.subscribe("state:updated", (state) =>
      this.viewManager.render(state)
    );

    // UI Events
    eventBus.subscribe("ui:newGame", () =>
      this.stateManager.updateState("currentView", "character_creation")
    );
    eventBus.subscribe("ui:startGame", (characterData) =>
      this.startGame(characterData)
    );
    eventBus.subscribe("ui:toggleCharacter", () =>
      this.toggleWindow("character")
    );
    eventBus.subscribe("ui:toggleInventory", () =>
      this.toggleWindow("inventory")
    );
    eventBus.subscribe("ui:closeWindow", (windowName) =>
      this.closeWindow(windowName)
    );
    eventBus.subscribe("ui:exitLocation", () => {
      this.stateManager.updateState("currentView", "map");
    });
    eventBus.subscribe("ui:show_dialogue", (npcData) =>
      this.showDialogue(npcData)
    );
    eventBus.subscribe("ui:close_dialogue", () => this.closeDialogue());
    eventBus.subscribe("ui:start_trade", (merchantData) =>
      this.tradingSystem.startTrade(merchantData)
    );
    eventBus.subscribe("ui:close_trade", () => this.tradingSystem.endTrade());

    // Game Events
    eventBus.subscribe("game:save", () => this.saveGame());
    eventBus.subscribe("game:load", () => this.loadGame());
    eventBus.subscribe("game:startCombat", () =>
      this.combatSystem.startCombat()
    );

    // Character Events
    eventBus.subscribe("character:confirm_stats", (data) =>
      this.characterSystem.confirmStats(data)
    );

    // Movement Events
    eventBus.subscribe("player:move", (direction) =>
      this.movementSystem.movePlayer(direction)
    );
    eventBus.subscribe("player:enter_location", (location) =>
      this.worldInteractionSystem.tryEnterLocation(location)
    );
    eventBus.subscribe("ui:confirm_enter_location", (location) =>
      this.worldInteractionSystem.confirmEnterLocation(location)
    );
    eventBus.subscribe("ui:cancel_enter_location", () =>
      this.worldInteractionSystem.cancelEnterLocation()
    );

    // Combat Events
    eventBus.subscribe("combat:action", (action) => {
      // 1. Hole den aktuellen Zustand
      const currentState = this.stateManager.getState();

      // 2. Führe die Kampfaktion aus und erhalte das Ergebnis
      const result = this.combatSystem.performAction(currentState, action);

      // 3. Aktualisiere den Spielzustand mit dem Ergebnis
      if (result && result.updatedState) {
        this.stateManager.setState(result.updatedState);

        // 4. Füge die neuen Log-Einträge hinzu
        if (result.log && result.log.length > 0) {
          result.log.forEach((message) => {
            this.stateManager.addLog(message);
          });
        }
      }
    });

    // Loot Events
    eventBus.subscribe("loot:take_all", () =>
      this.inventorySystem.takeAllLoot()
    );
    eventBus.subscribe("loot:take_selected", (ids) =>
      this.inventorySystem.takeSelectedLoot(ids)
    );
    eventBus.subscribe("loot:dismantle", (ids) =>
      this.inventorySystem.dismantleLoot(ids)
    );
    eventBus.subscribe("loot:close", () => this.inventorySystem.closeLoot());

    // Inventory Events
    eventBus.subscribe("inventory:itemMoved", (moveData) =>
      this.inventorySystem.handleItemMove(moveData)
    );
  }

  startGame(characterData) {
    const player = createCharacter(characterData);
    const currentState = this.stateManager.getState(); // Hole den aktuellen Zustand

    this.stateManager.setState({
      ...currentState, // Behalte alle alten Werte!
      player: player,
      currentView: "map",
      log: [...(currentState.log || []), `Willkommen, ${player.name}!`],
    });
  }

  toggleWindow(windowName) {
    // Mache den Code sicherer, falls activeWindows mal nicht existiert
    const currentWindows = this.stateManager.getState().activeWindows || [];
    const activeWindows = [...currentWindows];
    const index = activeWindows.indexOf(windowName);

    if (index > -1) {
      activeWindows.splice(index, 1);
    } else {
      activeWindows.push(windowName);
    }
    this.stateManager.updateState("activeWindows", activeWindows);
  }

  closeWindow(windowName) {
    const currentWindows = this.stateManager.getState().activeWindows || [];
    const activeWindows = currentWindows.filter((w) => w !== windowName);
    this.stateManager.updateState("activeWindows", activeWindows);
  }

  saveGame() {
    const state = this.stateManager.getState();
    if (state.player) {
      SaveSystem.saveGame(state);
      this.stateManager.addLog("Spiel gespeichert.");
    } else {
      this.stateManager.addLog("Kein Spielstand zum Speichern vorhanden.");
    }
  }

  loadGame() {
    const loadedState = SaveSystem.loadGame();
    if (loadedState) {
      this.stateManager.setState(loadedState);
      this.stateManager.addLog("Spiel geladen.");
    } else {
      this.stateManager.addLog("Kein gespeichertes Spiel gefunden.");
    }
  }

  showDialogue(npcData) {
    const dialogue = {
      speaker: npcData.name,
      text: npcData.dialogue,
      isMerchant: npcData.isMerchant || false,
      npcData: npcData,
    };
    this.stateManager.updateState({ activeDialogue: dialogue });
  }

  closeDialogue() {
    this.stateManager.updateState({ activeDialogue: null });
  }
}

const gameEngine = new GameEngine();
gameEngine.init();
