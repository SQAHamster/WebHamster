import { EntityProvider } from "./EntityProvider.js";

export class GrainProvider implements EntityProvider {

    constructor(
        private readonly grainImgPath: string
    ) { }

    public reset(): void {

    }

    getEntity(id: string): { element: HTMLElement; isStackable: boolean; } {
        const imgContainer = document.createElement("div");
        imgContainer.classList.add("grainImgDiv");
        const img = document.createElement("img");
        img.src = this.grainImgPath;
        img.classList.add("img-fluid");
        img.classList.add("grainImg");
        imgContainer.append(img);
        return { element: imgContainer, isStackable: true };
    }

}