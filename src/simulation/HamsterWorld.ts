import { HamsterDirection } from "../enums/HamsterDirection.js";
import { Position } from "../utils/Position.js";

export interface Tile {
    grains: number[];
    wall?: number | undefined;
}

export interface Hamster {
    position: Position,
    direction: HamsterDirection
}