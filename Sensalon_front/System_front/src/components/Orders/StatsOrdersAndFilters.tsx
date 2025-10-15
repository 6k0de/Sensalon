import { Calendar, CheckCircle, ChevronDown, Clock, Package, Search, X } from "lucide-react"
import { useEffect, useState } from "react"
import { OrderStatsAndFiltersProps } from "../../interfaces/orderStatsAndFiltersProps"

export const StatsOrdersAndFilters = ({ orders, onFilterChange, onClearFilters, activeFilters }: OrderStatsAndFiltersProps) => {
  const [search, setSearch] = useState(activeFilters.search || '')
  const [isDateMenuOpen, setIsDateMenuOpen] = useState(false)
   const [selectedDateRange, setSelectedDateRange] = useState<'all'|'30days'|'6months'|'1year'>(
    activeFilters.dateRange || 'all'
  );

  useEffect(() => {
    setSearch(activeFilters.search || "");
    setSelectedDateRange(activeFilters.dateRange || "all");
  }, [activeFilters.search, activeFilters.dateRange]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearch(value)
    onFilterChange({
      dateRange: selectedDateRange,
      search: value,
    })
  }
  const handleDateRangeChange = (
    range: 'all' | '30days' | '6months' | '1year',
  ) => {
    setSelectedDateRange(range)
    setIsDateMenuOpen(false)
    onFilterChange({
      dateRange: range,
      search,
    })
  }
  const clearSearch = () => {
    setSearch('')
    onFilterChange({
      dateRange: selectedDateRange,
      search: '',
    })
  }

  const handleClearAll = () => {
    // 1️⃣ Limpia los estados locales
    setSearch('');
    setSelectedDateRange('all');
    setIsDateMenuOpen(false);

    // 2️⃣ Notifica al padre que se limpiaron los filtros
    onClearFilters();

    // 3️⃣ Opcional: podrías agregar una pequeña animación o toast aquí
  };

  const norm = (s?: string) => (s ?? '').trim().toLowerCase();

  const hasActiveFilters = search || selectedDateRange !== 'all'

  const totalOrders = orders?.length || 0

  const approvedCount = orders.filter(o => norm(o.status) === 'approved').length;

  // trata "processing" como pendiente por si tu mapeo lo usa
  const pendingCount = orders.filter(o => {
    const s = norm(o.status);
    return s === 'pending' || s === 'processing';
  }).length;

  // contempla posibles nombres que te lleguen del backend
  const errorCount = orders.filter(o => {
    const s = norm(o.status);
    return s === 'error' || s === 'failed' || s === 'rejected' || s === 'cancelled' || s === 'canceled';
  }).length;

  console.log(orders)
  return (
    <>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-lg border border-primary-100 bg-primary-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Total de pedidos</p>
            <Package className="w-5 h-5 text-primary-500" />
          </div>
          <p className="text-xl font-bold text-gray-900">{totalOrders}</p>
        </div>

        <div className="p-4 rounded-lg border border-gray-200  bg-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-600">Pedidos Pendientes</p>
            <Clock className="w-5 h-5 text-gray-800" />
          </div>
          <p className="text-xl font-bold text-gray-900">{pendingCount}</p>
        </div>

        <div className="p-4 rounded-lg border border-green-200 bg-green-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-900">Pedidos Aprobados</p>
            <CheckCircle className="w-5 h-5 text-green-800" />
          </div>
          <p className="text-xl font-bold text-gray-900">{approvedCount}</p>
        </div>

        <div className="p-4 rounded-lg border border-red-200 bg-red-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-900">Pedidos Erroneos</p>
            <X className="w-5 h-5 text-red-800" />
          </div>
          <p className="text-xl font-bold text-gray-900">{errorCount}</p>
        </div>
      </section >

      <section>
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por ID o productos..."
                value={search}
                onChange={handleSearchChange}
                className="pl-10 pr-10 py-2 w-full border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 text-sm"
              />
              {search && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {/* Date Filter */}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 bg-white"
                onClick={() => setIsDateMenuOpen(!isDateMenuOpen)}
              >
                <Calendar className="w-4 h-4" />
                {selectedDateRange === 'all'
                  ? 'Todas las fechas'
                  : selectedDateRange === '30days'
                    ? 'Últimos 30 días'
                    : selectedDateRange === '6months'
                      ? 'Últimos 6 meses'
                      : 'Último año'}
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${isDateMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>
              {isDateMenuOpen && (
                <div className="absolute z-10 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg w-48">
                  <ul className="py-1">
                    <li
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedDateRange === 'all' ? 'bg-gray-50 text-primary-600' : ''}`}
                      onClick={() => handleDateRangeChange('all')}
                    >
                      Todas las fechas
                    </li>
                    <li
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedDateRange === '30days' ? 'bg-gray-50 text-primary-600' : ''}`}
                      onClick={() => handleDateRangeChange('30days')}
                    >
                      Últimos 30 días
                    </li>
                    <li
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedDateRange === '6months' ? 'bg-gray-50 text-primary-600' : ''}`}
                      onClick={() => handleDateRangeChange('6months')}
                    >
                      Últimos 6 meses
                    </li>
                    <li
                      className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-50 ${selectedDateRange === '1year' ? 'bg-gray-50 text-primary-600' : ''}`}
                      onClick={() => handleDateRangeChange('1year')}
                    >
                      Último año
                    </li>
                  </ul>
                </div>
              )}
            </div>
            {/* Clear Filters Button (only show when filters are active) */}
            {hasActiveFilters && (
              <button
                onClick={handleClearAll}
                className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Limpiar filtros
              </button>
            )}
          </div>
          {/* Active Filters Pills */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedDateRange !== 'all' && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-100">
                  {selectedDateRange === '30days'
                    ? 'Últimos 30 días'
                    : selectedDateRange === '6months'
                      ? 'Últimos 6 meses'
                      : 'Último año'}
                  <button
                    onClick={() => handleDateRangeChange('all')}
                    className="ml-1.5 hover:text-primary-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
              {search && (
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-primary-50 text-primary-700 border border-primary-100">
                  Búsqueda:{' '}
                  {search.length > 15 ? `${search.substring(0, 15)}...` : search}
                  <button
                    onClick={clearSearch}
                    className="ml-1.5 hover:text-primary-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
