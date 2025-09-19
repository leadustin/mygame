import StateManager from "./state_manager.js";
import { eventBus } from "./state_manager.js";
import { RenderSystem } from "../systems/render.js";
import { UIManager } from "../../game/ui/menu.js";
import { CharacterCreator } from "../../game/characters/character_creation.js";
import { CombatSystem } from "../gameplay/combat_system.js";
import { InventorySystem } from "../../game/systems/inventory/inventory.js";
import { SaveSystem } from "../systems/save.js";
import { TooltipSystem } from "../../game/ui/tooltips.js";
import { MapRenderer } from "../systems/map_renderer.js";
import { CharacterSystem } from "../../game/characters/characters.js";
import { MovementSystem } from "../gameplay/movement_system.js";
import { WorldInteractionSystem } from "../gameplay/world_interaction_system.js";
import { MATERIALS } from "../../data/items/materials.js";
import { TOWNS } from "../../data/locations/towns.js";
import { DUNGEONS } from "../../data/locations/dungeons.js";
import { CLASSES } from "../../game/characters/classes.js";
import { TradingSystem } from "../gameplay/trading_system.js";

class GameEngine {
  constructor() {
    this.stateManager = new StateManager();
    this.renderSystem = new RenderSystem();
    this.uiManager = new UIManager(this.stateManager);
    this.combatSystem = new CombatSystem();
    this.tooltipSystem = new TooltipSystem();
    this.mapRenderer = new MapRenderer();
    this.movementSystem = new MovementSystem();
    this.worldInteractionSystem = new WorldInteractionSystem();

    this.lastTime = 0;
    this.gameLoop = this.gameLoop.bind(this);
  }

  init() {
    console.log("Engine initialisiert...");

    eventBus.subscribe("state:updated", (state) =>
      this.renderSystem.render(state)
    );
    eventBus.subscribe("ui:startGame", (characterData) =>
      this.startGame(characterData)
    );
    eventBus.subscribe("game:startCombat", (locationId) =>
      this.startCombat(locationId)
    );
    eventBus.subscribe("combat:action", (action) =>
      this.handleCombatAction(action)
    );
    eventBus.subscribe("inventory:itemMoved", (data) =>
      this.handleItemMoved(data)
    );
    eventBus.subscribe("game:save", () => this.saveGame());
    eventBus.subscribe("game:load", () => this.loadGame());
    eventBus.subscribe("ui:newGame", () => this.setupInitialState());
    eventBus.subscribe("ui:closeWindow", (name) =>
      this.handleCloseWindow(name)
    );
    eventBus.subscribe("loot:take_selected", (ids) =>
      this.handleTakeSelected(ids)
    );
    eventBus.subscribe("loot:take_all", () => this.handleTakeAll());
    eventBus.subscribe("loot:dismantle", (ids) => this.handleDismantle(ids));
    eventBus.subscribe("loot:close", () => this.handleCloseLoot());
    eventBus.subscribe("character:confirm_stats", (data) =>
      this.handleConfirmStats(data)
    );
    eventBus.subscribe("player:moveTo", (pos) => this.handlePlayerMove(pos));
    eventBus.subscribe("player:stopMove", () => this.handlePlayerStopMove());
    eventBus.subscribe("ui:exitLocation", () => this.handleExitLocation());
    eventBus.subscribe("ui:show_location_prompt", (locationData) =>
      this.showLocationPrompt(locationData)
    );
    eventBus.subscribe("ui:confirm_enter_location", (locationData) =>
      this.enterLocation(locationData)
    );
    eventBus.subscribe("ui:cancel_enter_location", () =>
      this.cancelEnterLocation()
    );
    eventBus.subscribe("ui:show_dialogue", (npcData) =>
      this.showDialogue(npcData)
    );
    eventBus.subscribe("ui:close_dialogue", () => this.closeDialogue());
    eventBus.subscribe("ui:start_trade", (npcData) => this.startTrade(npcData));
    eventBus.subscribe("ui:close_trade", () => this.closeTrade());
    eventBus.subscribe("trade:buy", (item) => this.handleBuy(item));
    eventBus.subscribe("trade:sell", (data) => this.handleSell(data));
    eventBus.subscribe("trade:buy_back", (item) => this.handleBuyBack(item));

    this.showTitleScreen();

    this.uiManager.initEventListeners();
    this.tooltipSystem.init();
    requestAnimationFrame(this.gameLoop);
  }

  handlePlayerMove(position) {
    this.movementSystem.setTarget(position);
  }

  handlePlayerStopMove() {
    this.movementSystem.setTarget(null);
  }

  gameLoop(timestamp) {
    const deltaTime = (timestamp - this.lastTime) / 1000 || 0;
    this.lastTime = timestamp;

    const state = this.stateManager.getLiveState();

    if (state.currentView === "map" && state.player) {
      this.movementSystem.update(state.player, deltaTime);
      this.worldInteractionSystem.update(state.player);

      if (this.movementSystem.hasTarget()) {
        this.mapRenderer.centerOnPlayer();
      }

      this.mapRenderer.draw();
    }

    requestAnimationFrame(this.gameLoop);
  }

  // NEUE FUNKTION: Zeigt das Fenster an und pausiert die Bewegung
  showLocationPrompt(locationData) {
    this.handlePlayerStopMove();
    const state = this.stateManager.getState();
    const newState = {
      ...state,
      // Wir merken uns die anstehende Interaktion im State
      pendingInteraction: {
        type: "enter_location",
        location: locationData,
      },
    };
    this.stateManager.setState(newState);
  }

  // NEUE FUNKTION: Betritt den Ort, wenn der Spieler zustimmt
  enterLocation(locationData) {
    const state = this.stateManager.getState();
    let player = state.player;

    // Ort als "entdeckt" markieren
    if (!player.discoveredLocations.includes(locationData.id)) {
      player.discoveredLocations.push(locationData.id);
    }

    const targetId = locationData.targetLocationId || locationData.id;

    if (locationData.type === "dungeon_entrance") {
      this.startCombat(targetId);
    } else if (locationData.type === "town") {
      // Finde den vollständigen Datensatz der Stadt in TOWNS
      const townKey = Object.keys(TOWNS).find(
        (key) => TOWNS[key].id === targetId
      );
      const fullTownData = townKey ? TOWNS[townKey] : null;

      if (fullTownData) {
        // Jetzt haben wir das Objekt MIT der Eigenschaft 'mapImage'
        const newState = {
          ...state,
          currentView: "location",
          currentLocation: fullTownData, // Wir speichern das vollständige Objekt
          pendingInteraction: null,
          player: player,
          log: [...state.log, `Willkommen in ${fullTownData.name}.`],
        };
        this.stateManager.setState(newState);
      } else {
        console.error(
          `Stadt mit der ID ${targetId} wurde nicht in towns.js gefunden.`
        );
        this.cancelEnterLocation(); // Fallback, um einen Absturz zu verhindern
      }
    }
  }

  // NEUE FUNKTION: Schließt das Fenster, wenn der Spieler ablehnt
  cancelEnterLocation() {
    const state = this.stateManager.getState();
    const newState = {
      ...state,
      pendingInteraction: null, // Fenster-Info aus State entfernen
    };
    this.stateManager.setState(newState);
  }

  handleLocationEntered(locationData) {
    this.handlePlayerStopMove();

    const allLocations = { ...DUNGEONS, ...TOWNS };
    const locationKey = Object.keys(allLocations).find(
      (key) =>
        allLocations[key].id ===
        (locationData.targetLocationId || locationData.id)
    );

    if (locationKey) {
      const location = allLocations[locationKey];

      if (location.type === "dungeon") {
        this.startCombat(location.id);
      }
      // NEU: Logik für das Betreten einer Stadt
      else if (location.type === "town") {
        const state = this.stateManager.getState();
        const newState = {
          ...state,
          currentView: "location", // Ansicht wechseln
          currentLocation: location, // Aktuellen Ort speichern
          log: [...state.log, `Willkommen in ${location.name}.`],
        };
        this.stateManager.setState(newState);
      }
    } else {
      console.warn(
        `Ort mit ID ${
          locationData.targetLocationId || locationData.id
        } nicht gefunden.`
      );
    }
  }

  showDialogue(npcData) {
    this.stateManager.updateState("activeDialogue", {
      speaker: npcData.name,
      text: npcData.dialogue,
      isMerchant: npcData.isMerchant || false,
      npcData: npcData, // Wir geben die kompletten NPC-Daten weiter
    });
  }

  closeDialogue() {
    this.stateManager.updateState("activeDialogue", null);
  }

  startTrade(npcData) {
    this.stateManager.setState({
      ...this.stateManager.getState(),
      activeDialogue: null,
      activeTradeSession: {
        merchant: npcData,
      },
    });
  }

  closeTrade() {
    this.stateManager.updateState("activeTradeSession", null);
  }

  handleBuy(item) {
    const state = this.stateManager.getState();
    const result = TradingSystem.playerBuysItem(
      state.player,
      state.activeTradeSession.merchant,
      item
    );
    if (result.success) {
      this.stateManager.setState({
        ...state,
        player: result.player,
        activeTradeSession: { merchant: result.merchant },
      });
    }
  }

  handleSell(data) {
    const state = this.stateManager.getState();
    const result = TradingSystem.playerSellsItem(
      state.player,
      state.activeTradeSession.merchant,
      data.item,
      data.index
    );
    if (result.success) {
      this.stateManager.setState({
        ...state,
        player: result.player,
        activeTradeSession: { merchant: result.merchant },
      });
    }
  }

  handleBuyBack(item) {
    const state = this.stateManager.getState();
    const result = TradingSystem.playerBuysBackItem(
      state.player,
      state.activeTradeSession.merchant,
      item
    );
    if (result.success) {
      this.stateManager.setState({
        ...state,
        player: result.player,
        activeTradeSession: { merchant: result.merchant },
      });
    }
  }

  handleExitLocation() {
    const state = this.stateManager.getState();
    const newState = {
      ...state,
      currentView: "map", // Ansicht zurück zur Weltkarte
      currentLocation: null, // Aktuellen Ort zurücksetzen
      log: [...state.log, `Du verlässt ${state.currentLocation.name}.`],
    };
    this.stateManager.setState(newState);
  }

  handleConfirmStats(data) {
    const state = this.stateManager.getState();
    let player = state.player;
    player.stats = data.newStats;
    player.unspentStatPoints = data.remainingPoints;
    player.maxHp = player.stats.vitality * 10;
    player.maxMp = player.stats.intelligence * 10;
    player.hp = Math.min(player.hp, player.maxHp);
    player.mp = Math.min(player.mp, player.maxMp);
    this.stateManager.updateState("player", player);
  }

  handleCloseWindow(windowName) {
    this.uiManager.closeWindow(windowName);
  }

  handleTakeSelected(selectedIds) {
    const state = this.stateManager.getLiveState();
    if (!state.postCombatState) return;
    const takenItems = [];
    const remainingLoot = state.postCombatState.loot.filter((item) => {
      if (selectedIds.includes(item.lootId)) {
        takenItems.push(item);
        return false;
      }
      return true;
    });
    state.player.inventory.push(...takenItems);
    state.postCombatState.loot = remainingLoot;
    this.stateManager.setState({ ...state });
  }

  handleTakeAll() {
    const state = this.stateManager.getLiveState();
    if (!state.postCombatState) return;
    state.player.inventory.push(...state.postCombatState.loot);
    state.postCombatState.loot = [];
    this.stateManager.setState({ ...state });
  }

  handleDismantle(selectedIds) {
    const state = this.stateManager.getLiveState();
    if (!state.postCombatState) return;
    const receivedMaterials = {};
    const remainingLoot = state.postCombatState.loot.filter((item) => {
      if (selectedIds.includes(item.lootId) && item.dismantleYields) {
        for (const matId in item.dismantleYields) {
          const yieldData = item.dismantleYields[matId];
          if (Math.random() < yieldData.chance) {
            receivedMaterials[matId] =
              (receivedMaterials[matId] || 0) + yieldData.quantity[0];
          }
        }
        return false;
      }
      return true;
    });
    for (const matId in receivedMaterials) {
      const materialTemplate = Object.values(MATERIALS).find(
        (m) => m.id === matId
      );
      if (materialTemplate) {
        state.player.inventory.push({
          ...materialTemplate,
          quantity: receivedMaterials[matId],
        });
      }
    }
    state.postCombatState.loot = remainingLoot;
    this.stateManager.setState({ ...state });
  }

  handleCloseLoot() {
    const state = this.stateManager.getLiveState();
    if (!state.postCombatState) return;
    let player = state.player;
    player.xp += state.postCombatState.xpGained;
    player.gold += state.postCombatState.goldGained;
    const levelUpResult = CharacterSystem.checkForLevelUp(player);
    const finalState = {
      ...state,
      currentView: "map",
      log: [...state.postCombatState.originalLog, ...levelUpResult.log],
      postCombatState: null,
    };
    this.stateManager.setState(finalState);
  }

  showTitleScreen() {
    this.stateManager.setState({ currentView: "title_screen", log: [] });
  }

  setupInitialState() {
    const initialGameState = {
      currentView: "character_creation",
      creationData: { availableClasses: CLASSES },
      player: null,
      party: [],
      log: ["Bitte erstelle deinen Charakter."],
    };
    this.stateManager.setState(initialGameState);
  }

  startGame(characterData) {
    const player = CharacterCreator.createCharacter(characterData);
    const newGameState = {
      currentView: "map",
      player: player,
      party: [player],
      currentLocation: TOWNS.STARTING_TOWN,
      activeWindows: [],
      log: [`Willkommen, ${player.name}! Dein Abenteuer beginnt.`],
    };
    this.stateManager.setState(newGameState);
  }

  startCombat(locationId) {
    const allLocations = { ...DUNGEONS, ...TOWNS };
    const locationKey = Object.keys(allLocations).find(
      (key) => allLocations[key].id === locationId
    );
    if (!locationKey || !allLocations[locationKey].monsters) return;

    const location = allLocations[locationKey];
    const monsterData =
      location.monsters[Math.floor(Math.random() * location.monsters.length)];
    const monster = JSON.parse(JSON.stringify(monsterData));
    const state = this.stateManager.getState();
    const newState = {
      ...state,
      currentView: "combat",
      combat: { monster: monster, turn: "player" },
      log: [...state.log, `Ein wilder ${monster.name} erscheint!`],
    };
    this.stateManager.setState(newState);
  }

  handleCombatAction(action) {
    const currentState = this.stateManager.getLiveState();
    const { updatedState, log } = this.combatSystem.performAction(
      currentState,
      action
    );
    this.stateManager.setState({
      ...updatedState,
      log: [...currentState.log, ...log],
    });
  }

  handleItemMoved(data) {
    const state = this.stateManager.getLiveState();
    const { player } = InventorySystem.handleItemMove(
      state.player,
      data.source,
      data.target
    );
    this.stateManager.updateState("player", player);
  }

  saveGame() {
    const state = this.stateManager.getState();
    if (SaveSystem.saveGame(state)) {
      const newLog = [...state.log, "Spiel gespeichert."];
      this.stateManager.updateState("log", newLog);
    }
  }

  loadGame() {
    const loadedState = SaveSystem.loadGame();
    if (loadedState) {
      if (loadedState.player && !loadedState.player.mapPosition) {
        loadedState.player.mapPosition = { x: 2048, y: 1536 };
      }
      this.stateManager.setState(loadedState);
      const newLog = [...loadedState.log, "Spiel geladen."];
      this.stateManager.updateState("log", newLog);
    }
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const engine = new GameEngine();
  window.gameEngine = engine;
  engine.init();
});
