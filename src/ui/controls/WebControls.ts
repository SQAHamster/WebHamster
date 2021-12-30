import { HamsterGameControls } from "./HamsterGameControls.js";

export class WebControls extends HamsterGameControls {

    private readonly gameChangeListeners: Set<(game: string) => void>;
    private readonly formContainer: HTMLDivElement;
    private readonly resumeBtn: HTMLButtonElement;
    private readonly pauseBtn: HTMLButtonElement;
    private readonly abortBtn: HTMLButtonElement;
    private readonly undoBtn: HTMLButtonElement;
    private readonly redoBtn: HTMLButtonElement;
    private readonly gameDropdown: HTMLSelectElement;
    private readonly speedSlider: HTMLInputElement;

    public constructor(
        private readonly controlsContainer: Element
    ) {
        super();

        this.gameChangeListeners = new Set();

        this.formContainer = document.createElement("div");
        this.formContainer.classList.add("form-row");
        controlsContainer.append(this.formContainer);

        this.resumeBtn = this.createAndAttachButton("resumeBtn", this.resume.bind(this));
        this.pauseBtn = this.createAndAttachButton("pauseBtn", this.pause.bind(this));
        this.abortBtn = this.createAndAttachButton("abortBtn", this.abort.bind(this));
        this.undoBtn = this.createAndAttachButton("undoBtn", this.undo.bind(this));
        this.redoBtn = this.createAndAttachButton("redoBtn", this.redo.bind(this));

        this.gameDropdown = this.createAndAttachGameDropdown();

        this.speedSlider = this.createAndAttachSpeedSlider();
    }

    private createAndAttachSpeedSlider(): HTMLInputElement {
        const sliderContainer = document.createElement("div");
        sliderContainer.classList.add("col-12");
        sliderContainer.classList.add("speedSliderContainer");
        const slider = document.createElement("input");
        sliderContainer.append(slider);
        slider.classList.add("form-control-range");
        slider.type = "range";
        slider.min = "0";
        slider.max = "10";
        slider.value = "TODO";
        const emitter = this.changeSpeed.bind(this);
        slider.addEventListener("change", () => {
            emitter(parseInt(slider.value, 10));
        });
        this.formContainer.append(sliderContainer);
        return slider;
    }

    private createAndAttachGameDropdown(): HTMLSelectElement {
        const dropdownContainer = document.createElement("div");
        dropdownContainer.classList.add("col-12");
        dropdownContainer.classList.add("col-sm-6");
        dropdownContainer.classList.add("col-md-12");
        dropdownContainer.classList.add("mb-3");
        dropdownContainer.classList.add("gameDropdownContainer");
        const dropdown = document.createElement("select");
        dropdown.classList.add("custom-select");
        dropdown.addEventListener("change", (() => {
            this.gameChangeListeners.forEach(listener => {
                listener(dropdown.value);
            })
        }).bind(this));

        dropdown.add(document.createElement("option"));

        dropdownContainer.append(dropdown);
        //this.formContainer.append(dropdownContainer);
        return dropdown;
    }

    private createAndAttachButton(imgClass: string, emitter: () => void): HTMLButtonElement {
        const btnContainer = document.createElement("div");
        /*btnContainer.classList.add("col-2");
        btnContainer.classList.add("col-sm-1");
        btnContainer.classList.add("col-md-12");*/
        btnContainer.classList.add("mb-3");
        btnContainer.classList.add("mx-1");
        btnContainer.classList.add("btnContainer");
        const btn = this.createButton(imgClass);
        btn.addEventListener("click", emitter);
        btnContainer.append(btn);
        this.formContainer.append(btnContainer);
        return btn;
    }

    private createButton(imgClass: string): HTMLButtonElement {
        const btn = document.createElement("button");
        btn.classList.add("btn");
        btn.classList.add("btn-secondary");
        btn.classList.add("controls");
        const btnImg = document.createElement("span");
        btnImg.classList.add("btnImg");
        btnImg.classList.add(imgClass);
        btn.append(btnImg);
        return btn;
    }

    public setAvailableGames(games: string[]): void {
        throw new Error("Method not implemented.");
    }

    public addGameChangeListener(listener: (game: string) => void): void {
        this.gameChangeListeners.add(listener);
    }

    public removeGameChangeListener(listener: (game: string) => void): void {
        this.gameChangeListeners.delete(listener);
    }

    public async getStringInput(message: string, inputId: number): Promise<string | false | undefined> {
        return undefined;
    }

    public async getIntegerInput(message: string, inputId: number): Promise<number | false | undefined> {
        return undefined;
    }

    public async showAlert(message: string, inputId: number): Promise<true | undefined> {
        return undefined;
    }

    public cancelDialogs(): void {

    }

    public set resumeActive(isActive: boolean) {
        this.resumeBtn.disabled = !isActive;
    }

    public set pauseActive(isActive: boolean) {
        this.pauseBtn.disabled = !isActive;

    }

    public set undoActive(isActive: boolean) {
        this.undoBtn.disabled = !isActive;
    }

    public set redoActive(isActive: boolean) {
        this.redoBtn.disabled = !isActive;
    }
}