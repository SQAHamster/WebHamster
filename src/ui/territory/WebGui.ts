import { AddTileContentDelta } from "../../deltas/AddTileContentDelta.js";
import { Delta } from "../../deltas/Delta.js";
import { DeltaListener } from "../../deltas/DeltaListener.js";
import { NewTerritoryDelta } from "../../deltas/NewTerritoryDelta.js";
import { RemoveTileContentDelta } from "../../deltas/RemoveTileContentDelta.js";
import { RotateHamsterDelta } from "../../deltas/RotateHamsterDelta.js";
import { DeltaType } from "../../enums/DeltaType.js";
import { TileContentType } from "../../enums/TileContentType.js";
import { EntityProvider } from "../entityProviders/EntityProvider.js";

export class WebGui implements DeltaListener {

    private readonly grid: GuiTile[][];
    private readonly rows: HTMLDivElement[];
    private readonly tileContents: Map<number, { element: HTMLElement, isStackable: boolean }>;
    private readonly knownEntities: Set<HTMLElement>;
    private readonly entityProviders: Map<TileContentType, EntityProvider>;

    constructor(
        private readonly container: Element,
        private readonly maxGrainsVisible: number
    ) {
        this.entityProviders = new Map();
        this.knownEntities = new Set();
        this.container = container;
        this.container.classList.add("territory");
        this.grid = [];
        this.rows = [];
        this.tileContents = new Map();
        this.reset();
    }

    public registerEntityProvider(type: TileContentType, provider: EntityProvider) {
        this.entityProviders.set(type, provider);
    }

    public deleteEntityProvider(type: TileContentType) {
        this.entityProviders.delete(type);
    }

    public reset(): void {
        this.tileContents.clear();
        this.knownEntities.clear();
        while (this.container.firstElementChild) {
            this.container.firstElementChild.remove();
        }
        this.container.classList.remove("gameRunning");
        this.container.classList.add("noGameRunning");
        this.grid.splice(0, this.grid.length);
        this.rows.splice(0, this.rows.length);
        this.entityProviders.forEach(provider => {
            provider.reset();
        });
    }

    public newDelta(delta: Delta) {
        switch (delta.type) {
            case DeltaType.ADD_TILE_CONTENT:
                const addDelta = delta as AddTileContentDelta;
                this.addTileContent(addDelta);
                break;
            case DeltaType.NEW_TERRITORY:
                const newTerrDelta = delta as NewTerritoryDelta;
                this.reinitTerritory(newTerrDelta.width, newTerrDelta.height, true);
                break;
            case DeltaType.REMOVE_TILE_CONTENT:
                const removeDelta = delta as RemoveTileContentDelta;
                this.removeTileContent(removeDelta);
                break;
            case DeltaType.ROTATE_HAMSTER:
                const rotateDelta = delta as RotateHamsterDelta;
                this.rotateHamster(rotateDelta);
                break;
        }
    }

    private addTileContent(delta: AddTileContentDelta) {
        let currentTileContent = this.tileContents.get(delta.tileContentId);
        const location = delta.location;
        if (currentTileContent && currentTileContent.element) {
            currentTileContent.element.remove();
        } else {
            const provider = this.entityProviders.get(delta.contentType);
            if (!provider) {
                throw new Error(`No provider set for entity type ${delta.contentType}`);
            }
            currentTileContent = provider.getEntity(delta.tileContentId.toString(10));
            if (!currentTileContent || !currentTileContent.element) {
                throw new Error("Entity provider didn't provide a proper element");
            }
            if (this.knownEntities.has(currentTileContent.element)) {
                throw new Error("This element was already used. Please use a different instance");
            }
            this.knownEntities.add(currentTileContent.element);
            this.tileContents.set(delta.tileContentId, currentTileContent);
        }
        const tile = this.grid[location.y][location.x];
        if (currentTileContent.isStackable) {
            if (tile.grainContainer.children.length >= this.maxGrainsVisible) {
                tile.tileContent.append(tile.plusSymbol);
            } else {
                tile.plusSymbol.remove();
                tile.grainContainer.append(currentTileContent.element);
            }
        } else {
            tile.tileContent.append(currentTileContent.element);
        }
    }

    private removeTileContent(delta: RemoveTileContentDelta) {
        let currentTileContent = this.tileContents.get(delta.tileContentId);
        if (currentTileContent && currentTileContent.element) {
            currentTileContent.element.remove();
        }
    }

    private rotateHamster(delta: RotateHamsterDelta) {
        let hamster = this.tileContents.get(delta.tileContentId);
        if (!hamster || !hamster.element) {
            hamster = this.entityProviders.get(TileContentType.HAMSTER)?.getEntity(delta.tileContentId.toString(10));
            if (!hamster || !hamster.element) {
                throw new Error("Entity provider didn't provide a proper hamster");
            }
            if (this.knownEntities.has(hamster.element)) {
                throw new Error("This element was already used. Please use a different instance");
            }
            this.knownEntities.add(hamster.element);
            this.tileContents.set(delta.tileContentId, hamster);
        }
        hamster.element.style.transform = "rotate(" + ((DirectionValues[delta.direction] - 1) * 90) + "deg)";
    }

    private reinitTerritory(width: number, height: number, fullReinit?: boolean): void {
        this.container.classList.add("gameRunning");
        this.container.classList.remove("noGameRunning");
        this.tileContents.clear();
        this.knownEntities.clear();
        const oldHeight = this.grid.length;
        if (fullReinit || !oldHeight || oldHeight <= 0 || this.grid.some(row => row.length <= 0)) {
            while (this.container.firstElementChild) {
                this.container.firstElementChild.remove();
            }
            this.grid.splice(0, this.grid.length);
            this.rows.splice(0, this.rows.length);
            for (var y = 0; y < height; y++) {
                this.grid[y] = [];
                this.rows[y] = document.createElement("div");
                this.rows[y].classList.add("tileRow");
                this.container.append(this.rows[y]);
                for (var x = 0; x < width; x++) {
                    this.grid[y][x] = new GuiTile(this.rows[y]);
                }
            }
        } else {
            var currHeight = oldHeight;
            if (currHeight > height) {
                this.grid.splice(height, oldHeight - height);
                this.rows.splice(height, oldHeight - height);
                while (currHeight > height && this.container.lastElementChild) {
                    this.container.lastElementChild.remove();
                    currHeight--;
                }
            }
            for (var y = currHeight; y < height; y++) {
                this.grid[y] = [];
                this.rows[y] = document.createElement("div");
                this.rows[y].classList.add("tileRow");
                this.container.append(this.rows[y]);
                for (var x = 0; x < width; x++) {
                    this.grid[y][x] = new GuiTile(this.rows[y]);
                }
            }
            for (var y = 0; y < currHeight; y++) {
                for (var x = 0; x < width && x < this.grid[y].length; x++) {
                    this.grid[y][x].tileContent.childNodes.forEach(element => {
                        if (element != this.grid[y][x].grainContainer) {
                            element.remove();
                        }
                    });
                }
                if (this.grid[y].length > width) {
                    var currWidth = this.grid[y].length;
                    this.grid[y].splice(width, this.grid[y].length - width);
                    while (currWidth > width && this.rows[y].lastElementChild) {
                        this.rows[y].lastElementChild?.remove();
                        currWidth--;
                    }
                } else {
                    for (var x = this.grid[y].length; x < width; x++) {
                        this.grid[y][x] = new GuiTile(this.rows[y]);
                    }
                }
            }
        }
    }
}

class GuiTile {
    readonly parentRow: HTMLDivElement;
    readonly tile: HTMLDivElement;
    readonly tileContent: HTMLDivElement;
    readonly grainContainer: HTMLDivElement;
    readonly plusSymbol: HTMLDivElement;

    constructor(row: HTMLDivElement) {
        this.parentRow = row;
        this.tile = document.createElement("div");
        this.tile.classList.add("tile");
        this.parentRow.append(this.tile);
        this.tileContent = document.createElement("div");
        this.tileContent.classList.add("tileContent");
        this.tile.append(this.tileContent);
        this.grainContainer = document.createElement("div");
        this.grainContainer.className = "d-flex flex-wrap grainContainer";
        this.tileContent.append(this.grainContainer);
        this.plusSymbol = document.createElement("div");
        this.plusSymbol.classList.add("plusImgContainer");
    }
}

const DirectionValues = {
    NORTH: 0,
    EAST: 1,
    SOUTH: 2,
    WEST: 3,
};

