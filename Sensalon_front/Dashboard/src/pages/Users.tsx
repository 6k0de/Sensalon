import { useEffect, useState } from "react"
import { ModalUsers } from "../components/Modals/modal.users"
import { useUserStore } from "../hooks/useUserStore"
import { useSalonStore } from "../hooks/useSalonStore"
import { useDistributorStore } from "../hooks/useDistributorStore"
import { TableUserDist } from "../components/Table/tableUserDist"
import { Distributor } from "../interfaces/distributors"
import { TableUserSalon } from "../components/Table/tableUserSalon"
import { TableUserN } from "../components/Table/tableUserN"

export const Users = () => {
  const [showModal, setShowModal] = useState(false)
  const [viewChange, setViewCHange] = useState('usuarios')
  const [loading, setLoading] = useState(false)
  const [, setMode] = useState(0);
  const [, setSelectedCompanie] = useState<Distributor | null>(null);
  const { users, fetchUsers } = useUserStore()
  const { salones, fetchSalones } = useSalonStore()
  const { distribuidores, fetchDistribuidores } = useDistributorStore()

  const tableDistriutorsHeaders = ["Empresas", "Dirección", "Estado", "Ciudad", "Código Postal", "País", "Teléfono", "Correo Electrónico", "RFC", "Constancia Fiscal", "Fecha Creación"];
  const tableSalonsHeaders = ["Nombre Salón", "Teléfono", "Correo Electrónico", "Dirección", "Hora Apertura", "Hora Cierre", "Servicios", "Logo", "Fecha Creación"];
  const tableHeaders = ["Nombres", "Apellidos", "Nombre Usuario", "Correo Electrónico", "Fecha Creación"];

  useEffect(() => {
    setLoading(true)
    if (viewChange === 'usuarios') {
      fetchUsers().then(() => setLoading(false))
    } else if (viewChange === 'salones' && salones) {
      fetchSalones().then(() => setLoading(false))
    } else if (viewChange === 'distribuidores' && distribuidores) {
      fetchDistribuidores().then(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [viewChange, fetchUsers, fetchDistribuidores, fetchSalones])

  console.log({ users, salones, distribuidores })
  const handleEditDist = (dist: Distributor) => {
    setMode(1); // Cambiar a modo de edición
    setSelectedCompanie(dist); // Establecer el producto seleccionado
    setShowModal(true); // Mostrar el modal
  }


  return (
    <div className="py-12 px-5 ">
      <h1 className="text-3xl font-bold text-[#1d1d1b]">Usuarios</h1>
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
              <input type="search" id="search" className="block w-96 p-2 ps-10 text-sm text-[#1d1d1b] border border-gray-300 rounded-xl bg-gray-50 dark:placeholder-gray-400 dark:text-white" placeholder="Search" required />
            </div>
          </div>
          <div>
            <button data-modal-target="crud-modal" onClick={() => { setShowModal(true) }} data-modal-toggle="crud-modal" type="button" className="text-white bg-[#1d1d1b] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-[#c9c9c6] font-medium rounded-xl text-sm px-5 py-2 me-2 mb-2 ">Nuevo usuario</button>
            {
              showModal &&
              <ModalUsers show={showModal} onClose={() => setShowModal(false)} />
            }
          </div>
        </div>
        <div className="mt-5 bg-white shadow-sm p-4 rounded-xl h-full w-full">
          <div className="text-sm font-medium text-center text-gray-500 border-b border-gray-200 dark:text-gray-400 dark:border-gray-700">
            <ul className="flex flex-wrap -mb-px">
              <li className="me-2">
                <button onClick={() => { setViewCHange('usuarios') }} className={`inline-block p-4 border-b-2 ${viewChange === 'usuarios' ? 'text-blue-600  border-blue-600' : 'border-transparent '} rounded-t-lg hover:text-gray-600  dark:hover:text-gray-300`}>Usuarios</button>
              </li>
              <li className="me-2">
                <button onClick={() => { setViewCHange('salones') }} className={`inline-block p-4 border-b-2 ${viewChange === 'salones' ? 'text-blue-600  border-blue-600' : 'border-transparent '} rounded-t-lg hover:text-gray-600 active dark:text-blue-500 dark:border-blue-500`} aria-current="page">Salones</button>
              </li>
              <li className="me-2">
                <button onClick={() => { setViewCHange('distribuidores') }} className={`inline-block p-4 border-b-2  ${viewChange === 'distribuidores' ? 'text-blue-600  border-blue-600' : 'border-transparent '} rounded-t-lg hover:text-gray-600  dark:hover:text-gray-300`}>Distribuidores</button>
              </li>
            </ul>
          </div>
          <div className="mt-2">
            {loading ? (
              <p>Cargando...</p>
            ) :
              (
                <>
                  {viewChange === 'usuarios' && <TableUserN
                    fetch={fetchSalones}
                    outofstock="Error al obtener los usuarios"
                    encabezados={tableHeaders}
                    data={users?.usuarios || []}
                    setShowModal={undefined}
                    showModal={undefined}
                    handleEdit={handleEditDist}
                  />}
                  {viewChange === 'salones' && <TableUserSalon
                    fetch={fetchUsers}
                    outofstock="Error al obtener los salones"
                    encabezados={tableSalonsHeaders}
                    data={salones?.salones || []}
                    setShowModal={undefined}
                    showModal={undefined}
                    handleEdit={handleEditDist}
                  />}
                  {viewChange === 'distribuidores' && <TableUserDist
                    fetch={fetchDistribuidores}
                    outofstock="Error al obtener los distribuidores"
                    encabezados={tableDistriutorsHeaders}
                    data={distribuidores?.distribuidores || []}
                    setShowModal={undefined}
                    showModal={undefined}
                    handleEdit={handleEditDist}
                  />}
                </>
              )

            }
          </div>
        </div>
      </section>
    </div>
  )
} 