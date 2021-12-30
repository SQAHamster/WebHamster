import { DeltaListener } from "./deltas/DeltaListener.js";
import { GameMode } from "./enums/GameMode.js";
import { InputMode } from "./enums/InputMode.js";
import { InputInterface } from "./inputInterface/InputInterface.js";
import { UnionInputInterface } from "./inputInterface/UnionInputInterface.js";
import { GameState } from "./messages/GameState.js";
import { StatusReceiver } from "./utils/StatusReceiver.js";

export class HamsterGame implements StatusReceiver {
    private lastDeltaId: number;
    private listeners: Set<DeltaListener>;
    private readonly _unionInputInterface: UnionInputInterface;
    private lastInputId: number | undefined;
    private readonly controlsActive: {
        resume: boolean,
        pause: boolean,
        undo: boolean,
        redo: boolean
    };
    private lastGameMode: GameMode | undefined;
    private isRunningMode: boolean | undefined;

    public constructor() {
        this.lastDeltaId = -1;
        this.listeners = new Set();
        this._unionInputInterface = new UnionInputInterface();
        this.controlsActive = {
            resume: false,
            pause: false,
            undo: false,
            redo: false
        };
        this.reset();
    }

    public getLastDeltaId(): number {
        return this.lastDeltaId;
    }

    public addDeltaListener(listener: DeltaListener): void {
        this.listeners.add(listener);
    }

    public removeDeltaListener(listener: DeltaListener): void {
        this.listeners.delete(listener);
    }

    public reset(): void {
        console.log("Game reset");
        this.lastDeltaId = -1;
        this.lastInputId = undefined;
        this._unionInputInterface.cancelDialogs();
        this._unionInputInterface.resumeActive = false;
        this.controlsActive.resume = false;
        this._unionInputInterface.pauseActive = false;
        this.controlsActive.pause = false;
        this._unionInputInterface.undoActive = false;
        this.controlsActive.undo = false;
        this._unionInputInterface.redoActive = false;
        this.controlsActive.redo = false;
        this.isRunningMode = undefined;
        this.lastGameMode = undefined;
        this.listeners.forEach(listener => {
            listener.reset();
        });
    }

    public update(status: GameState): void {
        const currInputId = status.inputMessage?.inputId;
        if (currInputId !== this.lastInputId) {
            this._unionInputInterface.cancelDialogs();
            if (status.inputMessage && typeof currInputId === "number") {
                if (status.inputMessage.mode === InputMode.CONFIRM_ALERT) {
                    this._unionInputInterface.showAlert(status.inputMessage.message + "\n" + status.inputMessage.type ?? "" + "\n" + status.inputMessage.stacktrace ?? "", currInputId).then(response => {
                        if (response === true) {
                            this._unionInputInterface.input(currInputId, "OK");
                        }
                    }).catch((err) => {
                        console.error("Error on input:", err);
                        this._unionInputInterface.input(currInputId, undefined);
                    });
                } else if (status.inputMessage.mode === InputMode.READ_STRING) {
                    this._unionInputInterface.getStringInput(status.inputMessage.message, status.inputMessage.inputId).then(response => {
                        if (typeof response === "string") {
                            this._unionInputInterface.input(currInputId, response);
                        } else if (response === false) {
                            this._unionInputInterface.input(currInputId, undefined);
                        }
                    }).catch((err) => {
                        console.error("Error on input:", err);
                        this._unionInputInterface.input(currInputId, undefined);
                    });
                } else if (status.inputMessage.mode === InputMode.READ_INT) {
                    this._unionInputInterface.getIntegerInput(status.inputMessage.message, status.inputMessage.inputId).then(response => {
                        if (typeof response === "number") {
                            this._unionInputInterface.input(currInputId, response);
                        } else if (response === false) {
                            this._unionInputInterface.input(currInputId, undefined);
                        }
                    }).catch((err) => {
                        console.error("Error on input:", err);
                        this._unionInputInterface.input(currInputId, undefined);
                    });
                }
            }
            this.lastInputId = currInputId;
        }
        if (status.mode !== this.lastGameMode) {
            if (status.mode === GameMode.INITIALIZING || status.mode === GameMode.RUNNING) {
                this.isRunningMode = true;
                this._unionInputInterface.resumeActive = false;
                this.controlsActive.resume = false;
                this._unionInputInterface.pauseActive = true;
                this.controlsActive.pause = true;
                this._unionInputInterface.undoActive = false;
                this.controlsActive.undo = false;
                this._unionInputInterface.redoActive = false;
                this.controlsActive.redo = false;
            } else if (status.mode === GameMode.PAUSED) {
                this.isRunningMode = false;
                this._unionInputInterface.resumeActive = true;
                this.controlsActive.resume = true;
                this._unionInputInterface.pauseActive = false;
                this.controlsActive.pause = false;
            } else if (status.mode === GameMode.ABORTED || status.mode === GameMode.STOPPED) {
                this.isRunningMode = false;
                this._unionInputInterface.resumeActive = false;
                this.controlsActive.resume = false;
                this._unionInputInterface.pauseActive = false;
                this.controlsActive.pause = false;
            }
            this.lastGameMode = status.mode;
        }
        if (!this.isRunningMode) {
            if (status.canUndo !== this.controlsActive.undo) {
                this._unionInputInterface.undoActive = status.canUndo;
                this.controlsActive.undo = status.canUndo;
            }
            if (status.canRedo !== this.controlsActive.redo) {
                this._unionInputInterface.redoActive = status.canRedo;
                this.controlsActive.redo = status.canRedo;
            }
        }
        if (status.deltas.length > 0) {
            if (status.firstDeltaId > this.lastDeltaId + 1) {
                throw new Error(`Missing deltas ${this.lastDeltaId + 1} to ${status.firstDeltaId}!`);
            }
            status.deltas.filter((d, i) => i + status.firstDeltaId > this.lastDeltaId).forEach(d => {
                this.listeners.forEach(listener => {
                    listener.newDelta(d);
                });
            });
            this.lastDeltaId = status.firstDeltaId + status.deltas.length - 1;
        }
    }

    public addInputInterface(inputInterface: InputInterface): void {
        this._unionInputInterface.addInterface(inputInterface);
    }

    public removeInputInterface(inputInterface: InputInterface): void {
        this._unionInputInterface.removeInterface(inputInterface);
    }

    public get unionInputInterface(): InputInterface {
        return this._unionInputInterface;
    }
}

