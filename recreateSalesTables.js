// Script para recrear las tablas de ventas
const { query } = require('./src/db/db');

async function recreateSalesTables() {
  try {
    console.log('Iniciando recreación completa de tablas de ventas...');
    
    // Iniciar transacción
    await query('BEGIN');
    
    // Eliminar tablas existentes (en orden para respetar las restricciones de clave foránea)
    console.log('Eliminando tablas existentes...');
    await query('DROP TABLE IF EXISTS sale_items CASCADE');
    await query('DROP TABLE IF EXISTS sales CASCADE');
    
    // Crear tabla sales con estructura correcta y compatible con la aplicación
    console.log('Creando tabla sales...');
    await query(`
      CREATE TABLE sales (
        id SERIAL PRIMARY KEY,
        date TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        customer VARCHAR(255),
        user_id VARCHAR(100) NOT NULL,
        user_name VARCHAR(255) NOT NULL,
        total DECIMAL(10, 2) NOT NULL CHECK (total >= 0),
        estado_venta VARCHAR(50) DEFAULT 'completada',
        fecha_creacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // Crear tabla sale_items con tipos compatibles
    console.log('Creando tabla sale_items...');
    await query(`
      CREATE TABLE sale_items (
        id SERIAL PRIMARY KEY,
        sale_id INTEGER NOT NULL,
        product_id VARCHAR(100) NOT NULL,
        product_name VARCHAR(255) NOT NULL,
        product_sku VARCHAR(100) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
        subtotal DECIMAL(10, 2) NOT NULL CHECK (subtotal >= 0),
        FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
      );
    `);
    
    // Crear trigger para actualizar fecha_actualizacion automáticamente
    console.log('Creando trigger para actualización automática de fecha_actualizacion...');
    await query(`
      CREATE OR REPLACE FUNCTION update_fecha_actualizacion_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.fecha_actualizacion = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    await query(`
      CREATE TRIGGER update_sales_fecha_actualizacion
      BEFORE UPDATE ON sales
      FOR EACH ROW
      EXECUTE FUNCTION update_fecha_actualizacion_column();
    `);
    
    // Verificar si existe la tabla de movements antes de crear el trigger
    const movementsExists = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'movements'
      );
    `);
    
    if (movementsExists.rows[0].exists) {
      // Trigger para crear movimientos automáticamente al registrar una venta
      console.log('Creando trigger para generar movimientos automáticos...');
      await query(`
        CREATE OR REPLACE FUNCTION crear_movimiento_venta()
        RETURNS TRIGGER AS $$
        BEGIN
          -- Por cada item en la venta, crear un movimiento de tipo "venta"
          INSERT INTO movements (
            date, type, product_id, product_name, product_sku, 
            quantity, user_id, user_name, reason
          )
          VALUES (
            (SELECT date FROM sales WHERE id = NEW.sale_id), 
            'venta', 
            NEW.product_id, 
            NEW.product_name, 
            NEW.product_sku, 
            NEW.quantity, 
            (SELECT user_id FROM sales WHERE id = NEW.sale_id), 
            (SELECT user_name FROM sales WHERE id = NEW.sale_id), 
            'Venta #' || NEW.sale_id
          );
          
          -- Actualizar stock del producto si la tabla products existe
          BEGIN
            UPDATE products 
            SET stock = stock - NEW.quantity 
            WHERE id = NEW.product_id;
            EXCEPTION WHEN OTHERS THEN
              -- Ignorar errores si el producto no se encuentra
              RAISE NOTICE 'No se pudo actualizar el stock del producto %', NEW.product_id;
          END;
          
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `);
      
      await query(`
        CREATE TRIGGER generar_movimiento_venta
        AFTER INSERT ON sale_items
        FOR EACH ROW
        EXECUTE FUNCTION crear_movimiento_venta();
      `);
      console.log('Trigger de movimientos configurado correctamente.');
    } else {
      console.log('Tabla movements no encontrada, se omite la creación del trigger de movimientos.');
    }
    
    // Confirmar transacción
    await query('COMMIT');
    
    console.log('Tablas de ventas recreadas exitosamente.');
    
    // Verificar la estructura actualizada
    const salesColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sales'
      ORDER BY ordinal_position;
    `);
    
    console.log('Nueva estructura de la tabla sales:');
    salesColumns.rows.forEach(col => {
      console.log(` - ${col.column_name}: ${col.data_type}`);
    });
    
    const itemsColumns = await query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'sale_items'
      ORDER BY ordinal_position;
    `);
    
    console.log('Nueva estructura de la tabla sale_items:');
    itemsColumns.rows.forEach(col => {
      console.log(` - ${col.column_name}: ${col.data_type}`);
    });
    
    // Verificar triggers
    const triggers = await query(`
      SELECT trigger_name, event_manipulation, action_statement
      FROM information_schema.triggers
      WHERE event_object_table IN ('sales', 'sale_items')
      ORDER BY trigger_name;
    `);
    
    console.log('Triggers configurados:');
    triggers.rows.forEach(trig => {
      console.log(` - ${trig.trigger_name} (${trig.event_manipulation})`);
    });
    
  } catch (err) {
    // En caso de error, revertir los cambios
    await query('ROLLBACK');
    console.error('Error al recrear tablas de ventas:', err);
  } finally {
    // Cerrar la conexión
    process.exit(0);
  }
}

// Ejecutar la recreación
recreateSalesTables();
