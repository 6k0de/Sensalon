import { Request, Response } from "express";
import conn from "../../bd/config/config";
import { Products } from "../../bd/models/Products.model";
import { ProductPakcageItemsModel } from "../../bd/models/ProductsPackageitemst.model";

export const insertProduct = (req: Request, res: Response) => {
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
        // Trae todos los productos con los items si existen
        const productos = await Products.findAll({
            include: [
                {
                    model: ProductPakcageItemsModel,
                    as: 'packageItems',
                    required: false, // LEFT JOIN
                },
            ],
            order: [['dtcreation', 'DESC']],
        });

        // Para cada paquete, busca los nombres de los productos hijos
        const productosConNombres = await Promise.all(
            productos.map(async (p: any) => {
                const plain = p.toJSON();

                // Solo si es PACKAGE
                if (plain.producttype === 'PACKAGE' && plain.packageItems?.length > 0) {
                    const idsHijos = plain.packageItems.map((i: any) => i.productId);

                    // Busca los nombres de esos productos hijos
                    const hijos = await Products.findAll({
                        where: { iIdProduct: idsHijos },
                        attributes: ['iIdProduct', 'vcname'],
                    });

                    const mapHijos = Object.fromEntries(
                        hijos.map((h: any) => [h.iIdProduct, h.vcname])
                    );

                    // Agrega los nombres
                    plain.packageItems = plain.packageItems.map((i: any) => ({
                        ...i,
                        product_name: mapHijos[i.productId] || '(desconocido)',
                    }));
                }

                return plain;
            })
        );

        res.json(productosConNombres);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener productos' });
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
                iFIdCompany: id
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
        const productoEliminado = await Products.destroy({ where: { iIdProduct: id } });

        if (productoEliminado) {
            console.log(`Producto con ID ${id} eliminado`);
            res.status(200).json({ valor: 0, message: 'Producto eliminado correctamente' });
        } else {
            res.status(404).json({ message: 'Producto no encontrado' });
        }
    } catch (error) {
        console.error('Error eliminando el producto:', error);
        res.status(500).json({ valor: 1, message: 'Error al eliminar el producto', error });
    }
};