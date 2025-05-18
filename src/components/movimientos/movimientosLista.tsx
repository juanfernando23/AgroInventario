import React, { useState } from 'react';
import { Movement } from '../../types';
import { Loader, AlertTriangle } from 'lucide-react';

interface MovementsListProps {
  movements: Movement[];
  loading?: boolean;
  onSearch?: (filters: {
    productTerm?: string;
    type?: 'entrada' | 'salida' | 'venta' | 'ajuste' | '';
    dateFrom?: string;
    dateTo?: string;
  }) => void;
}

const MovementsList: React.FC<MovementsListProps> = ({ 
  movements, 
  loading = false,
  onSearch 
}) => {  const [filters, setFilters] = useState<{
    productTerm: string;
    type: '' | 'entrada' | 'salida' | 'venta' | 'ajuste';
    dateFrom: string;
    dateTo: string;
  }>({
    productTerm: '',
    type: '',
    dateFrom: '',
    dateTo: '',
  });  // Aplicar los filtros cuando cambian
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'type') {
      // Para el campo tipo, necesitamos hacer una conversión segura de tipos
      const typeValue = (value === '' || 
                         value === 'entrada' || 
                         value === 'salida' || 
                         value === 'venta' || 
                         value === 'ajuste') 
                        ? value as '' | 'entrada' | 'salida' | 'venta' | 'ajuste' 
                        : '';
      
      const updatedFilters = {
        ...filters,
        [name]: typeValue
      };
      setFilters(updatedFilters);
      
      // Si se proporcionó la función onSearch, llamarla para filtrar los datos
      if (onSearch) {
        onSearch(updatedFilters);
      }
    } else {
      // Para otros campos
      const updatedFilters = {
        ...filters,
        [name]: value
      };
      setFilters(updatedFilters);
      
      // Si se proporcionó la función onSearch, llamarla para filtrar los datos
      if (onSearch) {
        onSearch(updatedFilters);
      }
    }
  };
  // Reset de los filtros
  const handleResetFilters = () => {
    const resetFilters = {
      productTerm: '',
      type: '' as const,
      dateFrom: '',
      dateTo: '',
    };
    setFilters(resetFilters);
    
    if (onSearch) {
      onSearch(resetFilters);
    }
  };
  // Filtrar localmente si no hay función onSearch
  const filteredMovements = !onSearch ? movements.filter(movement => {
    const matchesProduct = !filters.productTerm || 
      movement.productName.toLowerCase().includes(filters.productTerm.toLowerCase()) ||
      movement.productSku.toLowerCase().includes(filters.productTerm.toLowerCase());
    
    const matchesType = !filters.type || movement.type === filters.type;
    
    const movementDate = new Date(movement.date);
    const matchesDateFrom = !filters.dateFrom || 
      movementDate >= new Date(filters.dateFrom);
    
    const matchesDateTo = !filters.dateTo || 
      movementDate <= new Date(filters.dateTo + 'T23:59:59');
    
    return matchesProduct && matchesType && matchesDateFrom && matchesDateTo;
  }) : movements;

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

  const getMovementTypeClass = (type: string) => {
    switch(type) {
      case 'entrada': return 'bg-green-100 text-green-800';
      case 'salida': return 'bg-blue-100 text-blue-800';
      case 'venta': return 'bg-purple-100 text-purple-800';
      case 'ajuste': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMovementTypeText = (type: string) => {
    switch(type) {
      case 'entrada': return 'Entrada';
      case 'salida': return 'Salida';
      case 'venta': return 'Venta';
      case 'ajuste': return 'Ajuste';
      default: return type;
    }
  };

  return (
    <div>
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Filtros</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="productTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Producto (Nombre/SKU)
            </label>
            <input
              id="productTerm"
              name="productTerm"
              type="text"
              value={filters.productTerm}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-[#4b7480] focus:border-[#4b7480] block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Movimiento
            </label>
            <select
              id="type"
              name="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="shadow-sm focus:ring-[#4b7480] focus:border-[#4b7480] block w-full sm:text-sm border-gray-300 rounded-md"
            >
              <option value="">Todos</option>
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="venta">Venta</option>
              <option value="ajuste">Ajuste</option>
            </select>
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
              className="shadow-sm focus:ring-[#4b7480] focus:border-[#4b7480] block w-full sm:text-sm border-gray-300 rounded-md"
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
              className="shadow-sm focus:ring-[#4b7480] focus:border-[#4b7480] block w-full sm:text-sm border-gray-300 rounded-md"
            />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleResetFilters}
            className="ml-3 py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4b7480]"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader className="h-12 w-12 text-[#255466] animate-spin" />
          </div>
        ) : filteredMovements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-yellow-400 mb-2" />
            <p className="text-gray-500">No se encontraron movimientos con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Producto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motivo
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(movement.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementTypeClass(movement.type)}`}>
                        {getMovementTypeText(movement.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{movement.productName}</div>
                      <div className="text-sm text-gray-500">SKU: {movement.productSku}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {movement.userName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div>{movement.reason}</div>
                      {movement.notes && <div className="text-xs text-gray-400">{movement.notes}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovementsList;