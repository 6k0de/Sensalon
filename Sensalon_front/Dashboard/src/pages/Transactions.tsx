import { useEffect, useState } from "react"
import { TableTransactions } from "../components/Table/tableTransactions"
import { HEADER_TABLE_TRANSACTIONS } from "../utils/headers/Transactions"
import { useTransactionStore } from "../hooks/useTransactionStore"

export const Transactions = () => {
    const { transaction, fetchTransaction } = useTransactionStore()
    const [searchTerm, setSearchTerm] = useState<string>("")

    console.log(transaction)
    const filteredTransactions = (transaction?.transaction || [])
        .filter((t) =>
            `${t.iIdTransaction} ${t.status} ${t.mercadoPagoPaymentId} ${t.iuserId}`
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
        )
        .sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

    useEffect(() => {
        fetchTransaction()
    }, [fetchTransaction])
    return (
        <div className="py-12 px-5">
            <h1 className="text-3xl font-bold text-[#1d1d1b]">Transacciones / Ventas</h1>
            <section className="mt-5">
                <div className="flex items-center justify-between bg-white shadow-sm w-full p-4 rounded-xl">
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
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                    />
                                </svg>
                            </div>
                            <input
                                type="search"
                                id="search"
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value) }}
                                className="block w-96 p-2 ps-10 text-sm text-[#1d1d1b] border border-gray-300 rounded-xl bg-gray-50 dark:placeholder-gray-400 dark:text-white"
                                placeholder="Buscar"
                                required
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="mt-5 bg-white shadow-sm p-4 rounded-xl h-full w-full">
                <TableTransactions
                    encabezados={HEADER_TABLE_TRANSACTIONS}
                    data={filteredTransactions}
                    outofstock="No se encontraron transacciones"
                    fetch={fetchTransaction}
                />
            </section>
        </div>
    )
}