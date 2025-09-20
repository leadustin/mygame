import { eventBus } from '../../../engine/core/state-manager.js'; // KORRIGIERT

export class PostCombatLootRenderer {
    constructor(container) {
        this.container = container;
        this.template = document.getElementById('post-combat-loot-template');
    }

    render(state) {
        const postCombatState = state.postCombatState;
        if (!postCombatState) return;

        const content = this.template.content.cloneNode(true);
        this.container.replaceChildren(content);

        // Populate data
        this.container.querySelector('#xp-gained').textContent = postCombatState.xpGained;
        this.container.querySelector('#gold-gained').textContent = postCombatState.goldGained;

        const lootListEl = this.container.querySelector("#loot-list");
        if (postCombatState.loot.length === 0) {
            lootListEl.innerHTML = "<p>Keine Beute gefunden.</p>";
        } else {
            postCombatState.loot.forEach((item) => {
                const itemEl = document.createElement("div");
                itemEl.className = "loot-item";
                itemEl.dataset.lootId = item.lootId;
                itemEl.innerHTML = `<img src="${item.icon}" alt="${item.name}"><span>${item.name}</span>`;
                lootListEl.appendChild(itemEl);
            });
        }

        this.attachEventListeners();
    }

    attachEventListeners() {
        const lootListEl = this.container.querySelector("#loot-list");

        lootListEl.addEventListener("click", (e) => {
            const lootItem = e.target.closest(".loot-item");
            if (lootItem) {
                lootItem.classList.toggle("selected");
            }
        });

        this.container.querySelector("#take-selected-btn").addEventListener("click", () => {
            const ids = Array.from(lootListEl.querySelectorAll(".loot-item.selected"))
                             .map((el) => el.dataset.lootId);
            if (ids.length > 0) eventBus.publish("loot:take_selected", ids);
        });

        this.container.querySelector("#dismantle-btn").addEventListener("click", () => {
            const ids = Array.from(lootListEl.querySelectorAll(".loot-item.selected"))
                             .map((el) => el.dataset.lootId);
            if (ids.length > 0) eventBus.publish("loot:dismantle", ids);
        });

        this.container.querySelector("#take-all-btn").addEventListener("click", () => {
            eventBus.publish("loot:take_all");
        });

        this.container.querySelector("#close-loot-btn").addEventListener("click", () => {
            eventBus.publish("loot:close");
        });
    }
}