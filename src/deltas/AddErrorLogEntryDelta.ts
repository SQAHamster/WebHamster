import { AddLogEntryDelta } from "./AddLogEntryDelta.js";

export class AddErrorLogEntryDelta extends AddLogEntryDelta {
    public constructor(
        _message: string,
        _hamsterId?: number | undefined
    ) {
        super(_message, _hamsterId);
    }
}