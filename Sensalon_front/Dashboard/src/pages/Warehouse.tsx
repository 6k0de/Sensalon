import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../utils/axiosClients"
import { WarehouseEntrance } from "../interfaces/warehouse"
import { TableWarehouse } from "../components/Table/table.WarehouseEntrance"
import { HEADER_TABLE_WAREHOUSE } from "../utils/headers/Warehouse"

export const Warehouse = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [warehouse, setWarehouse] = useState<WarehouseEntrance[]>([])
    const navigate = useNavigate()

    const getWarehouseEntrance = async () => {
        const warehouses = await api.get('/getWarehouseEntrance')
        setWarehouse(warehouses?.data?.data)
    }
    const handleCreateNewEntry = () => {
        navigate('/entradaAlmacen')
    }

    const handleEdit = (entrada: WarehouseEntrance) => {
        navigate('/entradaAlmacen', {
            state: {
                mode: 'edit',
                warehouse: entrada,
            },
        })
    }
    useEffect(() => {
        getWarehouseEntrance()
    }, [])

    const normalizedSearch = searchTerm.trim().toLowerCase();
    const filteredWarehouse = warehouse.filter((w) => {
        if (!normalizedSearch) return true;
        const doc = (w.docnumber ?? "").toString().toLowerCase();
        const supplier = (w.supplierName ?? "").toLowerCase();
        const company = (w.companyName ?? "").toLowerCase();
        const reason = (w.entryreason ?? "").toLowerCase();
        return (
            doc.includes(normalizedSearch) ||
            supplier.includes(normalizedSearch) ||
            company.includes(normalizedSearch) ||
            reason.includes(normalizedSearch)
        );
    });

    return (
        <>
            <div className="fixed top-0 right-0 z-50 p-4">

            </div>
            <div className="py-12 px-5 ">
                <h1 className="text-3xl font-bold text-[#1d1d1b]">Entrada de almacen</h1>
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
                                <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} type="search" id="search" className="block w-96 p-2 ps-10 text-sm text-[#1d1d1b] border border-gray-300 rounded-xl bg-gray-50 dark:placeholder-gray-400 dark:text-white" placeholder="Buscar" />
                            </div>
                        </div>
                        <div>
                            <button data-modal-target="crud-modal" onClick={handleCreateNewEntry} data-modal-toggle="crud-modal" type="button" className="text-white bg-[#1d1d1b] hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-[#c9c9c6] font-medium rounded-xl text-sm px-5 py-2 me-2 mb-2 ">+ &nbsp;Agregar compra</button>
                        </div>
                    </div>
                    <div className="mt-5 bg-white shadow-sm p-4 rounded-xl h-full w-full">
                        <TableWarehouse
                            encabezados={HEADER_TABLE_WAREHOUSE}
                            data={filteredWarehouse}
                            handleEdit={handleEdit}
                            fetch={getWarehouseEntrance}
                            outofstock="Informacion no disponible"

                        />
                    </div>
                </section>
            </div>
        </>
    )
}
