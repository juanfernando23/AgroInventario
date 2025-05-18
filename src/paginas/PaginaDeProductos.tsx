import React, { useState } from 'react';
import MainLayout from '../components/estructura/principal';
import ProductList from '../components/productos/ListaProductos';
import { Product } from '../types';
import { useProductService } from '../services/ProductService';
import { useNotification } from '../context/NotificationContext';

const ProductsPage: React.FC = () => {
  const { 
    products, 
    loading, 
    error, 
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts
  } = useProductService();
  
  const { showNotification } = useNotification();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleAddProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    try {
      const newProduct = await addProduct(product);
      showNotification('success', `Producto "${newProduct.name}" agregado correctamente`);
    } catch (error) {
      console.error('Error al añadir producto:', error);
      showNotification('error', `Error al agregar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleEditProduct = async (id: string, product: Partial<Product>) => {
    try {
      const updatedProduct = await updateProduct(id, product);
      showNotification('success', `Producto "${updatedProduct?.name}" actualizado correctamente`);
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      showNotification('error', `Error al actualizar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id);
      showNotification('success', 'Producto eliminado correctamente');
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      showNotification('error', `Error al eliminar producto: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };
    const handleSearch = (term: string) => {
    setSearchTerm(term);
    try {
      searchProducts(term);
    } catch (error) {
      console.error('Error al buscar productos:', error);
      showNotification('error', `Error al buscar productos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };  return (
    <MainLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Productos</h1>
        
        {error && (
          <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        <ProductList
          products={products}
          loading={loading}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onSearch={handleSearch}
          searchTerm={searchTerm}
        />
      </div>
    </MainLayout>
  );
};

export default ProductsPage;