import { useCallback, useEffect, useState } from "react";
import { useProductStore } from "../../hooks/useProductStore";
import { AnimatePresence } from "framer-motion";
import { useCartStore } from "../../hooks/useCartStore";
import { Companie } from "../../interfaces/empresas";
import { api } from "../../utils/axiosClients";
import { Categorie } from "../../interfaces/categorias";
import { isAdminUser, isDistributorUser, isGuestUser, isNormalUser, isSalonUser, readUser } from "../../helpers/detectedUserRole";
import { isNewProduct } from "../../helpers/isNewProduct";
import { groupVariantProducts } from "../../utils/groupedVariants";

export const ProductosView = () => {
    const {
        products,       // usar si quieres mostrar spinner mientras refresca
        fetchFromCache,
        startAutoRefresh,
        stopAutoRefresh,
    } = useProductStore();
    const { addToCart } = useCartStore()

    const [visibleProducts, setVisibleProducts] = useState(12)
    const [sortedProducts, setSortedProducts] = useState(products)

    //Filtros
    const [sortOption, setSortOption] = useState("Mas popular")
    const [open, setOpen] = useState<Boolean>(false)
    const [priceFrom, setPriceFrom] = useState<string>("");
    const [priceTo, setPriceTo] = useState<string>("");
    const [brands, setBrands] = useState<Companie[]>([])
    const [categories, setCategories] = useState<Categorie[]>([])
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [loadingFilters, setLoadingFilters] = useState<boolean>(true);
    const [priceError, setPriceError] = useState<string>("");

    const user = readUser();
    const isDistributor = isDistributorUser(user);

    console.log(isDistributor)

    const getAllBrandsandCategories = async () => {
        setLoadingFilters(true);
        try {
            const [marcas, categorias] = await Promise.all([
                api.get("/empresas"),
                api.get("/categorias"),
            ]);
            setBrands(marcas.data);
            setCategories(categorias.data);
        } finally {
            setLoadingFilters(false);
        }
    }

    useEffect(() => {
        getAllBrandsandCategories()
    }, [])

    // 1) Al montar: leer cache y arrancar el auto-refresh
    useEffect(() => {
        fetchFromCache();                 // pinta lo que haya en localStorage
        startAutoRefresh(5 * 60 * 1000);  // 5 minutos
        return () => stopAutoRefresh();
    }, [fetchFromCache, startAutoRefresh, stopAutoRefresh]);

    // 2) Cada vez que cambien los productos, actualiza la lista visible
    useEffect(() => {
        setSortedProducts(products); // 0 productos es válido
    }, [products]);

    const getEffectivePrice = (p: any): number => {
        // toma el primer precio disponible
        const prices = [p.decprice1, p.decprice2, p.decprice3]
            .map(Number)
            .filter((val) => !isNaN(val) && val > 0);
        return prices.length > 0 ? prices[0] : 0; // default 0 si no hay
    };


    const sortProducts = useCallback((list: any[], option: string) => {
        let sorted = [...list];
        switch (option) {
            case "Nuevos":
                sorted.sort(
                    (a, b) =>
                        new Date(b.dtcreation).getTime() -
                        new Date(a.dtcreation).getTime()
                );
                break;
            case "Precio: Menor a Mayor":
                sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
                break;
            case "Precio: Mayor a Menor":
                sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
                break;
            default:
                break;
        }
        return sorted;
    }, []);

    console.log(selectedBrands)
    useEffect(() => {
        let filtered = [...products];

        // marcas
        console.log("Ejemplo de producto:", products[0]);

        // 🔹 Filtro de marcas — admite ID o nombre
        if (selectedBrands.length > 0) {
            filtered = filtered.filter((p) => {
                console.log(p)
                const brandId = p.iIdCompany || p.iFIdCompany || p.company?.vcname || "";
                return selectedBrands.includes(brandId);
            });
        }


        // categorías
        if (selectedCategories.length > 0) {
            filtered = filtered.filter((p) => {
                try {
                    const parsed = JSON.parse(p.vccategories || '{}');
                    const ids = parsed?.Categorias?.map((c: any) => c.idCategoria) || [];
                    return ids.some((id: string) =>
                        selectedCategories.includes(id)
                    );
                } catch {
                    return false;
                }
            });
        }

        // precio
        const min = priceFrom ? Number(priceFrom) : 0;
        const max = priceTo ? Number(priceTo) : Infinity;

        if (!isNaN(min) && !isNaN(max)) {
            if (min > max) {
                setPriceError("El precio 'Desde' no puede ser mayor que el precio 'Hasta'.");
            } else {
                setPriceError(""); // limpiar error si todo está bien
                filtered = filtered.filter((p) => {
                    const price = getEffectivePrice(p);
                    return price >= min && price <= max;
                });
            }
        }

        // ordenar
        filtered = groupVariantProducts(filtered);

        // 🔹 Ordenar
        filtered = sortProducts(filtered, sortOption);

        setSortedProducts(filtered);
    }, [products, selectedBrands, selectedCategories, priceFrom, priceTo, sortOption, sortProducts]);


    const showMore = () => setVisibleProducts((prev) => prev + 16);

    const visibleItems = sortedProducts.slice(0, visibleProducts)

    const toggleBrand = (name: string) => {
        setSelectedBrands((prev) =>
            prev.includes(name) ? prev.filter((b) => b !== name) : [...prev, name]
        );
    };

    const toggleCategory = (id: string) => {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    };

    const DistributorEmptyState = () => (
        <div className="w-full bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-yellow-900">
            <h3 className="text-lg font-semibold mb-1">No se encuentran productos</h3>
            <p className="text-sm">
                Este usuario es <strong>Distribuidor</strong>, puede que no haya productos de esta marca, no se tenga asignada esta marca o que aún no se le haya asignado ninguna marca.
                Por favor contacta a un administrador para cualquier aclaración.
            </p>
        </div>
    );

    // Empty state genérico si quieres (para otros roles)
    const GenericEmptyState = () => (
        <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-6 text-gray-700">
            <h3 className="text-lg font-semibold mb-1">No hay productos para mostrar</h3>
            <p className="text-sm">Intenta ajustar los filtros o vuelve a intentarlo más tarde.</p>
        </div>
    );

    return (
        <div className="flex-grow">
            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    <aside className="w-full lg:w-1/4">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold mb-4">Filtros</h2>
                            <hr className="mb-4" />
                            <div>
                                <h3 className="font-semibold mb-2">Marcas</h3>
                                {loadingFilters ? (
                                    [...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"
                                        ></div>
                                    ))
                                ) : (
                                    brands.map((brand) => (
                                        <div key={brand.iIdCompany} className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                                checked={selectedBrands.includes(brand.iIdCompany || "")}
                                                onChange={() => toggleBrand(brand.iIdCompany)}
                                            />
                                            <label className="ml-2 text-gray-700">{brand.vcname}</label>
                                        </div>
                                    ))
                                )}
                            </div>
                            <hr className="mt-4" />
                            <div className="mt-6">
                                <h3 className="font-semibold mb-2">Categorías</h3>
                                {loadingFilters ? (
                                    [...Array(4)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-5 w-32 bg-gray-200 rounded animate-pulse mb-2"
                                        ></div>
                                    ))
                                ) : (
                                    categories.map((category) => (
                                        <div key={category.iIdCategory} className="flex items-center mb-2">
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                                checked={selectedCategories.includes(category.iIdCategory)}
                                                onChange={() => toggleCategory(category.iIdCategory)}
                                            />
                                            <label className="ml-2 text-gray-700">{category.vcname}</label>
                                        </div>
                                    ))
                                )}
                            </div>
                            <hr className="mt-4" />
                            {/* Rango de Precio */}
                            <div className="mb-6 mt-6">
                                <h3 className="font-semibold mb-2">Rango de Precio</h3>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        placeholder="Desde"
                                        value={priceFrom}
                                        onChange={(e) => setPriceFrom(e.target.value)}
                                        className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Hasta"
                                        value={priceTo}
                                        onChange={(e) => setPriceTo(e.target.value)}
                                        className="w-1/2 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {priceError && (
                                    <p className="text-red-500 text-sm mt-2">{priceError}</p>
                                )}
                            </div>
                        </div>
                    </aside>

                    <div className="w-full lg:w-3/4">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-semibold text-gray-800 p-2 bg-gray-100 rounded-lg px-5">Total de <strong> {sortedProducts.length}</strong> productos </h2>
                            <div className="flex items-center ">
                                <span className="mr-2 text-lg font-semibold text-gray-800">Ordenar por :</span>
                                <div className="relative">
                                    <select
                                        onClick={() => setOpen(!open)}
                                        onChange={(e) => setSortOption(e.target.value)}
                                        className="appearance-none border rounded-2xl px-5 py-1 text-lg pr-10 bg-white shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        value={sortOption}
                                    >
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

                        {sortedProducts.length === 0 ? (
                            <div className="mt-2">
                                {isDistributor ? <DistributorEmptyState /> : <GenericEmptyState />}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence>
                                    {visibleItems.map((product) => {
                                        const normalizedPath = product?.vcphoto?.replace(/\\/g, "/").split("/imagenes/")[1];
                                        const imageUrl = `https://api.sensalon.com.mx/imagenes/${normalizedPath}`;
                                        const isNew = isNewProduct(product.dtcreated);
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
                                        const i = product?.istock ?? 0;
                                        const lim = product?.istocklimit ?? 0;
                                        const cls =
                                            i === 0
                                                ? 'bg-red-50 border border-red-200 text-red-700'
                                                : i <= lim
                                                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-700'
                                                    : 'bg-green-50 border border-green-200 text-green-700';
                                        return (
                                            <div className="bg-white rounded-lg shadow-md overflow-hidden group cursor-pointer transform transition duration-300 ease-in-out hover:scale-105">
                                                <a href={`/productDetail/${product.iIdProduct}`} rel="noopener noreferrer">
                                                    <img
                                                        src={imageUrl}
                                                        alt={product.vcname}
                                                        className="w-full h-80 object-cover"
                                                    />
                                                    {isNew && (
                                                        <span className="absolute top-3 right-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-900 shadow-sm">
                                                            Nuevo
                                                        </span>
                                                    )}
                                                    <div className="p-4">
                                                        <div className="flex flex-row justify-between items-center">
                                                            <h3 className="font-medium mb-1 text-lg text-nowrap">{product.vcname}</h3>
                                                            <p className={`text-xs mt-1 font-medium rounded-full p-2 border ${cls}`}>
                                                                {i === 0 ? 'Sin stock' : `En stock`}
                                                            </p>
                                                        </div>

                                                        <p className="text-md text-red-700 font-bold">${userPrice ?? 'Precio no disponible'}</p>
                                                    </div>

                                                </a>
                                                {product.childrenVariants && product.childrenVariants.length > 0 && (
                                                    <div className="px-4 pb-2">
                                                        <p className="text-xs text-gray-500 mb-1">
                                                            Variantes disponibles:
                                                        </p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {product.childrenVariants.map((v: any) => (
                                                                <span
                                                                    key={v.iIdProduct}
                                                                    className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-700"
                                                                >
                                                                    {v.variantcolor || v.vcname}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                                {/* Botones de acción */}
                                                <div className="p-4">
                                                    <button
                                                        className="w-full bg-gray-700 py-2 text-white rounded-lg hover:bg-gray-900 transition duration-300"
                                                        onClick={() => addToCart(product)}
                                                    >
                                                        Agregar al carrito
                                                    </button>
                                                </div>

                                            </div>
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
