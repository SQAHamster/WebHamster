import { StateChangeEventType } from "../enums/StateChangeEventTypes.js";

export type StateChangeEventListener = (event: StateChangeEventType, ...params: any) => void;