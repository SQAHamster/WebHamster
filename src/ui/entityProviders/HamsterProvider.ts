import { ColorProvider } from "./ColorProvider.js";
import { EntityProvider } from "./EntityProvider.js";

export class HamsterProvider implements EntityProvider, ColorProvider {

    private static readonly defaultColors = ["#0800ff", "#038000", "#ffff00", "#ffbbcc", "#ff00ff", "#ff0000"];
    private readonly hamsters: Map<string, { element: HTMLElement, isStackable: boolean, color: string }> = new Map();

    private nextHamsterId: number = 0;

    constructor(
        private readonly hamsterImgPath: string
    ) { }

    public reset(): void {
        this.nextHamsterId = 0;
        this.hamsters.clear();
    }

    public getColor(hamsterId: string): string | undefined {
        return this.hamsters.get(hamsterId)?.color;
    }

    public getEntity(id: string): { element: HTMLElement; isStackable: boolean; } {
        const knownHamster = this.hamsters.get(id);
        if (knownHamster) {
            return knownHamster;
        } else {
            const hamsterDiv = document.createElement("div");
            hamsterDiv.classList.add("hamsterImgDiv");
            const colorStr = this.getHamsterColor(this.nextHamsterId);
            const styler = (svgDoc: Document) => {
                const gradientStops = svgDoc.getElementsByClassName("hamsterGradientStop");
                for (let i = 0; i < gradientStops.length; i++) {
                    (gradientStops[i] as SVGGradientElement).style.stopColor = colorStr;
                }
            };
            let svgElement;
            if (this.hamsterImgPath.startsWith("data:image/svg+xml;base64,")) {
                svgElement = this.createHamsterImgFromBase64(this.nextHamsterId, styler);
            } else {
                svgElement = this.createHamsterImgFromFilePath(styler);
            }
            svgElement.removeAttribute("width");
            svgElement.removeAttribute("height");
            hamsterDiv.append(svgElement);
            hamsterDiv.classList.add("hamsterDivAnim");
            this.nextHamsterId++;
            const hamster = { element: hamsterDiv, isStackable: false, color: colorStr };
            this.hamsters.set(id, hamster);
            return hamster;
        }
    }

    private getHamsterColor(hamsterId: number): string {
        if (hamsterId < HamsterProvider.defaultColors.length) {
            return HamsterProvider.defaultColors[hamsterId];
        } else {
            const colorRgb = this.hsvToRgb((200 * hamsterId) % 360, 1, 1);
            return `#${this.padToHex(colorRgb.r)}${this.padToHex(colorRgb.g)}${this.padToHex(colorRgb.b)}`;
        }
    }

    private createHamsterImgFromBase64(hamsterId: number, styler: (content: Document) => void): HTMLElement {
        const parser = new DOMParser();
        let svgCode = atob(this.hamsterImgPath.substr(26));
        let idIndex = svgCode.indexOf(" id=\"");
        let idEnd = svgCode.indexOf("\"", idIndex + 5);
        while (idIndex >= 0 && idEnd < svgCode.length) {
            let id = svgCode.substring(idIndex + 5, idEnd);
            svgCode = svgCode.split(id).join("hamster" + hamsterId + id);
            idIndex = svgCode.indexOf(" id=\"", idEnd + 1);
            idEnd = svgCode.indexOf("\"", idIndex + 5);
        }
        const svgImg = parser.parseFromString(svgCode, "image/svg+xml");
        const rootElement = (svgImg as any).rootElement as HTMLElement
        rootElement.classList.add("hamsterImg");
        rootElement.classList.add("tileImg");
        styler(svgImg);
        return rootElement;
    }

    private createHamsterImgFromFilePath(styler: (content: Document) => void): HTMLObjectElement {
        const hamsterImg = document.createElement("object");
        hamsterImg.classList.add("hamsterImg");
        hamsterImg.classList.add("tileImg");
        hamsterImg.data = this.hamsterImgPath;
        hamsterImg.type = "image/svg+xml";
        hamsterImg.addEventListener("load", () => {
            if (hamsterImg.contentDocument) {
                styler(hamsterImg.contentDocument);
            } else {
                throw new Error("Load error for hamster");
            }
        });
        return hamsterImg;
    }

    private hsvToRgb(h: number, s: number, v: number): { r: number, g: number, b: number } {
        var out;
        var c = v * s;
        var x = c * (1 - Math.abs(h / 60 % 2 - 1));
        var m = v - c;
        if (h >= 0 && h < 60) {
            out = { r: c, g: x, b: 0 };
        } else if (h >= 60 && h < 120) {
            out = { r: x, g: c, b: 0 };
        } else if (h >= 120 && h < 180) {
            out = { r: 0, g: c, b: x };
        } else if (h >= 180 && h < 240) {
            out = { r: 0, g: x, b: c };
        } else if (h >= 240 && h < 300) {
            out = { r: x, g: 0, b: c };
        } else if (h >= 300 && h < 360) {
            out = { r: c, g: 0, b: x };
        } else {
            throw new Error("Out of range h");
        }
        return { r: (out.r + m) * 255, g: (out.g + m) * 255, b: (out.b + m) * 255 };
    }

    private padToHex(n: number): string {
        var str = Math.floor(n).toString(16);
        str = str.substr(str.length - 2, 2);
        while (str.length < 2) {
            str = "0" + str;
        }
        return str;
    }

}