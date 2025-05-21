import React from 'react';
import { Sale } from '../../types';
import { formatCurrency } from '../../utilities/format';

interface SaleDetailsProps {
  sale: Sale;
}

const SaleDetails: React.FC<SaleDetailsProps> = ({ sale }) => {
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Información de la Venta</h3>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Nº Venta</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">#{sale.id}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Fecha</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{formatDate(sale.date)}</dd>
          </div>          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Cliente</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{sale.customer || 'Cliente no registrado'}</dd>
          </div>
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Vendedor</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{sale.userName}</dd>
          </div>          <div className="bg-green-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 rounded-lg">
            <dt className="text-sm font-medium text-gray-500">Total</dt>
            <dd className="mt-1 text-sm font-semibold text-gray-900 sm:mt-0 sm:col-span-2">{formatCurrency(sale.total)}</dd>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Productos Vendidos</h3>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <ul className="divide-y divide-gray-200">
              {sale.items.map((item, index) => (
                <li key={`${sale.id}-${item.productId}-${index}`} className="px-4 py-4">
                  <div className="flex justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.productName}</p>
                      <p className="text-xs text-gray-500">SKU: {item.productSku}</p>
                    </div>                    <div className="text-right text-sm font-medium">
                      <p>{formatCurrency(item.price)} × {item.quantity}</p>
                      <p className="text-gray-900">{formatCurrency(item.subtotal)}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6">              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total</p>
                <p>{formatCurrency(sale.total)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SaleDetails;