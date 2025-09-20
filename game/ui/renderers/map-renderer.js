// Dieser Renderer ist eine Brücke zum bestehenden Map-Rendering-System.

export class MapRenderer {
    constructor(container) {
        this.container = container; // Das ist die #main-view
    }

    render(state) {
        // Die bestehende Logik erwartet, dass die #main-view leer ist.
        this.container.innerHTML = ''; 

        // Ruft die init-Methode des bereits existierenden mapRenderers auf,
        // der auf dem globalen gameEngine-Objekt verfügbar ist.
        if (window.gameEngine && window.gameEngine.mapRenderer) {
            window.gameEngine.mapRenderer.init(this.container, state.player);
        } else {
            // Fallback, falls etwas schiefgeht.
            this.container.innerHTML = '<h2>Karten-Renderer konnte nicht geladen werden.</h2>';
            console.error("Der ursprüngliche mapRenderer wurde auf window.gameEngine nicht gefunden.");
        }
    }
}