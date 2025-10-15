import { AssociationsUserTransactions } from "./AssocionsUserTransactions";
import { AssociationsShippingTransactions } from "./AssociatiosShippingTransactions";
import { AssociationsOrderPendignUsersShipping } from "./AssociationsOrderPendignUsersShipping";
import { AssociationsCartItCartProduct } from "./AssociationsCartItCartProduct";
import { AssociationsCartUsers } from "./AssociationsCartUsers";
import { AssociationsCreditUser } from "./AssociationsCreditUser";
import { AssociationsCreditPayCredit } from "./AssociationsCreditPayCredit";
import { AssociationsCashbackUserTransaction } from "./AssociationsCashbackUserTransaction";
import { AssociationsProductsCategories } from "./AssociationsProductsCategories";
import { AssociationsProductsCompanies } from "./AssociationsProductsCompanies";
import { AssociationsRolesUsers } from "./AssociationsRolesUsers";
import { AssociationsDistributorsUsers } from "./AssociationsDistributorsUsers";

export const setupAssociations = () => {
    AssociationsUserTransactions();
    AssociationsShippingTransactions();
    AssociationsOrderPendignUsersShipping();
    AssociationsCartItCartProduct();
    AssociationsCartUsers();
    AssociationsCreditUser();
    AssociationsCreditPayCredit();
    AssociationsCashbackUserTransaction();
    AssociationsProductsCategories();
    AssociationsProductsCompanies();
    AssociationsRolesUsers();
    AssociationsDistributorsUsers();
};
