import { TitleScreenRenderer } from './renderers/title-screen-renderer.js';
import { CharacterCreationRenderer } from './renderers/character-creation-renderer.js';
import { GameOverRenderer } from './renderers/game-over-renderer.js';
import { CombatRenderer } from './renderers/combat-renderer.js';
import { PostCombatLootRenderer } from './renderers/post-combat-loot-renderer.js';
import { MapRenderer } from './renderers/map-renderer.js';
import { LocationRenderer } from './renderers/location-renderer.js';
import { HudRenderer } from './renderers/hud-renderer.js';
import { WindowManager } from './window-manager.js';
import { ModalManager } from './modal-manager.js';
import { NotificationManager } from './notification-manager.js'; // NEU

export class ViewManager {
    constructor() {
        this.mainView = document.getElementById('main-view');
        this.hudContainer = document.getElementById('hud-container');
        this.gameContainer = document.getElementById('game-container');
        
        this.renderers = {
            'title_screen': new TitleScreenRenderer(this.mainView),
            'character_creation': new CharacterCreationRenderer(this.mainView),
            'game_over': new GameOverRenderer(this.mainView),
            'combat': new CombatRenderer(this.mainView),
            'post_combat_loot': new PostCombatLootRenderer(this.mainView),
            'map': new MapRenderer(this.mainView),
            'location': new LocationRenderer(this.mainView),
        };
        
        // Manager für die globalen UI-Elemente
        this.hudRenderer = new HudRenderer(this.hudContainer);
        this.windowManager = new WindowManager(this.gameContainer);
        this.modalManager = new ModalManager();
        this.notificationManager = new NotificationManager(); // NEU
    }

    render(state) {
        // 1. Rendere die Hauptansicht
        const viewRenderer = this.renderers[state.currentView];
        if (viewRenderer) {
            viewRenderer.render(state);
        } else {
            console.error(`Kein Renderer für die Ansicht "${state.currentView}" gefunden.`);
            this.mainView.innerHTML = `<h2>Unbekannte Ansicht: ${state.currentView}</h2>`;
        }

        // 2. Rendere alle globalen UI-Manager, die über der Hauptansicht liegen
        this.hudRenderer.render(state);
        this.windowManager.render(state);
        this.modalManager.render(state);
        this.notificationManager.render(state);
    }
}