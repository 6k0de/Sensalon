import { Request, Response } from "express";
import { Op } from "sequelize";
import conn from "../../bd/config/config";
import { Products } from "../../bd/models/Products.model";
import { ProductPakcageItemsModel } from "../../bd/models/ProductsPackageitemst.model";
import { InventoryReservationModel } from "../../bd/models/InventoryReservation.model";
import { TransactionModel } from "../../bd/models/Transaction.model";
import { CartItemsModel } from "../../bd/models/CartItems.model";

// Valida que las cantidades de los componentes de un paquete no superen su stock actual.
// Devuelve null si todo es válido, o un mensaje de error para responder al cliente.
const validatePackageStock = async (producttype: any, productsPackage: any): Promise<string | null> => {
    if (producttype !== 'PACKAGE') return null;

    let items: any[] = [];
    try {
        items = typeof productsPackage === 'string' ? JSON.parse(productsPackage) : (productsPackage || []);
    } catch {
        return 'Formato inválido en los productos del paquete.';
    }

    if (!Array.isArray(items) || items.length === 0) {
        return 'El paquete debe incluir al menos un producto.';
    }

    // Acumular cantidades por producto (por si el mismo producto viene repetido)
    const totals = new Map<string, number>();
    for (const item of items) {
        const productId = String(item?.product_id ?? item?.productId ?? '');
        const qty = Number(item?.quantity);
        if (!productId || !Number.isFinite(qty) || qty <= 0) {
            return 'Cada producto del paquete debe tener una cantidad válida mayor a 0.';
        }
        totals.set(productId, (totals.get(productId) || 0) + qty);
    }

    const rows = await Products.findAll({
        where: { iIdProduct: { [Op.in]: Array.from(totals.keys()) }, isactive: 1 },
    });
    const rowMap = new Map<string, any>();
    rows.forEach((r: any) => rowMap.set(String(r.getDataValue('iIdProduct')), r));

    for (const [productId, qty] of totals) {
        const row = rowMap.get(productId);
        if (!row) return 'Uno de los productos del paquete no existe o está inactivo.';
        if (row.getDataValue('producttype') === 'PACKAGE') {
            return `Un paquete no puede contener otro paquete (${row.getDataValue('vcname')}).`;
        }
        const stock = Number(row.getDataValue('istock')) || 0;
        if (qty > stock) {
            return `La cantidad para "${row.getDataValue('vcname')}" (${qty}) supera el stock disponible (${stock}).`;
        }
    }
    return null;
};

export const insertProduct = async (req: Request, res: Response) => {
    const {
        iFIdCompany,
        vccategories,
        vcname,
        vcdescription,
        producttype,
        relatedproductId,
        variantcolor,
        productsPackage,
        vcweight,
        vcquantity,
        decprice1,
        decprice2,
        decprice3,
        istock,
        istocklimit
    } = req.body;

    console.log({
        iFIdCompany,
        vccategories,
        vcname,
        vcdescription,
        producttype,
        relatedproductId,
        variantcolor,
        productsPackage,
        vcweight,
        vcquantity,
        decprice1,
        decprice2,
        decprice3,
        istock,
        istocklimit
    });

    const urlPhoto = req.file ? req.file.path : null;

    // Guard: en paquetes, ninguna cantidad puede superar el stock actual del componente
    try {
        const stockError = await validatePackageStock(producttype, productsPackage);
        if (stockError) {
            return res.send({ valor: 1, message: stockError });
        }
    } catch (validationError) {
        console.error('Error validando stock del paquete:', validationError);
        return res.status(500).send({ valor: 1, message: 'Error al validar el stock del paquete' });
    }

    // Asegurar que los JSON vengan en formato correcto
    const parsedCategories = typeof vccategories === 'string' ? vccategories : JSON.stringify(vccategories);
    const parsedVariantColor = typeof variantcolor === 'string' ? variantcolor : JSON.stringify(variantcolor);
    const parsedProductsPackage = typeof productsPackage === 'string' ? productsPackage : JSON.stringify(productsPackage);

    conn.query(
        `CALL ProductCategoriesInsert(
            :piFIdCompany,
            :pvccategories,
            :pvcname,
            :pvcdescription,
            :pproducttype,
            :prelatedProductId,
            :pvariantColor,
            :pproductsPackage,
            :pvcweight,
            :pvcquantity,
            :pvcphoto,
            :pdecprice1,
            :pdecprice2,
            :pdecprice3,
            :pistock,
            :pistocklimit
        )`,
        {
            replacements: {
                piFIdCompany: iFIdCompany || null, // puede venir vacío
                pvccategories: parsedCategories || null,
                pvcname: vcname,
                pvcdescription: vcdescription,
                pproducttype: producttype,
                prelatedProductId: relatedproductId || null,
                pvariantColor: parsedVariantColor || null,
                pproductsPackage: parsedProductsPackage || null,
                pvcweight: vcweight,
                pvcquantity: vcquantity,
                pvcphoto: urlPhoto,
                pdecprice1: decprice1,
                pdecprice2: decprice2,
                pdecprice3: decprice3,
                pistock: istock,
                pistocklimit: istocklimit,
            }
        }
    )
        .then((result: any) => {
            try {
                // El SP devuelve un JSON con el campo 'insertado'
                const valor = JSON.parse(result[0].insertado);
                const resultado = valor.insertado;

                console.log('Resultado de insertar:', resultado);
                if (resultado === '0' || resultado === 0) {
                    res.send({ valor: 0, message: valor.mensaje });
                } else {
                    res.send({ valor: 1, message: valor.mensaje });
                }
            } catch (parseError) {
                console.error('Error al parsear respuesta del SP:', parseError);
                res.status(500).send({ valor: 1, message: 'Error procesando la respuesta del servidor' });
            }
        })
        .catch((error) => {
            console.error('Error al ejecutar SP:', error);
            res.status(500).send({ valor: 1, message: 'Error al crear el producto' });
        });
};

export const getAllProducts = async (_: Request, res: Response) => {
    try {
        // 1) Traer todos los productos con items de paquete
        const productos = await Products.findAll({
            where: { isactive: 1 },
            include: [
                {
                    model: ProductPakcageItemsModel,
                    as: "packageItems",
                    required: false,
                },
            ],
            order: [["dtcreation", "DESC"]],
        });

        const plainProducts = productos.map((p: any) => p.toJSON());

        console.log(productos)
        // 2) Juntar TODOS los productId hijos de todos los paquetes
        const allPackageItemIds = new Set<string>();

        plainProducts.forEach((p: any) => {
            if (p.producttype === "PACKAGE" && Array.isArray(p.packageItems)) {
                p.packageItems.forEach((i: any) => {
                    if (i.productId) allPackageItemIds.add(i.productId);
                });
            }
        });

        let mapHijos: Record<string, any> = {};

        if (allPackageItemIds.size > 0) {
            const hijos = await Products.findAll({
                where: { iIdProduct: Array.from(allPackageItemIds) },
                // ⬅ aquí mandas todos los campos que necesitas para calcular precio
                attributes: [
                    "iIdProduct",
                    "vcname",
                    "decprice1", // ej: público
                    "decprice2", // ej: salón
                    "decprice3", // ej: distribuidor
                ],
            });

            mapHijos = Object.fromEntries(
                hijos.map((h: any) => [
                    h.iIdProduct,
                    {
                        iIdProduct: h.iIdProduct,
                        vcname: h.vcname,
                        decprice1: h.decprice1,
                        decprice2: h.decprice2,
                        decprice3: h.decprice3,
                    },
                ])
            );
        }

        // 3) Enriquecer cada packageItem con el producto hijo (SIN decidir precio)
        const productosConHijos = plainProducts.map((p: any) => {
            if (
                p.producttype === "PACKAGE" &&
                Array.isArray(p.packageItems) &&
                p.packageItems.length > 0
            ) {
                p.packageItems = p.packageItems.map((i: any) => {
                    const hijo = mapHijos[i.productId];

                    return {
                        ...i,
                        product: hijo || null,
                        product_name: hijo?.vcname || "(desconocido)",
                        // ❌ NO calculamos product_price aquí
                    };
                });
            }

            return p;
        });
        
        res.json(productosConHijos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener productos" });
    }
};

export const getInactiveProducts = async (_: Request, res: Response) => {
    try {
        const productos = await Products.findAll({
            where: { isactive: 0 },
            include: [
                {
                    model: ProductPakcageItemsModel,
                    as: "packageItems",
                    required: false,
                },
            ],
            order: [["dtupdate", "DESC"]],
        });

        res.json(productos.map((p: any) => p.toJSON()));
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Error al obtener productos inactivos" });
    }
};



export const getProductsByCompany = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        console.log(id)
        if (!id) {
            return res.status(400).json({
                ok: false,
                message: "Debe enviar el parámetro companyId",
            });
        }

        const products = await Products.findAll({
            where: {
                iFIdCompany: id,
                isactive: 1
            },
            order: [["vcname", "ASC"]],
        });

        return res.json({
            ok: true,
            products,
        });
    } catch (error) {
        console.error("Error en getProductsByCompany:", error);
        return res.status(500).json({
            ok: false,
            message: "Error al obtener los productos por empresa",
        });
    }
};


export const getProductById = async (req: Request, res: Response) => {
    const id = req.params.id
    console.log(id)
    const producto = await Products.findOne({ where: { iIdProduct: id } })
    if (producto) {
        res.json(producto)
    } else {
        res.send({ valor: 1, message: 'Error al encontrar el producto' })
    }
}

export const getProductSimilar = async (req: Request, res: Response) => {
    const { idProduct, idUser } = req.query
    console.log(idProduct)
    await conn.query('CALL GetSimilarProductsByCategory(:p_userId ,:p_productId)',
        {
            replacements: {
                p_userId: idUser || null,
                p_productId: idProduct
            }
        }
    ).then((result: any) => {
        res.json(result)
    }).catch((error) => {
        res.send({ value: 1, message: 'Error al obtener productos similares', error })
    })
}

export const updateProduct = async (req: Request, res: Response) => {
    const {
        piIdProduct,
        iFIdCompany,
        vccategories,
        vcname,
        vcdescription,
        producttype,
        relatedproductId,
        variantcolor,
        productsPackage,
        vcweight,
        vcquantity,
        decprice1,
        decprice2,
        decprice3,
        istock,
        istocklimit,
        vcphoto
    } = req.body
    console.log({
        piIdProduct
        , iFIdCompany
        , vccategories
        , vcname
        , vcdescription
        , producttype
        , relatedproductId
        , variantcolor
        , productsPackage
        , vcweight
        , vcquantity
        , decprice1
        , decprice2
        , decprice3
        , istock
        , istocklimit
        , vcphoto
    })

    console.log(req.file || vcphoto)

    // Guard: en paquetes, ninguna cantidad puede superar el stock actual del componente
    try {
        const stockError = await validatePackageStock(producttype, productsPackage);
        if (stockError) {
            return res.send({ valor: 1, message: stockError });
        }
    } catch (validationError) {
        console.error('Error validando stock del paquete:', validationError);
        return res.status(500).send({ valor: 1, message: 'Error al validar el stock del paquete' });
    }

    if (req.file || vcphoto) {
        const urlPhoto = req?.file?.path ?? null
        console.log(urlPhoto)
        const parsedVariantColor = typeof variantcolor === 'string' ? variantcolor : JSON.stringify(variantcolor);
        const parsedProductsPackage = typeof productsPackage === 'string' ? productsPackage : JSON.stringify(productsPackage);
        await conn.query(
            `CALL ProductCategoriesUpdate(
                    :piIdProduct, :piFIdCompany, :pvccategories, :pvcname, :pvcdescription,
                    :pproducttype, :prelatedProductId, :pvariantColor, :pproductsPackage,
                    :pvcweight, :pvcquantity, :pvcphoto,
                    :pdecprice1, :pdecprice2, :pdecprice3, :pistock, :pistocklimit
                )`,
            {
                replacements: {
                    piIdProduct,
                    piFIdCompany: iFIdCompany,
                    pvccategories: vccategories,
                    pvcname: vcname,
                    pvcdescription: vcdescription,
                    pproducttype: producttype,                         // 'SIMPLE' | 'VARIANT' | 'PACKAGE'
                    prelatedProductId: relatedproductId || null,       // solo VARIANT
                    pvariantColor: parsedVariantColor || null,               // solo VARIANT (JSON string o null)
                    pproductsPackage: parsedProductsPackage || null,         // solo PACKAGE (JSON array string o null)
                    pvcweight: vcweight,
                    pvcquantity: vcquantity,
                    pvcphoto: urlPhoto,                                 // req.file?.path || vcphoto || null
                    pdecprice1: decprice1,
                    pdecprice2: decprice2,
                    pdecprice3: decprice3,
                    pistock: istock,
                    pistocklimit: istocklimit,
                },
            }
        ).then((result: any) => {
            console.log(result)
            let valor = JSON.parse(result[0].Actualizado)
            let resultado = valor.Actualizado
            console.log('resultado de actualizar', resultado);
            if (resultado == 0) {
                res.send({ valor: 0, message: 'Producto actualizado correctamente' })
            } else {
                res.send({ valor: 1, message: 'Error al actualizar el producto' })
            }
        })
    }
}


export const deleteProduct = async (req: Request, res: Response) => {
    const id = req.params.id;

    try {
        let txInfo: any[] | undefined;
        // Revisar reservaciones antes de borrar: liberar las pendientes y bloquear las comprometidas
        const reservations = await InventoryReservationModel.findAll({
            where: { productId: id },
            attributes: ["orderId", "status", "expiresAt"],
        });

        if (reservations.length > 0) {
            const reservedOrders = reservations
                .filter((r) => r.getDataValue("status") === "reserved")
                .map((r) => r.getDataValue("orderId"));

            const committedOrders = reservations
                .filter((r) => r.getDataValue("status") === "committed")
                .map((r) => r.getDataValue("orderId"));

            const orderIds = Array.from(new Set([...reservedOrders, ...committedOrders]));

            const transactions = await TransactionModel.findAll({
                where: { iOrderPendingId: { [Op.in]: orderIds } },
                attributes: ["iIdTransaction", "iOrderPendingId", "status"],
            });

            txInfo = transactions.map((t) => ({
                transactionId: t.getDataValue("iIdTransaction"),
                orderId: t.getDataValue("iOrderPendingId"),
                status: t.getDataValue("status"),
            }));

            // Liberar y eliminar reservas pendientes (reserved), incluso si están vencidas
            if (reservedOrders.length > 0) {
                await InventoryReservationModel.update(
                    { status: "released" },
                    { where: { productId: id, status: "reserved" } }
                );
                await InventoryReservationModel.destroy({
                    where: { productId: id, status: "released" },
                });
            }
        }

        const [updated] = await Products.update(
            { isactive: 0, dtupdate: new Date() },
            { where: { iIdProduct: id } }
        );

        // Quitar el producto de todos los carritos para evitar compras con items inactivos
        try {
            await CartItemsModel.destroy({ where: { iFIdProduct: id } });
        } catch (err) {
            console.error('No se pudieron limpiar los carritos para el producto inactivado:', err);
        }

        if (updated) {
            console.log(`Producto con ID ${id} marcado como inactivo`);
            res.status(200).json({
                valor: 0,
                message: 'Producto inactivado correctamente',
                infoTransacciones: txInfo || undefined
            });
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error eliminando el producto:', error);
        res.status(500).json({ valor: 1, message: 'Error al eliminar el producto', error });
    }
};

export const activateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const [updated] = await Products.update(
            { isactive: 1, dtupdate: new Date() },
            { where: { iIdProduct: id } }
        );

        if (updated) {
            return res.status(200).json({ valor: 0, message: 'Producto activado correctamente' });
        }

        return res.status(404).json({ valor: 1, message: 'Producto no encontrado' });
    } catch (error) {
        console.error('Error activando el producto:', error);
        return res.status(500).json({ valor: 1, message: 'Error al activar el producto', error });
    }
};
