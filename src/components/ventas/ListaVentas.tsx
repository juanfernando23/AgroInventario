import React, { useState, useEffect } from 'react';
import { Eye, Search, RefreshCw } from 'lucide-react';
import { Sale } from '../../types';
import { useSaleService } from '../../services/SaleService';
import { formatCurrency } from '../../utilities/format';

interface SalesListProps {
  sales: Sale[];
  onViewDetails: (sale: Sale) => void;
}

const SalesList: React.FC<SalesListProps> = ({ sales, onViewDetails }) => {
  // Acceder al servicio de ventas para búsquedas
  const { searchSales, loading } = useSaleService();
  // Estado local para los filtros
  const [filters, setFilters] = useState({
    vendedor: '',
    dateFrom: '',
    dateTo: '',
  });
  
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Aplicar filtros a través de la API
  const handleApplyFilters = async () => {
    try {
      // Solo enviar filtros que tengan valor
      const filtersToApply: any = {};
      if (filters.vendedor) filtersToApply.userName = filters.vendedor; // Usamos userName que es el campo del vendedor en la BD
      if (filters.dateFrom) filtersToApply.dateFrom = filters.dateFrom;
      if (filters.dateTo) filtersToApply.dateTo = filters.dateTo;
      
      // El resultado actualizado estará disponible en 'sales' a través de las props
      await searchSales(filtersToApply);
    } catch (error) {
      console.error("Error al aplicar filtros:", error);
    }
  };
  // Limpiar filtros
  const handleClearFilters = async () => {
    setFilters({
      vendedor: '',
      dateFrom: '',
      dateTo: '',
    });
    
    try {
      // Buscar sin filtros para mostrar todos
      await searchSales({});
    } catch (error) {
      console.error("Error al limpiar filtros:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  // La función getEstadoVentaClass ha sido eliminada

  return (
    <div>      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">          <div>
            <label htmlFor="vendedor" className="block text-sm font-medium text-gray-700 mb-1">
              Vendedor
            </label>
            <input
              id="vendedor"
              name="vendedor"
              type="text"
              value={filters.vendedor}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
              placeholder="Buscar por nombre de vendedor"
            />
          </div>
          
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Desde
            </label>
            <input
              id="dateFrom"
              name="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
              Fecha Hasta
            </label>
            <input
              id="dateTo"
              name="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-end space-x-3">
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Limpiar
          </button>
          <button
            onClick={handleApplyFilters}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#255466] hover:bg-[#1d4050]"
            disabled={loading}
          >
            <Search className="w-4 h-4 mr-2" />
            Buscar
          </button>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden rounded-lg">{loading ? (
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#255466] mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Cargando ventas...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Venta
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Productos
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vendedor
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">              {sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron ventas que coincidan con los filtros.
                  </td>
                </tr>
              ) : (
                // Nos aseguramos de que las ventas estén ordenadas por fecha descendente (más recientes primero)
                [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{sale.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(sale.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {sale.customer || 'Cliente no registrado'}
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatCurrency(sale.total)}
                    </td>                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.items.length} {sale.items.length === 1 ? 'producto' : 'productos'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sale.userName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => onViewDetails(sale)}
                        className="text-green-600 hover:text-green-900 transition-colors duration-200"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      </div>
    </div>
  );
};

export default SalesList;