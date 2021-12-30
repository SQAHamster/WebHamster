import { AddErrorLogEntryDelta } from "../deltas/AddErrorLogEntryDelta.js";
import { AddLogEntryDelta } from "../deltas/AddLogEntryDelta.js";
import { Delta } from "../deltas/Delta.js";
import { DeltaListener } from "../deltas/DeltaListener.js";
import { DeltaType } from "../enums/DeltaType.js";
import { ColorProvider } from "./entityProviders/ColorProvider.js";
import { HamsterProvider } from "./entityProviders/HamsterProvider.js";

export class GameLogGui implements DeltaListener {

    private readonly allLogEntries: HTMLDivElement[] = [];

    constructor(private readonly logContainer: Element, private readonly hamsterProvider: HamsterProvider) {

    }

    newDelta(delta: Delta): void {
        if (delta.type === DeltaType.ADD_LOG_ENTRY) {
            const newLogEntry = document.createElement("div");
            newLogEntry.className = "hamsterLogEntry";
            const logEntryText = document.createElement("div");
            logEntryText.className = "hamsterLogEntryText";
            logEntryText.innerText = (delta as AddLogEntryDelta).message;
            const hamsterId = (delta as AddLogEntryDelta).hamsterId
            if (typeof hamsterId === "number") {
                const color = this.hamsterProvider.getColor(hamsterId.toString(10));
                if (color) {
                    logEntryText.style.color = color;
                }
            }
            if (delta instanceof AddErrorLogEntryDelta) {
                newLogEntry.style.border = "2px solid red";
                const errorSymbolContainer = document.createElement("div");
                errorSymbolContainer.className = "hamsterLogError";
                const errorSymbol = document.createElement("img");
                errorSymbol.src="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='red' class='bi bi-exclamation-triangle-fill' viewBox='0 0 16 16'><path d='M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z'/></svg>";
                errorSymbolContainer.append(errorSymbol);
                newLogEntry.append(errorSymbolContainer);
            }
            newLogEntry.append(logEntryText);
            this.logContainer.append(newLogEntry);
            this.allLogEntries.push(newLogEntry);
        } else if (delta.type === DeltaType.REMOVE_LOG_ENTRY) {
            this.allLogEntries.pop()?.remove();
        }
    }

    reset(): void {
        while(this.logContainer.firstChild) {
            this.logContainer.firstChild.remove();
        }
        this.allLogEntries.splice(0,this.allLogEntries.length);
    }

}