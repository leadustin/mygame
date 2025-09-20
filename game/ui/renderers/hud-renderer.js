import { eventBus } from '../../../engine/core/state-manager.js'; // KORRIGIERT

export class HudRenderer {
    constructor(container) {
        this.container = container;
        this.template = document.getElementById('hud-template');
        this.listenerAttached = false;
    }

    render(state) {
        const visibleViews = ['map', 'combat'];
        if (visibleViews.includes(state.currentView)) {
            const content = this.template.content.cloneNode(true);
            this.container.replaceChildren(content);
            this.attachEventListeners();
        } else {
            this.container.innerHTML = '';
            this.listenerAttached = false;
        }
    }

    attachEventListeners() {
        if (this.listenerAttached) return;

        this.container.addEventListener('click', (e) => {
            const action = e.target.closest('button')?.dataset.action;
            if (!action) return;
            
            switch (action) {
                case 'toggleCharacter':
                    eventBus.publish('ui:toggleCharacter');
                    break;
                case 'toggleInventory':
                    eventBus.publish('ui:toggleInventory');
                    break;
                case 'toggleMap':
                    eventBus.publish('ui:toggleMap');
                    break;
                case 'save':
                    eventBus.publish('game:save');
                    break;
                case 'startTestCombat':
                    eventBus.publish('game:startCombat');
                    break;
            }
        });
        this.listenerAttached = true;
    }
}