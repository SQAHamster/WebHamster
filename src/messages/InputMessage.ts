import { InputMode } from "../enums/InputMode.js";

export class InputMessage {

    private constructor(
        private _message: string,
        private _inputId: number,
        private _mode: InputMode,
        private _type?: string,
        private _stacktrace?: string
    ) { }

    public get message(): string {
        return this._message;
    }

    public get inputId(): number {
        return this._inputId;
    }
    public get type(): string | undefined {
        return this._type;
    }
    public get stacktrace(): string | undefined {
        return this._stacktrace;
    }

    public get mode(): InputMode {
        return this._mode;
    }

    public static parse(input: any): InputMessage {
        if (typeof input !== "object") {
            throw new Error("The input message must be an object");
        }
        if (typeof input.message !== "string") {
            throw new Error("The message of the InputMessage must be set");
        }
        if (typeof input.inputId !== "number" || !isFinite(input.inputId) || input.inputId % 1 !== 0) {
            throw new Error(`The ID of the InputMessage must be set and an integer number`);
        }
        if (typeof input.type !== "string" && typeof input.type !== "undefined") {
            throw new Error(`The error type of the inputMessage must be a valid string or unset`);
        }
        if (typeof input.stacktrace !== "string" && typeof input.stacktrace !== "undefined") {
            throw new Error(`The error stacktrace of the inputMessage must be a valid string or unset`);
        }
        if (typeof input.mode !== "string" || !(input.mode in InputMode)) {
            throw new Error("The input mode must be set");
        }
        return new InputMessage(input.message, input.inputId, input.mode, input.type, input.stacktrace);
    }
}