import { Heart, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useProductDetail } from '../hooks/useProductDetail'
import { useCartStore } from '../hooks/useCartStore'
import axios from 'axios'
import { Product } from '../interfaces/products'



export const ProductDetail = () => {
    const { id } = useParams<{ id: string }>()
    const { addToCart } = useCartStore()
    const { product, loading, error } = useProductDetail(id || '')
    const navigate = useNavigate()
    const [productosSimilares, setProductosSimilares] = useState<Product[]>([])
    const [quantity, setQuantity] = useState(1)

    useEffect(() => {
        axios.get(`https://api.sensalon.com.mx/api/productosSimilares?idProduct=${id}`).then((res) => {
            setProductosSimilares(res.data)
        })
    }, [])

    console.log(productosSimilares)
    if (loading) return <p>Cargando...</p>;
    if (error) return <p>Error: {error}</p>;
    if (!product) return <p>Producto no encontrado.</p>;

    const decreaseQuantity = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const increaseQuantity = () => {
        if (quantity < product.istock) setQuantity(quantity + 1);
    };

    console.log(product)
    return (
        <main className="container mx-auto px-4 py-16">
            <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/2">
                    {product?.vcphoto && (
                        <>
                            {product.vcphoto.split(',').map((path: string, index: number) => {
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
                    <h1 className="text-3xl font-bold mb-4">{product?.vcname}</h1>
                    <p className='text-sm'></p>

                    <p className="text-2xl font-bold mb-6">${product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 'Precio no disponible'}</p>
                    <p className="text-gray-700 mb-8">{product?.vcdescription}</p>
                    <div className="mb-10">
                        <h3 className="font-semibold mb-4">Tamaño el producto</h3>
                        <div className="flex space-x-4">
                            <button className="border cursor-none rounded-full px-4 py-2">{product.vcweight}</button>

                        </div>
                    </div>
                    <div className="flex items-center mb-16">
                        <button onClick={decreaseQuantity} className="border rounded-l-full px-4 py-2">
                            <Minus size={20} />
                        </button>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, Math.min(product?.istock, parseInt(e.target.value))))}
                            className="w-16 text-center border-t border-b py-1.5"
                        />
                        <button onClick={increaseQuantity} className="border rounded-r-full px-4 py-2">
                            <Plus size={20} />
                        </button>
                        <p className='px-5 text-base'>En existencia: <strong>{product.istock}</strong></p>
                    </div>
                    <div className="flex items-center  gap-10 mb-8">
                        <button onClick={() => { addToCart(product) }} className="w-72 bg-black text-white py-3 px-6 rounded-full hover:bg-opacity-90 transition-colors flex items-center justify-center">
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
                    {productosSimilares.map((product) => {
                        const normalizedPath = product.vcphoto.replace(/\\/g, "/").split("/imagenes/")[1];
                        const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;
                        return (
                            <div key={product.iIdProduct} className="group">
                                <div className="mb-4 relative overflow-hidden rounded-lg">
                                    <img src={imageUrl} alt={product.vcname} width={300} height={300} className="w-full h-64 object-cover" />
                                    <div className="absolute flex-col gap-4 inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => addToCart(product)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">Agregar al carrito</button>
                                        <button onClick={() => navigate(`/productDetail/${product.iIdProduct}`)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">Ver producto</button>
                                    </div>
                                </div>
                                <h3 className="font-medium">{product.vcname}</h3>
                                <h4 className='text-sm'>{product.vcdescription}</h4>
                                <p className="text-lg font-bold">${product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 'Precio no disponible'}</p>
                            </div>
                        )
                    })}
                </div>
            </section>
        </main>
    )
}