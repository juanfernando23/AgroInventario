// Repositorio para operaciones CRUD de ventas
const { query } = require('../db/db');

// Función para convertir un objeto SaleDB a Sale (formato de la aplicación)
const mapToSale = (saleDB) => ({
  id: saleDB.id.toString(),
  date: saleDB.date.toISOString(),
  customer: saleDB.customer || undefined,
  userId: saleDB.user_id,
  userName: saleDB.user_name,
  total: parseFloat(saleDB.total),
  estado: saleDB.estado_venta || 'completada',
  items: [] // Se cargan por separado
});

// Función para convertir un objeto SaleItemDB a SaleItem
const mapToSaleItem = (itemDB) => ({
  productId: itemDB.product_id,
  productName: itemDB.product_name,
  productSku: itemDB.product_sku,
  quantity: itemDB.quantity,
  price: parseFloat(itemDB.price),
  subtotal: parseFloat(itemDB.subtotal)
});

// Clase para gestionar las operaciones con ventas
class SaleRepository {
  
  // Obtener todas las ventas con sus elementos
  static async getAll() {
    try {
      // Obtener todas las ventas
      const salesResult = await query('SELECT * FROM sales ORDER BY date DESC');
      
      const sales = [];
      
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
  static async getById(id) {
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
  static async create(sale) {
    try {
      // Iniciar transacción
      await query('BEGIN');
        // Insertar la venta
      const saleResult = await query(
        `INSERT INTO sales (
          date, customer, user_id, user_name, total, estado_venta
        ) VALUES ($1, $2, $3, $4, $5, $6) 
        RETURNING *`,
        [
          new Date(sale.date),
          sale.customer || null,
          sale.userId,
          sale.userName,
          sale.total,
          sale.estado || 'completada'
        ]
      );
      
      const newSale = mapToSale(saleResult.rows[0]);
      const saleId = newSale.id;
      
      // Insertar todos los elementos de la venta
      const items = [];
      
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
  static async search(filters) {
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
      
      const sales = [];
      
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
  static async getRecent(limit = 5) {
    try {
      // Obtener las ventas más recientes
      const salesResult = await query(
        'SELECT * FROM sales ORDER BY date DESC LIMIT $1',
        [limit]
      );
      
      const sales = [];
      
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
  }  // Obtener el conteo de ventas de hoy (considerando zona horaria de Colombia)
  static async getTodaySalesCount() {
    try {
      // Crear objeto de fecha para Colombia (UTC-5)
      const now = new Date();
      // Ajustar a la zona horaria de Colombia (UTC-5)
      const colombiaDate = new Date(now.toLocaleString('en-US', { timeZone: 'America/Bogota' }));
      
      // Obtener año, mes, día de la fecha en Colombia
      const year = colombiaDate.getFullYear();
      const month = colombiaDate.getMonth();
      const day = colombiaDate.getDate();
      
      // Crear fecha de inicio (00:00:00) y fin (23:59:59) para el día de hoy en Colombia
      const startOfDay = new Date(Date.UTC(year, month, day, 5, 0, 0)); // 00:00:00 en Colombia es 05:00:00 en UTC
      const endOfDay = new Date(Date.UTC(year, month, day, 5 + 24, 0, 0)); // 00:00:00 del día siguiente (inclusivo)
      
      // Eliminar logs innecesarios que podrían ralentizar la carga
      // Consultar el número de ventas de hoy - optimizando la consulta
      const result = await query(`
        SELECT COUNT(*) as count FROM sales 
        WHERE date >= $1 AND date < $2
      `, [startOfDay.toISOString(), endOfDay.toISOString()]);
      
      const count = parseInt(result.rows[0].count, 10);
      return count;
    } catch (error) {
      console.error('Error al obtener el conteo de ventas de hoy:', error);
      throw error;
    }
  }
}

module.exports = { SaleRepository };
