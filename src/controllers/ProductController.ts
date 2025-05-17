// Controlador para la API de productos
// Nota: En el frontend, este controlador solo es un stub.
// El ProductService deber�a usar fetch en lugar de llamar a estos m�todos.
import { Product } from "../types";

// Define las funciones del controlador
export class ProductController {
  
  // Obtener todos los productos
  static async getAllProducts(): Promise<Product[]> {
    console.warn("ProductController.getAllProducts() no debe usarse en el frontend");
    return [];
  }
  
  // Obtener un producto por ID
  static async getProductById(id: string): Promise<Product | null> {
    console.warn(`ProductController.getProductById(${id}) no debe usarse en el frontend`);
    return null;
  }
  
  // Crear un nuevo producto
  static async createProduct(productData: Omit<Product, "id" | "createdAt">): Promise<Product> {
    console.warn("ProductController.createProduct() no debe usarse en el frontend");
    throw new Error("Operaci�n no soportada en el frontend");
  }
  
  // Actualizar un producto existente
  static async updateProduct(id: string, productData: Partial<Product>): Promise<Product | null> {
    console.warn(`ProductController.updateProduct(${id}) no debe usarse en el frontend`);
    throw new Error("Operaci�n no soportada en el frontend");
  }
  
  // Eliminar un producto
  static async deleteProduct(id: string): Promise<boolean> {
    console.warn(`ProductController.deleteProduct(${id}) no debe usarse en el frontend`);
    throw new Error("Operaci�n no soportada en el frontend");
  }
  
  // Buscar productos por t�rmino
  static async searchProducts(term: string): Promise<Product[]> {
    console.warn(`ProductController.searchProducts(${term}) no debe usarse en el frontend`);
    return [];
  }
  
  // Obtener productos con stock bajo
  static async getLowStockProducts(): Promise<Product[]> {
    console.warn("ProductController.getLowStockProducts() no debe usarse en el frontend");
    return [];
  }
}
