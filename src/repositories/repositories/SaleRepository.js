"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleRepository = void 0;
// Repositorio para operaciones CRUD de ventas
const db_1 = require("../db/db");
// Función para convertir un objeto SaleDB a Sale (formato de la aplicación)
const mapToSale = (saleDB) => ({
    id: saleDB.id,
    date: saleDB.date.toISOString(),
    customer: saleDB.customer || undefined,
    userId: saleDB.user_id,
    userName: saleDB.user_name,
    total: parseFloat(saleDB.total),
    items: [] // Se cargan por separado
});
// Función para convertir un objeto SaleItemDB a SaleItem
const mapToSaleItem = (itemDB) => ({
    productId: itemDB.product_id,
    productName: itemDB.product_name,
    productSku: itemDB.product_sku,
    quantity: itemDB.quantity,
    price: parseFloat(itemDB.price),
    subtotal: parseFloat(itemDB.subtotal)
});
// Clase para gestionar las operaciones con ventas
class SaleRepository {
    // Obtener todas las ventas con sus elementos
    static async getAll() {
        try {
            // Obtener todas las ventas
            const salesResult = await (0, db_1.query)('SELECT * FROM sales ORDER BY date DESC');
            const sales = [];
            // Para cada venta, obtener sus elementos
            for (const saleDB of salesResult.rows) {
                const sale = mapToSale(saleDB);
                // Obtener los elementos de esta venta
                const itemsResult = await (0, db_1.query)('SELECT * FROM sale_items WHERE sale_id = $1', [saleDB.id]);
                sale.items = itemsResult.rows.map(mapToSaleItem);
                sales.push(sale);
            }
            return sales;
        }
        catch (error) {
            console.error('Error al obtener ventas:', error);
            throw error;
        }
    }
    // Obtener una venta por ID
    static async getById(id) {
        try {
            // Obtener la venta
            const saleResult = await (0, db_1.query)('SELECT * FROM sales WHERE id = $1', [id]);
            if (saleResult.rows.length === 0) {
                return null;
            }
            const sale = mapToSale(saleResult.rows[0]);
            // Obtener los elementos de esta venta
            const itemsResult = await (0, db_1.query)('SELECT * FROM sale_items WHERE sale_id = $1', [id]);
            sale.items = itemsResult.rows.map(mapToSaleItem);
            return sale;
        }
        catch (error) {
            console.error(`Error al obtener venta con ID ${id}:`, error);
            throw error;
        }
    }
    // Crear una nueva venta
    static async create(sale) {
        try {
            // Iniciar transacción
            await (0, db_1.query)('BEGIN');
            // Insertar la venta
            const saleResult = await (0, db_1.query)(`INSERT INTO sales (
          date, customer, user_id, user_name, total
        ) VALUES ($1, $2, $3, $4, $5) 
        RETURNING *`, [
                new Date(sale.date),
                sale.customer || null,
                sale.userId,
                sale.userName,
                sale.total
            ]);
            const newSale = mapToSale(saleResult.rows[0]);
            const saleId = newSale.id;
            // Insertar todos los elementos de la venta
            const items = [];
            for (const item of sale.items) {
                const itemResult = await (0, db_1.query)(`INSERT INTO sale_items (
            sale_id, product_id, product_name, product_sku, quantity, price, subtotal
          ) VALUES ($1, $2, $3, $4, $5, $6, $7) 
          RETURNING *`, [
                    saleId,
                    item.productId,
                    item.productName,
                    item.productSku,
                    item.quantity,
                    item.price,
                    item.subtotal
                ]);
                items.push(mapToSaleItem(itemResult.rows[0]));
            }
            newSale.items = items;
            // Confirmar transacción
            await (0, db_1.query)('COMMIT');
            return newSale;
        }
        catch (error) {
            // Revertir transacción en caso de error
            await (0, db_1.query)('ROLLBACK');
            console.error('Error al crear venta:', error);
            throw error;
        }
    }
    // Buscar ventas con filtros
    static async search(filters) {
        try {
            let queryStr = 'SELECT * FROM sales WHERE 1=1';
            const queryParams = [];
            let paramIndex = 1;
            if (filters.customer) {
                queryStr += ` AND customer ILIKE $${paramIndex}`;
                queryParams.push(`%${filters.customer}%`);
                paramIndex++;
            }
            if (filters.dateFrom) {
                queryStr += ` AND date >= $${paramIndex}`;
                queryParams.push(new Date(filters.dateFrom));
                paramIndex++;
            }
            if (filters.dateTo) {
                let endDate = new Date(filters.dateTo);
                endDate.setHours(23, 59, 59, 999);
                queryStr += ` AND date <= $${paramIndex}`;
                queryParams.push(endDate);
                paramIndex++;
            }
            queryStr += ' ORDER BY date DESC';
            const salesResult = await (0, db_1.query)(queryStr, queryParams);
            const sales = [];
            // Para cada venta, obtener sus elementos
            for (const saleDB of salesResult.rows) {
                const sale = mapToSale(saleDB);
                // Obtener los elementos de esta venta
                const itemsResult = await (0, db_1.query)('SELECT * FROM sale_items WHERE sale_id = $1', [saleDB.id]);
                sale.items = itemsResult.rows.map(mapToSaleItem);
                sales.push(sale);
            }
            return sales;
        }
        catch (error) {
            console.error('Error al buscar ventas:', error);
            throw error;
        }
    }
    // Obtener ventas recientes
    static async getRecent(limit = 5) {
        try {
            // Obtener las ventas más recientes
            const salesResult = await (0, db_1.query)('SELECT * FROM sales ORDER BY date DESC LIMIT $1', [limit]);
            const sales = [];
            // Para cada venta, obtener sus elementos
            for (const saleDB of salesResult.rows) {
                const sale = mapToSale(saleDB);
                // Obtener los elementos de esta venta
                const itemsResult = await (0, db_1.query)('SELECT * FROM sale_items WHERE sale_id = $1', [saleDB.id]);
                sale.items = itemsResult.rows.map(mapToSaleItem);
                sales.push(sale);
            }
            return sales;
        }
        catch (error) {
            console.error('Error al obtener ventas recientes:', error);
            throw error;
        }
    }
}
exports.SaleRepository = SaleRepository;
