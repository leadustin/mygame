import { eventBus } from '../../../engine/core/state-manager.js'; // KORRIGIERT
import { SPELLS } from '../../../data/items/spells.js'; // KORRIGIERT

export class CombatRenderer {
    constructor(container) {
        this.container = container;
        this.template = document.getElementById('combat-view-template');
    }

    render(state) {
        if (!state.combat || !state.player) return;

        const content = this.template.content.cloneNode(true);
        this.container.replaceChildren(content);

        const player = state.player;
        const monster = state.combat.monster;

        // Populate data
        this.container.querySelector('#monster-name').textContent = monster.name;
        this.container.querySelector('#monster-hp').textContent = monster.hp;
        this.container.querySelector('#monster-max-hp').textContent = monster.maxHp;

        this.container.querySelector('#player-name').textContent = player.name;
        this.container.querySelector('#player-hp').textContent = player.hp;
        this.container.querySelector('#player-max-hp').textContent = player.maxHp;
        this.container.querySelector('#player-mp').textContent = player.mp;
        this.container.querySelector('#player-max-mp').textContent = player.maxMp;

        // Handle dynamic buttons
        const usablePotions = player.inventory.filter(item => item && item.type === 'potion');
        const knownSpells = player.spellbook
            .map(spellId => Object.values(SPELLS).find(s => s.id === spellId))
            .filter(Boolean);

        const spellBtn = this.container.querySelector('#spell-btn');
        const itemBtn = this.container.querySelector('#item-btn');

        if (knownSpells.length === 0) spellBtn.disabled = true;
        if (usablePotions.length === 0) itemBtn.disabled = true;

        this.attachEventListeners(player, knownSpells, usablePotions);
    }

    attachEventListeners(player, knownSpells, usablePotions) {
        const submenuContainer = this.container.querySelector("#combat-submenu-container");

        this.container.querySelector('#attack-btn').addEventListener('click', () => {
            eventBus.publish("combat:action", { type: "attack" });
        });

        this.container.querySelector('#spell-btn').addEventListener('click', () => {
            submenuContainer.innerHTML = knownSpells
                .map(spell =>
                    `<button class="spell-choice-btn" data-spell-id="${spell.id}" ${player.mp < spell.costMp ? "disabled" : ""}>
                        ${spell.name} (${spell.costMp} MP)
                    </button>`
                )
                .join("");
        });

        this.container.querySelector('#item-btn').addEventListener('click', () => {
            submenuContainer.innerHTML = usablePotions
                .map(item =>
                    `<button class="item-choice-btn" data-item-id="${item.id}">
                        ${item.name}
                    </button>`
                )
                .join("");
        });

        this.container.addEventListener('click', (e) => {
            if (e.target.matches('.spell-choice-btn')) {
                eventBus.publish("combat:action", {
                    type: "spell",
                    spellId: e.target.dataset.spellId,
                });
            }
            if (e.target.matches('.item-choice-btn')) {
                eventBus.publish("combat:action", {
                    type: "item",
                    itemId: e.target.dataset.itemId,
                });
            }
        });
    }
}