import { DeltaType } from "../enums/DeltaType.js";

export abstract class Delta {

    public constructor(private readonly deltaType: DeltaType) { }

    public get type(): DeltaType {
        return this.deltaType;
    }

}