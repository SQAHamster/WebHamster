import { InputInterface } from "../inputInterface/InputInterface.js";
import { GameState } from "../messages/GameState.js";

export interface StatusReceiver {
    /**
     * 
     * @param status The game status of the current game
     */
    update(status: GameState): void;

    reset(): void;

    getLastDeltaId(): number;

    addInputInterface(inputInterface: InputInterface): void;

    removeInputInterface(inputInterface: InputInterface): void;

    readonly unionInputInterface: InputInterface;

}