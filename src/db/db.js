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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
// Configuraci�n de la conexi�n a la base de datos PostgreSQL
var pg_1 = require("pg");
var dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno desde el archivo .env
dotenv_1.default.config();
// Verificar si estamos en un entorno de navegador
var isBrowser = typeof window !== 'undefined';
// Objeto de configuraci�n para la conexi�n a la base de datos
var dbConfig = {
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    port: parseInt(process.env.PGPORT || '5432'),
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : false,
    max: 20, // M�ximo n�mero de clientes en el pool
    idleTimeoutMillis: 30000, // Tiempo m�ximo en ms que un cliente puede estar inactivo
    connectionTimeoutMillis: 2000, // Tiempo m�ximo en ms para esperar por un cliente
};
// Crear el pool de conexiones solo si no estamos en el navegador
var pool;
if (!isBrowser) {
    pool = new pg_1.Pool(dbConfig);
    // Eventos del pool
    pool.on('connect', function () {
        console.log('Cliente de base de datos conectado');
    });
    pool.on('error', function (err) {
        console.error('Error inesperado en el cliente PostgreSQL', err);
    });
}
/**
 * Funci�n para ejecutar consultas SQL
 * @param text - Texto de la consulta SQL
 * @param params - Par�metros para la consulta
 * @returns Promise con los resultados de la consulta
 */
var query = function (text_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([text_1], args_1, true), void 0, function (text, params) {
        var start, res, duration, error_1;
        if (params === void 0) { params = []; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // En el navegador, devolvemos resultados simulados
                    if (isBrowser) {
                        console.log('Simulando consulta en el navegador:', text);
                        return [2 /*return*/, { rows: [], rowCount: 0 }];
                    }
                    start = Date.now();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, pool.query(text, params)];
                case 2:
                    res = _a.sent();
                    duration = Date.now() - start;
                    console.log('Consulta ejecutada', { text: text, duration: duration, rows: res.rowCount });
                    return [2 /*return*/, res];
                case 3:
                    error_1 = _a.sent();
                    console.error('Error al ejecutar consulta', { text: text, error: error_1 });
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.query = query;
/**
 * Funci�n para obtener un cliente del pool
 * @returns Promise con un cliente
 */
var getClient = function () { return __awaiter(void 0, void 0, void 0, function () {
    var client, originalRelease;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // En el navegador, devolvemos un cliente simulado
                if (isBrowser) {
                    return [2 /*return*/, {
                            query: function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                                return [2 /*return*/, ({ rows: [], rowCount: 0 })];
                            }); }); },
                            release: function () { }
                        }];
                }
                return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                originalRelease = client.release;
                client.release = function () {
                    console.log('Cliente devuelto al pool');
                    return originalRelease.apply(client);
                };
                return [2 /*return*/, client];
        }
    });
}); };
exports.getClient = getClient;
exports.default = {
    query: exports.query,
    getClient: exports.getClient,
    pool: pool
};
