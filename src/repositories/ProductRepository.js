"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductRepository = void 0;
// Repositorio para operaciones CRUD de productos
var db_1 = require("../db/db");
// Función para convertir un objeto ProductDB a Product (formato de la aplicación)
var mapToProduct = function (productDB) { return ({
    id: productDB.id,
    sku: productDB.sku,
    name: productDB.name,
    description: productDB.description,
    category: productDB.category,
    price: typeof productDB.price === 'string' ? parseFloat(productDB.price) : productDB.price,
    stock: productDB.stock,
    minStock: productDB.min_stock,
    unit: productDB.unit,
    imageUrl: productDB.image_url,
    createdAt: productDB.created_at.toISOString()
}); };
// Clase para gestionar las operaciones con productos
var ProductRepository = /** @class */ (function () {
    function ProductRepository() {
    }
    // Obtener todos los productos
    ProductRepository.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)('SELECT * FROM products ORDER BY created_at DESC')];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(mapToProduct)];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error al obtener productos:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener un producto por ID
    ProductRepository.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)('SELECT * FROM products WHERE id = $1', [id])];
                    case 1:
                        result = _a.sent();
                        if (result.rows.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, mapToProduct(result.rows[0])];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error al obtener producto con ID ".concat(id, ":"), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Crear un nuevo producto
    ProductRepository.create = function (product) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)("INSERT INTO products (\n          sku, name, description, category, price, stock, min_stock, unit, image_url\n        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) \n        RETURNING *", [
                                product.sku,
                                product.name,
                                product.description,
                                product.category,
                                // Asegurarnos de que price siempre sea un número
                                typeof product.price === 'string' ? parseFloat(product.price) : product.price,
                                product.stock,
                                product.minStock,
                                product.unit,
                                product.imageUrl
                            ])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, mapToProduct(result.rows[0])];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error al crear producto:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Actualizar un producto existente
    ProductRepository.update = function (id, product) {
        return __awaiter(this, void 0, void 0, function () {
            var existingProduct, updates, values, paramIndex, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getById(id)];
                    case 1:
                        existingProduct = _a.sent();
                        if (!existingProduct) {
                            return [2 /*return*/, null];
                        }
                        updates = [];
                        values = [];
                        paramIndex = 1;
                        if (product.sku !== undefined) {
                            updates.push("sku = $".concat(paramIndex));
                            values.push(product.sku);
                            paramIndex++;
                        }
                        if (product.name !== undefined) {
                            updates.push("name = $".concat(paramIndex));
                            values.push(product.name);
                            paramIndex++;
                        }
                        if (product.description !== undefined) {
                            updates.push("description = $".concat(paramIndex));
                            values.push(product.description);
                            paramIndex++;
                        }
                        if (product.category !== undefined) {
                            updates.push("category = $".concat(paramIndex));
                            values.push(product.category);
                            paramIndex++;
                        }
                        if (product.price !== undefined) {
                            updates.push("price = $".concat(paramIndex));
                            // Asegurarnos de que price siempre sea un número
                            values.push(typeof product.price === 'string' ? parseFloat(product.price) : product.price);
                            paramIndex++;
                        }
                        if (product.stock !== undefined) {
                            updates.push("stock = $".concat(paramIndex));
                            values.push(product.stock);
                            paramIndex++;
                        }
                        if (product.minStock !== undefined) {
                            updates.push("min_stock = $".concat(paramIndex));
                            values.push(product.minStock);
                            paramIndex++;
                        }
                        if (product.unit !== undefined) {
                            updates.push("unit = $".concat(paramIndex));
                            values.push(product.unit);
                            paramIndex++;
                        }
                        if (product.imageUrl !== undefined) {
                            updates.push("image_url = $".concat(paramIndex));
                            values.push(product.imageUrl);
                            paramIndex++;
                        }
                        // Si no hay actualizaciones, devolvemos el producto existente
                        if (updates.length === 0) {
                            return [2 /*return*/, existingProduct];
                        }
                        // Agregamos el ID para la cláusula WHERE
                        values.push(id);
                        return [4 /*yield*/, (0, db_1.query)("UPDATE products SET ".concat(updates.join(', '), " WHERE id = $").concat(paramIndex, " RETURNING *"), values)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, mapToProduct(result.rows[0])];
                    case 3:
                        error_4 = _a.sent();
                        console.error("Error al actualizar producto con ID ".concat(id, ":"), error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // Eliminar un producto
    ProductRepository.delete = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)('DELETE FROM products WHERE id = $1 RETURNING id', [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rowCount !== null && result.rowCount > 0];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error al eliminar producto con ID ".concat(id, ":"), error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Buscar productos por término de búsqueda (nombre, SKU o categoría)
    ProductRepository.search = function (term) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)("SELECT * FROM products \n         WHERE name ILIKE $1 OR sku ILIKE $1 OR category ILIKE $1 \n         ORDER BY created_at DESC", ["%".concat(term, "%")])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(mapToProduct)];
                    case 2:
                        error_6 = _a.sent();
                        console.error("Error al buscar productos con t\u00E9rmino \"".concat(term, "\":"), error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener productos con stock bajo
    ProductRepository.getLowStock = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)('SELECT * FROM products WHERE stock <= min_stock ORDER BY stock ASC')];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(mapToProduct)];
                    case 2:
                        error_7 = _a.sent();
                        console.error('Error al obtener productos con stock bajo:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ProductRepository;
}());
exports.ProductRepository = ProductRepository;
exports.default = ProductRepository;
