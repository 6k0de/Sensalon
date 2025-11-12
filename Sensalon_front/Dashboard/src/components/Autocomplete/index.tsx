import { useState, useEffect, useRef } from "react";

type Product = {
  iIdProduct: string;
  vcname: string;
};

export function ProductAutocomplete({
  products,
  onSelect,
  isPackage,
  initialValue,
}: {
  products: Product[];
  onSelect: (id: string) => void;
  isPackage: boolean;
  initialValue?: any | null;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filtered, setFiltered] = useState<Product[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(true);

  const inputRef = useRef<HTMLInputElement>(null);

  // ✅ Corrige el flujo de carga inicial
  useEffect(() => {
    if (!products || products.length === 0) {
      return; // aún no hay productos
    }

    // Si ya hay productos, quitamos el loader
    setLoading(false);

    if (initialValue) {
      const found = products.find((p) => p.iIdProduct === initialValue);
      if (found) {
        setSearchTerm(found.vcname);
        onSelect(found.iIdProduct);
      }
    } else {
      // no hay valor inicial, pero ya se cargaron productos
      setLoading(false);
    }
  }, [products, initialValue]);

  // 🔍 Filtrar productos mientras escribe
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered([]);
      return;
    }

    const results = products.filter((p) =>
      p.vcname.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFiltered(results.slice(0, 8));
  }, [searchTerm, products]);

  const handleSelect = (product: Product) => {
    setSearchTerm(product.vcname);
    setShowList(false);
    setActiveIndex(-1);
    onSelect(product.iIdProduct);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showList) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev <= 0 ? filtered.length - 1 : prev - 1
      );
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(filtered[activeIndex]);
    } else if (e.key === "Escape") {
      setShowList(false);
    }
  };

  return (
    <div className="relative">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {!isPackage
          ? "Producto relacionado"
          : "Productos dentro del paquete:"}
      </label>

      {/* Loader mientras carga productos */}
      {loading ? (
        <div className="w-full h-10 bg-gray-200 animate-pulse rounded-xl dark:bg-gray-600" />
      ) : (
        <>
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none mt-7">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              viewBox="0 0 20 20"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar producto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowList(true);
            }}
            onKeyDown={handleKeyDown}
            onBlur={() => setTimeout(() => setShowList(false), 150)}
            className="ps-9 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-xl focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
          />

          {showList && filtered.length > 0 && (
            <ul className="absolute z-10 mt-1 bg-white border border-gray-200 rounded-xl shadow-md max-h-52 overflow-y-auto w-full dark:bg-gray-700 dark:border-gray-600">
              {filtered.map((product, i) => (
                <li
                  key={product.iIdProduct}
                  onClick={() => handleSelect(product)}
                  className={`p-2 text-sm cursor-pointer ${
                    i === activeIndex
                      ? "bg-primary-100 dark:bg-gray-600"
                      : "hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  {product.vcname}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
