import { DeltaType } from "../enums/DeltaType.js";
import { HamsterDirection } from "../enums/HamsterDirection.js";
import { Delta } from "./Delta.js";

export class RotateHamsterDelta extends Delta {

    public constructor(
        private readonly _tileContentId: number,
        private readonly _direction: HamsterDirection
    ) {
        super(DeltaType.ROTATE_HAMSTER);
    }

    public get tileContentId(): number {
        return this._tileContentId
    }

    public get direction(): HamsterDirection {
        return this._direction;
    }

    public static parse(input: any): RotateHamsterDelta {
        if (typeof input !== "object") {
            throw new Error(`The given delta must be an object`);
        }
        if (input.type !== DeltaType.ROTATE_HAMSTER) {
            throw new Error("The given object is not a rotate hamster delta");
        }
        if (typeof input.tileContentId !== "number" || !isFinite(input.tileContentId) || input.tileContentId % 1 !== 0) {
            throw new Error("The tileContentId id of the remove tile content delta must be a finite integer number");
        }
        if (typeof input.direction !== "string" || !(input.direction in HamsterDirection)) {
            throw new Error("The direction to turn the master to must be a valid direction");
        }
        return new RotateHamsterDelta(input.tileContentId, input.direction);
    }
}