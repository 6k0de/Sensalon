export interface Supplier {
    iIdSuppliers: string;       // UUID
    vcsupplier: string;         // Supplier name
    vcrfc?: string | null;      // Tax ID
    vcrazonsocial?: string | null; // Business name
    vcphone?: string | null;    // Phone
    vcemail?: string | null;    // Email
    dtcreation?: Date;
    dtupdate?: Date;
}