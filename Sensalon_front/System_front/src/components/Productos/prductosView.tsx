import { useCallback, useEffect, useState } from "react";
import { useProductStore } from "../../hooks/useProductStore";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "../../hooks/useCartStore";
import { useNavigate } from "react-router-dom";
export const ProductosView = () => {
    const navigate  = useNavigate()
    const { products, fetchProducts } = useProductStore()
    const { addToCart } = useCartStore()
    const [visibleProducts, setVisibleProducts] = useState(12)
    const [sortedProducts, setSortedProducts] = useState(products)
    const [loading, setLoading] = useState(false); // Estado de carga
    const [sortOption, setSortOption] = useState("Mas popular")
    const [open, setOpen] = useState<Boolean>(false)
    const [priceFrom, setPriceFrom] = useState<string>("");
    const [priceTo, setPriceTo] = useState<string>("");


    useEffect(() => {
        const loadProducts = async () => {
            setLoading(true);
            await fetchProducts();
            setLoading(false);
        };
        if (products.length === 0) loadProducts();
        else setSortedProducts(products);
    }, [fetchProducts, products]);

    const showMore = () => setVisibleProducts((prev) => prev + 16);

    const handlePriceFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPriceFrom(e.target.value);
    };

    const handlePriceToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPriceTo(e.target.value);
    };

    const applyPriceFilter = () => {
        if (Number(priceFrom) > Number(priceTo)) {
            alert("El precio 'Desde' no puede ser mayor que el precio 'Hasta'.");
            return;
        }
        const filtered = products.filter(
            (p) => p.decprice3 >= Number(priceFrom) && p.decprice3 <= Number(priceTo)
        );
        setSortedProducts(filtered);
    };


    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const option = event.target.value;
        setSortOption(option);
        setOpen(false);
        setLoading(true); // Activa el spinner
        setTimeout(() => {
            sortProducts(option);
            setLoading(false); // Desactiva el spinner después del cambio
        }, 500); // Delay para simular transición
    };

    const sortProducts = useCallback((option: string) => {
        let sorted = [...products]; // copia de los productos.
        switch (option) {
            case "Mas popular":
                sorted.sort((a, b) => b.istock - a.istock);
                break;
            case "Empresa":
                sorted.sort((a, b) => a.iFIdCompany.localeCompare(b.iFIdCompany));
                break;
            case "Nuevos":
                sorted.sort((a, b) => new Date(b.dtcreation).getTime() - new Date(a.dtcreation).getTime());
                break;
            case "Precio: Menor a Mayor":
                sorted.sort((a, b) => a.decprice3 - b.decprice3);
                break;
            case "Precio: Mayor a Menor":
                sorted.sort((a, b) => b.decprice3 - a.decprice3);
                break;
            default:
                break;
        }

        setSortedProducts(sorted); // Actualiza los productos ordenados.
    }, [products]);

    const visibleItems = sortedProducts.slice(0, visibleProducts)

    const handleViewProduct = (id: string) => {
        console.log('entrando id', id)
        if(id){
            navigate(`/productDetail/${id}`);
        }
    }

    console.log(products)
    return (
        <div className="flex-grow">
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4">Filtros</h2>

                            {/* Categorías */}
                          {/*   <div className="mb-6">
                                <h3 className="font-semibold mb-2">Categorías</h3>
                                {[
                                    "Shampoo",
                                    "Acondicionador",
                                    "Tintes",
                                    "Cuidado de la Piel",
                                    "Cuidado Corporal",
                                    "Cuidado del Cabello",
                                ].map((category, index) => (
                                    <div key={index} className="flex items-center justify-between mb-2">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                                            <span className="ml-2 text-gray-700">{category}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className="mb-6">
                                <h3 className="font-semibold mb-2">Marcas</h3>
                                {["L'Oreal", "Pantene", "Garnier", "Neutrogena"].map((brand, index) => (
                                    <div key={index} className="flex items-center mb-2">
                                        <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600" />
                                        <label className="ml-2 text-gray-700">{brand}</label>
                                    </div>
                                ))}
                            </div> */}


                            {/* Rango de Precio */}
                            <div className="mb-7">
                                <h3 className="font-semibold mb-2">Rango de Precio</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Desde"
                                        value={priceFrom}
                                        onChange={handlePriceFromChange}
                                        className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Hasta"
                                        value={priceTo}
                                        onChange={handlePriceToChange}
                                        className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <button onClick={applyPriceFilter} className="w-full bg-black text-white py-2 rounded-full font-semibold hover:bg-gray-800 transition duration-300">
                                Aplicar Filtros
                            </button>
                        </div>
                    </aside>

                    <div className="w-full lg:w-3/4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 p-2 bg-gray-100 rounded-lg px-5">Total de <strong> {products.length}</strong> productos </h2>
                            <div className="flex items-center ">
                                <span className="mr-2 text-lg font-semibold text-gray-800">Ordenar por :</span>
                                <div className="relative">
                                    <select
                                        onClick={() => setOpen(!open)}
                                        onChange={handleSelectChange}
                                        className="appearance-none border rounded-2xl px-5 py-1 text-lg pr-10 bg-white shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={sortOption}
                                    >
                                        <option>Mas popular</option>
                                        <option>Nuevos</option>
                                        <option>Precio: Menor a Mayor</option>
                                        <option>Precio: Mayor a Menor</option>
                                    </select>
                                    <span className="absolute inset-y-0 right-3 flex items-center pointer-events-none mt-1">
                                        {open ? (
                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M10 3a1 1 0 01.707.293l4 4a1 1 0 01-1.414 1.414L10 5.414 6.707 8.707A1 1 0 115.293 7.293l4-4A1 1 0 0110 3z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        )}
                                    </span>

                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center items-center min-h-[300px]">
                                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-16 w-16"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {visibleItems.map((product, index) => {
                                        const normalizedPath = product?.vcphoto?.replace(/\\/g, "/").split("/imagenes/")[1];
                                        const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;

                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.3 }}
                                                className="bg-white rounded-lg shadow-md overflow-hidden"
                                            >
                                                <img
                                                    src={imageUrl}
                                                    alt={product.vcname}
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="p-4">
                                                    <h3 className="font-semibold mb-2 text-pretty">{product.vcname}</h3>
                                                    <p className="text-lg font-bold mb-4">${product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 'Precio no disponible'}</p>

                                                    {/* Botones de acción */}
                                                    <div className="flex flex-col sm:flex-row gap-4">
                                                        <button
                                                            className="w-full bg-gray-200 py-2 text-black rounded-lg hover:bg-gray-300 transition duration-300"
                                                            onClick={() => addToCart(product)}
                                                        >
                                                            Agregar al carrito
                                                        </button>
                                                        <button
                                                            className="w-full bg-gray-800 py-2 text-white rounded-lg hover:bg-gray-900 transition duration-300"
                                                            onClick={() => handleViewProduct(product.iIdProduct)}
                                                        >
                                                            Ver producto
                                                        </button>
                                                    </div>

                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>

                        )}

                        {visibleProducts < sortedProducts.length &&
                            (
                                <div className="flex justify-center mt-8">
                                    <button onClick={showMore} className="px-2 py-3 bg-[#1d1d1b] w-72 rounded-xl text-white text-lg text-center font-semibold">Mostras mas</button>
                                </div>
                            )
                        }

                    </div>
                </div>
            </main>
        </div>
    );
};
