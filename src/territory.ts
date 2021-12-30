import { AddTileContentDelta } from "./deltas/AddTileContentDelta.js";
import { Delta } from "./deltas/Delta.js";
import { RemoveTileContentDelta } from "./deltas/RemoveTileContentDelta.js";
import { RotateHamsterDelta } from "./deltas/RotateHamsterDelta.js";
import { DeltaType } from "./enums/DeltaType.js";
import { HamsterDirection } from "./enums/HamsterDirection.js";
import { TileContentType } from "./enums/TileContentType.js";
import { Grain } from "./tileContents/Grain.js";
import { Hamster } from "./tileContents/Hamster.js";
import { TileContent } from "./tileContents/TileContent.js";
import { Wall } from "./tileContents/Wall.js";

class Territory {
    public readonly tileContents: Map<number, TileContent>;

    public constructor(
        private width: number,
        private height: number,
    ) {
        this.tileContents = new Map();
    }

    public proccessTerritoryDelta(delta: Delta) {
        switch (delta.type) {
            case DeltaType.ADD_TILE_CONTENT:
                const addDelta = delta as AddTileContentDelta;
                const addContent = this.tileContents.get(addDelta.tileContentId)
                if (addContent) {
                    addContent.location = addDelta.location;
                } else {
                    switch (addDelta.contentType) {
                        case TileContentType.GRAIN:
                            this.tileContents.set(addDelta.tileContentId, new Grain(addDelta.tileContentId, addDelta.location));
                            break;
                        case TileContentType.HAMSTER:
                            this.tileContents.set(addDelta.tileContentId, new Hamster(addDelta.tileContentId, HamsterDirection.EAST, addDelta.location));
                            break;
                        case TileContentType.WALL:
                            this.tileContents.set(addDelta.tileContentId, new Wall(addDelta.tileContentId, addDelta.location));
                            break;
                        default:
                            throw new Error("Unknown tile content type");
                    }
                }
                break;
            case DeltaType.REMOVE_TILE_CONTENT:
                const removeDelta = delta as RemoveTileContentDelta;
                const removeContent = this.tileContents.get(removeDelta.tileContentId)
                if (removeContent) {
                    removeContent.location = undefined;
                }
                break;
            case DeltaType.ROTATE_HAMSTER:
                const rotateDelta = delta as RotateHamsterDelta;
                const rotatateContent = this.tileContents.get(rotateDelta.tileContentId);
                if (rotatateContent) {
                    if (!(rotatateContent instanceof Hamster)) {
                        throw new Error("Can't rotate non hamster");
                    }
                    rotatateContent.direction = rotateDelta.direction;
                } else {
                    this.tileContents.set(rotateDelta.tileContentId, new Hamster(rotateDelta.tileContentId, rotateDelta.direction, undefined));
                }
                break;
        }
    }
}