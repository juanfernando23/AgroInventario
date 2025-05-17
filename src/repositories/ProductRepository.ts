// Repositorio para operaciones CRUD de productos
import { query } from '../db/db';
import { Product } from '../types';

// Interfaz para datos de producto que vienen desde la base de datos
interface ProductDB {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  min_stock: number;
  unit: string;
  image_url: string;
  created_at: Date;
}

// Función para convertir un objeto ProductDB a Product (formato de la aplicación)
const mapToProduct = (productDB: ProductDB): Product => ({
  id: productDB.id,
  sku: productDB.sku,
  name: productDB.name,
  description: productDB.description,
  category: productDB.category,
  price: typeof productDB.price === 'string' ? parseFloat(productDB.price) : productDB.price,
  stock: productDB.stock,
  minStock: productDB.min_stock,
  unit: productDB.unit,
  imageUrl: productDB.image_url,
  createdAt: productDB.created_at.toISOString()
});

// Clase para gestionar las operaciones con productos
export class ProductRepository {
  
  // Obtener todos los productos
  static async getAll(): Promise<Product[]> {
    try {
      const result = await query('SELECT * FROM products ORDER BY created_at DESC');
      return result.rows.map(mapToProduct);
    } catch (error) {
      console.error('Error al obtener productos:', error);
      throw error;
    }
  }
  
  // Obtener un producto por ID
  static async getById(id: string): Promise<Product | null> {
    try {
      const result = await query('SELECT * FROM products WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return mapToProduct(result.rows[0]);
    } catch (error) {
      console.error(`Error al obtener producto con ID ${id}:`, error);
      throw error;
    }
  }
    // Crear un nuevo producto
  static async create(product: Omit<Product, 'id' | 'createdAt'>): Promise<Product> {
    try {
      const result = await query(
        `INSERT INTO products (
          sku, name, description, category, price, stock, min_stock, unit, image_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
        RETURNING *`,
        [
          product.sku,
          product.name,
          product.description,
          product.category,
          // Asegurarnos de que price siempre sea un número
          typeof product.price === 'string' ? parseFloat(product.price) : product.price,
          product.stock,
          product.minStock,
          product.unit,
          product.imageUrl
        ]
      );
      
      return mapToProduct(result.rows[0]);
    } catch (error) {
      console.error('Error al crear producto:', error);
      throw error;
    }
  }
  
  // Actualizar un producto existente
  static async update(id: string, product: Partial<Product>): Promise<Product | null> {
    try {
      // Primero verificamos que el producto exista
      const existingProduct = await this.getById(id);
      
      if (!existingProduct) {
        return null;
      }
      
      // Construimos la consulta de actualización dinámicamente
      const updates: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;
      
      if (product.sku !== undefined) {
        updates.push(`sku = $${paramIndex}`);
        values.push(product.sku);
        paramIndex++;
      }
      
      if (product.name !== undefined) {
        updates.push(`name = $${paramIndex}`);
        values.push(product.name);
        paramIndex++;
      }
      
      if (product.description !== undefined) {
        updates.push(`description = $${paramIndex}`);
        values.push(product.description);
        paramIndex++;
      }
      
      if (product.category !== undefined) {
        updates.push(`category = $${paramIndex}`);
        values.push(product.category);
        paramIndex++;
      }
      
      if (product.price !== undefined) {
        updates.push(`price = $${paramIndex}`);
        // Asegurarnos de que price siempre sea un número
        values.push(typeof product.price === 'string' ? parseFloat(product.price) : product.price);
        paramIndex++;
      }
      
      if (product.stock !== undefined) {
        updates.push(`stock = $${paramIndex}`);
        values.push(product.stock);
        paramIndex++;
      }
      
      if (product.minStock !== undefined) {
        updates.push(`min_stock = $${paramIndex}`);
        values.push(product.minStock);
        paramIndex++;
      }
      
      if (product.unit !== undefined) {
        updates.push(`unit = $${paramIndex}`);
        values.push(product.unit);
        paramIndex++;
      }
      
      if (product.imageUrl !== undefined) {
        updates.push(`image_url = $${paramIndex}`);
        values.push(product.imageUrl);
        paramIndex++;
      }
      
      // Si no hay actualizaciones, devolvemos el producto existente
      if (updates.length === 0) {
        return existingProduct;
      }
      
      // Agregamos el ID para la cláusula WHERE
      values.push(id);
      
      const result = await query(
        `UPDATE products SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
        values
      );
      
      return mapToProduct(result.rows[0]);
    } catch (error) {
      console.error(`Error al actualizar producto con ID ${id}:`, error);
      throw error;
    }
  }
  
  // Eliminar un producto
  static async delete(id: string): Promise<boolean> {
    try {
      const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error(`Error al eliminar producto con ID ${id}:`, error);
      throw error;
    }
  }
  
  // Buscar productos por término de búsqueda (nombre, SKU o categoría)
  static async search(term: string): Promise<Product[]> {
    try {
      const result = await query(
        `SELECT * FROM products 
         WHERE name ILIKE $1 OR sku ILIKE $1 OR category ILIKE $1 
         ORDER BY created_at DESC`,
        [`%${term}%`]
      );
      
      return result.rows.map(mapToProduct);
    } catch (error) {
      console.error(`Error al buscar productos con término "${term}":`, error);
      throw error;
    }
  }
  
  // Obtener productos con stock bajo
  static async getLowStock(): Promise<Product[]> {
    try {
      const result = await query(
        'SELECT * FROM products WHERE stock <= min_stock ORDER BY stock ASC'
      );
      
      return result.rows.map(mapToProduct);
    } catch (error) {
      console.error('Error al obtener productos con stock bajo:', error);
      throw error;
    }
  }
}

export default ProductRepository;
