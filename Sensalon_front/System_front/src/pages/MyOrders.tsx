import { useEffect, useState } from 'react'
import { Order } from '../interfaces/orders'
import { StatsOrdersAndFilters } from '../components/Orders/StatsOrdersAndFilters'
import OrderList from '../components/Orders/OrderList'
import { api } from '../utils/axiosClients'
import { readUser } from '../helpers/detectedUserRole'
import { ApiOrder, mapApiOrderToOrder } from '../helpers/apiOrder'
import OrderPagination from '../components/Orders/OrdersPaginations'
const ITEMS_PER_PAGE = 5

export const MyOrders = () => {
    const [orders, setOrders] = useState<Order[]>([])
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
    const [displayedOrders, setDisplayedOrders] = useState<Order[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [currentPage, setCurrentPage] = useState(1)
    const [filters, setFilters] = useState({
        dateRange: 'all' as 'all' | '30days' | '6months' | '1year',
        search: '',
    })
    const user = readUser()
    console.log(user)
    const idUser = user?.user?.iIdUser || ''
    useEffect(() => {
        let mounted = true;
        setIsLoading(true);

        api.get(`/orders/${idUser}`)
            .then((res) => {
                const apiList: ApiOrder[] = res.data?.data ?? [];
                const mapped = apiList.map(mapApiOrderToOrder);
                if (mounted) setOrders(mapped);
            })
            .catch((err) => {
                console.error(err);
                if (mounted) setOrders([]);
            })
            .finally(() => mounted && setIsLoading(false));

        return () => { mounted = false; };
    }, [idUser]);

    // Apply filters
    useEffect(() => {
        let result = [...orders];

        // 👇 si no hay órdenes, refleja vacío y sal
        if (orders.length === 0) {
            setFilteredOrders([]);
            setCurrentPage(1);
            return;
        }

        // --- Filtro de fechas
        const cutoffFromRange = (range: 'all' | '30days' | '6months' | '1year') => {
            if (range === 'all') return null;
            const d = new Date();
            if (range === '30days') d.setDate(d.getDate() - 30);
            if (range === '6months') d.setMonth(d.getMonth() - 6);
            if (range === '1year') d.setFullYear(d.getFullYear() - 1);
            return d;
        };

        const cutoff = cutoffFromRange(filters.dateRange);
        if (cutoff) {
            result = result.filter(o => new Date(o.date) >= cutoff);
        }

        // --- Filtro de búsqueda
        if (filters.search.trim()) {
            const q = filters.search.toLowerCase();
            result = result.filter(o =>
                o.id.toLowerCase().includes(q) ||
                o.items?.some(it => it.name.toLowerCase().includes(q))
            );
        }

        // --- Orden
        result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setFilteredOrders(result);
        setCurrentPage(1);
    }, [filters, orders]);

    // Handle pagination
    useEffect(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
        const endIndex = startIndex + ITEMS_PER_PAGE
        setDisplayedOrders(filteredOrders.slice(startIndex, endIndex))
    }, [currentPage, filteredOrders])
    const handleFilterChange = (newFilters: {
        dateRange?: 'all' | '30days' | '6months' | '1year'
        search?: string
    }) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
        }))
    }
    const handleClearFilters = () => {
        setFilters({
            dateRange: 'all',
            search: '',
        })
    }
    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        // Scroll to top of the list when changing pages
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        })
    }
    const totalPages = Math.max(
        1,
        Math.ceil(filteredOrders.length / ITEMS_PER_PAGE),
    )


    return (
        <div className=" mt-2">
            <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2">
                <div className="rounded-2xl border border-gray-200 bg-slate-50 shadow-sm">
                    {/* Header */}
                    <div className="px-4 sm:px-6 py-5 border-b border-gray-200">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Mis Pedidos</h1>
                    </div>

                    {/* Contenido con altura fija y scroll interno */}
                    <div className="h-[calc(100vh-275px)] flex flex-col">
                        {/* Filtros + stats (no scroll) */}
                        <div className="px-4 sm:px-6 py-4 shrink-0">
                            <StatsOrdersAndFilters
                                orders={filteredOrders}
                                onFilterChange={handleFilterChange}
                                onClearFilters={handleClearFilters}
                                activeFilters={filters}
                            />
                        </div>

                        {/* Lista con scroll */}
                        <div className="relative flex-1">
                            <div className='absolute inset-0 overflow-y-auto custom-scrollbar'>
                                <div className="px-4 sm:px-6 py-2">
                                    <OrderList
                                        orders={displayedOrders}
                                        isLoading={isLoading}
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={handlePageChange}
                                        itemsPerPage={ITEMS_PER_PAGE}
                                    />
                                    <div className="sticky bottom-0 left-0 right-0 z-10 py-1">
                                        <div className="border-t border-gray-200 bg-white/90 backdrop-blur px-4 sm:px-6 py-3">
                                            <OrderPagination
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={handlePageChange}
                                            />
                                            <div className="mt-4 text-center text-sm text-gray-500">
                                                  Mostrando {displayedOrders.length} de {filteredOrders.length} pedidos
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}