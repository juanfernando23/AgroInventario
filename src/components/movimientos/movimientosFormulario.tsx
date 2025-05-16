import React, { useState, useEffect } from 'react';
import { Movement, Product } from '../../types';
import { mockCurrentUser, mockProducts } from '../../data/SimulacionDatos';

interface MovementFormProps {
  onSave: (movementData: Omit<Movement, 'id' | 'userName' | 'userId' | 'productName' | 'productSku'>) => void;
  onCancel: () => void;
}

const MovementForm: React.FC<MovementFormProps> = ({
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    type: 'entrada' as 'entrada' | 'salida' | 'venta' | 'ajuste',
    reason: '',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Actualizar el producto seleccionado cuando cambia el ID de producto
  useEffect(() => {
    if (formData.productId) {
      const product = mockProducts.find(p => p.id === formData.productId) || null;
      setSelectedProduct(product);
    } else {
      setSelectedProduct(null);
    }
  }, [formData.productId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'quantity' 
        ? parseInt(value) || 0 
        : name === 'type' 
          ? value as 'entrada' | 'salida' | 'venta' | 'ajuste'
          : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentDate = formData.date 
      ? new Date(`${formData.date}T${new Date().toTimeString().slice(0, 8)}`)
      : new Date();
      
    onSave({
      ...formData,
      date: currentDate.toISOString()
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-y-5">
        {/* Tipo de Movimiento */}
        <div className="w-full">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Tipo de Movimiento
          </label>
          <div className="relative">
            <select
              id="type"
              name="type"
              required
              value={formData.type}
              onChange={handleInputChange}
              className="appearance-none shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
            >
              <option value="entrada">Entrada</option>
              <option value="salida">Salida</option>
              <option value="ajuste">Ajuste</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
        
        {/* Producto */}
        <div className="w-full">
          <label htmlFor="productId" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Producto
          </label>
          <div className="relative">
            <select
              id="productId"
              name="productId"
              required
              value={formData.productId}
              onChange={handleInputChange}
              className="appearance-none shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
            >
              <option value="">Seleccione un producto</option>
              {mockProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - SKU: {product.sku}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {selectedProduct && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <div className="text-sm">
                <span className="font-medium">Stock actual: </span>
                {selectedProduct.stock} {selectedProduct.unit}
              </div>
            </div>
          )}
        </div>
        
        {/* Cantidad */}
        <div className="w-full">
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Cantidad
          </label>
          <div>
            <input
              type="number"
              name="quantity"
              id="quantity"
              required
              min={formData.type === 'salida' ? "1" : formData.type === 'ajuste' ? "-999" : "1"}
              value={formData.quantity}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.type === 'salida' && 'Valor positivo que se restará del inventario'}
              {formData.type === 'entrada' && 'Valor positivo que se sumará al inventario'}
              {formData.type === 'ajuste' && 'Valor positivo suma, negativo resta del inventario'}
            </p>
          </div>
        </div>
        
        {/* Fecha */}
        <div className="w-full">
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Fecha
          </label>
          <div>
            <input
              type="date"
              name="date"
              id="date"
              required
              value={formData.date}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
            />
          </div>
        </div>
        
        {/* Motivo */}
        <div className="w-full">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Motivo
          </label>
          <div>
            <input
              type="text"
              name="reason"
              id="reason"
              required
              value={formData.reason}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
              placeholder="Ej: Compra de inventario, Ajuste por inventario físico..."
            />
          </div>
        </div>
        
        {/* Notas */}
        <div className="w-full">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Notas (Opcional)
          </label>
          <div>
            <textarea
              name="notes"
              id="notes"
              rows={3}
              value={formData.notes}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3"
              placeholder="Información adicional sobre este movimiento..."
            />
          </div>
        </div>
      </div>
        <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466]"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#255466] hover:bg-[#1d4050] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466]"
        >
          Registrar Movimiento
        </button>
      </div>
    </form>
  );
};

export default MovementForm;