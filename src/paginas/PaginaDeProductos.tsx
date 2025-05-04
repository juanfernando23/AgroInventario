import React, { useState } from 'react';
import MainLayout from '../components/estructura/principal';
import ProductList from '../components/productos/ListaProductos';
import { mockProducts } from '../data/SimulacionDatos';
import { Product } from '../types';

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const handleAddProduct = (product: Omit<Product, 'id' | 'createdAt'>) => {
    const newProduct: Product = {
      ...product,
      id: `${products.length + 1}`,
      createdAt: new Date().toISOString()
    };
    
    setProducts([...products, newProduct]);
  };

  const handleEditProduct = (id: string, product: Partial<Product>) => {
    setProducts(
      products.map(p => (p.id === id ? { ...p, ...product } : p))
    );
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  return (
    <MainLayout>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Productos</h1>
        <ProductList
          products={products}
          onAddProduct={handleAddProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      </div>
    </MainLayout>
  );
};

export default ProductsPage;