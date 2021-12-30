export enum InputMode {
    /**
     * No input is expected
     */
    NONE = "NONE",
    /**
     * Currently an int is requested
     */
    READ_INT = "READ_INT",
    /**
     * Currently a string is requested
     */
    READ_STRING = "READ_STRING",
    /**
     * A alter should be shown, no input requested
     */
    CONFIRM_ALERT = "CONFIRM_ALERT"
}