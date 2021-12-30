import { DeltaType } from "../enums/DeltaType.js";
import { Delta } from "./Delta.js";

export class NewTerritoryDelta extends Delta {

    public constructor(
        private readonly _width: number,
        private readonly _height: number
    ) {
        super(DeltaType.NEW_TERRITORY);
    }

    public get width(): number {
        return this._width;
    }

    public get height(): number {
        return this._height;
    }

    public static parse(input: any): NewTerritoryDelta {
        if (typeof input !== "object") {
            throw new Error(`The given delta must be an object`);
        }
        if (input.type !== DeltaType.NEW_TERRITORY) {
            throw new Error("The given object is not a new territory delta");
        }
        if (typeof input.width !== "number" || !isFinite(input.width) || input.width % 1 !== 0) {
            throw new Error("The width of the new territory must be a finite integer number");
        }
        if (typeof input.height !== "number" || !isFinite(input.height) || input.height % 1 !== 0) {
            throw new Error("The height of the new territory must be a finite integer number");
        }
        return new NewTerritoryDelta(input.width, input.height);
    }
}