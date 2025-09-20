import { eventBus } from '../../../engine/core/state-manager.js'; // KORRIGIERT
import { SaveSystem } from '../../../engine/systems/save.js'; // KORRIGIERT

export class TitleScreenRenderer {
    constructor(container) {
        this.container = container;
        this.template = document.getElementById('title-screen-template');
    }

    render(state) {
        const content = this.template.content.cloneNode(true);
        const loadBtn = content.getElementById('load-game-btn');
        const newGameBtn = content.getElementById('new-game-btn');
        const saveExists = SaveSystem.saveExists();

        if (saveExists) {
            loadBtn.disabled = false;
            loadBtn.addEventListener('click', () => eventBus.publish('game:load'));
        } else {
            loadBtn.disabled = true;
        }

        newGameBtn.addEventListener('click', () => eventBus.publish('ui:newGame'));
        
        this.container.replaceChildren(content);
    }
}