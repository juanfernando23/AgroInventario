const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { ProductRepository } = require('./src/repositories/ProductRepository.js');
const { MovementRepository } = require('./src/repositories/MovementRepository.js');

// Cargar variables de entorno
dotenv.config();

// Crear la aplicación Express
const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

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

// Iniciar el servidor
app.listen(port, () => {
  console.log(`API de AgroInventario ejecutándose en el puerto ${port}`);
});
