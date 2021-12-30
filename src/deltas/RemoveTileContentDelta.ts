import { DeltaType } from "../enums/DeltaType.js";
import { Delta } from "./Delta.js";

export class RemoveTileContentDelta extends Delta {

    public constructor(
        private readonly _tileContentId: number
    ) {
        super(DeltaType.REMOVE_TILE_CONTENT);
    }

    public get tileContentId(): number {
        return this._tileContentId;
    }

    public static parse(input: any): RemoveTileContentDelta {
        if (typeof input !== "object") {
            throw new Error(`The given delta must be an object`);
        }
        if (input.type !== DeltaType.REMOVE_TILE_CONTENT) {
            throw new Error("The given object is not a remove tile content delta");
        }
        if (typeof input.tileContentId !== "number" || !isFinite(input.tileContentId) || input.tileContentId % 1 !== 0) {
            throw new Error("The tileContentId id of the remove tile content delta must be a finite integer number");
        }
        return new RemoveTileContentDelta(input.tileContentId);
    }
}