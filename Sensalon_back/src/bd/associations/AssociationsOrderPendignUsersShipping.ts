import { CreateOrderPending } from "../models/OrderPending.model";
import { ShippingAddresModel } from "../models/ShippingAdd.model";
import { Users } from "../models/Users.model"

export const AssociationsOrderPendignUsersShipping = () => {
    CreateOrderPending.belongsTo(Users, { foreignKey: "iIdUser", as: "user" });
    CreateOrderPending.belongsTo(ShippingAddresModel, { foreignKey: "iIdShippingAddress", as: "shippingAddress" });
}
