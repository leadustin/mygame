import { eventBus } from '../../../engine/core/state-manager.js'; // KORRIGIERT
import { RACES } from '../../characters/races.js'; // KORRIGIERT
import { CLASSES } from '../../characters/classes.js'; // KORRIGIERT
import { WEAPONS } from '../../../data/items/weapons.js'; // KORRIGIERT
import { ARMOR } from '../../../data/items/armor.js'; // KORRIGIERT
import { POTIONS } from '../../../data/items/potions.js'; // KORRIGIERT
import { CLOAKS } from '../../../data/items/cloaks.js'; // KORRIGIERT
import { BELTS } from '../../../data/items/belts.js'; // KORRIGIERT
import { JEWELRY } from '../../../data/items/jewelry.js'; // KORRIGIERT
import { HANDS } from '../../../data/items/hands.js'; // KORRIGIERT
import { FEET } from '../../../data/items/feet.js'; // KORRIGIERT
import { ARTIFACTS } from '../../../data/items/artifacts.js'; // KORRIGIERT
import { SHIELDS } from '../../../data/items/shields.js'; // KORRIGIERT
import { MATERIALS } from '../../../data/items/materials.js'; // KORRIGIERT
import { SPELLS } from '../../../data/items/spells.js'; // KORRIGIERT

const ALL_ITEMS = {
  ...WEAPONS, ...ARMOR, ...POTIONS, ...CLOAKS, ...BELTS, ...JEWELRY,
  ...HANDS, ...FEET, ...ARTIFACTS, ...SHIELDS, ...MATERIALS, ...SPELLS,
};

export class CharacterCreationRenderer {
    constructor(container) {
        this.container = container;
        this.template = document.getElementById('character-creation-template');
        
        this.currentStep = 1;
        this.creationData = {
            raceId: Object.keys(RACES)[0],
            classId: Object.keys(CLASSES)[0],
            gender: "Männlich",
            name: "",
        };
        this.steps = ["Rasse", "Klasse", "Personalisierung", "Abschluss"];
    }

    render(state) {
        this.currentStep = 1;
        this.creationData = {
            raceId: Object.keys(RACES)[0],
            classId: Object.keys(CLASSES)[0],
            gender: "Männlich",
            name: "",
        };
        this.renderWizard();
    }

    renderWizard() {
        const content = this.template.content.cloneNode(true);
        this.container.replaceChildren(content);
        this.renderStepIndicator();
        this.renderContentPanel();
        this.renderNavButtons();
    }

    renderStepIndicator() {
        const el = this.container.querySelector("#cc-step-indicator");
        el.innerHTML = this.steps
            .map((name, i) => `<div class="step ${this.currentStep === i + 1 ? "active" : ""}">${i + 1}. ${name}</div>`)
            .join("");
    }

    renderNavButtons() {
        const el = this.container.querySelector("#cc-nav-buttons");
        const back = `<button id="cc-back-btn" ${this.currentStep === 1 ? "disabled" : ""}>Zurück</button>`;
        const next = `<button id="cc-next-btn">${this.currentStep === this.steps.length ? "Abenteuer beginnen" : "Weiter"}</button>`;
        el.innerHTML = back + next;
        el.querySelector("#cc-back-btn").addEventListener("click", () => {
            this.currentStep--;
            this.renderWizard();
        });
        el.querySelector("#cc-next-btn").addEventListener("click", () => this.handleNextClick());
    }

    renderContentPanel() {
        const el = this.container.querySelector("#cc-content-panel");
        switch (this.currentStep) {
            case 1: this.renderSelectionStep(el, RACES, "raceId"); break;
            case 2: this.renderSelectionStep(el, CLASSES, "classId"); break;
            case 3: this.renderPersonalizationStep(el); break;
            case 4: this.renderFinalizationStep(el); break;
        }
    }

    renderSelectionStep(container, data, key) {
        container.innerHTML = `<div id="cc-selection-list"></div><div id="cc-details-panel"></div>`;
        const listEl = container.querySelector("#cc-selection-list");
        Object.entries(data).forEach(([id, value]) => {
            const btn = document.createElement("button");
            btn.className = `selection-button ${this.creationData[key] === id ? "active" : ""}`;
            btn.dataset.id = id;
            btn.textContent = value.name;
            listEl.appendChild(btn);
        });
        listEl.addEventListener("click", (e) => {
            if (e.target.matches(".selection-button")) {
                this.creationData[key] = e.target.dataset.id;
                this.renderSelectionStep(container, data, key);
            }
        });
        this.renderDetailsPanel(container.querySelector("#cc-details-panel"), data[this.creationData[key]]);
    }

    renderDetailsPanel(container, details) {
        let statsHtml = "";
        if (details.baseStats) {
            for (const [stat, val] of Object.entries(details.baseStats))
                statsHtml += `<div class="stat-line"><span>${stat}</span><span>${val}</span></div>`;
        } else if (details.statModifiers) {
            for (const [stat, val] of Object.entries(details.statModifiers))
                statsHtml += `<div class="stat-line"><span>${stat}</span><span>${val > 0 ? "+" : ""}${val}</span></div>`;
        }
        let equipHtml = "";
        if (details.startEquipment) {
            const icons = Object.values(details.startEquipment)
                .map((id) => {
                    const item = Object.values(ALL_ITEMS).find((i) => i.id === id);
                    return item ? `<img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}">` : "";
                })
                .join("");
            equipHtml = `<h4>Startausrüstung</h4><div class="cc-item-icons">${icons}</div>`;
        }
        container.innerHTML = `<div class="details-portrait"></div><h2>${details.name}</h2><p class="details-description">${details.description}</p><h4>${details.baseStats ? "Basisattribute" : "Boni"}</h4>${statsHtml}${equipHtml}`;
    }

    renderPersonalizationStep(container) {
        container.innerHTML = `<div id="cc-finalization-panel"><h2>Personalisierung</h2><div class="cc-gender-selection"><button class="selection-button ${this.creationData.gender === "Männlich" ? "active" : ""}" data-gender="Männlich">Männlich</button><button class="selection-button ${this.creationData.gender === "Weiblich" ? "active" : ""}" data-gender="Weiblich">Weiblich</button></div></div>`;
        container.querySelector(".cc-gender-selection").addEventListener("click", (e) => {
            if (e.target.matches(".selection-button")) {
                this.creationData.gender = e.target.dataset.gender;
                this.renderPersonalizationStep(container);
            }
        });
    }

    renderFinalizationStep(container) {
        container.innerHTML = `<div id="cc-finalization-panel"><h2>Abschluss</h2><p>Gib deinem Charakter einen Namen.</p><input type="text" id="char-name" placeholder="Charaktername" value="${this.creationData.name}"></div>`;
    }

    handleNextClick() {
        const nameInput = this.container.querySelector("#char-name");
        if (nameInput) this.creationData.name = nameInput.value;
        if (this.currentStep === 4) {
            if (!this.creationData.name.trim()) {
                alert("Bitte gib einen Namen ein.");
                return;
            }
            eventBus.publish("ui:startGame", this.creationData);
        } else {
            this.currentStep++;
            this.renderWizard();
        }
    }
}