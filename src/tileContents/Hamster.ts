import { HamsterDirection } from "../enums/HamsterDirection.js";
import { TileContent } from "./TileContent.js";
import { Position } from "../utils/Position.js";

export class Hamster extends TileContent {

    constructor(id: number, private lookingDirection: HamsterDirection, currentLocation?: Position) {
        super(id, currentLocation);
    }

    public get direction(): HamsterDirection {
        return this.lookingDirection;
    }

    public set direction(direction: HamsterDirection) {
        this.lookingDirection = direction;
    }

}