import { EntityProvider } from "./EntityProvider.js";

export class WallProvider implements EntityProvider {

    constructor(
        private readonly wallImgPath: string
    ) { }

    public reset(): void {

    }

    getEntity(id: string): { element: HTMLElement; isStackable: boolean; } {
        const wallImg = document.createElement("img");
        wallImg.src = this.wallImgPath;
        wallImg.classList.add("wallImg");
        wallImg.classList.add("tileImg");
        return { element: wallImg, isStackable: false };
    }

}