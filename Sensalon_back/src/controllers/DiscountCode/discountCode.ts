import { Request, Response } from "express";
import conn from "../../bd/config/config";
import { DiscountCodeModel } from "../../bd/models/DiscountCode.model";
import { DiscountCodeProductsModel } from "../../bd/models/DiscountCodeProducts.model";
import { Op } from "sequelize";

export const getDiscountCodes = async (_req: Request, res: Response) => {
    try {
        const codes = await DiscountCodeModel.findAll({
            order: [["createdAt", "DESC"]],
        });

        const ids = codes.map((c) => c.getDataValue("id") as string);
        const productsMap: Record<string, string[]> = {};

        if (ids.length > 0) {
            const links = await DiscountCodeProductsModel.findAll({
                where: { discountCodeId: { [Op.in]: ids } },
            });

            links.forEach((link) => {
                const codeId = link.getDataValue("discountCodeId") as string;
                const productId = link.getDataValue("productId") as string;
                if (!productsMap[codeId]) productsMap[codeId] = [];
                productsMap[codeId].push(productId);
            });
        }

        const payload = codes.map((code) => {
            const plain = code.get({ plain: true }) as any;
            return {
                ...plain,
                productIds: productsMap[plain.id] || [],
            };
        });

        return res.json({ ok: true, data: payload });
    } catch (error) {
        console.error("Error obteniendo códigos de descuento:", error);
        return res
            .status(500)
            .json({ ok: false, message: "Error al obtener códigos de descuento" });
    }
};


export const createDiscountCode = async (req: Request, res: Response) => {
    const {
        code,
        description,
        discountType,
        value,
        scope,
        productIds = [],
        usageLimitType,
        usageLimit,
        minSubtotal,
        isActive,
        startDate,
        endDate,
    } = req.body;

    const t = await conn.transaction()

    try {
        const discount = DiscountCodeModel.create({
            description,
            code,
            discountType,
            value,
            scope,
            usageLimitType,
            usageLimit: usageLimitType === "limited" ? usageLimit : null,
            minSubtotal,
            isActive,
            startDate: startDate || null,
            endDate: endDate || null,
        },
            { transaction: t }
        )

        const discountId = (await discount).getDataValue("id") as string;
        if (scope === 'products' && productIds.length > 0) {
            const rows = productIds.map((productId: any) => ({
                discountCodeId: discountId,
                productId,
            }));

            await DiscountCodeProductsModel.bulkCreate(rows, { transaction: t });
        }

        await t.commit()

        return res.status(201).json({
            ok: true,
            data: discount,
        });
    } catch (error) {
        await t.rollback();
        console.error("Error creando código de descuento:", error);
        return res
            .status(500)
            .json({ ok: false, message: "Error al crear el código de descuento" });
    }
}

export const updateDiscountCode = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        code,
        discountType,
        value,
        scope,
        productIds = [],
        usageLimitType,
        usageLimit,
        minSubtotal,
        isActive,
        startDate,
        endDate,
    } = req.body;

    const t = await conn.transaction();

    try {
        const discount = await DiscountCodeModel.findByPk(id, { transaction: t });

        if (!discount) {
            await t.rollback();
            return res
                .status(404)
                .json({ ok: false, message: "Código de descuento no encontrado" });
        }

        await discount.update(
            {
                code,
                discountType,
                value,
                scope,
                usageLimitType,
                usageLimit: usageLimitType === "limited" ? usageLimit : null,
                minSubtotal,
                isActive,
                startDate: startDate || null,
                endDate: endDate || null,
            },
            { transaction: t }
        );

        const discountId = discount.getDataValue("id") as string;
        // Limpiar relaciones existentes
        await DiscountCodeProductsModel.destroy({
            where: { discountCodeId: discountId },
            transaction: t,
        });

        // Crear nuevas relaciones si aplica
        if (scope === "products" && productIds.length > 0) {
            const rows = productIds.map((productId: any) => ({
                discountCodeId: discountId,
                productId,
            }));
            await DiscountCodeProductsModel.bulkCreate(rows, { transaction: t });
        }

        await t.commit();

        return res.json({
            ok: true,
            data: discount,
        });
    } catch (error) {
        await t.rollback();
        console.error("Error actualizando código de descuento:", error);
        return res
            .status(500)
            .json({ ok: false, message: "Error al actualizar el código de descuento" });
    }
};

export const deleteDiscountCode = async (req: Request, res: Response) => {
    const { id } = req.params;
    const t = await conn.transaction();

    try {
        const discount = await DiscountCodeModel.findByPk(id, { transaction: t });
        if (!discount) {
            await t.rollback();
            return res.status(404).json({ ok: false, message: "Código no encontrado" });
        }

        await DiscountCodeProductsModel.destroy({
            where: { discountCodeId: id },
            transaction: t,
        });

        await discount.destroy({ transaction: t });

        await t.commit();
        return res.json({ ok: true, message: "Código eliminado" });
    } catch (error) {
        await t.rollback();
        console.error("Error eliminando código de descuento:", error);
        return res
            .status(500)
            .json({ ok: false, message: "Error al eliminar el código de descuento" });
    }
};
