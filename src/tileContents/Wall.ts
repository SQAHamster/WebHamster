import { TileContent } from "./TileContent.js";
import { Position } from "../utils/Position.js";

export class Wall extends TileContent {

    constructor(id: number, currentLocation?: Position) {
        super(id, currentLocation);
    }

}