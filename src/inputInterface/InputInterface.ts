import { StateChangeEventType } from "../enums/StateChangeEventTypes.js";
import { StateChangeEventListener } from "../utils/StateChangeEventListener.js";

export abstract class InputInterface {

    private readonly listeners: Map<StateChangeEventType, Set<StateChangeEventListener>>;

    public constructor() {
        this.listeners = new Map();
    }

    protected resume(): void {
        this.emitEvent(StateChangeEventType.resume);
    }

    protected pause(): void {
        this.emitEvent(StateChangeEventType.pause);
    }

    protected abort(): void {
        this.emitEvent(StateChangeEventType.abort);
    }

    protected undo(): void {
        this.emitEvent(StateChangeEventType.undo);
    }

    protected redo(): void {
        this.emitEvent(StateChangeEventType.redo);
    }

    protected changeSpeed(speed: number): void {
        this.emitEvent(StateChangeEventType.speedChange, speed);
    }

    public input(inputId: number, userInput: number | string | undefined): void {
        this.emitEvent(StateChangeEventType.inputResponse, inputId, userInput);
    }

    /**
     * 
     * @param message 
     * @param inputId 
     * @returns The string if it was entered, false if popup was aborted, undefined to ignore (DON'T LET THE USER IGNORE), reject on error
     */
    public abstract getStringInput(message: string, inputId: number): Promise<string | false | undefined>;

    /**
     * 
     * @param message 
     * @param inputId 
     * @returns The string if it was entered, false if popup was aborted, undefined to ignore (DON'T LET THE USER IGNORE), reject on error
     */
    public abstract getIntegerInput(message: string, inputId: number): Promise<number | false | undefined>;

    /**
     * 
     * @param message 
     * @param inputId 
     * @returns Return true when the alert was closed, undefined to ignore (DON'T LET THE USER IGNORE)
     */
    public abstract showAlert(message: string, inputId: number): Promise<true | undefined>;

    public abstract cancelDialogs(): void;

    public abstract set resumeActive(isActive: boolean);
    public abstract set pauseActive(isActive: boolean);
    public abstract set undoActive(isActive: boolean);
    public abstract set redoActive(isActive: boolean);

    protected emitEvent(event: StateChangeEventType, ...params: any) {
        this.listeners.get(event)?.forEach(handler => {
            handler(event, ...params);
        });
    }

    public on(event: StateChangeEventType, handler: StateChangeEventListener): void {
        if (event !== StateChangeEventType.all) {
            let currentHandlers = this.listeners.get(event);
            if (!currentHandlers) {
                currentHandlers = new Set();
                this.listeners.set(event, currentHandlers);
            }
            currentHandlers.add(handler);
        } else {
            for (const evt in StateChangeEventType) {
                if (evt !== StateChangeEventType.all && evt in StateChangeEventType) {
                    this.on(evt as any, handler);
                }
            }
        }
    }

    public off(event: StateChangeEventType, handler: StateChangeEventListener): void {
        if (event !== StateChangeEventType.all) {
            const currentHandlers = this.listeners.get(event);
            if (currentHandlers) {
                currentHandlers.delete(handler);
            }
        } else {
            this.listeners.forEach(handlers => {
                handlers.delete(handler);
            });
        }
    }
}