

export class Position {

    private readonly xPos: number;
    private readonly yPos: number;

    public constructor(xPos: number, yPos: number)
    public constructor(positionObject: any);
    public constructor(
        xPosOrObject: number | any,
        yPos?: number
    ) {
        if (typeof xPosOrObject === "object" && typeof yPos === "undefined") {
            if (typeof xPosOrObject.x === "number" && typeof xPosOrObject.y === "number") {
                this.xPos = xPosOrObject.x;
                this.yPos = xPosOrObject.y;
            } else if (typeof xPosOrObject.row === "number" && typeof xPosOrObject.column === "number") {
                this.xPos = xPosOrObject.column;
                this.yPos = xPosOrObject.row;
            } else {
                throw new Error("The position object must at least have the numeric properties x and y");
            }
        } else if (typeof xPosOrObject === "number" && typeof yPos === "number") {
            this.xPos = xPosOrObject;
            this.yPos = yPos;
        } else {
            throw new Error("The parameters for a new position must be a position object or two numbers");
        }
        if (this.xPos < 0 || this.yPos < 0) {
            throw new Error("A position can't be < 0");
        }
    }

    public get x(): number {
        return this.xPos;
    }

    public get y(): number {
        return this.yPos;
    }

}