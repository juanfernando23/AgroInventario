// Servicio para la gestión de ventas desde la API REST
import { useState, useEffect, useCallback } from 'react';
import { Sale, SaleItem } from '../types';

// URL completa del servidor API
const API_URL = 'http://localhost:3001/api/sales';

// Hook personalizado para la gestión de ventas
export const useSaleService = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar todas las ventas
  const loadSales = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('No se pudo obtener la lista de ventas');
      const data = await res.json();
      setSales(data);
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
        throw new Error(errorMsg);
      }
      
      const newSale = await res.json();
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
  };

  // Buscar ventas con filtros
  const searchSales = async (filters: {
    customer?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Construir parámetros de consulta      const params = new URLSearchParams();
      if (filters.customer) params.append('customer', filters.customer);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      
      const queryString = params.toString();
      const url = queryString ? `${API_URL}/search?${queryString}` : `${API_URL}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al buscar ventas');
      
      const data = await res.json();
      setSales(data);
    } catch (err: any) {
      setError('Error al buscar ventas: ' + (err.message || 'Error desconocido'));
      console.error('Error al buscar ventas:', err);
    } finally {
      setLoading(false);
    }  };

  // Obtener ventas recientes
  const getRecentSales = async (limit: number = 5): Promise<Sale[]> => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/recent?limit=${limit}`);
      if (!res.ok) throw new Error('No se pudieron obtener las ventas recientes');
      const data = await res.json();
      return data;
    } catch (err: any) {
      setError('Error al cargar ventas recientes: ' + (err.message || 'Error desconocido'));
      console.error('Error al cargar ventas recientes:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Obtener el número de ventas de hoy
  const getTodaySales = async (): Promise<number> => {
    try {
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0]; // 'YYYY-MM-DD'
      
      // Obtener todas las ventas
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('No se pudieron obtener las ventas');
      
      const data: Sale[] = await res.json();
      
      // Filtrar ventas de hoy
      const todaySales = data.filter(sale => {
        const saleDate = new Date(sale.date).toISOString().split('T')[0];
        return saleDate === formattedDate;
      });
      
      return todaySales.length;
    } catch (err: any) {
      console.error('Error al obtener ventas de hoy:', err);
      return 0;
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
