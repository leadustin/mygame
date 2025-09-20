import { eventBus } from '../../../engine/core/state-manager.js'; // KORRIGIERT

export class DialogueBoxRenderer {
    constructor() {
        this.template = document.getElementById('dialogue-box-template');
    }

    render(state) {
        if (document.getElementById('dialogue-box')) return;

        const dialogue = state.activeDialogue;
        const dialogueEl = document.createElement('div');
        dialogueEl.id = 'dialogue-box';
        dialogueEl.className = 'window active';
        dialogueEl.style.position = 'fixed';
        dialogueEl.style.bottom = '10%';
        dialogueEl.style.left = '50%';
        dialogueEl.style.width = '60%';
        dialogueEl.style.transform = 'translateX(-50%)';
        dialogueEl.style.zIndex = '100';

        const content = this.template.content.cloneNode(true);
        content.getElementById('dialogue-speaker').textContent = dialogue.speaker;
        content.getElementById('dialogue-text').textContent = `"${dialogue.text}"`;

        const actionsContainer = content.getElementById('dialogue-actions');
        let buttonsHtml = `<button id="close-dialogue-btn">Schließen</button>`;
        if (dialogue.isMerchant) {
            buttonsHtml += `<button id="trade-btn">Handeln</button>`;
        }
        actionsContainer.innerHTML = buttonsHtml;

        dialogueEl.appendChild(content);
        document.body.appendChild(dialogueEl);

        this.attachEventListeners(dialogue);
    }

    attachEventListeners(dialogue) {
        document.getElementById('close-dialogue-btn').addEventListener('click', () => {
            eventBus.publish('ui:close_dialogue');
        });
        if (dialogue.isMerchant) {
            document.getElementById('trade-btn').addEventListener('click', () => {
                eventBus.publish('ui:start_trade', dialogue.npcData);
            });
        }
    }
}