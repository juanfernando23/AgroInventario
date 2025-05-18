// Repositorio para operaciones CRUD de movimientos
import { query } from '../db/db';
import { Movement } from '../types';

// Interfaz para datos de movimiento que vienen desde la base de datos
interface MovementDB {
  id: string;
  date: Date;
  type: 'entrada' | 'salida' | 'venta' | 'ajuste';
  product_id: string;
  product_name: string;
  product_sku: string;
  quantity: number;
  user_id: string;
  user_name: string;
  reason: string;
  notes: string | null;
}

// Función para convertir un objeto MovementDB a Movement (formato de la aplicación)
const mapToMovement = (movementDB: MovementDB): Movement => ({
  id: movementDB.id,
  date: movementDB.date.toISOString(),
  type: movementDB.type,
  productId: movementDB.product_id,
  productName: movementDB.product_name,
  productSku: movementDB.product_sku,
  quantity: movementDB.quantity,
  userId: movementDB.user_id,
  userName: movementDB.user_name,
  reason: movementDB.reason,
  notes: movementDB.notes || undefined,
});

// Clase para gestionar las operaciones con movimientos
export class MovementRepository {
  
  // Obtener todos los movimientos
  static async getAll(): Promise<Movement[]> {
    try {
      const result = await query('SELECT * FROM movements ORDER BY date DESC');
      return result.rows.map(mapToMovement);
    } catch (error) {
      console.error('Error al obtener movimientos:', error);
      throw error;
    }
  }
  
  // Obtener un movimiento por ID
  static async getById(id: string): Promise<Movement | null> {
    try {
      const result = await query('SELECT * FROM movements WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return mapToMovement(result.rows[0]);
    } catch (error) {
      console.error(`Error al obtener movimiento con ID ${id}:`, error);
      throw error;
    }
  }
  
  // Crear un nuevo movimiento
  static async create(movement: Omit<Movement, 'id'>): Promise<Movement> {
    try {
      const result = await query(
        `INSERT INTO movements (
          date, type, product_id, product_name, product_sku, 
          quantity, user_id, user_name, reason, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
        RETURNING *`,
        [
          new Date(movement.date),
          movement.type,
          movement.productId,
          movement.productName,
          movement.productSku,
          movement.quantity,
          movement.userId,
          movement.userName,
          movement.reason,
          movement.notes || null
        ]
      );
      
      return mapToMovement(result.rows[0]);
    } catch (error) {
      console.error('Error al crear movimiento:', error);
      throw error;
    }
  }
  
  // Buscar movimientos por término de búsqueda
  static async search(options: {
    productId?: string;
    productTerm?: string;
    type?: 'entrada' | 'salida' | 'venta' | 'ajuste';
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Movement[]> {
    try {
      let queryStr = 'SELECT * FROM movements WHERE 1=1';
      const queryParams: any[] = [];
      let paramIndex = 1;
      
      if (options.productId) {
        queryStr += ` AND product_id = $${paramIndex}`;
        queryParams.push(options.productId);
        paramIndex++;
      }
      
      if (options.productTerm) {
        queryStr += ` AND (product_name ILIKE $${paramIndex} OR product_sku ILIKE $${paramIndex})`;
        queryParams.push(`%${options.productTerm}%`);
        paramIndex++;
      }
      
      if (options.type) {
        queryStr += ` AND type = $${paramIndex}`;
        queryParams.push(options.type);
        paramIndex++;
      }
      
      if (options.dateFrom) {
        queryStr += ` AND date >= $${paramIndex}`;
        queryParams.push(new Date(options.dateFrom));
        paramIndex++;
      }
      
      if (options.dateTo) {
        queryStr += ` AND date <= $${paramIndex}`;
        // Añadir 23:59:59 para incluir todo el día final
        const endDate = new Date(options.dateTo);
        endDate.setHours(23, 59, 59, 999);
        queryParams.push(endDate);
        paramIndex++;
      }
      
      queryStr += ' ORDER BY date DESC';
      
      const result = await query(queryStr, queryParams);
      return result.rows.map(mapToMovement);
    } catch (error) {
      console.error('Error al buscar movimientos:', error);
      throw error;
    }
  }
  
  // Obtener movimientos recientes (para el dashboard)
  static async getRecent(limit: number = 5): Promise<Movement[]> {
    try {
      const result = await query(
        'SELECT * FROM movements ORDER BY date DESC LIMIT $1',
        [limit]
      );
      
      return result.rows.map(mapToMovement);
    } catch (error) {
      console.error(`Error al obtener los ${limit} movimientos más recientes:`, error);
      throw error;
    }
  }
}

export default MovementRepository;
