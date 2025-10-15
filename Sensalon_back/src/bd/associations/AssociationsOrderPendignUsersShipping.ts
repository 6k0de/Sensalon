import { CreateOrderPending } from "../models/OrderPending.model";
import { ShippingAddresModel } from "../models/ShippingAdd.model";
import { Users } from "../models/Users.model"

export const AssociationsOrderPendignUsersShipping = () => {
    CreateOrderPending.belongsTo(Users, { foreignKey: "iIdUser" });
    CreateOrderPending.belongsTo(ShippingAddresModel, { foreignKey: "iIdShippingAddress" });
}