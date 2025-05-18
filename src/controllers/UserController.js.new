// Controlador de API para usuarios
const express = require('express');
const { UserRepository } = require('../repositories/UserRepository');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Obtener todos los usuarios (solo administradores)
router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await UserRepository.getAll();
    // No enviar las contraseñas al cliente
    res.json(users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin
    })));
  } catch (err) {
    console.error('Error al obtener usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// IMPORTANTE: Las rutas específicas deben ir ANTES de las rutas con parámetros
// Buscar usuarios (solo administradores)
router.get('/search/find', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { term, role } = req.query;
    
    const users = await UserRepository.search(term, role);
    
    // No enviar contraseñas
    res.json(users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin
    })));
  } catch (err) {
    console.error('Error al buscar usuarios:', err);
    res.status(500).json({ error: 'Error al buscar usuarios' });
  }
});

// Obtener usuario por ID (solo administradores o el mismo usuario)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verificar permisos: solo administradores o el propio usuario pueden ver los detalles
    if (req.user.role !== 'admin' && req.user.id !== id) {
      return res.status(403).json({ error: 'No tienes permisos para ver este usuario' });
    }
    
    const user = await UserRepository.getById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    // No enviar la contraseña al cliente
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      lastLogin: user.lastLogin
    });
  } catch (err) {
    console.error('Error al obtener usuario:', err);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Crear un nuevo usuario (solo administradores)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role, status } = req.body;
    
    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios' });
    }
    
    if (role && !['admin', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'El rol debe ser "admin" o "employee"' });
    }
    
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'El estado debe ser "active" o "inactive"' });
    }
    
    const newUser = await UserRepository.create({
      name,
      email,
      password,
      role: role || 'employee',
      status: status || 'active'
    });
    
    // No enviar la contraseña al cliente
    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
      lastLogin: newUser.lastLogin
    });
  } catch (err) {
    console.error('Error al crear usuario:', err);
    
    if (err.message === 'El correo electrónico ya está registrado') {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

// Actualizar un usuario (solo administradores o el mismo usuario)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, status } = req.body;
    
    // Verificar permisos
    const isOwnAccount = req.user.id === id;
    const isAdminAccount = req.user.role === 'admin';
    
    if (!isAdminAccount && !isOwnAccount) {
      return res.status(403).json({ error: 'No tienes permisos para actualizar este usuario' });
    }
    
    // Si no es administrador, solo puede cambiar su nombre y contraseña
    if (!isAdminAccount && isOwnAccount) {
      if (email || role || status) {
        return res.status(403).json({ 
          error: 'Solo puedes cambiar tu nombre y contraseña. Para otros cambios, contacta al administrador.' 
        });
      }
    }
    
    // Validar rol y estado si se están cambiando
    if (role && !['admin', 'employee'].includes(role)) {
      return res.status(400).json({ error: 'El rol debe ser "admin" o "employee"' });
    }
    
    if (status && !['active', 'inactive'].includes(status)) {
      return res.status(400).json({ error: 'El estado debe ser "active" o "inactive"' });
    }
    
    // Construir objeto con los campos a actualizar
    const updateData = {};
    if (name) updateData.name = name;
    if (email && (isAdminAccount || !isOwnAccount)) updateData.email = email;
    if (password) updateData.password = password;
    if (role && isAdminAccount) updateData.role = role;
    if (status && isAdminAccount) updateData.status = status;
    
    // No permitir cambiar el administrador principal a inactivo
    const userToUpdate = await UserRepository.getById(id);
    if (
      userToUpdate && 
      userToUpdate.email === 'admin@agroinventario.com' && 
      (updateData.status === 'inactive' || updateData.role === 'employee')
    ) {
      return res.status(400).json({ 
        error: 'No se puede cambiar el estado o rol del administrador principal' 
      });
    }
    
    const updatedUser = await UserRepository.update(id, updateData);
    
    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      status: updatedUser.status,
      lastLogin: updatedUser.lastLogin
    });
  } catch (err) {
    console.error('Error al actualizar usuario:', err);
    
    if (err.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    
    if (err.message === 'El correo electrónico ya está en uso') {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

// Eliminar un usuario (solo administradores)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // No permitir eliminar al administrador principal
    const userToDelete = await UserRepository.getById(id);
    if (userToDelete && userToDelete.email === 'admin@agroinventario.com') {
      return res.status(400).json({ 
        error: 'No se puede eliminar el usuario administrador principal' 
      });
    }
    
    // No permitir auto-eliminarse
    if (req.user.id === id) {
      return res.status(400).json({ 
        error: 'No puedes eliminar tu propia cuenta' 
      });
    }
    
    const result = await UserRepository.delete(id);
    res.json(result);
  } catch (err) {
    console.error('Error al eliminar usuario:', err);
    
    if (err.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    
    if (err.message === 'No se puede eliminar el usuario administrador principal') {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Cambiar contraseña (solo el propio usuario o un administrador)
router.post('/:id/change-password', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    // Verificar permisos
    const isOwnAccount = req.user.id === id;
    const isAdminAccount = req.user.role === 'admin';
    
    if (!isAdminAccount && !isOwnAccount) {
      return res.status(403).json({ 
        error: 'No tienes permisos para cambiar la contraseña de este usuario' 
      });
    }
    
    // Validaciones
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }
    
    // Si es el propio usuario, necesitamos la contraseña actual
    if (isOwnAccount && !currentPassword) {
      return res.status(400).json({ error: 'Se requiere la contraseña actual' });
    }
    
    // Si es un administrador cambiando la contraseña de otro usuario, no necesita la contraseña actual
    if (isAdminAccount && !isOwnAccount) {
      // El administrador puede cambiar directamente la contraseña
      await UserRepository.update(id, { password: newPassword });
      return res.json({ success: true, message: 'Contraseña actualizada correctamente' });
    }
    
    // Para el caso de un usuario cambiando su propia contraseña
    const result = await UserRepository.changePassword(id, currentPassword, newPassword);
    res.json(result);
  } catch (err) {
    console.error('Error al cambiar contraseña:', err);
    
    if (err.message === 'Usuario no encontrado') {
      return res.status(404).json({ error: err.message });
    }
    
    if (err.message === 'La contraseña actual es incorrecta') {
      return res.status(400).json({ error: err.message });
    }
    
    res.status(500).json({ error: 'Error al cambiar contraseña' });
  }
});

module.exports = router;
