import { useEffect, useMemo } from "react";
import CategoryGrid from "../components/Grid/categoriGrid";
import { useProductStore } from "../hooks/useProductStore";
import { useCategorieStore } from "../hooks/useCategorieStore";
import { useCompanieStore } from "../hooks/useCompanieStore";
import { useCartStore } from "../hooks/useCartStore";
import { useNavigate } from "react-router-dom";

export const Home = () => {
    const { products, fetchProducts } = useProductStore()
    const { categories, fetchCategories } = useCategorieStore()
    const { companies, fetchCompanies } = useCompanieStore()
    const navigate = useNavigate()

    const { addToCart } = useCartStore()
    useEffect(() => {
        const loadData = async () => {
            await Promise.all([
                products.length === 0 && fetchProducts(),
                categories.length === 0 && fetchCategories(),
                companies.length === 0 && fetchCompanies()
            ])
        }
        loadData()
    }, [products.length, categories.length, companies.length])

    console.log(products)

    const productsNuevos = useMemo(
        () =>
            [...products]
                .sort((a, b) => new Date(b.dtcreation).getTime() - new Date(a.dtcreation).getTime())
                .slice(0, 4),
        [products]
    );

    const productsTopVentas = useMemo(
        () =>
            [...products]
                .sort((a, b) => b.istock - a.istock)
                .slice(0, 4),
        [products]
    );

    const categoriesVisita = useMemo(
        () =>
            [...categories]
                .sort((a, b) => new Date(b.dtcreation).getTime() - new Date(a.dtcreation).getTime())
                .slice(0, 4),
        [categories]
    );

    return (
        <main className="py-5">
            <section className="bg-[#1d1d1b] text-white py-16 rounded-xl px-7">
                <div className="container mx-auto px-3">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="mb-8 md:mb-0 md:w-1/2">
                            <h2 className="text-4xl md:text-6xl font-bold mb-4">Encuentra la Belleza que Va Contigo</h2>
                            <p className="text-lg text-pretty mb-6 leading-relaxed">Brilla con confianza con products que realzan tu estilo y resaltan tu
                                belleza natural. Descubre nuestra selección de products diseñados para hacerte sentir única y auténtica en cada momento.
                                En Sensalon, creemos que la verdadera belleza está en ser tú misma.</p>
                            <button onClick={() => navigate('/productos')} className="bg-white text-black px-8 py-3 rounded-full font-medium">Comprar ahora</button>
                        </div>
                        <div className="md:w-1/2 px-5">
                            <img src="/img/hola.jpg" alt="Featured products" width={600} height={400} className="rounded-lg" />
                        </div>
                    </div>
                    {/* <div className="mt-12 flex justify-between items-center">
                        <p className="text-lg font-medium p-2 bg-white rounded-full text-black">+{products.length} Productos</p>
                        <p className="text-lg font-medium">Convenio con +{companies.length} empresas</p>
                        <p className="text-lg font-medium">30,000+ Customers</p>
                    </div> */}
                </div>
            </section>

            <section className="py-12 px-10 mb-10">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl  font-bold mb-8">Nuevos Productos</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {productsNuevos.map((product) => {

                            const normalizedPath = product?.vcphoto?.replace(/\\/g, '/').split('/imagenes/')[1];
                            const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;
                            return (
                                <div key={product.iIdProduct} className="group">
                                    <div className="mb-4 relative overflow-hidden rounded-lg">
                                        <img src={imageUrl} alt={product.vcname} width={300} height={300} className="w-full h-64 object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col gap-5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => addToCart(product)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">Añadir al carrito</button>
                                            <button onClick={() => navigate(`/productDetail/${product.iIdProduct}`)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">Ver producto</button>
                                        </div>
                                    </div>
                                    <h3 className="font-medium">{product.vcname}</h3>
                                    <p className="text-sm text-pretty mt-1 mb-1 truncate-multiline">{product.vcdescription}</p>
                                    <p className="text-lg font-bold">${product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 'Precio no disponible'}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section className="py-12 bg-gray-100 rounded-lg px-10 mb-10">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold mb-8">Top Ventas</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {productsTopVentas.map((product) => {
                            const normalizedPath = product?.vcphoto?.replace(/\\/g, '/').split('/imagenes/')[1];
                            const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;
                            return (
                                <div key={product.iIdProduct} className="group">
                                    <div className="mb-4 relative overflow-hidden rounded-lg">
                                        <img src={imageUrl} alt={product.vcname} width={300} height={300} className="w-full h-64 object-cover" />
                                        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col gap-5 items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => addToCart(product)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">Añadir al carrito</button>
                                            <button onClick={() => navigate(`/productDetail/${product.iIdProduct}`)} className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium">Ver producto</button>
                                        </div>
                                    </div>
                                    <h3 className="font-medium">{product.vcname}</h3>
                                    <p className="text-sm text-pretty mt-1 mb-1 truncate-multiline">{product.vcdescription}</p>
                                    <p className="text-lg font-bold">${product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 'Precio no disponible'}</p>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </section>

            <section className="py-10 mb-10">
                <CategoryGrid categoriasVisita={categoriesVisita} />
            </section>

            <section className="bg-gray-100 rounded-xl px-4 py-12 overflow-hidden">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold mb-14 ml-4">Nuestras Marcas</h2>
                    <div className="relative">
                        <div className="flex overflow-x-hidden">
                            <div className="flex space-x-8 py-2 animate-scroll">
                                {[...companies, ...companies].map((empresa, index) => (
                                    <div
                                        key={index}
                                        className="flex-shrink-0 w-48 mb-1 h-48 bg-white  shadow-md rounded-full flex items-center justify-center transform hover:scale-105 transition-transform duration-300"
                                    >
                                        <span className="text-lg font-bold text-black">{empresa.vcname}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="absolute top-0 bottom-0 left-0 w-1/12 bg-gradient-to-r from-gray-100 to-transparent pointer-events-none"></div>
                        <div className="absolute top-0 bottom-0 right-0 w-1/12 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none"></div>
                    </div>
                </div>
            </section>

        </main>
    );
};
