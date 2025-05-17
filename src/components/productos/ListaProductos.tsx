import React, { useState } from 'react';
import { Edit, Trash2, Search, Plus, AlertTriangle, Loader } from 'lucide-react';
import { Product } from '../../types';
import ProductForm from './FormularioProductos';
import Modal from '../comun/Modal';

interface ProductListProps {
  products: Product[];
  loading: boolean;
  searchTerm?: string;
  onSearch: (term: string) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onEditProduct: (id: string, product: Partial<Product>) => void;
  onDeleteProduct: (id: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({
  products,
  loading,
  searchTerm = '',
  onSearch,
  onAddProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  const [showProductForm, setShowProductForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

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

  const handleSaveProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
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
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    try {
      onSearch(term);
    } catch (error) {
      console.error("Error al realizar la búsqueda:", error);
      // El error será manejado por el componente padre
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
            onChange={handleSearchChange}
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

      {loading ? (
        <div className="flex justify-center items-center p-12">
          <Loader className="h-12 w-12 text-[#255466] animate-spin" />
        </div>
      ) : (
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
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? (
                        <div className="flex flex-col items-center justify-center py-4">
                          <AlertTriangle className="h-12 w-12 text-yellow-400 mb-2" />
                          <p>No se encontraron productos que coincidan con "{searchTerm}".</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-4">
                          <p>No hay productos disponibles. ¡Añade tu primer producto!</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  products.map((product) => (
                    <tr 
                      key={product.id} 
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      {/* Columna Producto */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {product.imageUrl ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
                                {product.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Columna SKU / Categoría */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{product.sku}</div>
                        <div className="text-sm text-gray-500">{product.category}</div>
                      </td>
                      
                      {/* Columna Stock */}
                      <td className="px-6 py-4">
                        <div className={`text-sm ${product.stock <= product.minStock ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {product.stock} {product.unit}
                        </div>
                        {product.stock <= product.minStock && (
                          <div className="text-xs text-red-500">Stock bajo</div>
                        )}
                      </td>
                      
                      {/* Columna Precio */}
                      <td className="px-6 py-4 text-sm text-gray-500">
                        ${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price)).toFixed(2)}
                      </td>
                      
                      {/* Columna Acciones */}
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 transition-colors duration-150"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-150"
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
            {products.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {searchTerm ? (
                  <div className="flex flex-col items-center justify-center py-4">
                    <AlertTriangle className="h-12 w-12 text-yellow-400 mb-2" />
                    <p>No se encontraron productos que coincidan con "{searchTerm}".</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4">
                    <p>No hay productos disponibles. ¡Añade tu primer producto!</p>
                  </div>
                )}
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {products.map((product) => (
                  <li key={product.id} className="p-4">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        {product.imageUrl ? (
                          <img className="h-10 w-10 rounded-full object-cover" src={product.imageUrl} alt={product.name} />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
                            {product.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <button 
                          onClick={() => handleEditClick(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3 p-1"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(product)}
                          className="text-red-600 hover:text-red-900 p-1"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-xs text-gray-500">Categoría</p>
                        <p className="text-sm">{product.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Precio</p>
                        <p className="text-sm">${typeof product.price === 'number' ? product.price.toFixed(2) : parseFloat(String(product.price)).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Stock</p>
                        <p className={`text-sm ${product.stock <= product.minStock ? 'text-red-600 font-medium' : ''}`}>
                          {product.stock} {product.unit}
                          {product.stock <= product.minStock && ' (Stock bajo)'}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      <Modal 
        isOpen={showProductForm} 
        onClose={() => setShowProductForm(false)}
        title={selectedProduct ? `Editar producto: ${selectedProduct.name}` : "Agregar nuevo producto"}
      >
        <ProductForm 
          product={selectedProduct || undefined} 
          onSave={handleSaveProduct} 
          onCancel={() => setShowProductForm(false)}
        />
      </Modal>

      <Modal 
        isOpen={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)}
        title="Confirmar eliminación"
      >
        <div className="p-6">
          <p className="mb-4">¿Está seguro de que desea eliminar el producto <strong>{selectedProduct?.name}</strong>?</p>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              onClick={handleConfirmDelete}
            >
              Eliminar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductList;