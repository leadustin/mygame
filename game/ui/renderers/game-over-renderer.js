export class GameOverRenderer {
    constructor(container) {
        this.container = container;
        this.template = document.getElementById('game-over-template');
    }

    render(state) {
        const content = this.template.content.cloneNode(true);
        this.container.replaceChildren(content);
    }
}