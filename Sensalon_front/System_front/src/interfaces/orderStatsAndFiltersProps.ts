import { Order } from "./orders"

export interface OrderStatsAndFiltersProps {
    orders: Order[]
    onFilterChange: (filters: {
        dateRange?: 'all' | '30days' | '6months' | '1year'
        search?: string
    }) => void
    onClearFilters: () => void
    activeFilters: {
        dateRange: 'all' | '30days' | '6months' | '1year'
        search: string
    }
}   