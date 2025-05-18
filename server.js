const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { ProductRepository } = require('./src/repositories/ProductRepository.js');
const { MovementRepository } = require('./src/repositories/MovementRepository.js');
const { SaleRepository } = require('./src/repositories/SaleRepository.js');
const { UserRepository } = require('./src/repositories/UserRepository.js');

// Controladores de API
//const userController = require('./src/controllers/UserController.js');
//const authController = require('./src/controllers/AuthController.js');

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get('/api/test', (req, res) => {
  res.json({ message: 'API de prueba funcionando correctamente' });
});

// Rutas API para productos
app.get('/api/products', async (req, res) => {
  try {
    const products = await ProductRepository.getAll();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await ProductRepository.getById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    console.error(`Error al obtener producto con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al obtener el producto' });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const newProduct = await ProductRepository.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updatedProduct = await ProductRepository.update(req.params.id, req.body);
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error(`Error al actualizar producto con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al actualizar el producto' });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const success = await ProductRepository.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).send();
  } catch (error) {
    console.error(`Error al eliminar producto con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al eliminar el producto' });
  }
});

app.get('/api/products/search/:term', async (req, res) => {
  try {
    const products = await ProductRepository.search(req.params.term);
    res.json(products);
  } catch (error) {
    console.error(`Error al buscar productos con término "${req.params.term}":`, error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
});

app.get('/api/products/status/lowstock', async (req, res) => {
  try {
    const products = await ProductRepository.getLowStock();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
  }
});

// Rutas API para movimientos
app.get('/api/movements', async (req, res) => {
  try {
    const movements = await MovementRepository.getAll();
    res.json(movements);
  } catch (error) {
    console.error('Error al obtener movimientos:', error);
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
});

app.post('/api/movements', async (req, res) => {
  try {
    const updateProduct = req.body.updateProduct === true;
    // Eliminar el campo updateProduct para no guardarlo en la base de datos
    const { updateProduct: _, ...movementData } = req.body;
    
    const newMovement = await MovementRepository.create(movementData);
    
    // Si se debe actualizar el inventario del producto
    if (updateProduct && newMovement.productId) {
      try {
        // Obtener el producto actual
        const product = await ProductRepository.getById(newMovement.productId);
        
        if (product) {
          // Calcular el nuevo stock basado en el tipo de movimiento
          let newStock = product.stock;
          
          if (newMovement.type === 'entrada') {
            newStock += newMovement.quantity;
          } else if (['salida', 'venta'].includes(newMovement.type)) {
            newStock -= newMovement.quantity;
          } else if (newMovement.type === 'ajuste') {
            // Para ajustes, la cantidad puede ser positiva o negativa
            newStock += newMovement.quantity; // La cantidad ya viene con el signo correcto
          }
          
          // Actualizar el stock del producto
          await ProductRepository.update(newMovement.productId, {
            ...product,
            stock: newStock
          });
        }
      } catch (productError) {
        console.error('Error al actualizar el stock del producto:', productError);
        // No detenemos la creación del movimiento si falla la actualización del producto
      }
    }
    
    res.status(201).json(newMovement);
  } catch (error) {
    console.error('Error al crear movimiento:', error);
    res.status(500).json({ error: 'Error al crear el movimiento' });
  }
});

app.get('/api/movements/search', async (req, res) => {
  try {
    const filters = {
      productTerm: req.query.productTerm,
      type: req.query.type,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };
    
    const movements = await MovementRepository.search(filters);
    res.json(movements);
  } catch (error) {
    console.error('Error al buscar movimientos:', error);
    res.status(500).json({ error: 'Error al buscar movimientos' });
  }
});

app.get('/api/movements/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '5');
    const movements = await MovementRepository.getRecent(limit);
    res.json(movements);
  } catch (error) {
    console.error('Error al obtener movimientos recientes:', error);
    res.status(500).json({ error: 'Error al obtener movimientos recientes' });
  }
});

// Rutas API para ventas
app.get('/api/sales', async (req, res) => {
  try {
    const sales = await SaleRepository.getAll();
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas:', error);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// Rutas especiales para ventas (deben ir antes que las rutas con parámetros)
app.get('/api/sales/search', async (req, res) => {
  try {
    const filters = {
      customer: req.query.customer,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo
    };
    
    const sales = await SaleRepository.search(filters);
    res.json(sales);
  } catch (error) {
    console.error('Error al buscar ventas:', error);
    res.status(500).json({ error: 'Error al buscar ventas' });
  }
});

app.get('/api/sales/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || '5');
    const sales = await SaleRepository.getRecent(limit);
    res.json(sales);
  } catch (error) {
    console.error('Error al obtener ventas recientes:', error);
    res.status(500).json({ error: 'Error al obtener ventas recientes' });
  }
});

app.get('/api/sales/:id', async (req, res) => {
  try {
    const sale = await SaleRepository.getById(req.params.id);
    if (!sale) {
      return res.status(404).json({ error: 'Venta no encontrada' });
    }
    res.json(sale);
  } catch (error) {
    console.error(`Error al obtener venta con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al obtener la venta' });
  }
});

app.post('/api/sales', async (req, res) => {
  try {
    // Crear la venta en la base de datos
    const newSale = await SaleRepository.create(req.body);
    
    // Crear movimientos de inventario para cada producto vendido
    for (const item of req.body.items) {
      try {
        // Crear un movimiento de tipo "venta" para cada producto
        const movementData = {
          date: req.body.date,
          type: 'venta',
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          quantity: item.quantity,
          userId: req.body.userId,
          userName: req.body.userName,
          reason: `Venta #${newSale.id}`,
          notes: req.body.customer ? `Cliente: ${req.body.customer}` : 'Venta directa'
        };
        
        // Crear el movimiento y actualizar el stock
        await MovementRepository.create(movementData);
        
        // Obtener el producto actual
        const product = await ProductRepository.getById(item.productId);
        
        if (product) {
          // Actualizar el stock del producto
          await ProductRepository.update(item.productId, {
            ...product,
            stock: Math.max(0, product.stock - item.quantity)
          });
        }
      } catch (itemError) {
        console.error(`Error al procesar el ítem ${item.productId} de la venta:`, itemError);
        // Continuamos con los demás ítems aunque falle este
      }
    }
    
    res.status(201).json(newSale);
  } catch (error) {
    console.error('Error al crear venta:', error);
    res.status(500).json({ error: 'Error al crear la venta' });
  }
});

// Rutas de autenticación
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Permitir autenticación con el usuario admin hardcoded para casos de emergencia
    if (email === 'admin@agroinventario.com' && password === 'admin123') {
      // Simular usuario autenticado
      return res.json({
        user: {
          id: '1',
          name: 'Admin Usuario',
          email: 'admin@agroinventario.com',
          role: 'admin'
        },
        token: 'token-simulado-1234567890'
      });
    }
    
    // Autenticar con la base de datos para el resto de usuarios
    const authResult = await UserRepository.authenticate(email, password);
    
    if (authResult.success) {
      // Generar un token simple (en producción sería un JWT)
      const token = `token-${Date.now()}-${authResult.user.id}`;
      
      return res.json({
        user: authResult.user,
        token
      });
    } else {
      return res.status(401).json({ 
        error: authResult.message || 'Credenciales inválidas. Verifique su email y contraseña.',
        errorType: authResult.message.includes('inactivo') ? 'inactive_user' : 'invalid_credentials'
      });
    }
  } catch (error) {
    console.error('Error en autenticación:', error);
    return res.status(500).json({ error: 'Error al procesar la autenticación' });
  }
});

app.post('/api/auth/verify-token', (req, res) => {
  // Simulación de verificación de token
  res.json({ 
    valid: true,
    user: {
      id: '1',
      name: 'Admin Usuario',
      email: 'admin@agroinventario.com',
      role: 'admin'
    }
  });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Sesión cerrada correctamente' });
});

// Rutas API para usuarios
app.get('/api/users', async (req, res) => {
  try {
    const users = await UserRepository.getAll();
    res.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const user = await UserRepository.getById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    console.error(`Error al obtener usuario con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al obtener el usuario' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await UserRepository.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    // Si es un error de email duplicado, devolver un mensaje específico
    if (error.message && error.message.includes('ya está registrado')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const updatedUser = await UserRepository.update(req.params.id, req.body);
    if (!updatedUser) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(updatedUser);
  } catch (error) {
    console.error(`Error al actualizar usuario con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const result = await UserRepository.delete(req.params.id);
    if (!result.success) {
      return res.status(404).json({ error: result.message || 'Usuario no encontrado' });
    }
    res.json(result);
  } catch (error) {
    console.error(`Error al eliminar usuario con ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Error al eliminar el usuario' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`API de AgroInventario ejecutándose en el puerto ${port}`);
});
