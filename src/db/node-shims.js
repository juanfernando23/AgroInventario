// Shims para bibliotecas específicas de Node.js utilizadas en el cliente
// Este archivo proporciona implementaciones simuladas para las APIs de Node.js
// que podrían ser importadas por dependencias pero que no son necesarias en el cliente

// Clase simulada de Pool
export class Pool {
  constructor() {
    console.log('Pool simulado creado en el navegador');
  }

  on(event, callback) {
    console.log(`Evento ${event} registrado en Pool simulado`);
    return this;
  }

  async query() {
    console.log('Consulta simulada en el navegador');
    return { rows: [], rowCount: 0 };
  }

  async connect() {
    console.log('Conexión simulada en el navegador');
    return {
      query: async () => ({ rows: [], rowCount: 0 }),
      release: () => {}
    };
  }
}

// Clase simulada de PoolClient
export class PoolClient {
  async query() {
    return { rows: [], rowCount: 0 };
  }
  
  release() {}
}

// Clase simulada de QueryResult
export class QueryResult {
  constructor() {
    this.rows = [];
    this.rowCount = 0;
  }
}

export default {
  Pool,
  PoolClient,
  QueryResult
};
