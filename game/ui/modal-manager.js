import { DialogueBoxRenderer } from './renderers/dialogue-box-renderer.js';
import { TradeWindowRenderer } from './renderers/trade-window-renderer.js';

export class ModalManager {
    constructor() {
        this.dialogueRenderer = new DialogueBoxRenderer();
        this.tradeRenderer = new TradeWindowRenderer();
    }

    render(state) {
        // Wichtig: Immer nur ein Modal zur gleichen Zeit. Handel hat Vorrang.
        if (state.activeTradeSession) {
            this.closeDialogue(); // Schließt einen eventuell offenen Dialog
            this.tradeRenderer.render(state);
        } else if (state.activeDialogue) {
            this.closeTrade(); // Schließt ein eventuell offenes Handelsfenster
            this.dialogueRenderer.render(state);
        } else {
            // Wenn kein Modal aktiv ist, sorge dafür, dass beide geschlossen sind.
            this.closeDialogue();
            this.closeTrade();
        }
    }
    
    closeDialogue() {
        const dialogueBox = document.getElementById('dialogue-box');
        if (dialogueBox) dialogueBox.remove();
    }

    closeTrade() {
        const tradeWindow = document.getElementById('trade-window');
        if (tradeWindow) tradeWindow.remove();
    }
}