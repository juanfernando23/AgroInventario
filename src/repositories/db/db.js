"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClient = exports.query = void 0;
// Configuraci�n de la conexi�n a la base de datos PostgreSQL
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
// Cargar variables de entorno desde el archivo .env
dotenv_1.default.config();
// Verificar si estamos en un entorno de navegador
const isBrowser = typeof window !== 'undefined';
// Objeto de configuraci�n para la conexi�n a la base de datos
const dbConfig = {
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
let pool;
if (!isBrowser) {
    pool = new pg_1.Pool(dbConfig);
    // Eventos del pool
    pool.on('connect', () => {
        console.log('Cliente de base de datos conectado');
    });
    pool.on('error', (err) => {
        console.error('Error inesperado en el cliente PostgreSQL', err);
    });
}
/**
 * Función para ejecutar consultas SQL
 * @param text - Texto de la consulta SQL
 * @param params - Parámetros para la consulta
 * @returns Promise con los resultados de la consulta
 */
const query = async (text, params = []) => {
    // En el navegador, devolvemos resultados simulados
    if (isBrowser || !pool) {
        console.log('Simulando consulta en el navegador:', text);
        return { rows: [], rowCount: 0 };
    }
    const start = Date.now();
    try {
        const res = await pool.query(text, params);
        const duration = Date.now() - start;
        console.log('Consulta ejecutada', { text, duration, rows: res.rowCount });
        return res;
    }
    catch (error) {
        console.error('Error al ejecutar consulta', { text, error });
        throw error;
    }
};
exports.query = query;
/**
 * Función para obtener un cliente del pool
 * @returns Promise con un cliente
 */
const getClient = async () => {
    // En el navegador, devolvemos un cliente simulado
    if (isBrowser || !pool) {
        return {
            query: async () => ({ rows: [], rowCount: 0 }),
            release: () => { }
        };
    }
    const client = await pool.connect();
    const originalRelease = client.release;
    client.release = () => {
        console.log('Cliente devuelto al pool');
        return originalRelease.apply(client);
    };
    return client;
};
exports.getClient = getClient;
exports.default = {
    query: exports.query,
    getClient: exports.getClient,
    pool
};
