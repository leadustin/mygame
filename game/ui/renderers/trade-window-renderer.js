import { eventBus } from '../../engine/core/state-manager.js';

export class TradeWindowRenderer {
    constructor() {
        this.template = document.getElementById('trade-window-template');
    }

    render(state) {
        if (document.getElementById('trade-window')) return;

        const { player, activeTradeSession } = state;
        const merchant = activeTradeSession.merchant;

        const tradeEl = document.createElement('div');
        tradeEl.id = 'trade-window';
        tradeEl.className = 'window active';
        tradeEl.style.width = "90%";
        tradeEl.style.maxWidth = "1400px";
        tradeEl.style.height = "80%";
        tradeEl.style.position = "fixed";
        tradeEl.style.top = "10%";
        tradeEl.style.left = "50%";
        tradeEl.style.transform = "translateX(-50%)";
        tradeEl.style.zIndex = "99";

        const content = this.template.content.cloneNode(true);
        
        // Populate data
        content.getElementById('merchant-name').textContent = merchant.name;
        content.getElementById('merchant-name-display').textContent = merchant.name;
        content.getElementById('merchant-sprite').src = merchant.sprite;
        content.getElementById('merchant-gold').textContent = merchant.gold;
        content.getElementById('player-name-display').textContent = player.name;
        content.getElementById('player-gold').textContent = player.gold;
        
        // Render Grids
        content.getElementById('merchant-inventory').innerHTML = this.renderInventoryGrid(merchant.inventory, 'merchant', 'shop');
        content.getElementById('player-inventory').innerHTML = this.renderInventoryGrid(player.inventory, 'inventory', 'inventory');
        content.getElementById('buyback-inventory').innerHTML = this.renderInventoryGrid(merchant.buyBack, 'buyback', 'shop', 10);
        
        tradeEl.appendChild(content);
        document.body.appendChild(tradeEl);
        
        this.attachEventListeners(tradeEl);
    }
    
    renderInventoryGrid(items, source, targetType, size = 30) {
        let html = "";
        for (let i = 0; i < size; i++) {
            const item = items[i];
            html += `<div class="inventory-slot drop-target" data-target-type="${targetType}" data-index="${i}">`;
            if (item) {
                html += `<img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}" draggable="true" data-source="${source}" data-item-id="${item.id}" data-index="${i}">`;
            }
            html += `</div>`;
        }
        return html;
    }

    attachEventListeners(tradeEl) {
        document.getElementById('close-trade-btn').addEventListener('click', () => {
            eventBus.publish('ui:close_trade');
        });
        
        // Hier müsste die Drag&Drop-Listener-Logik aus der alten render.js eingefügt werden.
        // this.attachDragDropListeners(tradeEl);
    }
}