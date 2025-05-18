// Controlador para manejar la autenticación de usuarios
const express = require('express');
const { UserRepository } = require('../repositories/UserRepository');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Clave secreta para firmar los tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'agroinventario-jwt-secret-key';
// Tiempo de expiración del token (24 horas)
const TOKEN_EXPIRATION = '24h';

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar campos obligatorios
    if (!email || !password) {
      return res.status(400).json({ error: 'El correo electrónico y la contraseña son obligatorios' });
    }
    
    // Verificar las credenciales
    const authResult = await UserRepository.authenticate(email, password);
    
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.message });
    }
    
    const { user } = authResult;
    
    // Verificar si el usuario está activo
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' });
    }
    
    // Actualizar fecha de último inicio de sesión
    await UserRepository.updateLastLogin(user.id);
    
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRATION }
    );
    
    // Responder con el token y datos básicos del usuario
    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (err) {
    console.error('Error en la autenticación:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Verificar si un token JWT es válido
router.post('/verify-token', async (req, res) => {
  try {
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'Token no proporcionado' });
    }
    
    // Verificar el token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar si el usuario existe y está activo
    const user = await UserRepository.getById(decoded.id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    
    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Tu cuenta está inactiva. Contacta al administrador.' });
    }
    
    // Token válido
    res.json({ 
      valid: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    // Si hay un error de verificación, el token no es válido
    return res.status(401).json({ valid: false, error: 'Token inválido o expirado' });
  }
});

// Cerrar sesión (invalidar token)
// Nota: En realidad, JWT no se puede invalidar en el servidor 
// sin una estrategia adicional. Este endpoint es principalmente
// para consistencia de la API.
router.post('/logout', (req, res) => {
  // En una implementación completa, podríamos tener:
  // 1. Una lista negra de tokens
  // 2. Un sistema de refresh tokens que se pueden revocar
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

module.exports = router;
