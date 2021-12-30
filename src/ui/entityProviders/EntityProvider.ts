export interface EntityProvider {
    getEntity(id: string): { element: HTMLElement, isStackable: boolean }
    reset(): void;
}