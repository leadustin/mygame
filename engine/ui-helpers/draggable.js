/**
 * draggable.js
 * * Macht ein HTML-Element per Drag & Drop verschiebbar. (DEBUG-VERSION)
 */
export class Draggable {
    constructor(element) {
        this.element = element;
        this.header = element.querySelector('.window-header');
        
        this.isDragging = false;
        this.initialMouseX = 0;
        this.initialMouseY = 0;
        this.initialElX = 0;
        this.initialElY = 0;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.header.addEventListener('mousedown', this.onMouseDown);
        this.element.dataset.draggable = true;
    }

    onMouseDown(event) {
        console.log("--- DRAG CHECK 1: MOUSEDOWN ---");
        this.isDragging = true;
        this.initialMouseX = event.clientX;
        this.initialMouseY = event.clientY;
        
        this.initialElX = this.element.offsetLeft;
        this.initialElY = this.element.offsetTop;
        console.log(`Startposition des Elements: Left=${this.initialElX}, Top=${this.initialElY}`);

        document.addEventListener('mousemove', this.onMouseMove);
        document.addEventListener('mouseup', this.onMouseUp);
    }

    onMouseMove(event) {
        if (!this.isDragging) return;
        
        console.log("--- DRAG CHECK 2: MOUSEMOVE ---"); // Dieser Check ist am wichtigsten!

        const deltaX = event.clientX - this.initialMouseX;
        const deltaY = event.clientY - this.initialMouseY;
        
        const newX = this.initialElX + deltaX;
        const newY = this.initialElY + deltaY;
        
        console.log(`Neue Position wird gesetzt: Left=${newX}px, Top=${newY}px`);

        this.element.style.left = `${newX}px`;
        this.element.style.top = `${newY}px`;
        this.element.style.bottom = 'auto';
        this.element.style.right = 'auto';
    }

    onMouseUp() {
        console.log("--- DRAG CHECK 3: MOUSEUP ---");
        this.isDragging = false;
        document.removeEventListener('mousemove', this.onMouseMove);
        document.removeEventListener('mouseup', this.onMouseUp);
    }
}