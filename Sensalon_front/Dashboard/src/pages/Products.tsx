import { useEffect, useState } from "react";
import { ModalProduct } from "../components/Modals/modal.products";
import { TableProducts } from "../components/Table/table";
import { Product } from "../interfaces/products";
import { SuccessToast } from "../components/Toast/successToast";
import { ErrorToast } from "../components/Toast/errorToast";
import { HEADER_TABLE_PRODUCTS } from "../utils/headers/Products";
import { api } from "../utils/axiosClients";

export const Products = () => {
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [products, SetProducts] = useState<Product[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);
  const [mode, setMode] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null); // Estado para el producto seleccionado
  const [showToast, setShowToast] = useState(true);

  const fetchProducts = async () => {
    try {
      const response = await api.get("/productos");
      SetProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);
  
  const filteredProducts = (products || []).filter((p) => 
    `${p.vcname} ${p.decprice1} ${p.decprice2} ${p.decprice3}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const handleModalClose = async (
    message: string,
    type: "success" | "error" | null,
  ) => {
    setShowModal(false);
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    if (type == "success") {
      await fetchProducts();
    }

    setTimeout(() => {
      setToastMessage(null);
      setToastType(null);
      setShowToast(false);
    }, 3000);
  };

  const handleCreateNewProduct = () => {
    setMode(0); // Cambiar a modo de creación
    setSelectedProduct(null); // Limpiar el producto seleccionado
    setShowModal(true); // Mostrar el modal
  };

  const handleEditProduct = (product: Product) => {
    setMode(1); // Cambiar a modo de edición
    setSelectedProduct(product); // Establecer el producto seleccionado
    setShowModal(true); // Mostrar el modal
  };

  return (
    <>
      {/* Contenedor para mostrar los toasts en la parte superior */}
      <div className="fixed top-0 right-0 z-50 p-4">
        {toastMessage && toastType === "success" && (
          <SuccessToast message={toastMessage} showToast={showToast} />
        )}
        {toastMessage && toastType === "error" && (
          <ErrorToast message={toastMessage} showToast={showToast} />
        )}
      </div>

      <div className="py-12 px-5 h-full">
        <h1 className="text-3xl font-bold text-[#1d1d1b]">Productos</h1>
        <section className="mt-5 h-[620px]">
          <div className="flex items-center justify-between bg-white shadow-sm w-full p-4 rounded-xl ">
            <div>
              <label className="mb-2 text-sm font-medium text-[#1d1d1b] sr-only dark:text-white">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-500 dark:text-gray-400"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 20"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                    />
                  </svg>
                </div>
                <input
                  type="search"
                  id="search"
                  value={searchTerm}
                  onChange={(e) => {setSearchTerm(e.target.value)}}
                  className="block w-96 p-2 ps-10 text-sm text-[#1d1d1b] border border-gray-300 rounded-xl bg-gray-50 dark:placeholder-gray-400 dark:text-white"
                  placeholder="Search"
                  required
                />
              </div>
            </div>
            <div>
              <button
                data-modal-target="crud-modal"
                onClick={handleCreateNewProduct}
                data-modal-toggle="crud-modal"
                type="button"
                className=" text-white bg-[#1d1d1b] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-[#c9c9c6] font-medium rounded-xl text-sm px-5 py-2 me-2 mb-2"
              >
                Nuevo producto
              </button>
              {showModal && (
                <ModalProduct
                  mode={mode}
                  data={selectedProduct || []}
                  show={showModal}
                  onClose={(
                    message: string,
                    type: "success" | "error" | null,
                  ) => handleModalClose(message, type)}
                />
              )}
            </div>
          </div>
          <div className="mt-5 bg-white shadow-sm p-4 rounded-xl h-full w-full">
            <TableProducts
              setShowModal={setShowModal}
              showModal={showModal}
              handleEdit={handleEditProduct}
              encabezados={HEADER_TABLE_PRODUCTS}
              data={filteredProducts}
              fetch={fetchProducts}
              outofstock="No se tiene productos registrados"
            />
          </div>
        </section>
      </div>
    </>
  );
};
