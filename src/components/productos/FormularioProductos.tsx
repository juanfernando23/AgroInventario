import React, { useState, useEffect } from 'react';
import { ImageIcon } from 'lucide-react';
import { Product } from '../../types';

interface ProductFormProps {
  product?: Product;
  onSave: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    category: '',
    price: 0,
    stock: 0,
    minStock: 0,
    unit: 'unidad',
    imageUrl: ''
  });

  const categoryOptions = [
    'Fertilizantes',
    'Semillas',
    'Herbicidas',
    'Insecticidas',
    'Fungicidas',
    'Herramientas',
    'Equipos',
    'Otros'
  ];

  const unitOptions = [
    'unidad',
    'kg',
    'g',
    'mg',
    'l',
    'ml',
    'm',
    'cm',
    'mm',
    'sobre',
    'paquete',
    'caja'
  ];

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku,
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        stock: product.stock,
        minStock: product.minStock,
        unit: product.unit,
        imageUrl: product.imageUrl
      });
    }
  }, [product]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      // Solo permitir números y punto decimal en el campo de precio
      const numericValue = value.replace(/[^0-9.]/g, '');
      // Evitar múltiples puntos decimales
      const validatedValue = numericValue.split('.').slice(0, 2).join('.');
      
      setFormData(prev => ({
        ...prev,
        [name]: validatedValue === '' ? 0 : parseFloat(validatedValue) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'stock' || name === 'minStock' 
          ? parseFloat(value) || 0 
          : value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col gap-y-5">
        {/* SKU y Nombre en fila para escritorio, columna para móvil */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* SKU */}
          <div className="w-full">
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700 text-left mb-2">
              SKU
            </label>
            <div>
              <input
                type="text"
                name="sku"
                id="sku"
                required
                value={formData.sku}
                onChange={handleInputChange}
                disabled={!!product}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md disabled:bg-gray-100 bg-white p-3 h-10"
              />
            </div>
          </div>

          {/* Name */}
          <div className="w-full">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Nombre
            </label>
            <div>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="w-full">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Descripción
          </label>
          <div>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3"
            />
          </div>
        </div>

        {/* Category */}
        <div className="w-full">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Categoría
          </label>
          <div className="relative">
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="appearance-none shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
            >
              <option value="">Seleccione una categoría</option>
              {categoryOptions.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Price, Unit y Min Stock en fila para escritorio, columna para móvil */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">          {/* Price */}
          <div className="w-full">
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Precio Unit.
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">$</span>
              </div>              <input
                type="text"
                name="price"
                id="price"
                required
                value={formData.price === 0 ? '' : formData.price}
                onChange={handleInputChange}
                placeholder="0"
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-7 pr-12 sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
              />
            </div>
          </div>

          {/* Unit */}
          <div className="w-full">
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Unidad Med.
            </label>
            <div className="relative">
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                className="appearance-none shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
              >
                {unitOptions.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Min Stock */}
          <div className="w-full">
            <label htmlFor="minStock" className="block text-sm font-medium text-gray-700 text-left mb-2">
              Stock Mínimo
            </label>
            <div>
              <input
                type="number"
                name="minStock"
                id="minStock"
                min="0"
                required
                value={formData.minStock}
                onChange={handleInputChange}
                className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
              />
            </div>
          </div>
        </div>

        {/* Stock */}
        <div className="w-full">
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700 text-left mb-2">
            Stock Actual
          </label>
          <div>
            <input
              type="number"
              name="stock"
              id="stock"
              min="0"
              required
              value={formData.stock}
              onChange={handleInputChange}
              className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
            />
          </div>
        </div>

        {/* Image URL */}
        <div className="w-full">
          <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 text-left mb-2">
            URL Imagen
          </label>
          <div className="flex items-center">
             <div className="flex-shrink-0 h-10 w-10 border border-gray-200 rounded-md overflow-hidden bg-gray-100 mr-3">
               {formData.imageUrl ? (
                 <img
                   src={formData.imageUrl}
                   alt="Vista previa"
                   className="h-full w-full object-cover"
                   onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '';
                    target.style.display = 'none';
                    e.currentTarget.parentElement?.appendChild(
                      Object.assign(document.createElement('div'), {
                        className: 'h-full w-full flex items-center justify-center',
                        innerHTML: '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>'
                      })
                    );
                  }}
                 />
               ) : (
                 <div className="h-full w-full flex items-center justify-center">
                   <ImageIcon className="h-5 w-5 text-gray-400" />
                 </div>
               )}
             </div>
            <input
              type="url"
              name="imageUrl"
              id="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://ejemplo.com/imagen.jpg"
              className="focus:ring-green-500 focus:border-green-500 flex-1 block w-full rounded-md sm:text-sm border-2 border-gray-300 bg-white p-3 h-10"
            />
          </div>
           <p className="mt-2 text-sm text-gray-500 text-left">
             URL de una imagen para el producto. Deje en blanco para usar una imagen genérica.
           </p>
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
          {product ? 'Guardar Cambios' : 'Crear Producto'}
        </button>
      </div>
    </form>
  );
};

export default ProductForm;