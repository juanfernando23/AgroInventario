// Verificar estructura de la base de datos
const { query } = require('./src/db/db');

async function checkTables() {
  try {
    console.log('Verificando tablas de la base de datos...');
    
    // Verificar tabla sales
    const salesResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sales'
      );
    `);
    console.log('Tabla sales existe:', salesResult.rows[0].exists);
    
    // Verificar tabla sale_items
    const itemsResult = await query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'sale_items'
      );
    `);
    console.log('Tabla sale_items existe:', itemsResult.rows[0].exists);
    
    // Si las tablas existen, verificar sus estructuras
    if (salesResult.rows[0].exists) {
      const salesColumns = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sales'
        ORDER BY ordinal_position;
      `);
      console.log('Estructura de la tabla sales:');
      salesColumns.rows.forEach(col => {
        console.log(` - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    if (itemsResult.rows[0].exists) {
      const itemsColumns = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'sale_items'
        ORDER BY ordinal_position;
      `);
      console.log('Estructura de la tabla sale_items:');
      itemsColumns.rows.forEach(col => {
        console.log(` - ${col.column_name}: ${col.data_type}`);
      });
    }
    
    // Verificar si hay datos en las tablas
    if (salesResult.rows[0].exists) {
      const salesCount = await query('SELECT COUNT(*) FROM sales');
      console.log('Número de ventas en la tabla:', salesCount.rows[0].count);
    }
    
    if (itemsResult.rows[0].exists) {
      const itemsCount = await query('SELECT COUNT(*) FROM sale_items');
      console.log('Número de items de venta en la tabla:', itemsCount.rows[0].count);
    }
    
  } catch (err) {
    console.error('Error al verificar tablas:', err);
  } finally {
    // Cerrar conexión
    process.exit(0);
  }
}

// Ejecutar la verificación
checkTables();
