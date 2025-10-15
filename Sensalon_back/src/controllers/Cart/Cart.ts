// controllers/cart.controller.ts
import { Request, Response } from "express";
import { Products } from "../../bd/models/Products.model";
import { CartItemAttributes } from "../../interfaces/CartItems";
import { CartItemsModel } from "../../bd/models/CartItems.model";
import { CartModel } from "../../bd/models/Cart.model";

// Guardar items en carrito (crear/actualizar)
export const insertCartItems = async (req: Request, res: Response) => {
    try {
        const { idCart, items }: { idCart: string; items: CartItemAttributes[] } = req.body;

        if (!Array.isArray(items)) {
            return res.status(400).json({ error: "Debes enviar un array de items" });
        }

        const existingItemsInCart = await CartItemsModel.findAll({ where: { iFIdCart: idCart } });

        // Si el carrito llega vacío, limpiar lo existente
        if (items.length === 0 && existingItemsInCart.length > 0) {
            await CartItemsModel.destroy({ where: { iFIdCart: idCart } });
            return res.status(200).json({ message: "Carrito vaciado correctamente" });
        }

        if (existingItemsInCart.length > 0) {
            await CartItemsModel.destroy({ where: { iFIdCart: idCart } });
        }

        const validProducts = await Products.findAll({
            where: { iIdProduct: items.map(i => i.iFIdProduct) }
        });
        const validProductIds = validProducts.map(p => p.dataValues.iIdProduct);

        // Filtrar solo los productos válidos
        const filteredItems = items.filter(i => validProductIds.includes(i.iFIdProduct));

        if (filteredItems.length === 0) {
            return res.status(200).json({ message: "No hay productos válidos para guardar en el carrito" });
        }

        const cartItemsToInsert = filteredItems.map((item) => ({
            iFIdCart: idCart,
            iFIdProduct: item.iFIdProduct,
            iquantity: item.iquantity,
            decprice: item.decprice,
        }));

        const cartItems = await CartItemsModel.bulkCreate(cartItemsToInsert);
        return res.status(200).json({ cartItems });
    } catch (error) {
        console.error("Error al insertar items al carrito:", error);
        return res.status(500).json({ error: "Ocurrió un error al insertar los items" });
    }
};

// Obtener items del carrito por usuario
export const getCartItemsByUser = async (req: Request, res: Response) => {
    try {
        const { idUser } = req.params;

        const cart = await CartModel.findOne({ where: { iFIdUser: idUser } });
        if (!cart) {
            return res.status(404).json({ error: "El carrito no existe" });
        }

        const cartItems = await CartItemsModel.findAll({
            where: { iFIdCart: cart.getDataValue("iIdCart") },
            include: [{ model: Products, as: "product", required: true }],
        });

        return res.status(200).json({ cartItems });
    } catch (error) {
        console.error("Error al obtener los items del carrito:", error);
        return res.status(500).json({ error: "Error al obtener items del carrito" });
    }
};

// Obtener id del carrito por usuario
export const GetIdCartByUser = async (req: Request, res: Response) => {
    try {

        const { idUser } = req.params;
        console.log(idUser)
        const cart = await CartModel.findOne({ where: { iFIdUser: idUser } });

        if (!cart) {
            return res.status(404).json({ error: "No se encontró el carrito" });
        }

        return res.status(200).json({ cart });
    } catch (error) {
        return res.status(500).json({ error: "Ocurrió un error al buscar el carrito" });
    }
};
