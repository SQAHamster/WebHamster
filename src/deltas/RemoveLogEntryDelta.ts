import { DeltaType } from "../enums/DeltaType.js";
import { Delta } from "./Delta.js";

export class RemoveLogEntryDelta extends Delta {

    public constructor(
    ) {
        super(DeltaType.REMOVE_LOG_ENTRY);
    }

    public static parse(input: any): RemoveLogEntryDelta {
        if (typeof input !== "object") {
            throw new Error(`The given delta must be an object`);
        }
        if (input.type !== DeltaType.REMOVE_LOG_ENTRY) {
            throw new Error("The given object is not a remove log entry delta");
        }
        return new RemoveLogEntryDelta();
    }
}