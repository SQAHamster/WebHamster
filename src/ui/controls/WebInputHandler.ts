import { InputMode } from "../../enums/InputMode.js";
import { InputInterface } from "../../inputInterface/InputInterface.js";

export class WebInputHandler extends InputInterface {

    private openDialogs: Set<{ message: string, inputId: number, mode: InputMode, resolve: (value: any) => void, reject: (reason: any) => void }>;
    private backdropElement: HTMLDivElement;

    public constructor(
        private readonly alertModal: HTMLDivElement,
        private readonly alertModalContent: HTMLElement,
        private readonly alertOK: HTMLElement,
        private readonly inputModal: HTMLDivElement,
        private readonly inputModalContent: HTMLElement,
        private readonly inputModalTextField: HTMLInputElement,
        private readonly inputAbort: HTMLElement,
        private readonly inputOK: HTMLButtonElement,
        private readonly inputForm: HTMLFormElement,
        private readonly inputErrorMsg: HTMLElement,
    ) {
        super();
        this.openDialogs = new Set();
        this.backdropElement = document.createElement("div");
        this.backdropElement.classList.add("modal-backdrop");
        this.backdropElement.classList.add("fade");
        this.alertOK.addEventListener("click", this.onAlertOk.bind(this));
        this.inputAbort.addEventListener("click", this.onInputAbort.bind(this));
        this.inputOK.addEventListener("click", this.onInputAccept.bind(this));
        this.inputModalTextField.addEventListener("input", this.checkInputValid.bind(this));
    }

    private checkInputValid(): boolean {
        let customValidity = "";
        this.inputModalTextField.setCustomValidity(customValidity);
        const isValid = this.inputModalTextField.checkValidity()
        this.inputOK.disabled = !isValid;
        this.inputForm.classList.add("was-validated");
        if (!isValid) {
            if (this.openDialogs.size >= 1) {
                const firstDialog = this.openDialogs.values().next();
                if (firstDialog.value.mode == InputMode.READ_STRING) {
                    if (this.inputModalTextField.value.length == 0) {
                        customValidity = "The string is required to be non empty";
                    } else {
                        customValidity = "Input invalid";
                    }
                } else if (firstDialog.value.mode == InputMode.READ_INT) {
                    const inputNum = parseFloat(this.inputModalTextField.value);
                    const max = parseInt(this.inputModalTextField.max, 10);
                    const min = parseInt(this.inputModalTextField.min, 10);
                    if (inputNum > max) {
                        customValidity = "Number is too big (higher than Integer.MAX_VALUE)";
                    } else if (inputNum < min) {
                        customValidity = "Number is too small (lower than Integer.MIN_VALUE)";
                    } else if (!isFinite(inputNum)) {
                        customValidity = "Input is not a number";
                    } else if (inputNum % 1 != 0) {
                        customValidity = "Number is not a integer number but a float.";
                    } else {
                        console.log(inputNum);
                        customValidity = "Input is not a valid integer number";
                    }
                } else {
                    customValidity = "Input invalid";
                }
            } else {
                customValidity = "Input invalid";
            }
        }
        this.inputErrorMsg.innerText = customValidity;
        this.inputModalTextField.setCustomValidity(customValidity);
        return isValid;
    }

    private onAlertOk() {
        this.openDialogs.forEach(dialog => {
            if (dialog.mode === InputMode.CONFIRM_ALERT) {
                dialog.resolve(true);
                this.hideModal(this.alertModal);
                this.openDialogs.delete(dialog);
            }
        });
    }

    private onInputAbort() {
        this.openDialogs.forEach(dialog => {
            if (dialog.mode === InputMode.READ_INT || dialog.mode === InputMode.READ_STRING) {
                dialog.resolve(false);
                this.hideModal(this.inputModal);
                this.openDialogs.delete(dialog);
            }
        });
    }

    private onInputAccept() {
        if (this.checkInputValid()) {
            this.openDialogs.forEach(dialog => {
                if (dialog.mode === InputMode.READ_INT) {
                    try {
                        dialog.resolve(parseInt(this.inputModalTextField.value, 10));
                    } catch (err) {
                        dialog.reject(err);
                    }
                    this.hideModal(this.inputModal);
                    this.openDialogs.delete(dialog);
                } else if (dialog.mode === InputMode.READ_STRING) {
                    dialog.resolve(this.inputModalTextField?.value);
                    this.hideModal(this.inputModal);
                    this.openDialogs.delete(dialog);
                }
            });
        }
    }

    public getStringInput(message: string, inputId: number): Promise<string | false | undefined> {
        return new Promise((resolve, reject) => {
            this.inputModalContent.innerText = message;
            this.inputModalTextField.type = "text";
            this.inputModalTextField.min = "";
            this.inputModalTextField.max = "";
            this.inputModalTextField.step = "";
            this.inputModalTextField.value = "";
            this.checkInputValid();
            this.showModal(this.inputModal);
            this.openDialogs.add({ message, inputId, mode: InputMode.READ_STRING, resolve, reject });
        });
    }

    public getIntegerInput(message: string, inputId: number): Promise<number | false | undefined> {
        return new Promise((resolve, reject) => {
            this.inputModalContent.innerText = message;
            this.inputModalTextField.value = "0";
            this.inputModalTextField.type = "number";
            this.inputModalTextField.min = "-2147483648";
            this.inputModalTextField.max = "2147483647";
            this.inputModalTextField.step = "1";
            this.checkInputValid();
            this.showModal(this.inputModal);
            this.openDialogs.add({ message, inputId, mode: InputMode.READ_INT, resolve, reject });
        });
    }

    public showAlert(message: string, inputId: number): Promise<true | undefined> {
        return new Promise((resolve, reject) => {
            this.alertModalContent.innerText = message;
            this.showModal(this.alertModal);
            this.openDialogs.add({ message, inputId, mode: InputMode.CONFIRM_ALERT, resolve, reject });
        });
    }

    public cancelDialogs(): void {
        this.openDialogs.forEach(dialog => {
            dialog.resolve(undefined);
            if (dialog.mode === InputMode.CONFIRM_ALERT) {
                this.hideModal(this.alertModal);
            } else {
                this.hideModal(this.inputModal);
            }
        });
        this.openDialogs.clear();
    }

    private showModal(element: HTMLElement) {
        element.style.display = "block";
        document.body.appendChild(this.backdropElement);
        document.body.classList.add("modal-open");
        setTimeout(() => {
            element.classList.add("show");
            this.backdropElement.classList.add("show");
        }, 150);
    }

    private hideModal(element: HTMLElement) {
        element.classList.remove("show");
        this.backdropElement.classList.remove("show");
        setTimeout(() => {
            element.style.display = "none";
            document.body.classList.remove("modal-open");
            this.backdropElement.remove();
        }, 150);
    }

    public set resumeActive(isActive: boolean) {
    }

    public set pauseActive(isActive: boolean) {
    }

    public set undoActive(isActive: boolean) {
    }

    public set redoActive(isActive: boolean) {
    }

}