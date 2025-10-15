import { useEffect, useMemo } from "react";
import { useCartStore } from "../../hooks/useCartStore";
import { Product } from "../../interfaces/products";
import { useCompanieStore } from "../../hooks/useCompanieStore";

interface ProductCardProps {
    product: Product;
    isNew?: boolean;
    isBestSeller?: boolean;
    badges?: string[];
}

export const ProductCard = ({
    product,
    isNew,
    isBestSeller,
    badges = [],
}: ProductCardProps) => {
    const { addToCart } = useCartStore();
    const { companies, fetchCompanies } = useCompanieStore();

    // Cargar empresas si aún no están en memoria
    useEffect(() => {
        if (!companies || companies.length === 0) {
            fetchCompanies?.();
        }
    }, [companies, fetchCompanies]);

    console.log(product)
    const companyName = useMemo(() => {
        const companyId = (product as any).iIdCompany || (product as any).iFIdCompany || (product as any).companyId;
        if (!companyId) return "Sin empresa";
        const found = companies?.find((c) => c.iIdCompany === companyId);
        return found?.vcname ?? "Sin empresa";
    }, [companies, product]);

    const handleAddToCart = () => {
        addToCart(product);
    };

    return (
        <div className="flex flex-col rounded-xl transition">
            <a
                href={`/productDetail/${product.iIdProduct}`}
                className="group cursor-pointer transform transition duration-300 ease-in-out hover:scale-105"
            >
                <div className="mb-4 relative overflow-hidden rounded-lg aspect-square w-full max-w-md sm:max-w-sm md:max-w-full mx-auto">
                    <img
                        src={product.vcphoto || "/placeholder.png"}
                        alt={product.vcname}
                        className="w-full h-full object-cover transition duration-300 ease-in-out group-hover:scale-110"
                    />
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                        {isNew && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#fce7f3] text-[#831843]">
                                Nuevo
                            </span>
                        )}
                        {isBestSeller && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                Más vendido
                            </span>
                        )}
                        {badges.map(
                            (badge, index) =>
                                badge !== "New" &&
                                badge !== "Best Seller" && (
                                    <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-700 text-white rounded"
                                    >
                                        {badge}
                                    </span>
                                )
                        )}
                    </div>
                </div>

                {/* Info */}
                <div className="text-center sm:text-left">
                    <p className="text-sm uppercase font-medium text-gray-500">
                        {companyName}
                    </p>
                    <h3 className="text-lg font-medium mt-1 mb-2 line-clamp-2">
                        {product.vcname}
                    </h3>
                    <span className="text-red-700 text-md font-bold text-lg mb-2 block">
                        $
                        {Number(
                            product.decprice1 ?? product.decprice2 ?? product.decprice3 ?? 0
                        ).toFixed(2)}
                    </span>
                </div>
            </a>

            {/* Botón */}
            <button
                onClick={handleAddToCart}
                className=" mt-3 w-1/2 text-white  py-2  rounded-full  bg-black  hover:bg-gray-800  transition  duration-300 mx-auto md:mx-0 md:w-1/2     "
            >
                Agregar al carrito
            </button>


        </div>

    );
};
