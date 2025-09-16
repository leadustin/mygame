/**
 * engine.js
 * * Haupt-Einstiegspunkt des Spiels.
 * Initialisiert alle Kernsysteme, lädt die Spieldaten und startet die Haupt-Game-Loop.
 */
import StateManager from './state_manager.js';
import EventBus from './event_bus.js';
import { RenderSystem } from '../systems/render.js';
import { InputSystem } from '../systems/input.js';

// Daten importieren
import { CLASSES } from '../../game/characters/classes.js';
import { WEAPONS } from '../../data/items/weapons.js';
import { COMMON_MONSTERS } from '../../data/monsters/common.js';
import { TOWNS } from '../../data/locations/towns.js';

class GameEngine {
    constructor() {
        this.stateManager = new StateManager();
        this.eventBus = new EventBus();
        this.renderSystem = new RenderSystem();
        this.inputSystem = new InputSystem(this.eventBus);
        
        this.lastTime = 0;
        this.gameLoop = this.gameLoop.bind(this);
    }

    /**
     * Initialisiert die Engine und das Spiel.
     */
    init() {
        console.log("Engine initialisiert...");

        // Registriert Systeme beim EventBus, damit sie auf Events hören können
        this.eventBus.subscribe('state:updated', (state) => this.renderSystem.render(state));
        
        // Initialen Spielzustand setzen (Dummy-Daten für den Start)
        this.setupInitialState();
        
        // Input-Handler initialisieren
        this.inputSystem.init();

        // Spiel-Loop starten
        requestAnimationFrame(this.gameLoop);
    }

    /**
     * Setzt den anfänglichen Zustand des Spiels auf.
     * Normalerweise würde hier ein Charaktererstellungs- oder Ladebildschirm kommen.
     * Wir erstellen hier direkt einen Dummy-Spieler, um schnell starten zu können.
     */
    setupInitialState() {
        const player = {
            id: 'player',
            name: 'Held',
            class: CLASSES.WARRIOR.name,
            level: 1,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            stats: {
                strength: 15,
                dexterity: 12,
                intelligence: 8,
            },
            inventory: [WEAPONS.RUSTY_SWORD],
            equipment: {
                weapon: WEAPONS.RUSTY_SWORD,
            },
        };

        const initialGameState = {
            player: player,
            party: [player],
            currentLocation: TOWNS.STARTING_TOWN,
            activeWindows: [], // Keine Fenster sind zu Beginn offen
            currentView: 'map', // 'map', 'combat', 'inventory', etc.
            log: ['Willkommen in der Welt!'],
            combat: null, // Kein Kampf aktiv zu Beginn
        };

        this.stateManager.setState(initialGameState);
        console.log("Initialer Spielzustand gesetzt:", this.stateManager.getState());
    }

    /**
     * Die Haupt-Game-Loop.
     * @param {number} timestamp - Der aktuelle Zeitstempel vom Browser.
     */
    gameLoop(timestamp) {
        const deltaTime = (timestamp - this.lastTime) / 1000;
        this.lastTime = timestamp;

        // 1. Update-Logik (z.B. KI, Animationen, Zeit)
        // update(deltaTime);

        // 2. Rendern (wird jetzt ereignisbasiert durch state:updated ausgelöst)
        // this.renderSystem.render(this.stateManager.getState());

        requestAnimationFrame(this.gameLoop);
    }
}

// Sobald das DOM geladen ist, wird die Engine instanziiert und gestartet.
window.addEventListener('DOMContentLoaded', () => {
    const engine = new GameEngine();
    // Machen Sie die Engine global zugänglich für Debugging-Zwecke (optional)
    window.gameEngine = engine; 
    engine.init();
});