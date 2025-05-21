// Servicio para la gestión de ventas desde la API REST
import { useState, useEffect, useCallback } from 'react';
import { Sale, SaleItem } from '../types';

// URL completa del servidor API
const API_URL = 'http://localhost:3001/api/sales';

// Datos simulados para usar cuando no se puede conectar con el servidor
const mockSaleItems: SaleItem[] = [
  {
    id: 'mock-item-1',
    saleId: 'mock-sale-1',
    productId: 'mock-1',
    productName: 'Fertilizante Premium',
    quantity: 3,
    price: 25.99,
    subtotal: 77.97
  },
  {
    id: 'mock-item-2',
    saleId: 'mock-sale-2',
    productId: 'mock-2',
    productName: 'Semillas de Maíz',
    quantity: 5,
    price: 8.50,
    subtotal: 42.50
  }
];

const mockSales: Sale[] = [
  {
    id: 'mock-sale-1',
    customerName: 'Juan Pérez',
    date: new Date().toISOString(),
    total: 77.97,
    items: [mockSaleItems[0]],
    status: 'completed',
    paymentMethod: 'efectivo',
    notes: 'Cliente frecuente'
  },
  {
    id: 'mock-sale-2',
    customerName: 'María González',
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 día atrás
    total: 42.50,
    items: [mockSaleItems[1]],
    status: 'completed',
    paymentMethod: 'tarjeta',
    notes: 'Primera compra'
  }
];

// Hook personalizado para la gestión de ventas
export const useSaleService = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);  // Cargar todas las ventas
  
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        // Añadimos un parámetro sort=desc para asegurarnos de que el servidor devuelva las ventas ordenadas
        const res = await fetch(`${API_URL}?sort=desc`);
        if (!res.ok) throw new Error('No se pudo obtener la lista de ventas');
        const data = await res.json();
        
        // Ordenar las ventas con las más recientes primero (doble seguridad)
        const sortedSales = [...data].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        
        setSales(sortedSales);
      } catch (err: any) {
        console.warn('Error al conectar con el servidor de ventas, usando datos simulados:', err.message);
        // Si no se puede conectar con el servidor, usar datos simulados
        setSales(mockSales);
      }
    } catch (err: any) {
      setError('Error al cargar ventas: ' + (err.message || 'Error desconocido'));
      console.error('Error al cargar ventas:', err);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Cargar al montar el componente
  useEffect(() => {
    loadSales();
  }, [loadSales]);

  // Añadir una nueva venta
  const addSale = async (saleData: {
    customer: string;
    date: string;
    items: SaleItem[];
    userId: string;
    userName: string;
    total: number;
  }): Promise<Sale> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });
        if (!res.ok) {
        let errorMsg = 'No se pudo registrar la venta';
        try {
          const errorData = await res.json();
          errorMsg = errorData.error || errorMsg;
        } catch (e) {
          // Si no es JSON, intentamos obtener el texto
          errorMsg = await res.text() || `Error del servidor: ${res.status}`;
        }
        throw new Error(errorMsg);      }
      
      const newSale = await res.json();
      // Añadir la nueva venta al principio de la lista para mantener el orden cronológico inverso
      setSales((prev) => [newSale, ...prev]);
      return newSale;
    } catch (err: any) {
      setError('Error al registrar venta: ' + (err.message || 'Error desconocido'));
      console.error('Error al registrar venta:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Obtener una venta por ID
  const getSaleById = async (id: string): Promise<Sale> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/${id}`);
      if (!res.ok) throw new Error('No se pudo obtener la venta');
      const sale = await res.json();
      return sale;
    } catch (err: any) {
      setError('Error al obtener venta: ' + (err.message || 'Error desconocido'));
      console.error('Error al obtener venta:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };  // Buscar ventas con filtros
  const searchSales = async (filters: {
    customer?: string;
    userName?: string; // Añadimos soporte para filtrar por vendedor
    dateFrom?: string;
    dateTo?: string;
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Construir parámetros de consulta
      const params = new URLSearchParams();      if (filters.customer) params.append('customer', filters.customer);
      if (filters.userName) params.append('userName', filters.userName); // Filtro por vendedor
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      // Siempre añadir el parámetro sort=desc para asegurarnos de que el servidor devuelva las ventas más recientes primero
      params.append('sort', 'desc');
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}/search?${queryString}` : `${API_URL}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al buscar ventas');
      
      const data = await res.json();
      
      // Ordenar las ventas con las más recientes primero
      const sortedSales = [...data].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      setSales(sortedSales);
    } catch (err: any) {
      setError('Error al buscar ventas: ' + (err.message || 'Error desconocido'));
      console.error('Error al buscar ventas:', err);
    } finally {
      setLoading(false);
    }
  };
  // Obtener ventas recientes
  const getRecentSales = async (limit: number = 5): Promise<Sale[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/recent?limit=${limit}`);
      if (!res.ok) throw new Error('No se pudieron obtener las ventas recientes');
      const data = await res.json();
      
      // Ordenar las ventas con las más recientes primero
      const sortedSales = [...data].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
      
      return sortedSales;
    } catch (err: any) {
      setError('Error al cargar ventas recientes: ' + (err.message || 'Error desconocido'));
      console.error('Error al cargar ventas recientes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };  // Obtener el número de ventas de hoy
  const getTodaySales = async (): Promise<number> => {
    try {
      // Usar el endpoint específico para ventas de hoy (con zona horaria de Colombia)
      const res = await fetch(`${API_URL}/today/count`, {
        // Agregar caché de 30 segundos para optimizar múltiples solicitudes
        cache: 'no-cache', // Deshabilitar caché para asegurar datos actualizados
        headers: { 'Cache-Control': 'no-cache, no-store, must-revalidate' }
      });
      
      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
      }
      
      const data = await res.json();
      return data.count;
    } catch (err: any) {
      console.error('[SaleService] Error al obtener ventas de hoy desde API:', err);
      
      // Si falla la conexión con el servidor, intentar calcular localmente
      try {
        // Obtener la fecha actual en la zona horaria de Colombia (UTC-5)
        const now = new Date();
        const colombiaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
        const colombiaDateStr = colombiaDate.toISOString().split('T')[0]; // 'YYYY-MM-DD'
        
        // Filtrar ventas por la fecha de Colombia
        const todaySales = sales.filter(sale => {
          // Convertir la fecha de la venta a la zona horaria de Colombia
          const saleDate = new Date(sale.date);
          const colombiaSaleDate = new Date(saleDate.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
          const formattedSaleDate = colombiaSaleDate.toISOString().split('T')[0];
          
          return formattedSaleDate === colombiaDateStr;
        });
        
        return todaySales.length;
      } catch (localErr) {
        console.error('[SaleService] Error al calcular ventas localmente:', localErr);
        return 0;
      }
    }
  };
  return {
    sales,
    loading,
    error,
    loadSales,
    addSale,
    getSaleById,
    searchSales,
    getRecentSales,
    getTodaySales
  };
};
