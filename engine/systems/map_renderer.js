import { eventBus } from '../core/state_manager.js';
import { MAP_LOCATIONS } from '../../data/locations/map_locations.js';

/**
 * map_renderer.js
 * * Verwaltet das Rendern, Zoomen und Verschieben einer kachelbasierten Karte auf einem HTML-Canvas.
 */
export class MapRenderer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.tiles = {};
        this.tilesLoaded = false;
        this.playerTokenImage = null;
        this.player = null;
        this.locations = {};

        this.mapCols = 32;
        this.mapRows = 24;
        this.tileWidth = 128;
        this.tileHeight = 128;
        this.playerTokenSize = 16;

        this.scale = 0.5;
        this.minScale = 0.25;
        this.maxScale = 4.0;
        this.origin = { x: 0, y: 0 };
        
        this.isPanning = false;
        this.panStart = { x: 0, y: 0 };

        // Bind event handlers to the class instance to maintain 'this' context
        this.handleZoom = this.handleZoom.bind(this);
        this.handlePanStart = this.handlePanStart.bind(this);
        this.handlePanMove = this.handlePanMove.bind(this);
        this.handlePanEnd = this.handlePanEnd.bind(this);
        this.handleRightClick = this.handleRightClick.bind(this);
        this.handleMapClick = this.handleMapClick.bind(this);

        this.loadLocations();
        this.preloadPlayerToken();
        this.preloadTiles();
    }

    loadLocations() {
        this.locations = MAP_LOCATIONS;
    }

    preloadPlayerToken() {
        this.playerTokenImage = new Image();
        this.playerTokenImage.src = 'assets/images/maps/player_token.webp';
    }

    preloadTiles() {
        let loadedCount = 0;
        const totalTiles = this.mapCols * this.mapRows;
        for (let y = 1; y <= this.mapRows; y++) {
            for (let x = 1; x <= this.mapCols; x++) {
                const key = `${y}x${x}`;
                const tileImage = new Image();
                tileImage.src = `assets/images/tiles/map_${y}x${x}.webp`;
                this.tiles[key] = tileImage;
                tileImage.onload = () => {
                    loadedCount++;
                    if (loadedCount === totalTiles) {
                        this.tilesLoaded = true;
                        if (this.canvas) this.draw();
                    }
                };
            }
        }
    }

    init(container, player) {
        this.player = player;
        if (this.canvas && this.canvas.parentElement === container) {
            this.draw();
            return;
        };
        
        if (this.canvas) this.canvas.remove();

        this.canvas = document.createElement('canvas');
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.ctx = this.canvas.getContext('2d');
        container.appendChild(this.canvas);

        this.canvas.addEventListener('wheel', this.handleZoom);
        this.canvas.addEventListener('mousedown', this.handlePanStart);
        this.canvas.addEventListener('mousemove', this.handlePanMove);
        this.canvas.addEventListener('mouseup', this.handlePanEnd);
        this.canvas.addEventListener('mouseleave', this.handlePanEnd);
        this.canvas.addEventListener('contextmenu', this.handleRightClick);
        this.canvas.addEventListener('click', this.handleMapClick);

        this.centerOnPlayer(true);
        this.draw();
    }
    
    handleMapClick(e) {
        if (!this.player) return;

        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = mouseX / this.scale + this.origin.x;
        const worldY = mouseY / this.scale + this.origin.y;

        for (const key in this.locations) {
            const loc = this.locations[key];

            if (this.player.discoveredLocations.includes(loc.id)) {
                const textWidth = this.ctx.measureText(loc.name).width / this.scale;
                const textHeight = 24 / this.scale; 
                if (worldX >= loc.position.x - textWidth / 2 && worldX <= loc.position.x + textWidth / 2 &&
                    worldY >= loc.position.y - textHeight && worldY <= loc.position.y) {
                    
                    const dx = this.player.mapPosition.x - loc.position.x;
                    const dy = this.player.mapPosition.y - loc.position.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < loc.triggerRadius) {
                        eventBus.publish('ui:show_location_prompt', loc);
                    } else {
                        // Optional: Feedback, dass der Spieler zu weit weg ist.
                        // eventBus.publish('game:log', `Du bist zu weit von ${loc.name} entfernt.`);
                    }
                    return;
                }
            }
        }
    }

    draw() {
        if (!this.canvas || !this.ctx || !this.player) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.tilesLoaded) {
            this.ctx.fillStyle = 'white';
            this.ctx.font = '16px Cinzel';
            this.ctx.fillText('Lade Karte...', 20, 40);
            return;
        }
        
        for (let y = 1; y <= this.mapRows; y++) {
            for (let x = 1; x <= this.mapCols; x++) {
                const tile = this.tiles[`${y}x${x}`];
                if (tile && tile.complete) {
                    const drawX = ( (x-1) * this.tileWidth - this.origin.x) * this.scale;
                    const drawY = ( (y-1) * this.tileHeight - this.origin.y) * this.scale;
                    const drawWidth = this.tileWidth * this.scale + 1;
                    const drawHeight = this.tileHeight * this.scale + 1;
                    if (drawX + drawWidth > 0 && drawX < this.canvas.width && drawY + drawHeight > 0 && drawY < this.canvas.height) {
                        this.ctx.drawImage(tile, drawX, drawY, drawWidth, drawHeight);
                    }
                }
            }
        }
        
        this.ctx.font = `${24 * Math.sqrt(this.scale)}px Cinzel`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 5;

        for (const key in this.locations) {
            const loc = this.locations[key];
            
            if (this.player.discoveredLocations.includes(loc.id)) {
                this.ctx.fillStyle = '#fce8a8'; // Gold
            } else {
                this.ctx.fillStyle = '#ffffff'; // Weiß
            }

            const drawX = (loc.position.x - this.origin.x) * this.scale;
            const drawY = (loc.position.y - this.origin.y) * this.scale;
            this.ctx.fillText(loc.name, drawX, drawY);
        }
        this.ctx.shadowBlur = 0;

        if (this.playerTokenImage && this.playerTokenImage.complete) {
            const playerX = this.player.mapPosition.x;
            const playerY = this.player.mapPosition.y;
            const drawX = (playerX - this.origin.x) * this.scale;
            const drawY = (playerY - this.origin.y) * this.scale;
            const drawSize = this.playerTokenSize * this.scale;
            const centeredX = drawX - drawSize / 2;
            const centeredY = drawY - drawSize / 2;
            this.ctx.drawImage(this.playerTokenImage, centeredX, centeredY, drawSize, drawSize);
        }
    }
    
    centerOnPlayer(instant = false) {
        if (!this.player || !this.canvas) return;
        
        const targetX = this.player.mapPosition.x - (this.canvas.width / 2 / this.scale);
        const targetY = this.player.mapPosition.y - (this.canvas.height / 2 / this.scale);

        this.origin.x = targetX;
        this.origin.y = targetY;
        
        this.clampOrigin();
    }

    handleRightClick(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = mouseX / this.scale + this.origin.x;
        const worldY = mouseY / this.scale + this.origin.y;
        
        eventBus.publish('player:moveTo', { x: worldX, y: worldY });
    }

    clampOrigin() {
        if (!this.canvas) return;
        
        const worldWidth = this.mapCols * this.tileWidth;
        const worldHeight = this.mapRows * this.tileHeight;
        const viewWidthInWorld = this.canvas.width / this.scale;
        const viewHeightInWorld = this.canvas.height / this.scale;

        const maxOriginX = worldWidth - viewWidthInWorld;
        const maxOriginY = worldHeight - viewHeightInWorld;

        const minX = maxOriginX < 0 ? maxOriginX / 2 : 0;
        const minY = maxOriginY < 0 ? maxOriginY / 2 : 0;
        const maxX = maxOriginX < 0 ? minX : maxOriginX;
        const maxY = maxOriginY < 0 ? minY : maxOriginY;

        this.origin.x = Math.max(minX, Math.min(this.origin.x, maxX));
        this.origin.y = Math.max(minY, Math.min(this.origin.y, maxY));
    }
    
    handleZoom(e) {
        e.preventDefault();
        const zoomIntensity = 0.1;
        const scroll = e.deltaY < 0 ? 1 : -1;
        const zoom = Math.exp(scroll * zoomIntensity);
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const worldX = mouseX / this.scale + this.origin.x;
        const worldY = mouseY / this.scale + this.origin.y;
        this.scale *= zoom;
        this.scale = Math.max(this.minScale, Math.min(this.maxScale, this.scale));
        this.origin.x = worldX - mouseX / this.scale;
        this.origin.y = worldY - mouseY / this.scale;
        this.clampOrigin();
        this.draw();
    }
    
    handlePanStart(e) {
        if (e.button !== 0) return;
        eventBus.publish('player:stopMove');
        this.isPanning = true;
        this.panStart.x = e.clientX;
        this.panStart.y = e.clientY;
    }
    
    handlePanMove(e) {
        if (!this.isPanning) return;
        const deltaX = e.clientX - this.panStart.x;
        const deltaY = e.clientY - this.panStart.y;
        this.origin.x -= deltaX / this.scale;
        this.origin.y -= deltaY / this.scale;
        this.clampOrigin();
        this.panStart.x = e.clientX;
        this.panStart.y = e.clientY;
        this.draw();
    }
    
    handlePanEnd() {
        this.isPanning = false;
    }
}