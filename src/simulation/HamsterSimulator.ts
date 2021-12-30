import { AddErrorLogEntryDelta } from "../deltas/AddErrorLogEntryDelta.js";
import { AddLogEntryDelta } from "../deltas/AddLogEntryDelta.js";
import { AddTileContentDelta } from "../deltas/AddTileContentDelta.js";
import { Delta } from "../deltas/Delta.js";
import { NewTerritoryDelta } from "../deltas/NewTerritoryDelta.js";
import { RemoveLogEntryDelta } from "../deltas/RemoveLogEntryDelta.js";
import { RemoveTileContentDelta } from "../deltas/RemoveTileContentDelta.js";
import { RotateHamsterDelta } from "../deltas/RotateHamsterDelta.js";
import { GameMode } from "../enums/GameMode.js";
import { HamsterDirection } from "../enums/HamsterDirection.js";
import { GameHistory, HamsterData, InitHamsterLogEntry, LogEntryType, MoveLogEntry, PickGrainLogEntry, PutGrainLogEntry, TileContentType, TurnLeftLogEntry, WriteLogEntry } from "../GameHistory.js";
import { GameState } from "../messages/GameState.js";
import { Position } from "../utils/Position.js";
import { Tile, Hamster } from "./HamsterWorld.js";

export class HamsterSimulator {

    private nextStep = 0;
    private speed = 1;
    private isRunning: boolean = false;
    private timerStarted: boolean = false;
    private allDeltas: Delta[] = [];

    private territory: Tile[][] = [];
    private hamsters: Map<number, Hamster> = new Map();
    private nextTileContentId = -1;

    constructor(private readonly gameHistory: GameHistory, private readonly gameStepListener: (newState: GameState) => void, private readonly gameResetListener: () => void) {
        for (let y = 0; y < gameHistory.territory.size.rowCount; y++) {
            const currRow: Tile[] = [];
            this.territory.push(currRow);
            for (let x = 0; x < gameHistory.territory.size.columnCount; x++) {
                const tile = gameHistory.territory.tileContents
                currRow.push({ grains: [] });
            }
        }
    }

    public stepForward() {
        if (this.nextStep >= this.gameHistory.logEntries.length) {
            return;
        }
        const step = this.gameHistory.logEntries[this.nextStep];
        const deltas: Delta[] = [];
        switch (step.type) {
            case LogEntryType.INIT_HAMSTER:
                deltas.push(...this.initHamster(step as InitHamsterLogEntry))
                break;
            case LogEntryType.MOVE:
                deltas.push(...this.moveHamster((step as MoveLogEntry).hamsterId))
                break;
            case LogEntryType.TURN_LEFT:
                deltas.push(...this.turnHamsterLeft((step as TurnLeftLogEntry).hamsterId));
                break;
            case LogEntryType.PICK_GRAIN:
                deltas.push(...this.removeGrainFromTile((step as PickGrainLogEntry).hamsterId))
                deltas.push(new AddLogEntryDelta("Pick Grain", (step as PickGrainLogEntry).hamsterId))
                break;
            case LogEntryType.PUT_GRAIN:
                deltas.push(...this.addGrainToTile((step as PutGrainLogEntry).hamsterId))
                deltas.push(new AddLogEntryDelta("Put Grain", (step as PutGrainLogEntry).hamsterId))
                break;
            case LogEntryType.WRITE:
                deltas.push(new AddLogEntryDelta((step as WriteLogEntry).message, (step as WriteLogEntry).hamsterId));
                break;
        }
        if (step.errorMessage) {
            deltas.push(new AddErrorLogEntryDelta(step.errorMessage, (step as any)["hamsterId"]))
        }
        this.allDeltas.push(...deltas);
        this.nextStep = Math.min(this.nextStep + 1, this.gameHistory.logEntries.length);
        const state = new GameState(this.allDeltas, this.isRunning ? GameMode.RUNNING : GameMode.PAUSED, undefined, this.nextStep > 0, this.nextStep < this.gameHistory.logEntries.length, this.speed, 0);
        this.gameStepListener(state);
    }

    public stepBackward() {
        if (this.nextStep <= 0) {
            return;
        }
        const step = this.gameHistory.logEntries[this.nextStep - 1];
        const deltas: Delta[] = [];
        switch (step.type) {
            case LogEntryType.INIT_HAMSTER:
                deltas.push(new RemoveTileContentDelta((step as InitHamsterLogEntry).hamster.hamsterId));
                break;
            case LogEntryType.MOVE:
                deltas.push(...this.moveHamster((step as MoveLogEntry).hamsterId, true))
                break;
            case LogEntryType.TURN_LEFT:
                deltas.push(...this.turnHamsterLeft((step as TurnLeftLogEntry).hamsterId, true));
                break;
            case LogEntryType.PICK_GRAIN:
                deltas.push(...this.addGrainToTile((step as PickGrainLogEntry).hamsterId))
                deltas.push(new RemoveLogEntryDelta())
                break;
            case LogEntryType.PUT_GRAIN:
                deltas.push(...this.removeGrainFromTile((step as PutGrainLogEntry).hamsterId))
                deltas.push(new RemoveLogEntryDelta())
                break;
            case LogEntryType.WRITE:
                deltas.push(new RemoveLogEntryDelta());
                break;
        }
        if (step.errorMessage) {
            debugger;
            deltas.push(new RemoveLogEntryDelta());
        }
        this.allDeltas.push(...deltas);
        this.nextStep = Math.max(this.nextStep - 1, 0);
        const state = new GameState(this.allDeltas, GameMode.PAUSED, undefined, this.nextStep > 0, this.nextStep < this.gameHistory.logEntries.length, this.speed, 0);
        this.gameStepListener(state);
    }

    reset() {
        this.gameResetListener();

        this.nextStep = 0;
        this.isRunning = false;
        this.allDeltas.splice(0, this.allDeltas.length);
        for (let y = 0; y < this.gameHistory.territory.size.rowCount; y++) {
            const currRow: Tile[] = this.territory[y];
            for (let x = 0; x < this.gameHistory.territory.size.columnCount; x++) {
                currRow[x].grains.splice(0,currRow[x].grains.length);
            }
        }
        this.hamsters.clear();
        this.nextTileContentId = -1;

        const deltas: Delta[] = [];
        deltas.push(new NewTerritoryDelta(this.gameHistory.territory.size.columnCount, this.gameHistory.territory.size.rowCount))
        for (const content of this.gameHistory.territory.tileContents) {
            const contentPos = new Position(content.location.column, content.location.row);
            switch (content.type) {
                case TileContentType.HAMSTER:
                    deltas.push(new RotateHamsterDelta((content as HamsterData).hamsterId, (content as HamsterData).direction));
                    deltas.push(new AddTileContentDelta((content as HamsterData).hamsterId, contentPos, TileContentType.HAMSTER));
                    this.hamsters.set((content as HamsterData).hamsterId, { position: contentPos, direction: (content as HamsterData).direction });
                    break;
                case TileContentType.GRAIN:
                    const grainId = this.nextTileContentId--;
                    deltas.push(new AddTileContentDelta(grainId, contentPos, TileContentType.GRAIN));
                    this.territory[contentPos.y][contentPos.x].grains.push(grainId);
                    break;
                case TileContentType.WALL:
                    const wallId = this.nextTileContentId--;
                    deltas.push(new AddTileContentDelta(wallId, contentPos, TileContentType.WALL));
                    this.territory[contentPos.y][contentPos.x].wall = wallId;
            }
        }
        this.allDeltas.push(...deltas);
        const state = new GameState(this.allDeltas, GameMode.PAUSED, undefined, this.nextStep > 0, this.nextStep < this.gameHistory.logEntries.length, this.speed, 0);
        this.gameStepListener(state);
    }

    private initHamster(step: InitHamsterLogEntry): Delta[] {
        const deltas: Delta[] = [];
        let oldHamster = this.hamsters.get(step.hamster.hamsterId);
        if (!oldHamster) {
            const hamsterPos = new Position(step.hamster.location.column, step.hamster.location.row);
            oldHamster = { position: hamsterPos, direction: step.hamster.direction };
            this.hamsters.set(step.hamster.hamsterId, oldHamster);
        }
        deltas.push(new RotateHamsterDelta(step.hamster.hamsterId, oldHamster.direction));
        deltas.push(new AddTileContentDelta(step.hamster.hamsterId, oldHamster.position, TileContentType.HAMSTER));
        return deltas;
    }

    private removeGrainFromTile(hamsterId: number): Delta[] {
        const deltas: Delta[] = [];
        const oldHamster = this.hamsters.get(hamsterId);
        if (oldHamster) {
            const grainId = this.territory[oldHamster.position.y][oldHamster.position.x].grains.pop();
            if (typeof grainId === "number") {
                deltas.push(new RemoveTileContentDelta(grainId));
            }
        }
        return deltas;
    }

    private addGrainToTile(hamsterId: number): Delta[] {
        const deltas: Delta[] = [];
        const oldHamster = this.hamsters.get(hamsterId);
        if (oldHamster) {
            const grainId = this.nextTileContentId--;
            deltas.push(new AddTileContentDelta(grainId, oldHamster.position, TileContentType.GRAIN));
            this.territory[oldHamster.position.y][oldHamster.position.x].grains.push(grainId);
        }
        return deltas;
    }

    private turnHamsterLeft(hamsterId: number, invert?: boolean): Delta[] {
        const deltas: Delta[] = [];
        const oldHamster = this.hamsters.get(hamsterId);
        if (oldHamster) {
            let newDir: HamsterDirection;
            switch (oldHamster?.direction) {
                case HamsterDirection.NORTH:
                    newDir = invert ? HamsterDirection.EAST : HamsterDirection.WEST;
                    break;
                case HamsterDirection.EAST:
                    newDir = invert ? HamsterDirection.SOUTH : HamsterDirection.NORTH;
                    break;
                case HamsterDirection.SOUTH:
                    newDir = invert ? HamsterDirection.WEST : HamsterDirection.EAST;
                    break;
                case HamsterDirection.WEST:
                    newDir = invert ? HamsterDirection.NORTH : HamsterDirection.SOUTH;
                    break;
                default:
                    throw new Error("Unknown rotation");
            }
            oldHamster.direction = newDir;
            deltas.push(new RotateHamsterDelta(hamsterId, newDir));
            if (!invert) {
                deltas.push(new AddLogEntryDelta("Turn Left", hamsterId))
            } else {
                deltas.push(new RemoveLogEntryDelta())
            }
        }
        return deltas;
    }

    private moveHamster(hamsterId: number, invert?: boolean): Delta[] {
        const deltas: Delta[] = [];
        const oldHamster = this.hamsters.get(hamsterId);
        if (oldHamster) {
            let newPos: Position;
            switch (oldHamster?.direction) {
                case HamsterDirection.NORTH:
                    newPos = new Position(oldHamster.position.x, oldHamster.position.y + (invert ? 1 : -1));
                    break;
                case HamsterDirection.EAST:
                    newPos = new Position(oldHamster.position.x - (invert ? 1 : -1), oldHamster.position.y);
                    break;
                case HamsterDirection.SOUTH:
                    newPos = new Position(oldHamster.position.x, oldHamster.position.y - (invert ? 1 : -1));
                    break;
                case HamsterDirection.WEST:
                    newPos = new Position(oldHamster.position.x + (invert ? 1 : -1), oldHamster.position.y);
                    break;
                default:
                    throw new Error("Unknown rotation");
            }
            oldHamster.position = newPos;
            deltas.push(new RemoveTileContentDelta(hamsterId));
            deltas.push(new AddTileContentDelta(hamsterId, newPos, TileContentType.HAMSTER));
            if (!invert) {
                deltas.push(new AddLogEntryDelta("Move", hamsterId))
            } else {
                deltas.push(new RemoveLogEntryDelta())
            }
        }
        return deltas;
    }


    public resume() {
        if (!this.timerStarted) {
            this.isRunning = true;
            this.timerStep();
        }
    }

    public setSpeed(speed: number) {
        this.speed = speed;
    }

    public pause() {
        this.isRunning = false;
        this.timerStarted = false;
        const state = new GameState(this.allDeltas, GameMode.PAUSED, undefined, this.nextStep > 0, false, this.speed, 0);
        this.gameStepListener(state);
    }

    private timerStep() {
        if (this.nextStep >= this.gameHistory.logEntries.length) {
            this.isRunning = false;
            this.timerStarted = false;
            const state = new GameState(this.allDeltas, GameMode.PAUSED, undefined, this.nextStep > 0, false, this.speed, 0);
            this.gameStepListener(state);
        }
        if (this.isRunning) {
            this.timerStarted = true;
            this.stepForward();
            setTimeout(this.timerStep.bind(this), (11.0 - this.speed) / 5.0 * 400.0);
        }
    }
}