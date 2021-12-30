import { Position } from "../utils/Position.js";

export abstract class TileContent {

    constructor(
        private readonly tileContentId: number,
        private currentLocation?: Position
    ) { }

    public get id(): number {
        return this.tileContentId
    }

    public get location(): Position | undefined {
        return this.currentLocation;
    }

    public set location(loc: Position | undefined) {
        this.currentLocation = loc;
    }

    public get isOnTerritory(): boolean {
        return this.currentLocation !== undefined;
    }

}