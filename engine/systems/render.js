/**
 * render.js
 * * Verantwortlich für das Darstellen des Spielzustands im DOM. (Korrigierte Version)
 */
import { eventBus } from '../core/state_manager.js';
import { Draggable } from '../ui_helpers/draggable.js';
import { SaveSystem } from './save.js';
import { RACES } from '../../game/characters/races.js';
import { CLASSES } from '../../game/characters/classes.js';
import { WEAPONS } from '../../data/items/weapons.js';
import { ARMOR } from '../../data/items/armor.js';
import { POTIONS } from '../../data/items/potions.js';

const ALL_ITEMS = { ...WEAPONS, ...ARMOR, ...POTIONS };

export class RenderSystem {
    constructor() {
        this.mainView = document.getElementById('main-view');
        this.hudContainer = document.getElementById('hud-container');
        this.gameContainer = document.getElementById('game-container');
    }

    render(state) {
        this.mainView.innerHTML = ''; 

        switch (state.currentView) {
            case 'title_screen':
                this.renderTitleScreenView();
                break;
            case 'character_creation':
                this.renderCharacterCreationView(state);
                break;
            case 'map':
                this.renderMapView(state);
                break;
            case 'combat':
                this.renderCombatView(state);
                break;
            case 'game_over':
                this.renderGameOverView();
                break;
            default:
                this.mainView.innerHTML = `<h2>Unbekannte Ansicht: ${state.currentView}</h2>`;
        }

        if (state.currentView === 'map' || state.currentView === 'combat') {
            this.renderHud();
            this.renderActiveWindows(state, this.gameContainer);
        } else {
            this.hudContainer.innerHTML = '';
        }

        if (state.currentView !== 'title_screen' && state.log) {
            this.renderLog(state.log);
        }
    }
    
    renderHud() {
        if (this.hudContainer.innerHTML !== '') return;
        this.hudContainer.innerHTML = `
            <button class="hud-button" data-action="toggleCharacter">Charakter</button>
            <button class="hud-button" data-action="toggleInventory">Inventar</button>
            <button class="hud-button" data-action="toggleMap">Karte</button>
            <button class="hud-button" data-action="save">Speichern</button>
        `;
        this.hudContainer.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (!action) return;
            switch(action) {
                case 'toggleCharacter': eventBus.publish('ui:toggleCharacter'); break;
                case 'toggleInventory': eventBus.publish('ui:toggleInventory'); break;
                case 'toggleMap': eventBus.publish('ui:toggleMap'); break;
                case 'save': eventBus.publish('game:save'); break;
            }
        });
    }

    renderTitleScreenView() {
        const saveExists = SaveSystem.saveExists();
        this.mainView.innerHTML = `
            <div id="title-screen-container">
                <h1>Mein RPG</h1>
                <div id="title-menu">
                    <button id="new-game-btn">Neues Spiel</button>
                    <button id="load-game-btn" ${!saveExists ? 'disabled' : ''}>Spiel laden</button>
                    <button disabled>Optionen</button>
                </div>
            </div>
        `;
        document.getElementById('new-game-btn').addEventListener('click', () => eventBus.publish('ui:newGame'));
        if (saveExists) {
            document.getElementById('load-game-btn').addEventListener('click', () => eventBus.publish('game:load'));
        }
    }

    renderCharacterCreationView(state) {
        // Dies ist die vollständige, korrekte Wizard-Version
        let currentStep = 1;
        const creationData = {
            raceId: Object.keys(RACES)[0],
            classId: Object.keys(CLASSES)[0],
            gender: 'Männlich',
            name: ''
        };
        const steps = ['Rasse', 'Klasse', 'Personalisierung', 'Abschluss'];

        const renderWizard = () => {
            this.mainView.innerHTML = `
                <div id="cc-wizard-container">
                    <div id="cc-step-indicator"></div>
                    <div id="cc-content-panel"></div>
                    <div id="cc-nav-buttons"></div>
                </div>`;
            renderStepIndicator();
            renderContentPanel();
            renderNavButtons();
        };

        const renderStepIndicator = () => {
            const indicatorEl = this.mainView.querySelector('#cc-step-indicator');
            indicatorEl.innerHTML = steps.map((name, index) => 
                `<div class="step ${currentStep === index + 1 ? 'active' : ''}">${index + 1}. ${name}</div>`
            ).join('');
        };
        
        const renderNavButtons = () => {
            const navEl = this.mainView.querySelector('#cc-nav-buttons');
            const backBtn = `<button id="cc-back-btn" ${currentStep === 1 ? 'disabled' : ''}>Zurück</button>`;
            const nextBtnText = currentStep === steps.length ? 'Abenteuer beginnen' : 'Weiter';
            const nextBtn = `<button id="cc-next-btn">${nextBtnText}</button>`;
            navEl.innerHTML = backBtn + nextBtn;
            navEl.querySelector('#cc-back-btn').addEventListener('click', () => { currentStep--; renderWizard(); });
            navEl.querySelector('#cc-next-btn').addEventListener('click', handleNextClick);
        };
        
        const renderContentPanel = () => {
            const contentEl = this.mainView.querySelector('#cc-content-panel');
            switch(currentStep) {
                case 1: renderSelectionStep(contentEl, RACES, 'raceId'); break;
                case 2: renderSelectionStep(contentEl, CLASSES, 'classId'); break;
                case 3: renderPersonalizationStep(contentEl); break;
                case 4: renderFinalizationStep(contentEl); break;
            }
        };

        const renderSelectionStep = (container, data, selectionKey) => {
            container.innerHTML = `<div id="cc-selection-list"></div><div id="cc-details-panel"></div>`;
            const listEl = container.querySelector('#cc-selection-list');
            
            Object.entries(data).forEach(([key, value]) => {
                const btn = document.createElement('button');
                btn.className = `selection-button ${creationData[selectionKey] === key ? 'active' : ''}`;
                btn.dataset.id = key;
                btn.textContent = value.name;
                listEl.appendChild(btn);
            });

            listEl.addEventListener('click', (e) => {
                const btn = e.target.closest('.selection-button');
                if (btn) {
                    creationData[selectionKey] = btn.dataset.id;
                    renderSelectionStep(container, data, selectionKey);
                }
            });
            renderDetailsPanel(container.querySelector('#cc-details-panel'), data[creationData[selectionKey]]);
        };

        const renderDetailsPanel = (container, details) => {
            let statsHtml = '';
            if (details.baseStats) {
                for (const [stat, value] of Object.entries(details.baseStats)) {
                    statsHtml += `<div class="stat-line"><span>${stat}</span><span>${value}</span></div>`;
                }
            } else if (details.statModifiers) {
                for (const [stat, value] of Object.entries(details.statModifiers)) {
                    statsHtml += `<div class="stat-line"><span>${stat}</span><span>${value > 0 ? '+' : ''}${value}</span></div>`;
                }
            }
            
            let equipmentHtml = '';
            if (details.startEquipment) {
                const itemIcons = Object.values(details.startEquipment)
                    .map(itemId => {
                        const item = Object.values(ALL_ITEMS).find(i => i.id === itemId);
                        if (!item) return '';
                        return `<img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}">`;
                    })
                    .join('');
                equipmentHtml = `<h4>Startausrüstung</h4><div class="cc-item-icons">${itemIcons}</div>`;
            }

            container.innerHTML = `
                <div class="details-portrait"></div>
                <h2>${details.name}</h2>
                <p class="details-description">${details.description}</p>
                <h4>${details.baseStats ? 'Basisattribute' : 'Attributs-Boni'}</h4>
                ${statsHtml}
                ${equipmentHtml}
            `;
        };
        
        const renderPersonalizationStep = (container) => {
             container.innerHTML = `<div id="cc-finalization-panel"><h2>Personalisierung</h2><div class="cc-gender-selection"><button class="selection-button ${creationData.gender === 'Männlich' ? 'active' : ''}" data-gender="Männlich">Männlich</button><button class="selection-button ${creationData.gender === 'Weiblich' ? 'active' : ''}" data-gender="Weiblich">Weiblich</button></div></div>`;
            container.querySelector('.cc-gender-selection').addEventListener('click', (e) => {
                const btn = e.target.closest('.selection-button');
                if (btn) {
                    creationData.gender = btn.dataset.gender;
                    renderPersonalizationStep(container);
                }
            });
        };
        
        const renderFinalizationStep = (container) => {
            container.innerHTML = `<div id="cc-finalization-panel"><h2>Abschluss</h2><p>Gib deinem Charakter einen Namen.</p><input type="text" id="char-name" placeholder="Charaktername" value="${creationData.name}"></div>`;
        };
        
        const handleNextClick = () => {
            if (currentStep === 4) { // Letzter Schritt
                 creationData.name = this.mainView.querySelector('#char-name').value;
                if (!creationData.name.trim()) { alert('Bitte gib einen Namen ein.'); return; }
                eventBus.publish('ui:startGame', creationData);
            } else {
                 if (currentStep === 3) { // Namen zwischenspeichern, falls vorhanden
                    const nameInput = this.mainView.querySelector('#char-name');
                    if (nameInput) creationData.name = nameInput.value;
                }
                currentStep++;
                renderWizard();
            }
        };

        renderWizard();
    }
    
    renderMapView(state) {
        if (!state.currentLocation) return;
        this.mainView.innerHTML = `
            <div style="padding: 20px;">
                <h2>${state.currentLocation.name}</h2>
                <p>${state.currentLocation.description}</p>
                <button id="enter-dungeon-btn">Betrete die Goblin-Höhle</button>
            </div>
        `;
        document.getElementById('enter-dungeon-btn').addEventListener('click', () => eventBus.publish('game:startCombat'));
    }

    renderCombatView(state) {
        if (!state.combat || !state.player) return;
        this.mainView.innerHTML = `
             <div id="combat-screen" style="padding: 20px; text-align: center;">
                <div class="monster-area" style="margin-bottom: 40px;">
                    <h2>${state.combat.monster.name}</h2>
                    <p>HP: ${state.combat.monster.hp} / ${state.combat.monster.maxHp}</p>
                </div>
                <div class="player-area" style="margin-bottom: 40px;">
                    <h3>${state.player.name}</h3>
                    <p>HP: ${state.player.hp} / ${state.player.maxHp}</p>
                    <p>MP: ${state.player.mp} / ${state.player.maxMp}</p>
                </div>
                <div class="actions">
                    <button id="attack-btn">Angriff</button>
                    <button disabled>Zauber</button>
                    <button disabled>Item</button>
                </div>
            </div>`;
        document.getElementById('attack-btn').addEventListener('click', () => eventBus.publish('combat:action', { type: 'attack' }));
    }

    renderGameOverView() {
        this.mainView.innerHTML = `<h2 style="padding: 20px; color: red; text-align: center;">GAME OVER</h2>`;
    }

    renderActiveWindows(state, container) {
        container.querySelectorAll('.window').forEach(win => win.remove());

        if (!state.activeWindows || !state.player) return;
        state.activeWindows.forEach(windowName => {
            const windowEl = document.createElement('div');
            windowEl.className = 'window active';
            windowEl.id = `${windowName}-window`;

            if (windowName === 'character') this.renderCharacterWindow(windowEl, state.player);
            else if (windowName === 'inventory') this.renderInventoryWindow(windowEl, state.player);
            
            container.appendChild(windowEl);
        });
    }

    renderCharacterWindow(windowEl, player) {
        windowEl.style.left = '50px';
        windowEl.style.top = '50px';
        windowEl.style.width = '300px';

        let statsHtml = '';
        for (const [stat, value] of Object.entries(player.stats)) {
            statsHtml += `<div class="stat-line"><span>${stat.charAt(0).toUpperCase() + stat.slice(1)}</span><span>${value}</span></div>`;
        }
        
        let equipmentHtml = '';
        const slots = ['weapon', 'armor'];
        slots.forEach(slot => {
            const item = player.equipment[slot];
            const itemName = item ? item.name : 'Leer';
            equipmentHtml += `<div class="stat-line"><span>${slot.charAt(0).toUpperCase() + slot.slice(1)}</span><span>${itemName}</span></div>`;
        });

        windowEl.innerHTML = `
            <h3>${player.name}</h3>
            <p>Level ${player.level} ${player.class}</p>
            <p>${player.race}, ${player.gender}</p>
            <hr>
            <div class="stat-line"><span>HP</span><span>${player.hp} / ${player.maxHp}</span></div>
            <div class="stat-line"><span>MP</span><span>${player.mp} / ${player.maxMp}</span></div>
            <hr>
            <h4>Attribute</h4>
            ${statsHtml}
            <hr>
            <h4>Ausrüstung</h4>
            ${equipmentHtml}`;
    }

    renderInventoryWindow(windowEl, player) {
        windowEl.style.right = '50px';
        windowEl.style.top = '50px';
        windowEl.style.width = '600px';

        let slotsHtml = '';
        const inventorySize = 32;

        for (let i = 0; i < inventorySize; i++) {
            const item = player.inventory[i];
            if (item) {
                slotsHtml += `<div class="inventory-slot" data-item-index="${i}"><img src="${item.icon}" data-tooltip-id="${item.id}"></div>`;
            } else {
                slotsHtml += `<div class="inventory-slot"></div>`;
            }
        }

        windowEl.innerHTML = `<h3>Inventar</h3><div id="inventory-grid">${slotsHtml}</div>`;
        
        windowEl.querySelector('#inventory-grid').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const slot = e.target.closest('.inventory-slot');
            if (slot && slot.dataset.itemIndex) {
                const item = player.inventory[parseInt(slot.dataset.itemIndex)];
                if (item) this.showContextMenu(e.clientX, e.clientY, item);
            }
        });

        document.addEventListener('click', () => this.hideContextMenu(), { once: true });
    }

    showContextMenu(x, y, item) {
        this.hideContextMenu();
        const menu = document.createElement('div');
        menu.id = 'context-menu';
        document.body.appendChild(menu);

        let menuOptions = '';
        if (item.type === 'weapon' || item.type === 'armor') menuOptions += `<div class="context-menu-item" data-action="equip">Ausrüsten</div>`;
        if (item.type === 'potion') menuOptions += `<div class="context-menu-item" data-action="use">Benutzen</div>`;
        menu.innerHTML = menuOptions;
        
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        menu.style.display = 'block';

        menu.addEventListener('click', (e) => {
            const action = e.target.dataset.action;
            if (action === 'equip') eventBus.publish('inventory:equip', item);
            else if (action === 'use') eventBus.publish('inventory:use', item);
            this.hideContextMenu();
        });
    }

    hideContextMenu() {
        const menu = document.getElementById('context-menu');
        if (menu) menu.remove();
    }

    /**
     * Rendert das Nachrichtenlog. (KORRIGIERTE VERSION)
     */
    renderLog(logMessages) {
        if (!logMessages) return;
        let logWindow = document.getElementById('log-window');

        if (!logWindow) {
            logWindow = document.createElement('div');
            logWindow.id = 'log-window';
            logWindow.classList.add('draggable-window');
            logWindow.innerHTML = `<div class="window-header">Log</div><div class="log-content"></div>`;
            document.body.appendChild(logWindow);
            new Draggable(logWindow);
        }

        const logContent = logWindow.querySelector('.log-content');
        if (logContent) {
            logContent.innerHTML = logMessages.slice(-10).map(msg => `<div class="log-message">${msg}</div>`).join('');
            logContent.scrollTop = logContent.scrollHeight;
        }
    }
}