import { DeltaType } from "../enums/DeltaType.js";
import { TileContentType } from "../enums/TileContentType.js";
import { Position } from "../utils/Position.js";
import { Delta } from "./Delta.js";

export class AddTileContentDelta extends Delta {

    public constructor(
        private readonly _tileContentId: number,
        private readonly _location: Position,
        private readonly _contentType: TileContentType
    ) {
        super(DeltaType.ADD_TILE_CONTENT);
    }

    public get tileContentId(): number {
        return this._tileContentId
    }

    public get location(): Position {
        return this._location;
    }

    public get contentType(): TileContentType {
        return this._contentType
    }

    public static parse(input: any): AddTileContentDelta {
        if (typeof input !== "object") {
            throw new Error(`The given delta must be an object`);
        }
        if (input.type !== DeltaType.ADD_TILE_CONTENT) {
            throw new Error("The given object is not an add tile content delta");
        }
        if (typeof input.tileContentId !== "number" || !isFinite(input.tileContentId) || input.tileContentId % 1 !== 0) {
            throw new Error("The contentId id of the add tile content delta must be a finite integer number");
        }
        if (typeof input.contentType !== "string" || !(input.contentType in TileContentType)) {
            throw new Error("The content type of the add tile content delta must be a valid tile content type");
        }
        const loc = new Position(input.location);
        return new AddTileContentDelta(input.tileContentId, loc, input.contentType);
    }
}