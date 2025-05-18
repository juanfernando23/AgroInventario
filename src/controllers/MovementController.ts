// Controlador para la API de movimientos
// Nota: En el frontend, este controlador solo es un stub.
// El MovementService debería usar fetch en lugar de llamar a estos métodos.
import { Movement } from "../types";

// Define las funciones del controlador
export class MovementController {
  
  // Obtener todos los movimientos
  static async getAllMovements(): Promise<Movement[]> {
    console.warn("MovementController.getAllMovements() no debe usarse en el frontend");
    return [];
  }
  
  // Obtener un movimiento por ID
  static async getMovementById(id: string): Promise<Movement | null> {
    console.warn(`MovementController.getMovementById(${id}) no debe usarse en el frontend`);
    return null;
  }
  
  // Crear un nuevo movimiento
  static async createMovement(movementData: Omit<Movement, "id">): Promise<Movement> {
    console.warn("MovementController.createMovement() no debe usarse en el frontend");
    throw new Error("Operación no soportada en el frontend");
  }
  
  // Buscar movimientos según filtros
  static async searchMovements(filters: {
    productTerm?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<Movement[]> {
    console.warn(`MovementController.searchMovements() no debe usarse en el frontend`);
    return [];
  }
  
  // Obtener movimientos recientes
  static async getRecentMovements(limit: number = 5): Promise<Movement[]> {
    console.warn(`MovementController.getRecentMovements(${limit}) no debe usarse en el frontend`);
    return [];
  }
}

export default MovementController;
