import { useEffect, useMemo, useState } from "react";
import { useProductStore } from "../hooks/useProductStore";
import { useCategorieStore } from "../hooks/useCategorieStore";
import { useCompanieStore } from "../hooks/useCompanieStore";
import BannerSlider from "../components/Banner/banner";
import { api } from "../utils/axiosClients";
import { ProductCard } from "../components/ProductCard/productCard";
import { isDistributorUser, readUser } from "../helpers/detectedUserRole";

export const Home = () => {
    const { products, startAutoRefresh, stopAutoRefresh, fetchFromCache, refreshFromServer } = useProductStore();
    const { categories, fetchCategories } = useCategorieStore()
    const { companies, fetchCompanies } = useCompanieStore()
    const [sliderImages, setSliderImages] = useState([])

    const user = readUser();
    const isDistributor = isDistributorUser(user);

    const getAllSliderImage = async () => {
        const image = await api.get('/sliderImage')
        setSliderImages(image.data)
    }

    useEffect(() => {
        getAllSliderImage()
    }, [])

    useEffect(() => {
        fetchFromCache();            // pinta lo que haya en localStorage
        startAutoRefresh(5 * 60 * 1000); // 5 minutos
        return () => stopAutoRefresh();
    }, [fetchFromCache, startAutoRefresh, stopAutoRefresh]);

    useEffect(() => {
        refreshFromServer()
    }, [])

    useEffect(() => {
        const loadData = async () => {
            await Promise.all([

                categories.length === 0 && fetchCategories(),
                companies.length === 0 && fetchCompanies()
            ])
        }
        loadData()
    }, [categories.length, companies.length])

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

    return (
        <main className="py-5">
            <section>
                {sliderImages.length === 0 ? (
                    // Skeleton mientras no hay imágenes
                    <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gray-200 animate-pulse rounded-2xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-gray-300 to-gray-200" />
                        <div className="absolute inset-0 flex items-center">
                            {/* … contenido skeleton */}
                        </div>
                    </div>

                ) : (
                    // Slider ya cargado
                    <BannerSlider slides={sliderImages} />
                )}
            </section>

            <section className="py-12 rounded-lg px-4 mx-6 sm:px-6 lg:px-12 mb-10">
                <div className="container mx-auto">
                    <h2 className="text-3xl  font-bold mb-2">Nuevos Productos</h2>
                    <p>Nuestros últimos productos para el cuidado del cuerpo y el cabello, pensados para ti.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {isDistributor && products.length === 0 ? (
                            <div className="col-span-full flex items-center justify-center text-center bg-yellow-50 rounded-2xl p-8 sm:p-10">
                                <div className=" rounded-xl p-4 text-yellow-900">
                                    <p>
                                        No se encuentran productos porque tu cuenta de <strong>Distribuidor</strong> aún no tiene marcas asignadas.
                                        Contacta a un administrador.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {productsNuevos.map((product) => {

                                    const normalizedPath = product?.vcphoto
                                        ?.replace(/\\/g, "/")
                                        .split("/imagenes/")[1];
                                    const imageUrl = `http://localhost:3000/imagenes/${normalizedPath}`;

                                    return (
                                        <ProductCard
                                            key={product.iIdProduct}
                                            product={{ ...product, vcphoto: imageUrl }}
                                            isNew
                                        />
                                    )
                                })}
                            </>
                        )}
                    </div>
                </div>
            </section>

            <section className="py-12 bg-gray-100 rounded-lg px-4 mx-6 sm:px-6 lg:px-12 mb-10">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold">Más Vendidos</h2>
                    <p>Nuestros productos más populares, preferidos por nuestros clientes</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                        {isDistributor && products.length === 0 ? (
                            <div className="col-span-full flex items-center justify-center text-center bg-yellow-50 rounded-2xl p-8 sm:p-10">
                                <div className="rounded-xl p-4 text-yellow-900">
                                    <p>
                                        No se encuentran productos porque tu cuenta de <strong>Distribuidor</strong> aún no tiene marcas asignadas.
                                        Contacta a un administrador.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <>
                                {productsTopVentas.map((product) => {
                                    const normalizedPath = product?.vcphoto
                                        ?.replace(/\\/g, "/")
                                        .split("/imagenes/")[1];
                                    const imageUrl = `http://localhost:3000/imagenes/${normalizedPath}`;

                                    return (
                                        <ProductCard
                                            key={product.iIdProduct}
                                            product={{ ...product, vcphoto: imageUrl }}
                                            isBestSeller
                                        />
                                    );
                                })}
                            </>
                        )}
                    </div>
                </div>
            </section>


            <section className="rounded-xl px-4 py-12 overflow-hidden">
                <div className="container mx-auto">
                    <h2 className="text-3xl font-bold ml-4">Nuestras Marcas</h2>
                    <p className="ml-4">Explora las marcas disponibles en nuestra tienda</p>
                    <div className="relative mt-12">
                        <div className="flex overflow-x-hidden">
                            <div className="flex space-x-8 py-2 animate-scroll">
                                {[...companies, ...companies].map((empresa, index) => {
                                    // Ruta de la imagen en public/img/marcas
                                    const logoUrl = `/img/marcas/${empresa.vcname}.webp`;
                                    return (
                                        <div
                                            key={index}
                                            className="flex-shrink-0 w-48 h-48 mx-2 bg-gray-50 shadow-md rounded-full flex items-center justify-center transform hover:scale-105 transition-transform duration-300"
                                        >
                                            <img
                                                src={logoUrl}
                                                alt={empresa.vcname}
                                                className="w-full h-full object-contain"
                                                onError={(e) => e.currentTarget.parentElement?.remove()}
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        {/* Gradientes laterales */}
                        <div className="absolute top-0 bottom-0 left-0 w-1/12 bg-gradient-to-r from-gray-50 to-transparent pointer-events-none rounded-sm"></div>
                        <div className="absolute top-0 bottom-0 right-0 w-1/12 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none rounded-sm"></div>
                    </div>
                </div>
            </section>


        </main>
    );
};
