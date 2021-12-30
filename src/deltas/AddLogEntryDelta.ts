import { DeltaType } from "../enums/DeltaType.js";
import { Delta } from "./Delta.js";

export class AddLogEntryDelta extends Delta {

    public constructor(
        private readonly _message: string,
        private readonly _hamsterId: number | undefined
    ) {
        super(DeltaType.ADD_LOG_ENTRY);
    }

    public get message(): string {
        return this._message;
    }

    public get hamsterId(): number | undefined {
        return this._hamsterId;
    }

    public static parse(input: any): AddLogEntryDelta {
        if (typeof input !== "object") {
            throw new Error(`The given delta must be an object`);
        }
        if (input.type !== DeltaType.ADD_LOG_ENTRY) {
            throw new Error("The given object is not an add log entry delta");
        }
        if (typeof input.message !== "string") {
            throw new Error("A add log entry delta must have a message");
        }
        if (typeof input.hamsterId !== "undefined" && (typeof input.hamsterId !== "number" || !isFinite(input.hamsterId) || input.hamsterId % 1 !== 0)) {
            throw new Error("The hamster id of the add log entry delta must be a finite integer number");
        }
        return new AddLogEntryDelta(input.message, input.hamsterId);
    }
}