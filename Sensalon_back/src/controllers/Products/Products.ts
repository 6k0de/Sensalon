import { Request, Response } from "express";
import conn from "../../bd/config/config";
import { Products } from "../../bd/models/Products.model";

export const insertProduct = (req: Request, res: Response) => {
    const { iFIdCompany, vccategories, vcname, vcdescription, vcweight, vcquantity, decprice1, decprice2, decprice3, istock, istocklimit } = req.body
    console.log({
        iFIdCompany
        , vccategories
        , vcname
        , vcdescription
        , vcweight
        , vcquantity
        , decprice1
        , decprice2
        , decprice3
        , istock
        , istocklimit
    })
    if (req.file) {
        const urlPhoto = req.file.path
        console.log(urlPhoto)
        conn.query(
            'CALL ProductCategoriesInsert(:piFIdCompany, :pvccategories, :pvcname,:pvcdescription, :pvcweight, :pvcquantity, :pvcphoto, :pdecprice1, :pdecprice2, :pdecprice3, :pistock, :pistocklimit)',
            {
                replacements: {
                    piFIdCompany: iFIdCompany,
                    pvccategories: vccategories,
                    pvcname: vcname,
                    pvcdescription: vcdescription,
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
        ).then((result: any) => {
            let valor = JSON.parse(result[0].insertado)
            let resultado = valor.insertado
            console.log('resultado de insertar', resultado);
            if (resultado == 0) {
                res.send({ valor: 0, message: 'Producto creado correctamente' })
            } else {
                res.send({ valor: 1, message: 'Error al crear el producto' })
            }
        }).catch((error) => {
            console.error(error);
        });
    }
}

export const getAllProducts = async (_: Request, res: Response) => {
    const productos = await Products.findAll()
    res.json(productos)
}

export const getProductById = async (req: Request, res: Response) => {
    const id = req.params.id
    console.log(id)
    const producto = await Products.findOne({ where: { iIdProduct: id} })
    if (producto) {
        res.json(producto)
    } else {
        res.send({ valor: 1, message: 'Error al encontrar el producto' })
    }
}

export const getProductSimilar = async(req: Request, res: Response) => {
    const { idProduct, idUser } = req.query
    console.log(idProduct)
    await conn.query('CALL GetSimilarProductsByCategory(:p_userId ,:p_productId)', 
        {
            replacements: {
                p_userId: idUser,
                p_productId: idProduct
            }
        }
    ).then((result: any) => {
        res.json(result)
    }).catch((error) => {
        res.send({value: 1, message: 'Error al obtener productos similares', error})
    })
}

export const updateProduct = async (req: Request, res: Response) => {
    const { piIdProduct, iFIdCompany, vccategories, vcname, vcdescription, vcweight, vcquantity, decprice1, decprice2, decprice3, istock, istocklimit, vcphoto } = req.body
    console.log({
        piIdProduct
        , iFIdCompany
        , vccategories
        , vcname
        , vcdescription
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
        const urlPhoto = req?.file?.path
        console.log(urlPhoto)
        conn.query(
            'CALL ProductCategoriesUpdate(:piIdProduct, :piFIdCompany, :pvccategories, :pvcname,:pvcdescription, :pvcweight, :pvcquantity, :pvcphoto, :pdecprice1, :pdecprice2, :pdecprice3, :pistock, :pistocklimit)',
            {
                replacements: {
                    piIdProduct: piIdProduct,
                    piFIdCompany: iFIdCompany,
                    pvccategories: vccategories,
                    pvcname: vcname,
                    pvcdescription: vcdescription,
                    pvcweight: vcweight,
                    pvcquantity: vcquantity,
                    pvcphoto: urlPhoto || vcphoto,
                    pdecprice1: decprice1,
                    pdecprice2: decprice2,
                    pdecprice3: decprice3,
                    pistock: istock,
                    pistocklimit: istocklimit,
                }
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