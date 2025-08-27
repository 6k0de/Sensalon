export interface Categorie {
    iIdCategory: string;
    vcname: string;
    vcdescription: string;
    dtcreation?: Date;
    dtupdate?: Date | null;
    dtdeletion?: Date | null;
}