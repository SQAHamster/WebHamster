import { DeltaType } from "../enums/DeltaType.js";
import { AddLogEntryDelta } from "./AddLogEntryDelta.js";
import { AddTileContentDelta } from "./AddTileContentDelta.js";
import { Delta } from "./Delta.js";
import { NewTerritoryDelta } from "./NewTerritoryDelta.js";
import { RemoveLogEntryDelta } from "./RemoveLogEntryDelta.js";
import { RemoveTileContentDelta } from "./RemoveTileContentDelta.js";
import { RotateHamsterDelta } from "./RotateHamsterDelta.js";

export class DeltaParser {
    public static parse(input: any): Delta {
        if (typeof input !== "object") {
            throw new Error("The delta needs to be an object");
        }
        if (typeof input.type !== "string" || !(input.type in DeltaType)) {
            throw new Error("Type of delta must be set");
        }
        switch (input.type) {
            case DeltaType.ADD_LOG_ENTRY:
                return AddLogEntryDelta.parse(input);
            case DeltaType.ADD_TILE_CONTENT:
                return AddTileContentDelta.parse(input);
            case DeltaType.NEW_TERRITORY:
                return NewTerritoryDelta.parse(input);
            case DeltaType.REMOVE_LOG_ENTRY:
                return RemoveLogEntryDelta.parse(input);
            case DeltaType.REMOVE_TILE_CONTENT:
                return RemoveTileContentDelta.parse(input);
            case DeltaType.ROTATE_HAMSTER:
                return RotateHamsterDelta.parse(input);
            default:
                throw new Error("How did this happen?! TS seems to not properly check enum values\nUnknown delta type");
        }
    }
}