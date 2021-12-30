import { InputInterface } from "../../inputInterface/InputInterface.js";

export abstract class HamsterGameControls extends InputInterface {
    public abstract setAvailableGames(games: string[]): void;
    public abstract addGameChangeListener(listener: (game: string) => void): void;
    public abstract removeGameChangeListener(listener: (game: string) => void): void;
}