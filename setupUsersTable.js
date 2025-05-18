// Script para configurar la tabla de usuarios
const { query } = require('./src/db/db');
const bcrypt = require('bcryptjs');

// Función para verificar si existe una tabla
async function tableExists(tableName) {
  const result = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = $1
    );
  `, [tableName]);
  return result.rows[0].exists;
}

// Función para comprobar si existe una columna en una tabla
async function columnExists(tableName, columnName) {
  const result = await query(`
    SELECT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = $1
      AND column_name = $2
    );
  `, [tableName, columnName]);
  return result.rows[0].exists;
}

// Función para crear o actualizar la tabla de usuarios
async function setupUsersTable() {
  try {
    console.log('Iniciando configuración de tabla de usuarios...');
    
    // Iniciar transacción
    await query('BEGIN');
    
    const usersExists = await tableExists('users');
    
    // Si la tabla no existe, crearla
    if (!usersExists) {
      console.log('Creando tabla de usuarios...');
      await query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'employee')),
          status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
          last_login TIMESTAMP WITHOUT TIME ZONE,
          created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      
      // Crear trigger para actualización automática del campo updated_at
      console.log('Configurando trigger para users...');
      await query(`
        CREATE OR REPLACE FUNCTION update_users_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_users_updated_at();
      `);
    } else {
      // Si la tabla existe, verificar si tiene la estructura correcta
      console.log('La tabla users ya existe. Verificando estructura...');
      
      // Verificar columnas requeridas      // Verificar qué columna de contraseña usar
      const hasContrasenaHashColumn = await columnExists('users', 'contrasena_hash');
      
      const requiredColumns = [
        { name: 'name', type: 'character varying' },
        { name: 'email', type: 'character varying' },
        { name: hasContrasenaHashColumn ? 'contrasena_hash' : 'password', type: 'character varying' },
        { name: 'role', type: 'character varying' },
        { name: 'status', type: 'character varying' },
        { name: 'last_login', type: 'timestamp without time zone' }
      ];
      
      // Obtener columnas actuales
      const columnsResult = await query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'users';
      `);
      
      const existingColumns = columnsResult.rows.map(row => ({
        name: row.column_name,
        type: row.data_type
      }));
      
      // Verificar si necesitamos añadir columnas
      for (const requiredCol of requiredColumns) {
        const exists = existingColumns.find(col => col.name === requiredCol.name);
        
        if (!exists) {
          console.log(`Añadiendo columna faltante: ${requiredCol.name}`);
          await query(`
            ALTER TABLE users 
            ADD COLUMN ${requiredCol.name} ${requiredCol.type}
            ${requiredCol.name === 'status' ? "DEFAULT 'active'" : ''};
          `);
        }
      }
      
      // Verificar restricciones de roles y status
      await query(`
        ALTER TABLE users 
        DROP CONSTRAINT IF EXISTS users_role_check;
        
        ALTER TABLE users
        ADD CONSTRAINT users_role_check 
        CHECK (role IN ('admin', 'employee'));
        
        ALTER TABLE users 
        DROP CONSTRAINT IF EXISTS users_status_check;
        
        ALTER TABLE users
        ADD CONSTRAINT users_status_check 
        CHECK (status IN ('active', 'inactive'));
      `);
    }
      // Verificar si la tabla tiene columna password o contrasena_hash
    const hasPasswordColumn = await columnExists('users', 'password');
    const hasContrasenaHashColumn = await columnExists('users', 'contrasena_hash');
    
    // Determinar qué columna usar para la contraseña
    const passwordColumnName = hasContrasenaHashColumn ? 'contrasena_hash' : 'password';
    console.log(`Usando columna "${passwordColumnName}" para la contraseña`);

    // Verificar si existe el usuario administrador
    const adminExists = await query(`
      SELECT COUNT(*) FROM users 
      WHERE email = 'admin@agroinventario.com';
    `);
    
    // Si no existe, crear el usuario administrador
    if (parseInt(adminExists.rows[0].count) === 0) {
      console.log('Creando usuario administrador...');
      
      // Generar hash de la contraseña
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('admin123', salt);
      
      await query(`
        INSERT INTO users (name, email, ${passwordColumnName}, role, status)
        VALUES ('Admin Usuario', 'admin@agroinventario.com', $1, 'admin', 'active');
      `, [hashedPassword]);
      
      console.log('Usuario administrador creado con éxito.');
      console.log('Email: admin@agroinventario.com');
      console.log('Contraseña: admin123');
    } else {
      console.log('El usuario administrador ya existe.');
    }
    
    // Confirmar cambios
    await query('COMMIT');
    console.log('Configuración de la tabla de usuarios completada con éxito.');
    
  } catch (error) {
    // Revertir cambios en caso de error
    await query('ROLLBACK');
    console.error('Error al configurar la tabla de usuarios:', error);
  } finally {
    process.exit();
  }
}

// Ejecutar la configuración
setupUsersTable();
