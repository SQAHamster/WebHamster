import { HamsterDirection } from "./enums/HamsterDirection.js";

export interface GameHistory {
    territory: TerritoryData,
    logEntries: LogEntry[]
}

export enum LogEntryType {
    INIT_HAMSTER = "INIT_HAMSTER",
    INITIAL = "INITIAL",
    MOVE = "MOVE",
    TURN_LEFT = "TURN_LEFT",
    PICK_GRAIN = "PICK_GRAIN",
    PUT_GRAIN = "PUT_GRAIN",
    WRITE = "WRITE"
}

export interface LogEntry {
    type: LogEntryType,
    errorMessage?: string
}

export interface HamsterLogEntry extends LogEntry {
    hamsterId: number
}

export interface InitHamsterLogEntry extends LogEntry {
    type: LogEntryType.INIT_HAMSTER,
    hamster: HamsterData
}

export interface InitialLogEntry extends LogEntry {
    type: LogEntryType.INITIAL
}

export interface MoveLogEntry extends HamsterLogEntry {
    type: LogEntryType.MOVE
}

export interface TurnLeftLogEntry extends HamsterLogEntry {
    type: LogEntryType.TURN_LEFT
}

export interface PickGrainLogEntry extends HamsterLogEntry {
    type: LogEntryType.PICK_GRAIN
}

export interface PutGrainLogEntry extends HamsterLogEntry {
    type: LogEntryType.PUT_GRAIN
}

export interface WriteLogEntry extends HamsterLogEntry {
    type: LogEntryType.WRITE,
    message: string
}

export interface TerritoryData {
    size: { columnCount: number, rowCount: number },
    tileContents: TileContentData[]
}

export enum TileContentType {
    GRAIN = "GRAIN",
    HAMSTER = "HAMSTER",
    WALL = "WALL"
}

export interface TileContentData {
    type: TileContentType,
    location: { row: number, column: number }
}

export interface HamsterData extends TileContentData {
    type: TileContentType.HAMSTER,
    hamsterId: number,
    direction: HamsterDirection
}

export interface GrainData extends TileContentData {
    type: TileContentType.GRAIN
}

export interface WallData extends TileContentData {
    type: TileContentType.WALL
}
