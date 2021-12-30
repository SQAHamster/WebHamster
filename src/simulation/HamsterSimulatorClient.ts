import { GameHistory, LogEntryType } from "../GameHistory.js";
import { HamsterGUIClient } from "../network/HamsterGUIClient.js";
import { StateChangeEventType } from "../enums/StateChangeEventTypes.js";
import { HamsterSimulator } from "./HamsterSimulator.js";
import { GameState } from "../messages/GameState.js";

export class HamsterSimulatorClient extends HamsterGUIClient {
    private readonly runningGames: Map<string, HamsterSimulator>;

    constructor(
    ) {
        super();
        this.runningGames = new Map();
    }

    public addGame(gameId: string, gameHistory: GameHistory) {
        const existingGame = this.runningGames.get(gameId);
        if (existingGame) {
            existingGame.pause();
        }
        const filteredHistory: GameHistory = {
            ...gameHistory,
            logEntries: gameHistory.logEntries.filter(entry => entry.type != LogEntryType.INITIAL || (!!entry.errorMessage))
        }
        const newGame = new HamsterSimulator(gameHistory, this.gameStateChanged.bind(this, gameId), this.gameReset.bind(this, gameId));
        this.runningGames.set(gameId, newGame);
        this.newGameListeners.forEach(newGameListener => {
            newGameListener.newGame(gameId, this);
        });
        newGame.reset();
    }

    public clearGames() {
        for (const [gameId, game] of this.runningGames) {
            game.pause();
        }
        this.runningGames.clear();
    }

    public get currentlyRunningGames(): string[] {
        return [...this.runningGames.keys()];
    }

    protected gameStateChangesEventListener(gameId: string, event: StateChangeEventType, ...params: any): void {
        const existingGame = this.runningGames.get(gameId);
        if (existingGame) {
            switch (event) {
                case StateChangeEventType.resume:
                    existingGame.resume();
                    break;
                case StateChangeEventType.pause:
                    existingGame.pause();
                    break;
                case StateChangeEventType.undo:
                    existingGame.stepBackward();
                    break;
                case StateChangeEventType.redo:
                    existingGame.stepForward();
                    break;
                case StateChangeEventType.speedChange:
                    if (arguments.length >= 3 && typeof params[0] === "number" && params[0] >= 0 && params[0] <= 10) {
                        existingGame.setSpeed(params[0]);
                    } else {
                        throw new Error("Illegal speed");
                    }
                    break;
                case StateChangeEventType.abort:
                    existingGame.reset();
            }
        }
    }

    private gameReset(gameId: string) {
        this.listeners.forEach((listenerData, statusReceiver) => {
            if (gameId === listenerData.gameId) {
                statusReceiver.reset();
            }
        });
    }

    private gameStateChanged(gameId: string, newState: GameState) {
        this.listeners.forEach((listenerData, statusReceiver) => {
            if (gameId === listenerData.gameId) {
                const nextDeltaId = statusReceiver.getLastDeltaId() + 1
                const startDeltaId = nextDeltaId - newState.firstDeltaId
                statusReceiver.update(new GameState(newState.deltas.slice(startDeltaId), newState.mode, newState.inputMessage, newState.canUndo, newState.canRedo, newState.speed, nextDeltaId));
            }
        });
    }

    forceUpdate(hamsterGameId?: string): void {
        throw new Error("Method not implemented.");
    }
    start(): void {
        //throw new Error("Method not implemented.");
    }
    stop(): void {
        throw new Error("Method not implemented.");
    }

}