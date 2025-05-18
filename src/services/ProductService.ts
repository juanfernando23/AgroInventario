// Servicio para la gestión de productos desde la API REST
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

// URL completa del servidor API en lugar de ruta relativa
const API_URL = 'http://localhost:3001/api/products';

// Datos simulados para usar cuando no se puede conectar con el servidor
const mockProducts: Product[] = [
  {
    id: 'mock-1',
    sku: 'PROD001',
    name: 'Fertilizante Premium',
    description: 'Fertilizante orgánico de alta calidad',
    category: 'Fertilizantes',
    price: 25.99,
    stock: 150,
    minStock: 20,
    unit: 'kg',
    imageUrl: '/img/fertilizante.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-2',
    sku: 'PROD002',
    name: 'Semillas de Maíz',
    description: 'Semillas de maíz híbrido de alto rendimiento',
    category: 'Semillas',
    price: 8.50,
    stock: 300,
    minStock: 50,
    unit: 'kg',
    imageUrl: '/img/maiz.jpg',
    createdAt: new Date().toISOString()
  },
  {
    id: 'mock-3',
    sku: 'PROD003',
    name: 'Insecticida Natural',
    description: 'Insecticida a base de ingredientes naturales',
    category: 'Protección',
    price: 15.75,
    stock: 80,
    minStock: 15,
    unit: 'l',
    imageUrl: '/img/insecticida.jpg',
    createdAt: new Date().toISOString()
  }
];

// Hook personalizado para la gestión de productos
export const useProductService = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los productos
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('No se pudo obtener la lista de productos');
        const data = await res.json();
        setProducts(data);
      } catch (err: any) {
        console.warn('Error al conectar con el servidor de productos, usando datos simulados:', err.message);
        // Si no se puede conectar con el servidor, usar datos simulados
        setProducts(mockProducts);
      }
    } catch (err: any) {
      setError('No se pudieron cargar los productos. ' + (err.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar el componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Agregar un nuevo producto
  const addProduct = async (product: Omit<Product, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('No se pudo agregar el producto');
      const newProduct = await res.json();
      setProducts((prev) => [newProduct, ...prev]);
      return newProduct;
    } catch (err: any) {
      setError('Error al agregar producto: ' + (err.message || 'Error desconocido'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar un producto existente
  const updateProduct = async (id: string, product: Partial<Product>) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('No se pudo actualizar el producto');
      const updatedProduct = await res.json();
      setProducts((prev) => prev.map((p) => (p.id === id ? updatedProduct : p)));
      return updatedProduct;
    } catch (err: any) {
      setError('Error al actualizar producto: ' + (err.message || 'Error desconocido'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un producto
  const deleteProduct = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo eliminar el producto');
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return true;
    } catch (err: any) {
      setError('Error al eliminar producto: ' + (err.message || 'Error desconocido'));
      throw err;
    } finally {
      setLoading(false);
    }
  };  // Buscar productos
  const searchProducts = async (term: string) => {
    setLoading(true);
    setError(null);
    try {
      // Si el término de búsqueda está vacío, cargar todos los productos
      if (!term.trim()) {
        return await loadProducts();
      }
      
      try {
        const res = await fetch(`${API_URL}/search/${encodeURIComponent(term)}`);
        if (!res.ok) throw new Error('No se pudo buscar productos');
        const data = await res.json();
        setProducts(data);
        return data;
      } catch (fetchError) {
        console.warn('Error al buscar productos en API, utilizando búsqueda local:', fetchError);
        // Realizar búsqueda local si la API falla
        // Cargar todos los productos primero si es necesario
        if (products.length === 0) {
          await loadProducts();
        }
        // Filtrar los productos localmente
        const filteredProducts = products.filter(p => 
          p.name.toLowerCase().includes(term.toLowerCase()) || 
          p.sku.toLowerCase().includes(term.toLowerCase()) || 
          p.category.toLowerCase().includes(term.toLowerCase())
        );
        setProducts(filteredProducts);
        return filteredProducts;
      }
    } catch (err: any) {
      setError('Error al buscar productos: ' + (err.message || 'Error desconocido'));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    reload: loadProducts,
  };
};

export default useProductService;
