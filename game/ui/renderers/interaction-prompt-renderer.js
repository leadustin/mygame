import { eventBus } from '../../../engine/core/state-manager.js';

export class InteractionPromptRenderer {
    constructor() {
        this.template = document.getElementById('interaction-prompt-template');
    }

    render(state) {
        const existingPrompt = document.getElementById('interaction-prompt');
        if (state.pendingInteraction) {
            if (existingPrompt) return; // Verhindert mehrfaches Rendern

            const interaction = state.pendingInteraction;
            const promptEl = document.createElement('div');
            promptEl.id = 'interaction-prompt';
            promptEl.className = 'window active';
            promptEl.style.position = 'fixed';
            promptEl.style.top = '30%';
            promptEl.style.left = '50%';
            promptEl.style.transform = 'translateX(-50%)';
            promptEl.style.zIndex = '100';

            const content = this.template.content.cloneNode(true);
            content.getElementById('interaction-location-name').textContent = interaction.location.name;
            
            promptEl.appendChild(content);
            document.body.appendChild(promptEl);

            this.attachEventListeners(promptEl, interaction.location);
        } else {
            if (existingPrompt) existingPrompt.remove();
        }
    }

    attachEventListeners(promptEl, location) {
        promptEl.querySelector('#confirm-enter-btn').addEventListener('click', () => {
            eventBus.publish('ui:confirm_enter_location', location);
            promptEl.remove();
        });
        promptEl.querySelector('#cancel-enter-btn').addEventListener('click', () => {
            eventBus.publish('ui:cancel_enter_location');
            promptEl.remove();
        });
    }
}