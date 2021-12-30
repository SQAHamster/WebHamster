import { HamsterGUIClient } from "../network/HamsterGUIClient.js";

export interface NewGameListener {
    newGame(newGameId: string, guiClient: HamsterGUIClient): void;
}