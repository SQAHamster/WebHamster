export interface ColorProvider {
    getColor(hamsterId: string): string | undefined;
}