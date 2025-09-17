/**
 * engine.js
 * * Haupt-Einstiegspunkt des Spiels.
 */
import StateManager from './state_manager.js';
import { eventBus } from './state_manager.js';
import { RenderSystem } from '../systems/render.js';
import { InputSystem } from '../systems/input.js';
import { UIManager } from '../../game/ui/menu.js';
import { CharacterCreator } from '../../game/characters/character_creation.js';
import { CombatSystem } from '../gameplay/combat_system.js';
import { InventorySystem } from '../../game/systems/inventory/inventory.js';
import { SaveSystem } from '../systems/save.js';

// Daten importieren
import { TOWNS } from '../../data/locations/towns.js';
import { DUNGEONS } from '../../data/locations/dungeons.js';
import { CLASSES } from '../../game/characters/classes.js';


class GameEngine {
    constructor() {
        this.stateManager = new StateManager();
        this.renderSystem = new RenderSystem();
        this.inputSystem = new InputSystem();
        this.uiManager = new UIManager(this.stateManager);
        this.combatSystem = new CombatSystem();
        
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        console.log("Engine initialisiert...");

        // Alle globalen Events abonnieren
        eventBus.subscribe('state:updated', (state) => this.renderSystem.render(state));
        eventBus.subscribe('ui:startGame', (characterData) => this.startGame(characterData));
        eventBus.subscribe('game:startCombat', () => this.startCombat());
        eventBus.subscribe('combat:action', (action) => this.handleCombatAction(action));
        eventBus.subscribe('inventory:use', (item) => this.useItem(item));
        eventBus.subscribe('inventory:equip', (item) => this.equipItem(item));
        eventBus.subscribe('game:save', () => this.saveGame());
        eventBus.subscribe('game:load', () => this.loadGame());
        
        // Startlogik: Lade Spielstand oder starte neu
        if (SaveSystem.saveExists()) {
            this.loadGame();
        } else {
            this.setupInitialState();
        }
        
        this.inputSystem.init();
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Setzt den anfänglichen Zustand auf den Charaktererstellungs-Bildschirm.
     */
    setupInitialState() {
        const initialGameState = {
            currentView: 'character_creation',
            creationData: { availableClasses: CLASSES },
            player: null,
            party: [],
            log: ['Bitte erstelle deinen Charakter.'],
        };
        this.stateManager.setState(initialGameState);
    }

    /**
     * Wird aufgerufen, nachdem der Spieler seinen Charakter erstellt hat.
     */
    startGame(characterData) {
        const player = CharacterCreator.createCharacter(characterData);

        const newGameState = {
            ...this.stateManager.getState(),
            currentView: 'map',
            player: player,
            party: [player],
            currentLocation: TOWNS.STARTING_TOWN,
            activeWindows: [],
            log: [`Willkommen, ${player.name}! Dein Abenteuer beginnt.`],
        };

        this.stateManager.setState(newGameState);
        console.log("Spiel gestartet mit Spieler:", player);
    }

    /**
     * Startet einen neuen Kampf.
     */
    startCombat() {
        const dungeon = DUNGEONS.GOBLIN_CAVE;
        const monsterData = dungeon.monsters[Math.floor(Math.random() * dungeon.monsters.length)];
        const monster = JSON.parse(JSON.stringify(monsterData));

        const state = this.stateManager.getState();
        const newState = {
            ...state,
            currentView: 'combat',
            combat: {
                monster: monster,
                turn: 'player',
            },
            log: [...state.log, `Ein wilder ${monster.name} erscheint!`],
        };
        this.stateManager.setState(newState);
    }

    /**
     * Verarbeitet eine Aktion im Kampf.
     */
    handleCombatAction(action) {
        const currentState = this.stateManager.getState();
        const { updatedState, log } = this.combatSystem.performAction(currentState, action);
        
        updatedState.log = [...currentState.log, ...log];
        this.stateManager.setState(updatedState);
    }
    
    /**
     * Benutzt einen Gegenstand aus dem Inventar.
     */
    useItem(item) {
        const state = this.stateManager.getState();
        const { player, log } = InventorySystem.useItem(state.player, item);
        const newState = { ...state, player, log: [...state.log, log] };
        this.stateManager.setState(newState);
    }

    /**
     * Rüstet einen Gegenstand aus.
     */
    equipItem(item) {
        const state = this.stateManager.getState();
        const { player, log } = InventorySystem.equipItem(state.player, item);
        const newState = { ...state, player, log: [...state.log, log] };
        this.stateManager.setState(newState);
    }

    /**
     * Speichert das aktuelle Spiel.
     */
    saveGame() {
        const state = this.stateManager.getState();
        if (SaveSystem.saveGame(state)) {
            const newLog = [...state.log, "Spiel gespeichert."];
            this.stateManager.updateState('log', newLog);
        }
    }

    /**
     * Lädt das Spiel.
     */
    loadGame() {
        const loadedState = SaveSystem.loadGame();
        if (loadedState) {
            this.stateManager.setState(loadedState);
            const newLog = [...loadedState.log, "Spiel geladen."];
            this.stateManager.updateState('log', newLog);
        }
    }

    gameLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;
        requestAnimationFrame(this.gameLoop);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    const engine = new GameEngine();
    window.gameEngine = engine; 
    engine.init();
});