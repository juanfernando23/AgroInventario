// Script para configurar la base de datos
import { query } from './db';

// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';

// Función para verificar si la tabla de productos existe
async function checkProductsTable() {
  if (isBrowser) {
    console.log('Saltando verificación de tabla en el navegador');
    return true;
  }
  
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'products'
      );
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error al verificar la tabla products:', error);
    throw error;
  }
}

// Función para crear la tabla de productos
async function createProductsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(100) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
        min_stock INTEGER DEFAULT 0 CHECK (min_stock >= 0),
        unit VARCHAR(50) NOT NULL,
        image_url VARCHAR(255),
        created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );

      -- Trigger para actualizar fecha_actualizacion en products
      DO $$ 
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_product_update_fecha') THEN
          CREATE OR REPLACE FUNCTION update_fecha_actualizacion_product()
          RETURNS TRIGGER AS $$
          BEGIN
             NEW.fecha_actualizacion = NOW();
             RETURN NEW;
          END;
          $$ language 'plpgsql';

          CREATE TRIGGER trg_product_update_fecha
          BEFORE UPDATE ON products
          FOR EACH ROW
          EXECUTE FUNCTION update_fecha_actualizacion_product();
        END IF;
      END $$;
    `);
    
    console.log('Tabla products creada exitosamente');
    return true;
  } catch (error) {
    console.error('Error al crear la tabla products:', error);
    throw error;
  }
}

// Función para agregar productos de muestra si la tabla está vacía
async function seedProducts() {
  try {
    // Verificar si hay productos
    const countResult = await query('SELECT COUNT(*) FROM products');
    const count = parseInt(countResult.rows[0].count);
    
    if (count === 0) {
      // Si no hay productos, insertar algunos de muestra
      await query(`
        INSERT INTO products (sku, name, description, category, price, stock, min_stock, unit, image_url)
        VALUES 
          ('FERT-001', 'Fertilizante NPK', 'Fertilizante completo con nitrógeno, fósforo y potasio', 'Fertilizantes', 25.99, 50, 10, 'kg', NULL),
          ('SEM-001', 'Semillas de Maíz', 'Semillas de maíz de alta productividad', 'Semillas', 15.50, 100, 20, 'kg', NULL),
          ('HERB-001', 'Herbicida Premium', 'Herbicida para control de malezas', 'Herbicidas', 18.75, 30, 5, 'l', NULL),
          ('TOOL-001', 'Azada de Jardín', 'Herramienta para remoción de tierra', 'Herramientas', 12.99, 15, 3, 'unidad', NULL),
          ('FERT-002', 'Abono Orgánico', 'Abono 100% natural para todo tipo de cultivos', 'Fertilizantes', 9.99, 80, 15, 'kg', NULL);
      `);
      
      console.log('Productos de muestra agregados exitosamente');
    }
    
    return true;
  } catch (error) {
    console.error('Error al agregar productos de muestra:', error);
    throw error;
  }
}

// Función para verificar si la tabla de movimientos existe
async function checkMovementsTable() {
  if (isBrowser) {
    console.log('Saltando verificación de tabla movements en el navegador');
    return true;
  }
  
  try {
    const result = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'movements'
      );
    `);
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Error al verificar la tabla movements:', error);
    throw error;
  }
}

// Función para crear la tabla de movimientos
async function createMovementsTable() {
  try {
    // Primero eliminamos la tabla existente si no tiene la estructura correcta
    await query(`DROP TABLE IF EXISTS movements;`);
    
    // Luego creamos la tabla con la estructura completa necesaria
    await query(`
      CREATE TABLE IF NOT EXISTS movements (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        type VARCHAR(20) NOT NULL CHECK (type IN ('entrada', 'salida', 'venta', 'ajuste')),
        product_id VARCHAR(255) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL,
        user_id VARCHAR(255) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        reason VARCHAR(255) NOT NULL,
        notes TEXT
      );
    `);
    
    console.log('Tabla movements creada exitosamente');
    return true;
  } catch (error) {
    console.error('Error al crear la tabla movements:', error);
    throw error;
  }
}

// Función principal para configurar la base de datos
export async function setupDatabase() {
  // Saltamos la configuración de la base de datos en el navegador
  if (isBrowser) {
    console.log('Saltando configuración de la base de datos en el navegador');
    return true;
  }
  
  try {
    console.log('Iniciando configuración de la base de datos...');
    
    // Configurar tabla de productos
    const productsTableExists = await checkProductsTable();
    
    if (!productsTableExists) {
      console.log('La tabla products no existe, creándola...');
      await createProductsTable();
      await seedProducts();
    } else {
      console.log('La tabla products ya existe');
    }
    
    // Configurar tabla de movimientos
    const movementsTableExists = await checkMovementsTable();
    
    if (!movementsTableExists) {
      console.log('La tabla movements no existe, creándola...');
      await createMovementsTable();
    } else {
      console.log('La tabla movements ya existe');
    }
    
    console.log('Configuración de la base de datos completada');
    return true;
  } catch (error) {
    console.error('Error durante la configuración de la base de datos:', error);
    throw error;
  }
}

// Exportar funciones
export default {
  setupDatabase,
  checkProductsTable,
  createProductsTable,
  seedProducts,
  checkMovementsTable,
  createMovementsTable
};
