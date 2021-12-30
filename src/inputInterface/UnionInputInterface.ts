import { StateChangeEventType } from "../enums/StateChangeEventTypes.js";
import { StateChangeEventListener } from "../utils/StateChangeEventListener.js";
import { InputInterface } from "./InputInterface.js";

export class UnionInputInterface extends InputInterface {

    private readonly inputInterfaces: Set<InputInterface>;
    private eventEmitter: StateChangeEventListener;

    public constructor() {
        super();
        this.inputInterfaces = new Set();
        this.eventEmitter = this.emitEvent.bind(this);
    }

    public addInterface(iface: InputInterface): void {
        this.inputInterfaces.add(iface);
        iface.on(StateChangeEventType.all, this.eventEmitter);
    }

    public removeInterface(iface: InputInterface): void {
        if (this.inputInterfaces.has(iface)) {
            iface.off(StateChangeEventType.all, this.eventEmitter);
            this.inputInterfaces.delete(iface);
        }
    }

    public getStringInput(message: string, inputId: number): Promise<string | false | undefined> {
        return new Promise((resolve, reject) => {
            let wasResolved = false;
            this.inputInterfaces.forEach(iface => {
                iface.getStringInput(message, inputId).then((respose) => {
                    if (respose !== undefined) {
                        if (!wasResolved) {
                            resolve(respose);
                            wasResolved = true;
                        }
                    }
                }).catch((err) => {
                    if (!wasResolved) {
                        reject(err);
                        wasResolved = true;
                    }
                });
            });
        });
    }

    public getIntegerInput(message: string, inputId: number): Promise<number | false | undefined> {
        return new Promise((resolve, reject) => {
            let wasResolved = false;
            this.inputInterfaces.forEach(iface => {
                iface.getIntegerInput(message, inputId).then((respose) => {
                    if (respose !== undefined) {
                        if (!wasResolved) {
                            resolve(respose);
                            wasResolved = true;
                        }
                    }
                }).catch((err) => {
                    if (!wasResolved) {
                        reject(err);
                        wasResolved = true;
                    }
                });
            });
        });
    }

    public showAlert(message: string, inputId: number): Promise<true | undefined> {
        return new Promise((resolve, reject) => {
            let wasResolved = false;
            this.inputInterfaces.forEach(iface => {
                iface.showAlert(message, inputId).then((respose) => {
                    if (respose !== undefined) {
                        if (!wasResolved) {
                            resolve(respose);
                            wasResolved = true;
                        }
                    }
                }).catch((err) => {
                    if (!wasResolved) {
                        reject(err);
                        wasResolved = true;
                    }
                });
            });
        });
    }

    public cancelDialogs(): void {
        this.inputInterfaces.forEach(iface => {
            iface.cancelDialogs();
        });
    }

    public set resumeActive(isActive: boolean) {
        this.inputInterfaces.forEach(iface => {
            iface.resumeActive = isActive;
        });
    }

    public set pauseActive(isActive: boolean) {
        this.inputInterfaces.forEach(iface => {
            iface.pauseActive = isActive;
        });
    }

    public set undoActive(isActive: boolean) {
        this.inputInterfaces.forEach(iface => {
            iface.undoActive = isActive;
        });
    }

    public set redoActive(isActive: boolean) {
        this.inputInterfaces.forEach(iface => {
            iface.redoActive = isActive;
        });
    }

}