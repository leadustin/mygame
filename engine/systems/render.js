import { eventBus } from "../core/state_manager.js";
import { Draggable } from "../ui_helpers/draggable.js";
import { SaveSystem } from "./save.js";
import { RACES } from "../../game/characters/races.js";
import { CLASSES } from "../../game/characters/classes.js";
import { WEAPONS } from "../../data/items/weapons.js";
import { ARMOR } from "../../data/items/armor.js";
import { POTIONS } from "../../data/items/potions.js";
import { CLOAKS } from "../../data/items/cloaks.js";
import { BELTS } from "../../data/items/belts.js";
import { JEWELRY } from "../../data/items/jewelry.js";
import { HANDS } from "../../data/items/hands.js";
import { FEET } from "../../data/items/feet.js"; // Angepasst an deinen Dateinamen
import { ARTIFACTS } from "../../data/items/artifacts.js";
import { SHIELDS } from "../../data/items/shields.js";
import { MATERIALS } from "../../data/items/materials.js";
import { CharacterSystem } from "../../game/characters/characters.js";
import { SPELLS } from "../../data/items/spells.js";

const ALL_ITEMS = {
  ...WEAPONS,
  ...ARMOR,
  ...POTIONS,
  ...CLOAKS,
  ...BELTS,
  ...JEWELRY,
  ...HANDS,
  ...FEET,
  ...ARTIFACTS,
  ...SHIELDS,
  ...MATERIALS,
  ...SPELLS,
};

export class RenderSystem {
  constructor() {
    this.mainView = document.getElementById("main-view");
    this.hudContainer = document.getElementById("hud-container");
    this.gameContainer = document.getElementById("game-container");
  }

  render(state) {
    this.mainView.innerHTML = "";

    switch (state.currentView) {
      case "title_screen":
        this.renderTitleScreenView();
        break;
      case "character_creation":
        this.renderCharacterCreationView(state);
        break;
      case "map":
        this.renderMapView(state);
        break;
      case "location":
        this.renderLocationView(state);
        break;
      case "combat":
        this.renderCombatView(state);
        break;
      case "game_over":
        this.renderGameOverView();
        break;
      case "post_combat_loot":
        this.renderPostCombatLootView(state);
        break;
      default:
        this.mainView.innerHTML = `<h2>Unbekannte Ansicht: ${state.currentView}</h2>`;
    }

    if (state.activeDialogue) {
      // Stelle sicher, dass kein Handelsfenster im Weg ist
      const oldTrade = document.getElementById("trade-window");
      if (oldTrade) oldTrade.remove();

      this.renderDialogueBox(state.activeDialogue);
    } else if (state.activeTradeSession) {
      // Stelle sicher, dass kein Dialogfenster im Weg ist
      const oldDialogue = document.getElementById("dialogue-box");
      if (oldDialogue) oldDialogue.remove();

      this.renderTradeWindow(state);
    } else {
      // Dieser Block schließt das letzte offene Fenster (Dialog oder Handel)
      const oldBox =
        document.getElementById("dialogue-box") ||
        document.getElementById("trade-window");
      if (oldBox) oldBox.remove();
    }

    if (state.currentView === "map" || state.currentView === "combat") {
      this.renderHud();
      this.renderActiveWindows(state, this.gameContainer);
    } else if (state.currentView === "location") {
      // Setze den Schutz-Schalter zurück, damit renderHud() wieder funktioniert
      delete this.hudContainer.dataset.listenerAttached;

      // Zeigt NUR den "Weltkarte"-Knopf in der HUD-Leiste
      this.hudContainer.innerHTML = `
                <button id="exit-location-btn" class="hud-button">Weltkarte</button>
            `;

      // Füge den Event-Listener direkt hinzu
      document
        .getElementById("exit-location-btn")
        .addEventListener("click", () => {
          this.mainView.style.backgroundImage = "none";
          eventBus.publish("ui:exitLocation");
        });
    } else {
      // Für alle anderen Ansichten wird die Leiste geleert und der Schalter zurückgesetzt
      this.hudContainer.innerHTML = "";
      delete this.hudContainer.dataset.listenerAttached;
    }
    if (state.pendingInteraction) {
      this.renderInteractionPrompt(state.pendingInteraction);
    }

    if (state.currentView !== "title_screen" && state.log) {
      this.renderLog(state.log);
    }
  }

  attachDragDropListeners(container) {
    container.addEventListener("dragstart", (e) => {
      if (e.target.tagName === "IMG") {
        window.gameEngine.tooltipSystem.hideTooltip();
        const source = e.target.dataset.source;
        const data = { source };
        if (source === "inventory") data.index = e.target.dataset.index;
        else if (source === "equipment") data.slot = e.target.dataset.slot;
        e.dataTransfer.setData("application/json", JSON.stringify(data));
        setTimeout(() => (e.target.style.opacity = "0.5"), 0);
      }
    });
    container.addEventListener("dragend", (e) => {
      if (e.target.tagName === "IMG") e.target.style.opacity = "1";
    });
    container.addEventListener("dragover", (e) => {
      const targetSlot = e.target.closest(".drop-target");
      if (targetSlot) {
        e.preventDefault();
        targetSlot.classList.add("drag-over");
      }
    });
    container.addEventListener("dragleave", (e) => {
      const targetSlot = e.target.closest(".drop-target");
      if (targetSlot) targetSlot.classList.remove("drag-over");
    });
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      const targetSlot = e.target.closest(".drop-target");
      if (targetSlot) {
        targetSlot.classList.remove("drag-over");
        const sourceData = JSON.parse(
          e.dataTransfer.getData("application/json")
        );
        const targetData = {
          type: targetSlot.classList.contains("equipment-slot")
            ? "equipment"
            : "inventory",
          slot: targetSlot.dataset.slot,
          index: targetSlot.dataset.index,
        };
        eventBus.publish("inventory:itemMoved", {
          source: sourceData,
          target: targetData,
        });
      }
    });
  }

  renderHud() {
    if (this.hudContainer.dataset.listenerAttached) return;

    this.hudContainer.innerHTML = `
            <button class="hud-button" data-action="toggleCharacter">Charakter</button>
            <button class="hud-button" data-action="toggleInventory">Rucksack</button>
            <button class="hud-button" data-action="toggleMap">Karte</button>
            <button class="hud-button" data-action="save">Speichern</button>
            <button class="hud-button" data-action="startTestCombat" style="border-color: red;">Testkampf</button>
        `;

    this.hudContainer.addEventListener("click", (e) => {
      const action = e.target.closest("button")?.dataset.action;
      if (!action) return;
      switch (action) {
        case "toggleCharacter":
          eventBus.publish("ui:toggleCharacter");
          break;
        case "toggleInventory":
          eventBus.publish("ui:toggleInventory");
          break;
        case "toggleMap":
          eventBus.publish("ui:toggleMap");
          break;
        case "save":
          eventBus.publish("game:save");
          break;
        case "startTestCombat":
          eventBus.publish("game:startCombat");
          break;
      }
    });
    this.hudContainer.dataset.listenerAttached = "true";
  }

  renderTitleScreenView() {
    const saveExists = SaveSystem.saveExists();
    this.mainView.innerHTML = `
            <div id="title-screen-container">
                <h1>Mein RPG</h1>
                <div id="title-menu">
                    <button id="new-game-btn">Neues Spiel</button>
                    <button id="load-game-btn" ${
                      !saveExists ? "disabled" : ""
                    }>Spiel laden</button>
                    <button disabled>Optionen</button>
                </div>
            </div>
        `;
    document
      .getElementById("new-game-btn")
      .addEventListener("click", () => eventBus.publish("ui:newGame"));
    if (saveExists) {
      document
        .getElementById("load-game-btn")
        .addEventListener("click", () => eventBus.publish("game:load"));
    }
  }

  renderCharacterCreationView(state) {
    let currentStep = 1;
    const creationData = {
      raceId: Object.keys(RACES)[0],
      classId: Object.keys(CLASSES)[0],
      gender: "Männlich",
      name: "",
    };
    const steps = ["Rasse", "Klasse", "Personalisierung", "Abschluss"];

    const renderWizard = () => {
      this.mainView.innerHTML = `<div id="cc-wizard-container"><div id="cc-step-indicator"></div><div id="cc-content-panel"></div><div id="cc-nav-buttons"></div></div>`;
      renderStepIndicator();
      renderContentPanel();
      renderNavButtons();
    };
    const renderStepIndicator = () => {
      const el = this.mainView.querySelector("#cc-step-indicator");
      el.innerHTML = steps
        .map(
          (name, i) =>
            `<div class="step ${currentStep === i + 1 ? "active" : ""}">${
              i + 1
            }. ${name}</div>`
        )
        .join("");
    };
    const renderNavButtons = () => {
      const el = this.mainView.querySelector("#cc-nav-buttons");
      const back = `<button id="cc-back-btn" ${
        currentStep === 1 ? "disabled" : ""
      }>Zurück</button>`;
      const next = `<button id="cc-next-btn">${
        currentStep === steps.length ? "Abenteuer beginnen" : "Weiter"
      }</button>`;
      el.innerHTML = back + next;
      el.querySelector("#cc-back-btn").addEventListener("click", () => {
        currentStep--;
        renderWizard();
      });
      el.querySelector("#cc-next-btn").addEventListener(
        "click",
        handleNextClick
      );
    };
    const renderContentPanel = () => {
      const el = this.mainView.querySelector("#cc-content-panel");
      switch (currentStep) {
        case 1:
          renderSelectionStep(el, RACES, "raceId");
          break;
        case 2:
          renderSelectionStep(el, CLASSES, "classId");
          break;
        case 3:
          renderPersonalizationStep(el);
          break;
        case 4:
          renderFinalizationStep(el);
          break;
      }
    };
    const renderSelectionStep = (container, data, key) => {
      container.innerHTML = `<div id="cc-selection-list"></div><div id="cc-details-panel"></div>`;
      const listEl = container.querySelector("#cc-selection-list");
      Object.entries(data).forEach(([id, value]) => {
        const btn = document.createElement("button");
        btn.className = `selection-button ${
          creationData[key] === id ? "active" : ""
        }`;
        btn.dataset.id = id;
        btn.textContent = value.name;
        listEl.appendChild(btn);
      });
      listEl.addEventListener("click", (e) => {
        if (e.target.matches(".selection-button")) {
          creationData[key] = e.target.dataset.id;
          renderSelectionStep(container, data, key);
        }
      });
      renderDetailsPanel(
        container.querySelector("#cc-details-panel"),
        data[creationData[key]]
      );
    };
    const renderDetailsPanel = (container, details) => {
      let statsHtml = "";
      if (details.baseStats) {
        for (const [stat, val] of Object.entries(details.baseStats))
          statsHtml += `<div class="stat-line"><span>${stat}</span><span>${val}</span></div>`;
      } else if (details.statModifiers) {
        for (const [stat, val] of Object.entries(details.statModifiers))
          statsHtml += `<div class="stat-line"><span>${stat}</span><span>${
            val > 0 ? "+" : ""
          }${val}</span></div>`;
      }
      let equipHtml = "";
      if (details.startEquipment) {
        const icons = Object.values(details.startEquipment)
          .map((id) => {
            const item = Object.values(ALL_ITEMS).find((i) => i.id === id);
            return item
              ? `<img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}">`
              : "";
          })
          .join("");
        equipHtml = `<h4>Startausrüstung</h4><div class="cc-item-icons">${icons}</div>`;
      }
      container.innerHTML = `<div class="details-portrait"></div><h2>${
        details.name
      }</h2><p class="details-description">${details.description}</p><h4>${
        details.baseStats ? "Basisattribute" : "Boni"
      }</h4>${statsHtml}${equipHtml}`;
    };
    const renderPersonalizationStep = (container) => {
      container.innerHTML = `<div id="cc-finalization-panel"><h2>Personalisierung</h2><div class="cc-gender-selection"><button class="selection-button ${
        creationData.gender === "Männlich" ? "active" : ""
      }" data-gender="Männlich">Männlich</button><button class="selection-button ${
        creationData.gender === "Weiblich" ? "active" : ""
      }" data-gender="Weiblich">Weiblich</button></div></div>`;
      container
        .querySelector(".cc-gender-selection")
        .addEventListener("click", (e) => {
          if (e.target.matches(".selection-button")) {
            creationData.gender = e.target.dataset.gender;
            renderPersonalizationStep(container);
          }
        });
    };
    const renderFinalizationStep = (container) => {
      container.innerHTML = `<div id="cc-finalization-panel"><h2>Abschluss</h2><p>Gib deinem Charakter einen Namen.</p><input type="text" id="char-name" placeholder="Charaktername" value="${creationData.name}"></div>`;
    };
    const handleNextClick = () => {
      const nameInput = this.mainView.querySelector("#char-name");
      if (nameInput) creationData.name = nameInput.value;
      if (currentStep === 4) {
        if (!creationData.name.trim()) {
          alert("Bitte gib einen Namen ein.");
          return;
        }
        eventBus.publish("ui:startGame", creationData);
      } else {
        currentStep++;
        renderWizard();
      }
    };
    renderWizard();
  }

  renderDialogueBox(dialogue) {
    if (document.getElementById("dialogue-box")) return;
    const dialogueEl = document.createElement("div");
    dialogueEl.id = "dialogue-box";
    dialogueEl.className = "window active";
    dialogueEl.style.position = "fixed";
    dialogueEl.style.bottom = "10%";
    dialogueEl.style.left = "50%";
    dialogueEl.style.width = "60%";
    dialogueEl.style.transform = "translateX(-50%)";
    dialogueEl.style.zIndex = "100";

    let buttonsHtml = `<button id="close-dialogue-btn">Schließen</button>`;
    if (dialogue.isMerchant) {
      buttonsHtml += `<button id="trade-btn">Handeln</button>`;
    }

    dialogueEl.innerHTML = `
            <div class="window-header">
                <span>${dialogue.speaker}</span>
            </div>
            <div class="window-content" style="padding: 20px; text-align: left;">
                <p>"${dialogue.text}"</p>
                <div class="dialogue-actions" style="margin-top: 20px; text-align: right;">${buttonsHtml}</div>
            </div>
        `;

    document.body.appendChild(dialogueEl);

    document
      .getElementById("close-dialogue-btn")
      .addEventListener("click", () => eventBus.publish("ui:close_dialogue"));
    if (dialogue.isMerchant) {
      document
        .getElementById("trade-btn")
        .addEventListener("click", () =>
          eventBus.publish("ui:start_trade", dialogue.npcData)
        );
    }
  }

  // FÜGE DIESE NEUE FUNKTION hinzu
  renderTradeWindow(state) {
        // Wir aktualisieren das Fenster bei jeder Änderung, anstatt es nur einmal zu erstellen
        const existingWindow = document.getElementById('trade-window');
        if (existingWindow) existingWindow.remove();

        const { player, activeTradeSession } = state;
        const merchant = activeTradeSession.merchant;

        const tradeEl = document.createElement('div');
        tradeEl.id = 'trade-window';
        tradeEl.className = 'window active';
        tradeEl.style.width = '90%';
        tradeEl.style.maxWidth = '1400px'; // Etwas mehr Platz für das 3-Spalten-Layout
        tradeEl.style.height = '80%';
        tradeEl.style.position = 'fixed';
        tradeEl.style.top = '10%';
        tradeEl.style.left = '50%';
        tradeEl.style.transform = 'translateX(-50%)';
        tradeEl.style.zIndex = '99';

        // Helper-Funktion zum Erstellen eines Grids
        const renderInventoryGrid = (items, source, size = 30) => { // 5 Spalten * 6 Reihen = 30 Slots
            let html = '';
            for(let i = 0; i < size; i++) {
                const item = items[i];
                if (item) {
                    html += `<div class="inventory-slot" data-source="${source}" data-index="${i}" data-tooltip-id="${item.id}"><img src="${item.icon}" alt="${item.name}"></div>`;
                } else {
                    html += `<div class="inventory-slot"></div>`;
                }
            }
            return html;
        };

        const playerInventoryHtml = renderInventoryGrid(player.inventory, 'player');
        const merchantInventoryHtml = renderInventoryGrid(merchant.inventory, 'merchant');
        const buyBackHtml = renderInventoryGrid(merchant.buyBack, 'buyback', 10); // Kleinere Grid-Größe für Rückkauf

        tradeEl.innerHTML = `
            <div class="window-header"><span>Handel mit ${merchant.name}</span><button class="window-close-btn" id="close-trade-btn">×</button></div>
            <div class="window-content trade-content">
                <div class="trade-panel">
                    <div class="trade-character">
                        <img src="${merchant.sprite}" alt="${merchant.name}">
                        <p>${merchant.name}</p>
                        <p>Gold: ${merchant.gold}</p>
                    </div>
                    <h4>Angebot</h4>
                    <div class="inventory-grid trade-grid" id="merchant-trade-grid">${merchantInventoryHtml}</div>
                </div>

                <div class="trade-panel">
                    <div class="trade-character">
                        <img src="assets/images/portraits/player.webp" alt="Spieler">
                        <p>${player.name}</p>
                        <p>Dein Gold: ${player.gold}</p>
                    </div>
                    <h4>Dein Inventar</h4>
                    <div class="inventory-grid trade-grid" id="player-trade-grid">${playerInventoryHtml}</div>
                </div>

                <div class="trade-panel buyback-panel">
                    <div class="trade-character">
                         <h4>Rückkauf</h4>
                         <p style="font-size: 0.8em;">(Zum Verkaufspreis)</p>
                    </div>
                    <div class="inventory-grid trade-grid" id="buyback-grid">${buyBackHtml}</div>
                </div>
            </div>
        `;
        
        document.body.appendChild(tradeEl);

        document.getElementById('close-trade-btn').addEventListener('click', () => eventBus.publish('ui:close_trade'));
        
        tradeEl.addEventListener('click', (e) => {
            const slot = e.target.closest('.inventory-slot');
            if (!slot || !slot.dataset.tooltipId) return;

            const source = slot.dataset.source;
            const index = parseInt(slot.dataset.index, 10);

            if (source === 'player') {
                const item = player.inventory[index];
                if(item) eventBus.publish('trade:sell', { item, index });
            } else if (source === 'merchant') {
                const item = merchant.inventory[index];
                if(item) eventBus.publish('trade:buy', item);
            } else if (source === 'buyback') {
                const item = merchant.buyBack[index];
                if(item) eventBus.publish('trade:buy_back', item);
            }
        });
    }

  renderMapView(state) {
    if (window.gameEngine && window.gameEngine.mapRenderer) {
      window.gameEngine.mapRenderer.init(this.mainView, state.player);
    } else {
      this.mainView.innerHTML =
        "<h2>Karten-Renderer konnte nicht geladen werden.</h2>";
    }
  }

  renderLocationView(state) {
    const location = state.currentLocation;
    if (!location || !location.mapImage) {
      this.mainView.innerHTML = `<h2>Fehler: Kartenbild für ${location.name} nicht gefunden.</h2>`;
      return;
    }

    // Setzt das korrekte Hintergrundbild für die Stadt
    this.mainView.style.backgroundImage = `url(${location.mapImage})`;
    this.mainView.style.backgroundSize = "cover";
    this.mainView.style.backgroundPosition = "center";

    // Leert den Inhalt, um nur die Elemente des Ortes zu zeichnen
    let locationContentHtml = "";

    // Fügt NPCs hinzu, falls sie in den Ortsdaten definiert sind
    if (location.npcs && location.npcs.length > 0) {
      location.npcs.forEach((npc) => {
        locationContentHtml += `
                    <img src="${npc.sprite}" 
                         alt="${npc.name}" 
                         class="location-npc"
                         data-npcid="${npc.id}"
                         style="position: absolute; left: ${npc.position.x}px; top: ${npc.position.y}px; cursor: pointer; width: 64px; height: 64px;">
                `;
      });
    }

    this.mainView.innerHTML = locationContentHtml;

    // Fügt einen einzigen Event-Listener für die gesamte Ansicht hinzu, um Klicks auf NPCs abzufangen
    this.mainView.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("location-npc")) {
        const npcId = target.dataset.npcid;
        const npcData = location.npcs.find((n) => n.id === npcId);
        if (npcData) {
          eventBus.publish("ui:show_dialogue", npcData);
        }
      }
    });
  }

  renderInteractionPrompt(interaction) {
    // Verhindern, dass mehrere Fenster gleichzeitig offen sind
    if (document.getElementById("interaction-prompt")) return;

    const location = interaction.location;
    const promptEl = document.createElement("div");
    promptEl.id = "interaction-prompt";
    // Wir verwenden das bestehende 'window'-Styling
    promptEl.className = "window active";
    promptEl.style.position = "fixed";
    promptEl.style.top = "30%";
    promptEl.style.left = "50%";
    promptEl.style.transform = "translateX(-50%)";
    promptEl.style.zIndex = "100"; // Stellt sicher, dass es über allem liegt

    promptEl.innerHTML = `
            <div class="window-header">
                <span>Ort erreicht</span>
            </div>
            <div class="window-content" style="padding: 20px; text-align: center;">
                <h3>${location.name}</h3>
                <p>Möchtest du diesen Ort betreten?</p>
                <div style="display: flex; justify-content: space-around; margin-top: 20px;">
                    <button id="confirm-enter-btn">Betreten</button>
                    <button id="cancel-enter-btn">Weitergehen</button>
                </div>
            </div>
        `;

    document.body.appendChild(promptEl);

    document
      .getElementById("confirm-enter-btn")
      .addEventListener("click", () => {
        eventBus.publish("ui:confirm_enter_location", location);
        promptEl.remove();
      });
    document
      .getElementById("cancel-enter-btn")
      .addEventListener("click", () => {
        eventBus.publish("ui:cancel_enter_location");
        promptEl.remove();
      });
  }

  renderCombatView(state) {
    if (!state.combat || !state.player) return;
    const player = state.player;
    const monster = state.combat.monster;

    const usablePotions = player.inventory.filter(
      (i) => i && i.type === "potion"
    );
    const knownSpells = player.spellbook
      .map((spellId) => Object.values(SPELLS).find((s) => s.id === spellId))
      .filter((s) => s);

    this.mainView.innerHTML = `
            <div id="combat-screen" style="padding: 20px; text-align: center;">
                <div class="monster-area" style="margin-bottom: 40px;"><h2>${
                  monster.name
                }</h2><p>HP: ${monster.hp} / ${monster.maxHp}</p></div>
                <div class="player-area" style="margin-bottom: 40px;"><h3>${
                  player.name
                }</h3><p>HP: ${player.hp} / ${player.maxHp}</p><p>MP: ${
      player.mp
    } / ${player.maxMp}</p></div>
                <div class="actions" style="margin-bottom: 20px;"><button id="attack-btn">Angriff</button><button id="spell-btn" ${
                  knownSpells.length === 0 ? "disabled" : ""
                }>Zauber</button><button id="item-btn" ${
      usablePotions.length === 0 ? "disabled" : ""
    }>Item</button></div>
                <div id="combat-submenu-container" style="min-height: 50px;"></div>
            </div>`;

    const submenuContainer = this.mainView.querySelector(
      "#combat-submenu-container"
    );
    document
      .getElementById("attack-btn")
      .addEventListener("click", () =>
        eventBus.publish("combat:action", { type: "attack" })
      );
    document.getElementById("spell-btn").addEventListener("click", () => {
      submenuContainer.innerHTML = knownSpells
        .map(
          (spell) =>
            `<button class="spell-choice-btn" data-spell-id="${spell.id}" ${
              player.mp < spell.costMp ? "disabled" : ""
            }>${spell.name} (${spell.costMp} MP)</button>`
        )
        .join("");
    });
    document.getElementById("item-btn").addEventListener("click", () => {
      submenuContainer.innerHTML = usablePotions
        .map(
          (item) =>
            `<button class="item-choice-btn" data-item-id="${item.id}">${item.name}</button>`
        )
        .join("");
    });
    this.mainView.addEventListener("click", (e) => {
      if (e.target.matches(".spell-choice-btn"))
        eventBus.publish("combat:action", {
          type: "spell",
          spellId: e.target.dataset.spellId,
        });
      if (e.target.matches(".item-choice-btn"))
        eventBus.publish("combat:action", {
          type: "item",
          itemId: e.target.dataset.itemId,
        });
    });
  }

  renderGameOverView() {
    this.mainView.innerHTML = `<h2 style="color:red;text-align:center;">GAME OVER</h2>`;
  }

  renderPostCombatLootView(state) {
    const postCombatState = state.postCombatState;
    if (!postCombatState) return;
    this.mainView.innerHTML = `<div id="loot-screen-container"><div id="loot-panel"><h2>SIEG!</h2><p>Du erhältst ${
      postCombatState.xpGained
    } Erfahrungspunkte.</p><div id="loot-gold">Gefunden: ${
      postCombatState.goldGained
    } Gold</div><h4>Beute</h4><div id="loot-list">${
      postCombatState.loot.length === 0 ? "<p>Keine Beute gefunden.</p>" : ""
    }</div><div id="loot-actions"><button id="take-selected-btn">Nehmen</button><button id="dismantle-btn">Zerlegen</button><button id="take-all-btn">Alles nehmen</button><button id="close-loot-btn">Schließen</button></div></div></div>`;
    const lootListEl = this.mainView.querySelector("#loot-list");
    postCombatState.loot.forEach((item) => {
      const itemEl = document.createElement("div");
      itemEl.className = "loot-item";
      itemEl.dataset.lootId = item.lootId;
      itemEl.innerHTML = `<img src="${item.icon}" alt="${item.name}"><span>${item.name}</span>`;
      lootListEl.appendChild(itemEl);
    });
    lootListEl.addEventListener("click", (e) => {
      e.target.closest(".loot-item")?.classList.toggle("selected");
    });
    this.mainView
      .querySelector("#take-selected-btn")
      .addEventListener("click", () => {
        const ids = Array.from(
          lootListEl.querySelectorAll(".loot-item.selected")
        ).map((el) => el.dataset.lootId);
        if (ids.length > 0) eventBus.publish("loot:take_selected", ids);
      });
    this.mainView
      .querySelector("#dismantle-btn")
      .addEventListener("click", () => {
        const ids = Array.from(
          lootListEl.querySelectorAll(".loot-item.selected")
        ).map((el) => el.dataset.lootId);
        if (ids.length > 0) eventBus.publish("loot:dismantle", ids);
      });
    this.mainView
      .querySelector("#take-all-btn")
      .addEventListener("click", () => eventBus.publish("loot:take_all"));
    this.mainView
      .querySelector("#close-loot-btn")
      .addEventListener("click", () => eventBus.publish("loot:close"));
  }

  renderActiveWindows(state, container) {
    container.querySelectorAll(".window").forEach((win) => win.remove());
    if (!state.activeWindows || !state.player) return;
    state.activeWindows.forEach((name) => {
      const el = document.createElement("div");
      el.className = "window active";
      el.id = `${name}-window`;
      if (name === "character") this.renderCharacterWindow(el, state.player);
      else if (name === "inventory")
        this.renderInventoryWindow(el, state.player);
      container.appendChild(el);
    });
  }

  renderCharacterWindow(windowEl, player) {
    windowEl.classList.add("draggable-window");
    windowEl.style.left = "50%";
    windowEl.style.top = "50px";
    windowEl.style.transform = "translateX(-50%)";
    windowEl.style.width = "900px";

    let tempStats = JSON.parse(JSON.stringify(player.stats));
    let tempUnspentPoints = player.unspentStatPoints;
    const originalStats = JSON.parse(JSON.stringify(player.stats));

    const updateStatsDisplay = () => {
      const statsPanel = windowEl.querySelector("#character-stats-panel");
      if (!statsPanel) return;

      // Holen Sie sich die Basisstatistiken von der Klasse und Rasse des Charakters
      const classStats = CLASSES[player.classId].baseStats;
      const raceStats = RACES[player.raceId].statModifiers;

      // Kombinieren Sie die Statistiken
      const baseStats = {};
      for (const stat in classStats) {
        baseStats[stat] = classStats[stat] + (raceStats[stat] || 0);
      }

      const xpNeeded = CharacterSystem.getXpForNextLevel(player.level);
      const xpPercent = xpNeeded > 0 ? (player.xp / xpNeeded) * 100 : 0;
      const hpPercent = player.maxHp > 0 ? (player.hp / player.maxHp) * 100 : 0;
      const mpPercent = player.maxMp > 0 ? (player.mp / player.maxMp) * 100 : 0;

      let primaryStatsHtml = "";
      const primaryStats = [
        "strength",
        "dexterity",
        "intelligence",
        "vitality",
      ];
      primaryStats.forEach((stat) => {
        const value = tempStats[stat] || 0;
        const baseValue = originalStats[stat] || 0;
        const decreaseBtn =
          tempStats[stat] > baseValue
            ? `<button class="decrease-stat-btn stat-mod-btn" data-stat="${stat}">-</button>`
            : "";
        const increaseBtn =
          tempUnspentPoints > 0
            ? `<button class="increase-stat-btn stat-mod-btn" data-stat="${stat}">+</button>`
            : "";
        primaryStatsHtml += `<div class="stat-line"><span>${
          stat.charAt(0).toUpperCase() + stat.slice(1)
        }</span><div class="stat-value-controls"><span>${value}</span>${decreaseBtn}${increaseBtn}</div></div>`;
      });

      let secondaryStatsHtml = "";
      const secondaryStats = ["defense", "magicDefense"];
      secondaryStats.forEach((stat) => {
        if (tempStats[stat] !== undefined)
          secondaryStatsHtml += `<div class="stat-line"><span>${
            stat.charAt(0).toUpperCase() + stat.slice(1)
          }</span><span>${tempStats[stat]}</span></div>`;
      });

      const pointsDisplay =
        player.unspentStatPoints > 0
          ? `<div class="stat-points-display">Verfügbare Punkte: ${tempUnspentPoints}</div>`
          : "";
      const confirmButton =
        tempUnspentPoints < player.unspentStatPoints
          ? `<button class="confirm-stats-btn">Punkte bestätigen</button>`
          : "";

      statsPanel.innerHTML = `
                <div id="character-info-header"><h4>${player.name}</h4><p>Level ${player.level} ${player.race} ${player.class}</p></div>
                <div class="resource-bar-container"><div class="resource-bar-fill hp" style="width: ${hpPercent}%;"></div><div class="resource-bar-text">HP: ${player.hp} / ${player.maxHp}</div></div>
                <div class="resource-bar-container"><div class="resource-bar-fill mp" style="width: ${mpPercent}%;"></div><div class="resource-bar-text">MP: ${player.mp} / ${player.maxMp}</div></div>
                <div class="resource-bar-container"><div class="resource-bar-fill xp" style="width: ${xpPercent}%;"></div><div class="resource-bar-text">XP: ${player.xp} / ${xpNeeded}</div></div>
                <hr>
                <div class="stat-line"><span><img src="assets/images/icons/gold_coins.png" alt="Gold">Gold</span><span>${player.gold}</span></div>
                ${pointsDisplay}
                <hr>
                <h4>Primärattribute</h4>${primaryStatsHtml}<hr><h4>Kampfwerte</h4>${secondaryStatsHtml}${confirmButton}`;
    };

    const equipmentSlots = [
      "head",
      "cloak",
      "armor",
      "amulet",
      "hand",
      "belt",
      "foot",
      "artifact",
      "ring1",
      "ring2",
      "weapon",
      "offhand",
      "ranged",
    ];
    let armorHtml = "",
      weaponHtml = "";
    equipmentSlots.forEach((slotName) => {
      const item = player.equipment[slotName];
      let slotContent = `<span class="slot-name">${slotName.replace(
        /\d/g,
        ""
      )}</span>`;
      if (item)
        slotContent = `<img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}" draggable="true" data-source="equipment" data-slot="${slotName}">`;
      const slotHtml = `<div class="equipment-slot drop-target" data-slot="${slotName}">${slotContent}</div>`;
      if (["weapon", "offhand", "ranged"].includes(slotName))
        weaponHtml += slotHtml;
      else armorHtml += slotHtml;
    });
    const equipmentPanelHtml = `<div id="character-equipment-panel"><div class="equipment-group">${armorHtml}</div><div class="equipment-group weapons">${weaponHtml}</div></div>`;
    const equippableItems = player.inventory.filter(
      (item) =>
        item && equipmentSlots.some((slot) => slot.startsWith(item.type))
    );
    let filteredInventoryHtml = "";
    for (let i = 0; i < 20; i++) {
      const item = equippableItems[i];
      if (item) {
        const originalIndex = player.inventory.indexOf(item);
        filteredInventoryHtml += `<div class="inventory-slot drop-target" data-index="${originalIndex}"><img src="${item.icon}" alt="${item.name}" data-tooltip-id="${item.id}" draggable="true" data-source="inventory" data-index="${originalIndex}"></div>`;
      } else {
        filteredInventoryHtml += `<div class="inventory-slot drop-target"></div>`;
      }
    }
    const filteredInventoryPanelHtml = `<div id="character-filtered-inventory-panel"><h4>Ausrüstbare Items</h4><div id="filtered-inventory-grid">${filteredInventoryHtml}</div></div>`;

    windowEl.innerHTML = `<div class="window-header"><span>Charakter</span><button class="window-close-btn" data-window="character">×</button></div><div class="window-content"><div id="character-stats-panel"></div>${equipmentPanelHtml}${filteredInventoryPanelHtml}</div>`;
    updateStatsDisplay();
    const contentContainer = windowEl.querySelector(".window-content");
    this.attachDragDropListeners(contentContainer);
    new Draggable(windowEl);
    windowEl
      .querySelector(".window-close-btn")
      .addEventListener("click", (e) =>
        eventBus.publish("ui:closeWindow", e.target.dataset.window)
      );
    windowEl
      .querySelector("#character-stats-panel")
      .addEventListener("click", (e) => {
        const stat = e.target.dataset.stat;
        if (e.target.matches(".increase-stat-btn") && tempUnspentPoints > 0) {
          tempUnspentPoints--;
          tempStats[stat]++;
          updateStatsDisplay();
        }
        if (
          e.target.matches(".decrease-stat-btn") &&
          tempStats[stat] > originalStats[stat]
        ) {
          tempUnspentPoints++;
          tempStats[stat]--;
          updateStatsDisplay();
        }
        if (e.target.matches(".confirm-stats-btn")) {
          eventBus.publish("character:confirm_stats", {
            newStats: tempStats,
            remainingPoints: tempUnspentPoints,
          });
        }
      });
  }

  renderInventoryWindow(windowEl, player) {
    windowEl.classList.add("draggable-window");
    windowEl.style.right = "50px";
    windowEl.style.top = "50px";
    windowEl.style.width = "auto";
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
    windowEl.innerHTML = `<div class="window-header"><span>Rucksack</span><button class="window-close-btn" data-window="inventory">×</button></div><div class="window-content"><div id="inventory-grid">${inventoryHtml}</div></div>`;
    const gridContainer = windowEl.querySelector("#inventory-grid");
    this.attachDragDropListeners(gridContainer);
    new Draggable(windowEl);
    windowEl
      .querySelector(".window-close-btn")
      .addEventListener("click", (e) =>
        eventBus.publish("ui:closeWindow", e.target.dataset.window)
      );
  }

  renderLog(logMessages) {
    if (!logMessages) return;
    let logWindow = document.getElementById("log-window");
    if (!logWindow) {
      logWindow = document.createElement("div");
      logWindow.id = "log-window";
      logWindow.classList.add("draggable-window");
      logWindow.innerHTML = `<div class="window-header">Log</div><div class="log-content"></div>`;
      document.body.appendChild(logWindow);
      new Draggable(logWindow);
    }
    const logContent = logWindow.querySelector(".log-content");
    if (logContent) {
      logContent.innerHTML = logMessages
        .slice(-10)
        .map((msg) => `<div class="log-message">${msg}</div>`)
        .join("");
      logContent.scrollTop = logContent.scrollHeight;
    }
  }
}
