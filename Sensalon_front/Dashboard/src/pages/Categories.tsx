import { useEffect, useState } from "react"
import { ModalCategories } from "../components/Modals/modal.categories"
import { Categorie } from "../interfaces/categories"
import axios from "axios"
import { TableCategories } from "../components/Table/tableCategories"
import { SuccessToast } from "../components/Toast/successToast"
import { ErrorToast } from "../components/Toast/errorToast"


export const Categories = () => {
  const [showModal, setShowModal] = useState(false)
  const [categorias, setCategorias] = useState<Categorie[]>([])
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error" | null>(null);
  const [showToast, setShowToast] = useState(true);
  const [mode, setMode] = useState(0);
  const [selectedCategorie, setSelectedCategorie] = useState<Categorie | null>(null);

  const [searchTerm, setSearchTerm] = useState('');



  const headers: string[] = ['Nombre', 'Descripción', 'Creación']
  console.log(showModal)

  const fetchCategorias = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/categorias')
      setCategorias(response.data)
    } catch (error) {
      console.error("Error fetching categorias:", error);
    }
  }

  useEffect(() => {
    fetchCategorias()
  }, [])

  const handleModalClose = async (message: string, type: "success" | "error" | null) => {
    setShowModal(false);
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    if (type == "success") {
      await fetchCategorias();
    }

    setTimeout(() => {
      setToastMessage(null);
      setToastType(null);
      setShowToast(false);
    }, 3000);
  };

  const filteredCategories = categorias.filter(categoria =>
    categoria.vcname.toLowerCase().includes(searchTerm.toLowerCase()) || 
    categoria.vcdescription.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNewCategorie = () => {
    setMode(0); // Cambiar a modo de creación
    setSelectedCategorie(null); // Limpiar el producto seleccionado
    setShowModal(true); // Mostrar el modal
  };

  const handleEditCategorie = (categorie: Categorie) => {
    setMode(1); // Cambiar a modo de edición
    setSelectedCategorie(categorie); // Establecer el producto seleccionado
    setShowModal(true); // Mostrar el modal
  }
  return (
    <>
      <div className="fixed top-0 right-0 z-50 p-4">
        {toastMessage && toastType === "success" && (
          <SuccessToast message={toastMessage} showToast={showToast} />
        )}
        {toastMessage && toastType === "error" && (
          <ErrorToast message={toastMessage} showToast={showToast} />
        )}
      </div>
      <div className="py-12 px-5 ">
        <h1 className="text-3xl font-bold text-[#1d1d1b]">Categorias</h1>
        <section className="mt-5">
          <div className="flex items-center justify-between bg-white shadow-sm w-full p-4 rounded-xl">
            <div>
              <label className="mb-2 text-sm font-medium text-[#1d1d1b] sr-only dark:text-white">Search</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                  </svg>
                </div>
                <input  value={searchTerm}  onChange={(e) => setSearchTerm(e.target.value)} type="search" id="search" className="block w-96 p-2 ps-10 text-sm text-[#1d1d1b] border border-gray-300 rounded-xl bg-gray-50 dark:placeholder-gray-400 dark:text-white" placeholder="Buscar" />
              </div>
            </div>
            <div>
              <button data-modal-target="crud-modal" onClick={handleCreateNewCategorie} data-modal-toggle="crud-modal" type="button" className="text-white bg-[#1d1d1b] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-[#c9c9c6] font-medium rounded-xl text-sm px-5 py-2 me-2 mb-2 ">Nueva categoria</button>
              {
                showModal &&
                <ModalCategories mode={mode} data={selectedCategorie || []} show={showModal} onClose={(message: string, type: "success" | "error" | null) => handleModalClose(message, type)} />
              }
            </div>
          </div>
          <div className="mt-5 bg-white shadow-sm p-4 rounded-xl h-full w-full">
            <TableCategories
              encabezados={headers}
              data={filteredCategories}
              fetch={fetchCategorias}
              outofstock="Categorias no registradas"
              handleEdit={handleEditCategorie}
              setShowModal={undefined} 
              showModal={undefined}
            />
          </div>
        </section>
      </div>
    </>

  )
}