// Servicio para la gestión de movimientos desde la API REST
import { useState, useEffect, useCallback } from 'react';
import { Movement } from '../types';

// URL completa del servidor API
const API_URL = 'http://localhost:3001/api/movements';

// Datos simulados para usar cuando no se puede conectar con el servidor
const mockMovements: Movement[] = [
  {
    id: 'mock-mov-1',
    productId: 'mock-1',
    productName: 'Fertilizante Premium',
    type: 'entrada',
    quantity: 50,
    date: new Date().toISOString(),
    notes: 'Reposición de stock',
    userId: '1',
    userName: 'Admin Usuario'
  },
  {
    id: 'mock-mov-2',
    productId: 'mock-2',
    productName: 'Semillas de Maíz',
    type: 'salida',
    quantity: 20,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    notes: 'Venta a cliente',
    userId: '1',
    userName: 'Admin Usuario'
  },
  {
    id: 'mock-mov-3',
    productId: 'mock-3',
    productName: 'Insecticida Natural',
    type: 'entrada',
    quantity: 30,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 días atrás
    notes: 'Compra a proveedor',
    userId: '1',
    userName: 'Admin Usuario'
  }
];

// Hook personalizado para la gestión de movimientos
export const useMovementService = () => {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todos los movimientos
  const loadMovements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error('No se pudo obtener la lista de movimientos');
        const data = await res.json();
        setMovements(data);
      } catch (err: any) {
        console.warn('Error al conectar con el servidor de movimientos, usando datos simulados:', err.message);
        // Si no se puede conectar con el servidor, usar datos simulados
        setMovements(mockMovements);
      }
    } catch (err: any) {
      setError('Error al cargar movimientos: ' + (err.message || 'Error desconocido'));
      console.error('Error al cargar movimientos:', err);
      setMovements([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar el componente
  useEffect(() => {
    loadMovements();
  }, [loadMovements]);

  // Añadir un nuevo movimiento
  const addMovement = async (movement: Omit<Movement, 'id'>, updateProduct?: boolean): Promise<Movement> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...movement, updateProduct }),
      });
      if (!res.ok) throw new Error('No se pudo añadir el movimiento');
      const newMovement = await res.json();
      setMovements((prev) => [newMovement, ...prev]);
      return newMovement;
    } catch (err: any) {
      setError('Error al añadir movimiento: ' + (err.message || 'Error desconocido'));
      console.error('Error al añadir movimiento:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };  // Buscar movimientos con filtros
  const searchMovements = async (filters: {
    productTerm?: string;
    type?: string; // Ahora usamos string simple para evitar errores de tipo
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      // Construir los parámetros de búsqueda
      const searchParams = new URLSearchParams();
      if (filters.productTerm) searchParams.append('productTerm', filters.productTerm);
      if (filters.type && filters.type !== '') searchParams.append('type', filters.type);
      if (filters.dateFrom) searchParams.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) searchParams.append('dateTo', filters.dateTo);
      
      const searchUrl = `${API_URL}/search?${searchParams.toString()}`;
      
      const res = await fetch(searchUrl);
      if (!res.ok) throw new Error('No se pudo realizar la búsqueda de movimientos');
      const data = await res.json();
      setMovements(data);
      return data;
    } catch (err: any) {
      setError('Error al buscar movimientos: ' + (err.message || 'Error desconocido'));
      console.error('Error al buscar movimientos:', err);
      // En caso de error, devolvemos un array vacío
      setMovements([]);
      return [];
    } finally {
      setLoading(false);
    }
  };  // Obtener los movimientos recientes para el dashboard
  const getRecentMovements = async (limit: number = 5): Promise<Movement[]> => {
    try {
      // Usar no-cache para asegurar datos frescos
      const res = await fetch(`${API_URL}/recent?limit=${limit}`, {
        cache: 'no-cache',
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      
      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      
      // Agregar tiempo de carga artificialmente bajo para casos de prueba
      // return new Promise(resolve => setTimeout(() => resolve(data), 500));
      
      return data;
    } catch (err) {
      console.error('Error al obtener movimientos recientes:', err);
      // En caso de error, devolvemos datos simulados
      return mockMovements.slice(0, limit);
    }
  };

  return {
    movements,
    loading,
    error,
    addMovement,
    searchMovements,
    getRecentMovements,
    reload: loadMovements,
  };
};

export default useMovementService;
