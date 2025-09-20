import { Draggable } from '../../engine/ui-helpers/draggable.js';

export class LogRenderer {
    constructor() {
        this.template = document.getElementById('log-window-template');
        this.logWindow = null;
    }

    render(state) {
        if (state.currentView !== 'title_screen' && state.log) {
            if (!this.logWindow) {
                this.createLogWindow();
            }
            this.updateLogContent(state.log);
        } else {
            if (this.logWindow) {
                this.logWindow.remove();
                this.logWindow = null;
            }
        }
    }

    createLogWindow() {
        this.logWindow = document.createElement('div');
        this.logWindow.id = 'log-window';
        this.logWindow.classList.add('draggable-window');
        const content = this.template.content.cloneNode(true);
        this.logWindow.appendChild(content);
        document.body.appendChild(this.logWindow);
        new Draggable(this.logWindow);
    }

    updateLogContent(logMessages) {
        const logContent = this.logWindow.querySelector('.log-content');
        if (logContent) {
            logContent.innerHTML = logMessages
                .slice(-10)
                .map((msg) => `<div class="log-message">${msg}</div>`)
                .join('');
            logContent.scrollTop = logContent.scrollHeight;
        }
    }
}