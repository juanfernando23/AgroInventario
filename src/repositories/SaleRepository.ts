// Repositorio para operaciones CRUD de ventas
import { query } from '../db/db';
import { Sale, SaleItem } from '../types';

// Función para convertir un objeto SaleDB a Sale (formato de la aplicación)
const mapToSale = (saleDB: any): Sale => ({
  id: saleDB.id,
  date: saleDB.date.toISOString(),
  customer: saleDB.customer || undefined,
  userId: saleDB.user_id,
  userName: saleDB.user_name,
  total: parseFloat(saleDB.total),
  items: [] // Se cargan por separado
});

// Función para convertir un objeto SaleItemDB a SaleItem
const mapToSaleItem = (itemDB: any): SaleItem => ({
  productId: itemDB.product_id,
  productName: itemDB.product_name,
  productSku: itemDB.product_sku,
  quantity: itemDB.quantity,
  price: parseFloat(itemDB.price),
  subtotal: parseFloat(itemDB.subtotal)
});

// Clase para gestionar las operaciones con ventas
export class SaleRepository {
  
  // Obtener todas las ventas con sus elementos
  static async getAll(): Promise<Sale[]> {
    try {
      // Obtener todas las ventas
      const salesResult = await query('SELECT * FROM sales ORDER BY date DESC');
      
      const sales: Sale[] = [];
      
      // Para cada venta, obtener sus elementos
      for (const saleDB of salesResult.rows) {
        const sale = mapToSale(saleDB);
        
        // Obtener los elementos de esta venta
        const itemsResult = await query(
          'SELECT * FROM sale_items WHERE sale_id = $1',
          [saleDB.id]
        );
        
        sale.items = itemsResult.rows.map(mapToSaleItem);
        sales.push(sale);
      }
      
      return sales;
    } catch (error) {
      console.error('Error al obtener ventas:', error);
      throw error;
    }
  }
  
  // Obtener una venta por ID
  static async getById(id: string): Promise<Sale | null> {
    try {
      // Obtener la venta
      const saleResult = await query(
        'SELECT * FROM sales WHERE id = $1',
        [id]
      );
      
      if (saleResult.rows.length === 0) {
        return null;
      }
      
      const sale = mapToSale(saleResult.rows[0]);
      
      // Obtener los elementos de esta venta
      const itemsResult = await query(
        'SELECT * FROM sale_items WHERE sale_id = $1',
        [id]
      );
      
      sale.items = itemsResult.rows.map(mapToSaleItem);
      
      return sale;
    } catch (error) {
      console.error(`Error al obtener venta con ID ${id}:`, error);
      throw error;
    }
  }
  
  // Crear una nueva venta
  static async create(sale: Omit<Sale, 'id'>): Promise<Sale> {
    try {
      // Iniciar transacción
      await query('BEGIN');
      
      // Insertar la venta
      const saleResult = await query(
        `INSERT INTO sales (
          date, customer, user_id, user_name, total
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
        [
          new Date(sale.date),
          sale.customer || null,
          sale.userId,
          sale.userName,
          sale.total
        ]
      );
      
      const newSale = mapToSale(saleResult.rows[0]);
      const saleId = newSale.id;
      
      // Insertar todos los elementos de la venta
      const items: SaleItem[] = [];
      
      for (const item of sale.items) {
        const itemResult = await query(
          `INSERT INTO sale_items (
            sale_id, product_id, product_name, product_sku, quantity, price, subtotal
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING *`,
          [
            saleId,
            item.productId,
            item.productName,
            item.productSku,
            item.quantity,
            item.price,
            item.subtotal
          ]
        );
        
        items.push(mapToSaleItem(itemResult.rows[0]));
      }
      
      newSale.items = items;
      
      // Confirmar transacción
      await query('COMMIT');
      
      return newSale;
    } catch (error) {
      // Revertir transacción en caso de error
      await query('ROLLBACK');
      console.error('Error al crear venta:', error);
      throw error;
    }
  }
  
  // Buscar ventas con filtros
  static async search(filters: {
    customer?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Sale[]> {
    try {
      let queryStr = 'SELECT * FROM sales WHERE 1=1';
      const queryParams = [];
      let paramIndex = 1;
      
      if (filters.customer) {
        queryStr += ` AND customer ILIKE $${paramIndex}`;
        queryParams.push(`%${filters.customer}%`);
        paramIndex++;
      }
      
      if (filters.dateFrom) {
        queryStr += ` AND date >= $${paramIndex}`;
        queryParams.push(new Date(filters.dateFrom));
        paramIndex++;
      }
      
      if (filters.dateTo) {
        let endDate = new Date(filters.dateTo);
        endDate.setHours(23, 59, 59, 999);
        queryStr += ` AND date <= $${paramIndex}`;
        queryParams.push(endDate);
        paramIndex++;
      }
      
      queryStr += ' ORDER BY date DESC';
      
      const salesResult = await query(queryStr, queryParams);
      
      const sales: Sale[] = [];
      
      // Para cada venta, obtener sus elementos
      for (const saleDB of salesResult.rows) {
        const sale = mapToSale(saleDB);
        
        // Obtener los elementos de esta venta
        const itemsResult = await query(
          'SELECT * FROM sale_items WHERE sale_id = $1',
          [saleDB.id]
        );
        
        sale.items = itemsResult.rows.map(mapToSaleItem);
        sales.push(sale);
      }
      
      return sales;
    } catch (error) {
      console.error('Error al buscar ventas:', error);
      throw error;
    }
  }
  
  // Obtener ventas recientes
  static async getRecent(limit: number = 5): Promise<Sale[]> {
    try {
      // Obtener las ventas más recientes
      const salesResult = await query(
        'SELECT * FROM sales ORDER BY date DESC LIMIT $1',
        [limit]
      );
      
      const sales: Sale[] = [];
      
      // Para cada venta, obtener sus elementos
      for (const saleDB of salesResult.rows) {
        const sale = mapToSale(saleDB);
        
        // Obtener los elementos de esta venta
        const itemsResult = await query(
          'SELECT * FROM sale_items WHERE sale_id = $1',
          [saleDB.id]
        );
        
        sale.items = itemsResult.rows.map(mapToSaleItem);
        sales.push(sale);
      }
      
      return sales;
    } catch (error) {
      console.error('Error al obtener ventas recientes:', error);
      throw error;
    }
  }
}
