import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductDetail } from '../hooks/useProductDetail'
import { useCartStore } from '../hooks/useCartStore'
import { Product } from '../interfaces/products'
import { isAdminUser, isDistributorUser, isGuestUser, isNormalUser, isSalonUser, readUser } from '../helpers/detectedUserRole'
import { api } from '../utils/axiosClients'
import { formatColorName, parseVariantColor } from '../utils/variantColors'

export const ProductDetail = () => {
    const user = readUser();
    const { id } = useParams<{ id: string }>()
    const { addToCart } = useCartStore()
    const { product, loading, error } = useProductDetail(id || '')
    const navigate = useNavigate()
    const [productosSimilares, setProductosSimilares] = useState<Product[]>([])
    const [quantity, setQuantity] = useState(1)
    const [comment, setComment] = useState<string>("")
    const [selectedVariantId, setSelectedVariantId] = useState<string>("")
    console.log(user)
    useEffect(() => {
        api.get(`/productosSimilares?idProduct=${id}?idUser=${user?.iIdUser}`).then((res) => {
            setProductosSimilares(res.data)
        })
    }, [])

    // Construir opciones de variante: padre + hijos
    const variantOptions = useMemo(() => {
        if (!product) return [];

        // Si ya tiene childrenVariants (los que construimos en el hook)
        if (product.childrenVariants && product.childrenVariants.length > 0) {
            return [product, ...product.childrenVariants];
        }

        // Fallback: solo el producto actual
        return [product];
    }, [product]);

    useEffect(() => {
        if (variantOptions.length > 0) {
            setSelectedVariantId((prev) => prev || variantOptions[0].iIdProduct);
        }
    }, [variantOptions]);

    const selectedVariant =
        variantOptions.find((v) => v.iIdProduct === selectedVariantId) ||
        product;

    console.log(productosSimilares)

    const availableStock = selectedVariant?.istock;

    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product) return <p>Producto no encontrado.</p>;

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increaseQuantity = () => {
        if (quantity < availableStock!) setQuantity(quantity + 1);
    };

    const basePrice = () => {
        let p = selectedVariant?.decprice3; // default
        if (isGuestUser(user)) {
            p = selectedVariant?.decprice3; // invitado => 3
        } else if (isDistributorUser(user) || isAdminUser(user)) {
            p = selectedVariant?.decprice1;
        } else if (isSalonUser(user)) {
            p = selectedVariant?.decprice2;
        } else if (isNormalUser(user)) {
            p = selectedVariant?.decprice3;
        }
        return p;
    };

    const getVariantLabel = (p: Product) => {
        // 1) Si ya trae label explícito
        if (p.variantlabel) return p.variantlabel;

        // 2) Intentar obtener el color bonito
        let colorName = "";

        if (p.variantcolor) {
            try {
                const parsed = JSON.parse(p.variantcolor);
                if (parsed?.name) {
                    colorName =
                        parsed.name.charAt(0).toUpperCase() +
                        parsed.name.slice(1).toLowerCase();
                }
            } catch {
                /* ignore */
            }
        }

        // 3) Producto + color
        if (p.vcname && colorName) {
            return `${p.vcname} · ${colorName}`;
        }

        // 4) Solo nombre del producto
        if (p.vcname) return p.vcname;

        // 5) Fallback
        return "Variante";
    };


    const sortedVariants = [...variantOptions].sort((a, b) =>
        getVariantLabel(a).localeCompare(getVariantLabel(b))
    );


    // Construye opciones de atributos a partir de las variantes
    // No hay variantes en la interfaz actual; producttype/relatedproductId llegan planos.

    const displayProduct = selectedVariant;
    const userPrice = basePrice();
    console.log(product)

    return (
        <main className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    {displayProduct?.vcphoto && (
                        <>
                            {displayProduct.vcphoto.split(',').map((path: string, index: number) => {
                                const normalizedPath = path.replace(/\\/g, '/').split('/imagenes/')[1];
                                const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;


                                return (
                                    <img
                                        key={index}
                                        src={imageUrl}
                                        alt={`Product image ${index + 1}`}
                                        width={300}
                                        height={300}
                                        className="w-full rounded-lg"
                                    />
                                );
                            })}
                        </>
                    )}
                </div>
                <div className="md:w-1/2">
                    <h1 className="text-3xl font-bold mb-4">
                        {getVariantLabel(selectedVariant!)}
                    </h1>
                    <p className='text-sm'></p>

                    <p className="text-2xl font-bold mb-6">${userPrice}</p>
                    <p className="text-gray-700 mb-8">{displayProduct?.vcdescription}</p>
                    <div className="flex flex-wrap gap-2">
                        {sortedVariants.map((v) => {
                            const color = parseVariantColor(v.variantcolor);

                            return (
                                <button
                                    key={v.iIdProduct}
                                    onClick={() => setSelectedVariantId(v.iIdProduct)}
                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm
                    ${selectedVariantId === v.iIdProduct
                                            ? "bg-black text-white border-black"
                                            : "bg-white text-gray-700 border-gray-300"
                                        }
                `}
                                >
                                    {/* Nombre del producto */}
                                    <span className="font-medium">
                                        {v.vcname}
                                    </span>

                                    {/* separador */}
                                    {color?.name && (
                                        <span className="text-gray-400">·</span>
                                    )}

                                    {/* color */}
                                    {color?.hex && (
                                        <span
                                            className="w-3 h-3 rounded-full border"
                                            style={{ backgroundColor: color.hex }}
                                            title={formatColorName(color.name)}
                                        />
                                    )}

                                    {color?.name && (
                                        <span className="text-xs">
                                            {formatColorName(color.name)}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>


                    <div className="mb-6 mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Comentarios (opcional)
                        </label>
                        <textarea
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            rows={2}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Escribe un comentario o instrucción"
                        />
                    </div>
                    <div className="mb-10">
                        <h3 className="font-semibold mb-4">Tamaño el producto</h3>
                        <div className="flex space-x-4">
                            <button className="border cursor-none rounded-full px-4 py-2">{displayProduct?.vcweight}</button>

                        </div>
                    </div>
                    <div className="flex items-center mb-16">
                        <button onClick={decreaseQuantity} className="border rounded-l-full px-4 py-2">
                            <Minus size={20} />
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(availableStock!, parseInt(e.target.value))))}
                            className="w-16 text-center border-t border-b py-1.5"
                        />
                        <button onClick={increaseQuantity} className="border rounded-r-full px-4 py-2">
                            <Plus size={20} />
                        </button>
                        <p className='px-5 text-base'>En existencia: <strong>{availableStock}</strong></p>
                    </div>
                    <div className="flex items-center  gap-10 mb-8">
                        <button
                            onClick={() => {
                                addToCart(displayProduct!, {
                                    quantity,
                                    comment: comment.trim() || undefined,
                                })
                            }}
                            disabled={false}
                            className="w-72 bg-black text-white py-3 px-6 rounded-full hover:bg-opacity-90 transition-colors flex items-center justify-center disabled:bg-gray-400"
                        >
                            <ShoppingBag size={20} className="mr-2" />
                            Agregar al carrito
                        </button>
                        {/* <button className="bg-white border border-black text-black py-3 px-4 rounded-full hover:bg-gray-100 transition-colors">
                            <Heart size={20} />
                        </button> */}
                    </div>
                </div>
            </div>

            <section className="mt-16">
                <h2 className="text-2xl font-bold mb-8">Productos similares</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {productosSimilares?.map((product) => {
                        const normalizedPath = product?.vcphoto.replace(/\\/g, "/").split("/imagenes/")[1];
                        const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;
                        let userPrice = product.decprice3; // default
                        if (isGuestUser(user)) {
                            userPrice = product.decprice3; // invitado => 3
                        } else if (isDistributorUser(user) || isAdminUser(user)) {
                            userPrice = product.decprice1;
                        } else if (isSalonUser(user)) {
                            userPrice = product.decprice2;
                        } else if (isNormalUser(user)) {
                            userPrice = product.decprice3;
                        }
                        console.log(product)
                        return (
                            <div key={product?.iIdProduct} className="group">
                                <div className="mb-4 relative overflow-hidden rounded-lg">
                                    <img src={imageUrl} alt={product?.vcname} width={300} height={300} className="w-full h-64 object-cover" />
                                    <div className="absolute flex-col gap-4 inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => addToCart(product)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">Agregar al carrito</button>
                                        <button onClick={() => navigate(`/productDetail/${product?.iIdProduct}`)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">Ver producto</button>
                                    </div>
                                </div>
                                <h3 className="font-medium">{product?.vcname}</h3>
                                <h4 className='text-sm'>{product?.vcdescription}</h4>
                                <p className="text-lg font-bold">
                                    ${userPrice ?? "Precio no disponible"}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </section>
        </main>
    )
}
