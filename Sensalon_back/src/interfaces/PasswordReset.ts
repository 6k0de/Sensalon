export interface PasswordReset {
    iIdToken?: string;
    vcemail: string;
    vctoken: string;
    dtexpiration: Date;
}