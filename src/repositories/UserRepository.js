// Repositorio para operaciones CRUD de usuarios
const { query } = require('../db/db');
const bcrypt = require('bcryptjs');

// Función para convertir un objeto UserDB a User (formato de la aplicación)
const mapToUser = (userDB) => ({
  id: userDB.id.toString(),
  name: userDB.name,
  email: userDB.email,
  role: userDB.role,
  status: userDB.status,
  lastLogin: userDB.last_login ? userDB.last_login.toISOString() : null
});

// Clase para gestionar las operaciones con usuarios
class UserRepository {
  // Determinar la columna de contraseña
  static async getPasswordColumnName() {
    try {
      // Verificar si existe la columna contrasena_hash
      const result = await query(`
        SELECT EXISTS (
          SELECT FROM information_schema.columns 
          WHERE table_schema = 'public' 
          AND table_name = 'users'
          AND column_name = 'contrasena_hash'
        );
      `);
      return result.rows[0].exists ? 'contrasena_hash' : 'password';
    } catch (error) {
      console.error('Error al determinar la columna de contraseña:', error);
      // Por defecto, usar password si hay un error
      return 'password';
    }
  }
  
  // Obtener todos los usuarios
  static async getAll() {
    try {
      const result = await query('SELECT * FROM users ORDER BY name');
      return result.rows.map(mapToUser);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      throw error;
    }
  }
  
  // Obtener un usuario por ID
  static async getById(id) {
    try {
      const result = await query('SELECT * FROM users WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return mapToUser(result.rows[0]);
    } catch (error) {
      console.error(`Error al obtener usuario con ID ${id}:`, error);
      throw error;
    }
  }
  
  // Obtener un usuario por email
  static async getByEmail(email) {
    try {
      const result = await query('SELECT * FROM users WHERE email = $1', [email]);
      
      if (result.rows.length === 0) {
        return null;
      }
      
      return mapToUser(result.rows[0]);
    } catch (error) {
      console.error(`Error al obtener usuario con email ${email}:`, error);
      throw error;
    }
  }
    // Crear un nuevo usuario
  static async create(user) {
    try {
      // Verificar si el email ya está registrado
      const existingUser = await this.getByEmail(user.email);
      
      if (existingUser) {
        throw new Error('El correo electrónico ya está registrado');
      }
      
      // Hash de la contraseña
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(user.password, salt);
      
      // Determinar qué columna usar para la contraseña
      const passwordColumnName = await this.getPasswordColumnName();
      
      const result = await query(
        `INSERT INTO users (
          name, email, ${passwordColumnName}, role, status
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`,
        [
          user.name,
          user.email,
          hashedPassword,
          user.role,
          user.status || 'active'
        ]
      );
      
      return mapToUser(result.rows[0]);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      throw error;
    }
  }
  
  // Actualizar un usuario existente
  static async update(id, userData) {
    try {
      // Verificar si el usuario existe
      const existingUser = await this.getById(id);
      
      if (!existingUser) {
        throw new Error('Usuario no encontrado');
      }
      
      // Verificar si se está actualizando el email y si ya está en uso
      if (userData.email && userData.email !== existingUser.email) {
        const userWithEmail = await this.getByEmail(userData.email);
        if (userWithEmail) {
          throw new Error('El correo electrónico ya está en uso');
        }
      }
      
      // Preparar los campos a actualizar
      const fieldsToUpdate = [];
      const values = [];
      let paramIndex = 1;
      
      if (userData.name !== undefined) {
        fieldsToUpdate.push(`name = $${paramIndex++}`);
        values.push(userData.name);
      }
      
      if (userData.email !== undefined) {
        fieldsToUpdate.push(`email = $${paramIndex++}`);
        values.push(userData.email);
      }
        if (userData.password !== undefined) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(userData.password, salt);
        // Determinar qué columna usar para la contraseña
        const passwordColumnName = await this.getPasswordColumnName();
        fieldsToUpdate.push(`${passwordColumnName} = $${paramIndex++}`);
        values.push(hashedPassword);
      }
      
      if (userData.role !== undefined) {
        fieldsToUpdate.push(`role = $${paramIndex++}`);
        values.push(userData.role);
      }
      
      if (userData.status !== undefined) {
        fieldsToUpdate.push(`status = $${paramIndex++}`);
        values.push(userData.status);
      }
      
      // Si no hay campos para actualizar, retornar el usuario existente
      if (fieldsToUpdate.length === 0) {
        return existingUser;
      }
      
      // Añadir el ID al final de los valores
      values.push(id);
      
      const result = await query(
        `UPDATE users 
         SET ${fieldsToUpdate.join(', ')} 
         WHERE id = $${paramIndex} 
         RETURNING *`,
        values
      );
      
      return mapToUser(result.rows[0]);
    } catch (error) {
      console.error(`Error al actualizar usuario con ID ${id}:`, error);
      throw error;
    }
  }
  
  // Eliminar un usuario
  static async delete(id) {
    try {
      // Verificar que no se esté intentando eliminar al administrador principal
      const userToDelete = await this.getById(id);
      
      if (!userToDelete) {
        throw new Error('Usuario no encontrado');
      }
      
      if (userToDelete.email === 'admin@agroinventario.com') {
        throw new Error('No se puede eliminar el usuario administrador principal');
      }
      
      await query('DELETE FROM users WHERE id = $1', [id]);
      
      return { success: true, message: 'Usuario eliminado correctamente' };
    } catch (error) {
      console.error(`Error al eliminar usuario con ID ${id}:`, error);
      throw error;
    }  }
  
  // Autenticar un usuario
  static async authenticate(email, password) {
    try {
      // Obtener usuario con el email indicado
      const result = await query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      
      // Si no existe el usuario, retornar error
      if (result.rows.length === 0) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }
      
      const user = result.rows[0];
      
      // Determinar qué columna usar para la contraseña
      const passwordHash = user.contrasena_hash || user.password;
      
      // Verificar si la contraseña es correcta
      const isPasswordValid = bcrypt.compareSync(password, passwordHash);
      
      // Si la contraseña no es válida, retornar error
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Credenciales inválidas'
        };
      }
      
      // Si el usuario está inactivo, no permitir el login
      if (user.status === 'inactive') {
        return {
          success: false,
          message: 'Usuario inactivo. Contacte al administrador.'
        };
      }
      
      // Actualizar última fecha de inicio de sesión
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [user.id]
      );
      
      // Retornar resultado exitoso con el usuario
      return {
        success: true,
        user: mapToUser(user)
      };
    } catch (error) {
      console.error('Error al autenticar usuario:', error);
      throw error;
    }
  }
    // Cambiar la contraseña de un usuario
  static async changePassword(id, currentPassword, newPassword) {
    try {
      // Obtener el usuario actual
      const result = await query(
        'SELECT * FROM users WHERE id = $1',
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('Usuario no encontrado');
      }
      
      const user = result.rows[0];
      
      // Determinar qué columna usar para la contraseña
      const passwordColumnName = await this.getPasswordColumnName();
      const passwordHash = user.contrasena_hash || user.password;
      
      // Verificar que la contraseña actual sea correcta
      const isPasswordValid = bcrypt.compareSync(currentPassword, passwordHash);
      
      if (!isPasswordValid) {
        throw new Error('La contraseña actual es incorrecta');
      }
      
      // Generar hash de la nueva contraseña
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(newPassword, salt);
      
      // Actualizar la contraseña
      await query(
        `UPDATE users SET ${passwordColumnName} = $1 WHERE id = $2`,
        [hashedPassword, id]
      );
      
      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      console.error(`Error al cambiar contraseña del usuario ${id}:`, error);
      throw error;
    }
  }
  
  // Buscar usuarios
  static async search(searchTerm, role) {
    try {
      let queryStr = 'SELECT * FROM users WHERE 1=1';
      const params = [];
      let paramIndex = 1;
      
      // Buscar por nombre o email
      if (searchTerm) {
        queryStr += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
        params.push(`%${searchTerm}%`);
        paramIndex++;
      }
      
      // Filtrar por rol
      if (role) {
        queryStr += ` AND role = $${paramIndex}`;
        params.push(role);
        paramIndex++;
      }
      
      queryStr += ' ORDER BY name';
      
      const result = await query(queryStr, params);
        return result.rows.map(mapToUser);
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      throw error;
    }
  }
  
  // Actualizar la fecha del último inicio de sesión
  static async updateLastLogin(userId) {
    try {
      await query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
        [userId]
      );
      return true;
    } catch (error) {
      console.error(`Error al actualizar la fecha de último inicio de sesión para el usuario ${userId}:`, error);
      throw error;
    }
  }
}

module.exports = { UserRepository };
