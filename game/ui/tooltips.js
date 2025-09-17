/**
 * tooltips.js
 * * Ein wiederverwendbares System zur Anzeige von kontextbezogenen Tooltips.
 */
import { WEAPONS } from '../../data/items/weapons.js';
import { ARMOR } from '../../data/items/armor.js';
import { POTIONS } from '../../data/items/potions.js';
// Fasse alle bekannten Items in einem Objekt zusammen, um sie leicht nachschlagen zu können.
const ALL_ITEMS = { ...WEAPONS, ...ARMOR, ...POTIONS };

export class TooltipSystem {
    constructor() {
        this.tooltipEl = null;
        this.createTooltipElement();
    }

    createTooltipElement() {
        this.tooltipEl = document.createElement('div');
        this.tooltipEl.id = 'tooltip';
        this.tooltipEl.style.display = 'none'; // Standardmäßig versteckt
        document.body.appendChild(this.tooltipEl);
    }

    init() {
        console.log("TOOLTIP CHECK 1: TooltipSystem.init() wurde aufgerufen."); // <-- HINZUFÜGEN
        document.body.addEventListener('mouseover', (e) => this.handleMouseOver(e));
        document.body.addEventListener('mouseout', () => this.hideTooltip());
        document.body.addEventListener('mousemove', (e) => this.updateTooltipPosition(e));
    }
    
    handleMouseOver(e) {
        console.log("TOOLTIP CHECK 2: MouseOver-Event auf Body erkannt."); // <-- HINZUFÜGEN
        const target = e.target.closest('[data-tooltip-id]');
        console.log("TOOLTIP CHECK 3: Ziel-Element mit [data-tooltip-id]:", target); // <-- HINZUFÜGEN

        if (!target) return;

        const itemId = target.dataset.tooltipId;
        const item = Object.values(ALL_ITEMS).find(i => i.id === itemId);
        console.log("TOOLTIP CHECK 4: Gefundenes Item-Objekt:", item); // <-- HINZUFÜGEN

        if (item) {
            this.showTooltip(item);
        }
    }

    showTooltip(item) {
        console.log("TOOLTIP CHECK 5: showTooltip() wird aufgerufen."); // <-- HINZUFÜGEN
        this.tooltipEl.innerHTML = this.formatTooltip(item);
        this.tooltipEl.style.display = 'block';
    }

    hideTooltip() {
        this.tooltipEl.style.display = 'none';
    }

    updateTooltipPosition(e) {
        // Positioniert den Tooltip leicht versetzt zum Mauszeiger
        this.tooltipEl.style.left = `${e.clientX + 15}px`;
        this.tooltipEl.style.top = `${e.clientY + 15}px`;
    }

    formatTooltip(item) {
        let statsHtml = '';
        if (item.stats) {
            statsHtml = Object.entries(item.stats)
                .map(([stat, value]) => `<div class="stat-line"><span>${stat}</span><span>${value > 0 ? '+' : ''}${value}</span></div>`)
                .join('');
        }
        if (item.effect) {
             statsHtml = `<p>${item.effect.type === 'heal' ? 'Heilt' : ''} ${item.effect.amount} HP</p>`;
        }

        return `
            <h3>${item.name}</h3>
            <p style="text-transform: capitalize;">Typ: ${item.type}</p>
            <hr>
            ${statsHtml}
        `;
    }
}