import { Delta } from "../deltas/Delta.js";
import { DeltaParser } from "../deltas/DeltaParser.js";
import { GameMode } from "../enums/GameMode.js";
import { InputMessage } from "./InputMessage.js";

export class GameState {

    public constructor(
        private readonly _deltas: Delta[],
        private readonly _mode: GameMode,
        private readonly _inputMessage: InputMessage | undefined,
        private readonly _canUndo: boolean,
        private readonly _canRedo: boolean,
        private readonly _speed: number,
        private readonly _firstDeltaId: number
    ) { }


    public get deltas(): Delta[] {
        return this._deltas;
    }

    public get mode(): GameMode {
        return this._mode;
    }

    public get inputMessage(): InputMessage | undefined {
        return this._inputMessage;
    }

    public get canUndo(): boolean {
        return this._canUndo;
    }

    public get canRedo(): boolean {
        return this._canRedo;
    }

    public get speed(): number {
        return this._speed;
    }

    public get firstDeltaId(): number {
        return this._firstDeltaId;
    }

    public static parse(input: any): GameState {
        if (typeof input !== "object") {
            throw new Error("The status to parse needs to be an object");
        }
        if (typeof input.deltas !== "object" && !(input.deltas instanceof Array)) {
            throw new Error(`The deltas of the game status aren't set`);
        }
        if (typeof input.mode !== "string") {
            throw new Error("The game mode must be set");
        }
        if (typeof input.inputMessage !== "object" && typeof input.inputMessage !== "undefined") {
            throw new Error(`The input message must be a valid input message or undefined`);
        }
        if (typeof input.canUndo !== "boolean") {
            throw new Error(`canUndo must be a boolean`);
        }
        if (typeof input.canRedo !== "boolean") {
            throw new Error(`canRedo must be a boolean`);
        }
        if (typeof input.speed !== "number" || !isFinite(input.speed)) {
            throw new Error(`The current game speed must be a valid finite number`);
        }
        if (typeof input.firstDeltaId !== "undefined" && (typeof input.firstDeltaId !== "number" || !isFinite(input.firstDeltaId) || input.firstDeltaId % 1 !== 0)) {
            throw new Error(`The last delta id must be a valid finite integer`);
        }
        const deltas = [];
        for (const delta of input.deltas) {
            deltas.push(DeltaParser.parse(delta));
        }
        return new GameState(deltas, input.mode, input.inputMessage ? InputMessage.parse(input.inputMessage) : undefined, input.canUndo, input.canRedo, input.speed, input.firstDeltaId);
    }
}