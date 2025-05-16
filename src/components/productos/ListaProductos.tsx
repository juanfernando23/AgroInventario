import React, { useState } from 'react';
import { Edit, Trash2, Search, Plus } from 'lucide-react';
import { Product } from '../../types';
import ProductForm from './FormularioProductos';
import Modal from '../comun/Modal';

interface ProductListProps {
  products: Product[];
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddClick = () => {
    setSelectedProduct(null);
    setShowProductForm(true);
  };

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowProductForm(true);
  };

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setShowDeleteConfirm(true);
  };

  const handleSaveProduct = (product: any) => {
    if (selectedProduct) {
      onEditProduct(selectedProduct.id, product);
    } else {
      onAddProduct(product);
    }
    setShowProductForm(false);
  };

  const handleConfirmDelete = () => {
    if (selectedProduct) {
      onDeleteProduct(selectedProduct.id);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
            placeholder="Buscar por nombre, SKU o categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          type="button"
          onClick={handleAddClick}
          className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#255466] hover:bg-[#1d4050] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466] transition-colors duration-200"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Producto
        </button>
      </div>

      <div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
        {/* Vista de tabla para pantallas medianas y grandes */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Producto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SKU / Categoría
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Precio
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded bg-gray-200 overflow-hidden">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gray-200" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.sku}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex text-sm ${
                        product.stock <= product.minStock 
                          ? 'text-red-600 font-medium' 
                          : 'text-gray-900'
                      }`}>
                        {product.stock} {product.unit}
                      </span>
                      {product.stock <= product.minStock && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          ¡Stock Bajo!
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(product)}
                        className="text-blue-600 hover:text-blue-900 mr-4 transition-colors duration-200"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product)}
                        className="text-red-600 hover:text-red-900 transition-colors duration-200"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Vista de tarjetas para dispositivos móviles */}
        <div className="md:hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No se encontraron productos.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 p-4">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white border rounded-lg shadow-sm p-4">
                  <div className="flex items-center mb-3">
                    <div className="h-12 w-12 rounded bg-gray-200 overflow-hidden">
                      {product.imageUrl ? (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-200" />
                      )}
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.category}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                    <div>
                      <div className="text-gray-500">SKU</div>
                      <div>{product.sku}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Precio</div>
                      <div>${product.price.toFixed(2)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Stock</div>
                      <div className={product.stock <= product.minStock ? 'text-red-600 font-medium' : ''}>
                        {product.stock} {product.unit}
                        {product.stock <= product.minStock && (
                          <span className="ml-1 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            ¡Bajo!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-2 border-t pt-3">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="p-1.5 rounded-full text-blue-600 hover:bg-blue-50"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(product)}
                      className="p-1.5 rounded-full text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Form Modal */}
      <Modal
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        title={selectedProduct ? "Editar Producto" : "Crear Nuevo Producto"}
        size="lg"
      >
        <ProductForm
          product={selectedProduct || undefined}
          onSave={handleSaveProduct}
          onCancel={() => setShowProductForm(false)}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar Eliminación"
        size="sm"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">¿Eliminar producto?</h3>
          <p className="text-sm text-gray-500 mb-6">
            ¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer y eliminará movimientos asociados.
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466]"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 bg-[#255466] border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-[#1d4050] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466]"
              onClick={handleConfirmDelete}
            >
              Confirmar Eliminación
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;