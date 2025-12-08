import { Request, Response } from "express";
import { WarehouseModel } from "../../bd/models/WarehouseEntrance.model";
import conn from "../../bd/config/config";
import { Transaction } from "sequelize";
import { Products } from "../../bd/models/Products.model";
import { SupplierModel } from "../../bd/models/Suppliers.model";
import { Companies } from "../../bd/models/Companies.model";

export const createWarehouseEntrance = async (req: Request, res: Response) => {
    const t: Transaction = await conn.transaction();

    try {
        const {
            datebuy,
            entryreason,
            supplierId,
            companyId,
            productlist,
        } = req.body

        if (!datebuy || !entryreason || !supplierId || !companyId || !productlist) {
            return res.status(400).json({
                ok: false,
                message: "Faltan campos obligatorios.",
            });
        }

        const productlistString =
            typeof productlist === "string" ? productlist : JSON.stringify(productlist);

        const items: {
            productId: string;
            quantity: number;
            unitPrice: number;
        }[] = JSON.parse(productlistString);

        if (!Array.isArray(items) || items.length === 0) {
            t.rollback()
            return res.status(400).json({
                ok: false,
                message: "La lista de productos está vacía o mal formada.",
            });
        }

        const totalamount = items.reduce((acc, item) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            return acc + qty * price;
        }, 0);

        const lastEntry = await WarehouseModel.findOne({
            order: [["docnumber", "DESC"]],
        });

        const lastDoc = (lastEntry?.get("docnumber") as number) || 0;
        const nextDocNumber = lastDoc + 1;

        const newEntrance = await WarehouseModel.create({
            docnumber: nextDocNumber,
            datebuy,
            entryreason,
            supplierId,
            companyId,
            productlist: productlistString,
            totalcost: totalamount
        });

        if (entryreason === "compra" || entryreason === "devolucion cliente") {
            for (const item of items) {
                const qty = Number(item.quantity) || 0;
                if (qty <= 0) continue;

                const product = await Products.findByPk(item.productId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!product) {
                    // puedes decidir si haces throw o solo log
                    console.warn(
                        `Producto no encontrado al actualizar stock: ${item.productId}`
                    );
                    continue;
                }

                // Suponiendo que usas el campo istock como inventario actual
                const currentStock = Number(product.getDataValue('istock')) || 0;
                const newStock = currentStock + qty;

                await product.update(
                    { istock: newStock },
                    { transaction: t }
                );
            }
        }

        await t.commit();


        return res.status(201).json({
            ok: true,
            message: "Entrada de almacén creada correctamente.",
            entry: newEntrance,
        });
    } catch (error) {
        console.error("Error en createWarehouseEntry:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al crear la entrada de almacén.",
        });
    }
}

export const getAllWarehouseEntrance = async (req: Request, res: Response) => {
    try {
        const warehouse = await WarehouseModel.findAll({
            include: [
                {
                    model: SupplierModel,
                    as: "supplier",
                    attributes: ["iIdSuppliers", "vcsupplier"],
                },
                {
                    model: Companies,
                    as: "company",
                    attributes: ["iIdCompany", "vcname"],
                },
            ],
            order: [["id", "DESC"]],
        });

        if (!warehouse || warehouse.length === 0) {
            return res.status(404).json({
                ok: false,
                message: "No se encontraron registros de almacén",
            });
        }

        const data = warehouse.map((w) => {
            const plain = w.toJSON() as any;
            return {
                id: plain.id,
                docnumber: plain.docnumber,
                datebuy: plain.datebuy,
                entryreason: plain.entryreason,
                supplierId: plain.supplierId,
                supplierName: plain.supplier?.vcsupplier ?? null,
                companyId: plain.companyId,
                companyName: plain.company?.vcname ?? null,
                totalamount: plain.totalcost,
                productlist: plain.productlist,
            };
        });

        return res.status(200).json({ ok: true, data })
    } catch (error) {
        return res.status(500).json({ message: 'error en el servidor' })
    }
}

export const updateWarehouseEntrance = async (req: Request, res: Response) => {
    const { id } = req.params;
    const t: Transaction = await conn.transaction();

    try {
        const {
            datebuy,
            entryreason,
            supplierId,
            companyId,
            productlist,
        } = req.body;

        const existing = await WarehouseModel.findByPk(id, {
            transaction: t,
            lock: t.LOCK.UPDATE,
        });

        if (!existing) {
            await t.rollback();
            return res.status(404).json({ ok: false, message: "Entrada no encontrada." });
        }

        const productlistString =
            typeof productlist === "string" ? productlist : JSON.stringify(productlist);

        const newItems: { productId: string; quantity: number; unitPrice: number }[] =
            JSON.parse(productlistString);

        if (!Array.isArray(newItems) || newItems.length === 0) {
            await t.rollback();
            return res
                .status(400)
                .json({ ok: false, message: "La lista de productos está vacía o mal formada." });
        }

        const totalamount = newItems.reduce((acc, item) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.unitPrice) || 0;
            return acc + qty * price;
        }, 0);

        const adjustStock = async (
            items: { productId: string; quantity: number }[],
            factor: 1 | -1
        ) => {
            for (const item of items) {
                const qty = Number(item.quantity) || 0;
                if (qty <= 0) continue;

                const product = await Products.findByPk(item.productId, {
                    transaction: t,
                    lock: t.LOCK.UPDATE,
                });

                if (!product) {
                    console.warn(`Producto no encontrado al ajustar stock: ${item.productId}`);
                    continue;
                }

                const currentStock = Number(product.getDataValue("istock")) || 0;
                const newStock = currentStock + factor * qty;

                await product.update({ istock: newStock }, { transaction: t });
            }
        };

        // revertir stock previo si la entrada original era compra
        const oldEntryReason = existing.getDataValue("entryreason");
        const oldListRaw = existing.getDataValue("productlist") as string;
        let oldItems: { productId: string; quantity: number }[] = [];
        if (oldListRaw) {
            try {
                oldItems = JSON.parse(oldListRaw);
            } catch (err) {
                console.error("No se pudo parsear productlist anterior:", err);
            }
        }

        if ((oldEntryReason === "compra" || oldEntryReason === "devolucion cliente") && oldItems.length > 0) {
            await adjustStock(oldItems, -1);
        }

        // aplicar nuevo stock si ahora es compra o devolución de cliente
        if (entryreason === "compra" || entryreason === "devolucion cliente") {
            await adjustStock(newItems, 1);
        }

        await existing.update(
            {
                datebuy,
                entryreason,
                supplierId,
                companyId,
                productlist: productlistString,
                totalcost: totalamount,
            },
            { transaction: t }
        );

        await t.commit();

        return res.json({ ok: true, message: "Entrada actualizada correctamente.", entry: existing });
    } catch (error) {
        await t.rollback();
        console.error("Error en updateWarehouseEntrance:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al actualizar la entrada de almacén.",
        });
    }
};
