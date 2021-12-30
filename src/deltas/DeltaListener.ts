import { Delta } from "./Delta";

export interface DeltaListener {
    newDelta(delta: Delta): void;
    reset(): void;
}