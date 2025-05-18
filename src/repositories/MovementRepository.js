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
exports.MovementRepository = void 0;
// Repositorio para operaciones CRUD de movimientos
var db_1 = require("../db/db");
// Función para convertir un objeto MovementDB a Movement (formato de la aplicación)
var mapToMovement = function (movementDB) { return ({
    id: movementDB.id,
    date: movementDB.date.toISOString(),
    type: movementDB.type,
    productId: movementDB.product_id,
    productName: movementDB.product_name,
    productSku: movementDB.product_sku,
    quantity: movementDB.quantity,
    userId: movementDB.user_id,
    userName: movementDB.user_name,
    reason: movementDB.reason,
    notes: movementDB.notes || undefined,
}); };
// Clase para gestionar las operaciones con movimientos
var MovementRepository = /** @class */ (function () {
    function MovementRepository() {
    }
    // Obtener todos los movimientos
    MovementRepository.getAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)('SELECT * FROM movements ORDER BY date DESC')];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(mapToMovement)];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error al obtener movimientos:', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener un movimiento por ID
    MovementRepository.getById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)('SELECT * FROM movements WHERE id = $1', [id])];
                    case 1:
                        result = _a.sent();
                        if (result.rows.length === 0) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, mapToMovement(result.rows[0])];
                    case 2:
                        error_2 = _a.sent();
                        console.error("Error al obtener movimiento con ID ".concat(id, ":"), error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Crear un nuevo movimiento
    MovementRepository.create = function (movement) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)("INSERT INTO movements (\n          date, type, product_id, product_name, product_sku, \n          quantity, user_id, user_name, reason, notes\n        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) \n        RETURNING *", [
                                new Date(movement.date),
                                movement.type,
                                movement.productId,
                                movement.productName,
                                movement.productSku,
                                movement.quantity,
                                movement.userId,
                                movement.userName,
                                movement.reason,
                                movement.notes || null
                            ])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, mapToMovement(result.rows[0])];
                    case 2:
                        error_3 = _a.sent();
                        console.error('Error al crear movimiento:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Buscar movimientos por término de búsqueda
    MovementRepository.search = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var queryStr, queryParams, paramIndex, endDate, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        queryStr = 'SELECT * FROM movements WHERE 1=1';
                        queryParams = [];
                        paramIndex = 1;
                        if (options.productId) {
                            queryStr += " AND product_id = $".concat(paramIndex);
                            queryParams.push(options.productId);
                            paramIndex++;
                        }
                        if (options.productTerm) {
                            queryStr += " AND (product_name ILIKE $".concat(paramIndex, " OR product_sku ILIKE $").concat(paramIndex, ")");
                            queryParams.push("%".concat(options.productTerm, "%"));
                            paramIndex++;
                        }
                        if (options.type) {
                            queryStr += " AND type = $".concat(paramIndex);
                            queryParams.push(options.type);
                            paramIndex++;
                        }
                        if (options.dateFrom) {
                            queryStr += " AND date >= $".concat(paramIndex);
                            queryParams.push(new Date(options.dateFrom));
                            paramIndex++;
                        }
                        if (options.dateTo) {
                            queryStr += " AND date <= $".concat(paramIndex);
                            endDate = new Date(options.dateTo);
                            endDate.setHours(23, 59, 59, 999);
                            queryParams.push(endDate);
                            paramIndex++;
                        }
                        queryStr += ' ORDER BY date DESC';
                        return [4 /*yield*/, (0, db_1.query)(queryStr, queryParams)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(mapToMovement)];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Error al buscar movimientos:', error_4);
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // Obtener movimientos recientes (para el dashboard)
    MovementRepository.getRecent = function () {
        return __awaiter(this, arguments, void 0, function (limit) {
            var result, error_5;
            if (limit === void 0) { limit = 5; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, (0, db_1.query)('SELECT * FROM movements ORDER BY date DESC LIMIT $1', [limit])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows.map(mapToMovement)];
                    case 2:
                        error_5 = _a.sent();
                        console.error("Error al obtener los ".concat(limit, " movimientos m\u00E1s recientes:"), error_5);
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return MovementRepository;
}());
exports.MovementRepository = MovementRepository;
exports.default = MovementRepository;
