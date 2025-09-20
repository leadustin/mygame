import { Draggable } from '../../engine/ui-helpers/draggable.js';
import { eventBus } from '../../engine/core/state-manager.js';

export class InventoryWindowRenderer {
    constructor() {
        this.template = document.getElementById('inventory-window-template');
    }

    render(state) {
        const player = state.player;
        if (!player) return null;

        const windowEl = document.createElement('div');
        windowEl.id = 'inventory-window';
        windowEl.className = 'window active draggable-window';
        windowEl.style.right = '50px';
        windowEl.style.top = '50px';
        windowEl.style.width = 'auto';

        const content = this.template.content.cloneNode(true);
        const grid = content.getElementById('inventory-grid');
        
        let inventoryHtml = "";
        const inventorySize = 32;
        for (let i = 0; i < inventorySize; i++) {
            const item = player.inventory[i];
            if (item) {
                inventoryHtml += `<div class="inventory-slot drop-target" data-index="${i}"><img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}" draggable="true" data-source="inventory" data-index="${i}"></div>`;
            } else {
                inventoryHtml += `<div class="inventory-slot drop-target" data-index="${i}"></div>`;
            }
        }
        grid.innerHTML = inventoryHtml;

        windowEl.appendChild(content);

        this.attachEventListeners(windowEl);
        new Draggable(windowEl);
        return windowEl;
    }

    attachEventListeners(windowEl) {
        windowEl.querySelector(".window-close-btn").addEventListener("click", (e) => eventBus.publish("ui:closeWindow", e.target.dataset.window));
        // Drag & Drop Listener
        // this.attachDragDropListeners(windowEl.querySelector('#inventory-grid'));
    }
}