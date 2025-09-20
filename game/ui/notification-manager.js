import { InteractionPromptRenderer } from './renderers/interaction-prompt-renderer.js';
import { LogRenderer } from './renderers/log-renderer.js';

export class NotificationManager {
    constructor() {
        this.interactionPromptRenderer = new InteractionPromptRenderer();
        this.logRenderer = new LogRenderer();
    }

    render(state) {
        // Diese Renderer verwalten ihre eigenen Elemente und entscheiden, ob sie sich zeigen.
        this.interactionPromptRenderer.render(state);
        this.logRenderer.render(state);
    }
}