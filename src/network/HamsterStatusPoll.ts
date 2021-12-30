import { StateChangeEventType } from "../enums/StateChangeEventTypes.js";
import { GameState } from "../messages/GameState.js";
import { NewGameListener } from "../utils/NewGameListener.js";
import { StateChangeEventListener } from "../utils/StateChangeEventListener.js";
import { StatusReceiver } from "../utils/StatusReceiver.js";
import { HamsterGUIClient } from "./HamsterGUIClient.js";

export class HamsterStatusPoll extends HamsterGUIClient {
    private static readonly gamesListTimerDelay: number = 750;
    private static readonly minPollInterval: number = 100;

    private readonly runningGames: Map<string, number | true>;
    private getRunningGamesTimer: number | undefined;
    private stopPollSmallerThan: number = 0;

    private readonly serverBaseUrl: string;

    constructor(
        url?: string
    ) {
        super();
        this.runningGames = new Map();
        const parsedUrl = new URL(url ?? "http://localhost:8080");
        parsedUrl.search = "";
        this.serverBaseUrl = parsedUrl.toString().replace(/\/$/g, "");
    }

    public get currentlyRunningGames(): string[] {
        return [...this.runningGames.keys()];
    }

    public updateStatusReceiver(receiver: StatusReceiver, hamsterGameId: string, persistand?: boolean): void {
        super.updateStatusReceiver(receiver, hamsterGameId, persistand);
        if (typeof this.runningGames.get(hamsterGameId) === "boolean") {
            this.loadGameTimer(this.stopPollSmallerThan, hamsterGameId);
        }
    }

    public forceUpdate(hamsterGameId?: string): void {
        if (hamsterGameId && this.runningGames.has(hamsterGameId)) {
            this.loadGameInternal(hamsterGameId);
        } else {
            this.loadGamesListInternal();
            this.runningGames.forEach((timerId, gameId) => {
                this.loadGameInternal(gameId);
            });
        }
    }

    public start(): void {
        if (typeof this.getRunningGamesTimer === "undefined") {
            this.getRunningGamesTimer = 0;
            this.loadGamesListTimer(this.stopPollSmallerThan);
        }
    }

    protected gameStateChangesEventListener(gameId: string, event: StateChangeEventType, ...params: any): void {
        if (event !== StateChangeEventType.all && event !== StateChangeEventType.speedChange && event !== StateChangeEventType.inputResponse) {
            this.postAction(gameId, event);
        } else if (event === StateChangeEventType.speedChange) {
            if (arguments.length >= 3 && typeof params[0] === "number" && params[0] >= 0 && params[0] <= 10) {
                this.request("POST", `${this.serverBaseUrl}/speed?speed=${params[0]}&id=${gameId}`);
            } else {
                throw new Error("Illegal speed");
            }
        } else if (event === StateChangeEventType.inputResponse) {
            if (typeof params[0] === "number") {
                if (typeof params[1] === "string") {
                    this.request("POST", `${this.serverBaseUrl}/input?inputId=${params[0]}&input=${encodeURIComponent(params[1])}&id=${gameId}`);
                } else if (typeof params[1] === "number") {
                    this.request("POST", `${this.serverBaseUrl}/input?inputId=${params[0]}&input=${params[1]}&id=${gameId}`);
                } else if (typeof params[1] === "undefined") {
                    this.request("POST", `${this.serverBaseUrl}/abortInput?inputId=${params[0]}&id=${gameId}`);
                } else {
                    throw new Error("Type of input was illegal.");
                }
            }
        }
    }

    private async loadGameTimer(pollId: number, gameId: string): Promise<void> {
        if (pollId >= this.stopPollSmallerThan) {
            let status: GameState | undefined;
            try {
                status = await this.loadGameInternal(gameId);
            } catch (err) {
                console.error(err);
            }

            if (status !== undefined) {
                const stepTime = (11 - status.speed) / 5 * 400; //Formula for speed from hamster sim
                console.log(stepTime / 2);
                this.runningGames.set(gameId, setTimeout(this.loadGameTimer.bind(this), Math.max(stepTime / 2, HamsterStatusPoll.minPollInterval), pollId, gameId) as any);
            } else {
                this.runningGames.set(gameId, true);
            }
        }
    }

    private async loadGameInternal(gameId: string): Promise<GameState | undefined> {
        let lowestLastId: number | undefined;
        this.listeners.forEach((listenerData, statusReceiver) => {
            if (gameId === listenerData.gameId) {
                lowestLastId = !lowestLastId ? statusReceiver.getLastDeltaId() : Math.min(lowestLastId, statusReceiver.getLastDeltaId());
            }
        });
        if (lowestLastId !== undefined) {
            lowestLastId = Math.floor(Math.max(0, lowestLastId));
            const status = await this.getGameState(gameId, lowestLastId);
            this.listeners.forEach((listenerData, statusReceiver) => {
                if (gameId === listenerData.gameId) {
                    statusReceiver.update(status);
                }
            });
            return status;
        }
        this.gameHasListeners.delete(gameId);
        return undefined;
    }

    private async loadGamesListTimer(pollId: number): Promise<void> {
        if (pollId >= this.stopPollSmallerThan) {
            try {
                await this.loadGamesListInternal();
            } catch (err) {
                console.error(err);
            }
            this.getRunningGamesTimer = setTimeout(this.loadGamesListTimer.bind(this), HamsterStatusPoll.gamesListTimerDelay, pollId) as any;
        }
    }

    private async loadGamesListInternal(): Promise<void> {
        let gamesList: string[];
        try {
            gamesList = await this.getAvailableGames();
        } catch (err) {
            console.error(err);
            gamesList = [];
        }
        gamesList.filter(gameId => !this.runningGames.has(gameId)).forEach(gameId => {
            this.runningGames.set(gameId, true);
            this.newGameListeners.forEach(newGameListener => {
                newGameListener.newGame(gameId, this);
            });
            if (this.gameHasListeners.has(gameId)) {
                if (typeof this.runningGames.get(gameId) === "boolean") {
                    this.loadGameTimer(this.stopPollSmallerThan, gameId);
                }
            }
        });
        this.runningGames.forEach((timerId, gameId) => {
            if (gamesList.indexOf(gameId) < 0) {
                if (typeof timerId === "number") {
                    clearTimeout(timerId);
                }
                this.runningGames.delete(gameId);
            }
        });
        this.listeners.forEach((listenerData, statusReceiver) => {
            if (!listenerData.persistand && gamesList.indexOf(listenerData.gameId) < 0) {
                this.listeners.delete(statusReceiver);
            }
        });
    }

    private async postAction(gameId: string, action: string): Promise<void> {
        await this.request("POST", `${this.serverBaseUrl}/action?action=${action}&id=${gameId}`);
    }

    private async getAvailableGames(): Promise<string[]> {
        const ids = await this.request("GET", `${this.serverBaseUrl}/gamesList`);
        if (typeof ids !== "object" || !(ids instanceof Array) || !(ids.every(id => typeof id === "string"))) {
            throw new Error("The list of games is invalid");
        }
        return ids;
    }

    private async getGameState(hamsterGameId: string, firstDeltaId: number): Promise<GameState> {
        return GameState.parse(await this.request("GET", `${this.serverBaseUrl}/state?id=${hamsterGameId}&since=${firstDeltaId}`));
    }

    protected resetAllListeners() {
        this.listeners.forEach((game, listener) => {
            listener.reset();
        });
    }

    protected async request(method: string, url: string, body?: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const req = new XMLHttpRequest();
            req.onreadystatechange = () => {
                if (req.readyState >= (req.HEADERS_RECEIVED ?? 2)) {
                    if (req.status > 299 && (req.status < 500 || req.status > 599)) {
                        reject(`An error occured during loading the hamster game GUI: ${req.status}: ${req.statusText}`);
                    }
                }
                if (req.readyState === (req.DONE ?? 4)) {
                    if (req.status === 200) {
                        switch (req.responseType) {
                            case "text":
                            case "":
                                try {
                                    const parsedJson = JSON.parse(req.responseText);
                                    resolve(parsedJson);
                                } catch (err) {
                                    resolve(req.responseText);
                                }
                                break;
                            case "blob":
                                (req.response as Blob).text().then(resText => {
                                    try {
                                        const parsedJson = JSON.parse(resText);
                                        resolve(parsedJson);
                                    } catch (err) {
                                        resolve(resText);
                                    }
                                });
                                break;
                            case "json":
                                resolve(req.response);
                                break;
                        }
                    } else {
                        if (req.status > 299 && (req.status < 500 || req.status > 599)) {
                            reject(req.response);
                        } else if (req.status < 500 || req.status > 599) {
                            reject(req.response);
                        }
                    }
                }
            };
            req.onerror = () => {
                this.resetAllListeners();
                reject("Error during request");
            };
            req.open(method, url);
            try {
                req.send(body);
            } catch (err) {
                reject(err);
            }
        });
    }

    public stop(): void {
        if (typeof this.getRunningGamesTimer !== "undefined") {
            this.stopPollSmallerThan++;
            clearTimeout(this.getRunningGamesTimer);
            this.runningGames.forEach((timerId, gameId) => {
                if (typeof timerId === "number") {
                    clearTimeout(timerId);
                }
            });
            this.runningGames.clear();
            this.getRunningGamesTimer = undefined;
        }
    }

}