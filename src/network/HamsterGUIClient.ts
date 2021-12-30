import { StateChangeEventType } from "../enums/StateChangeEventTypes.js";
import { NewGameListener } from "../utils/NewGameListener.js";
import { StateChangeEventListener } from "../utils/StateChangeEventListener.js";
import { StatusReceiver } from "../utils/StatusReceiver.js";

export abstract class HamsterGUIClient {
    protected readonly listeners: Map<StatusReceiver, { gameId: string, persistand: boolean, listener: StateChangeEventListener }>;
    protected readonly gameHasListeners: Set<string>;
    protected readonly newGameListeners: Set<NewGameListener>;

    constructor(
    ) {
        this.newGameListeners = new Set();
        this.listeners = new Map();
        this.gameHasListeners = new Set();
    }

    public addStatusReceiver(receiver: StatusReceiver, hamsterGameId: string, persistand?: boolean): void {
        this.updateStatusReceiver(receiver, hamsterGameId, persistand);
    }

    public removeStatusReceiver(receiver: StatusReceiver): void {
        if (this.listeners.has(receiver)) {
            receiver.unionInputInterface.off(StateChangeEventType.all, this.listeners.get(receiver)?.listener ?? (() => { }));
        }
        this.listeners.delete(receiver);
    }

    public updateStatusReceiver(receiver: StatusReceiver, hamsterGameId: string, persistand?: boolean): void {
        if (this.listeners.has(receiver)) {
            receiver.unionInputInterface.off(StateChangeEventType.all, this.listeners.get(receiver)?.listener ?? (() => { }));
        }
        receiver.reset();
        const listener = this.gameStateChangesEventListener.bind(this, hamsterGameId);
        this.listeners.set(receiver, { gameId: hamsterGameId, persistand: persistand ?? false, listener: listener });
        receiver.unionInputInterface.on(StateChangeEventType.all, listener);
        this.gameHasListeners.add(hamsterGameId);
    }

    public addNewGameListener(listener: NewGameListener): void {
        this.newGameListeners.add(listener);
    }

    public removeNewGameListener(listener: NewGameListener): void {
        this.newGameListeners.delete(listener);
    }

    protected abstract gameStateChangesEventListener(gameId: string, event: StateChangeEventType, ...params: any): void;

    abstract forceUpdate(hamsterGameId?: string): void;
    abstract start(): void;
    abstract stop(): void;
    readonly abstract currentlyRunningGames: string[];
}