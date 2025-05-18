// Este archivo usa el módulo ts-node para ejecutar el servidor TypeScript directamente
// sin necesidad de compilar a JavaScript antes
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ProductRepository } from './src/repositories/ProductRepository';
import { MovementRepository } from './src/repositories/MovementRepository';

// Crear la aplicación Express
const app = express();
const port = process.env.API_PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));
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
    res.json({ success: true, message: 'Producto eliminado correctamente' });
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

app.get('/api/products/low-stock', async (req, res) => {
  try {
    const products = await ProductRepository.getLowStock();
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos con stock bajo:', error);
    res.status(500).json({ error: 'Error al obtener productos con stock bajo' });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor API ejecutándose en http://localhost:${port}`);
});
