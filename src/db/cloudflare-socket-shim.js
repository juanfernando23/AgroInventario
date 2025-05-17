// Este archivo es un reemplazo (shim) para el módulo cloudflare:sockets
// que se utiliza en entornos de Cloudflare Workers pero que no está disponible
// en entornos de desarrollo local.

// Implementación de un socket básico para evitar errores
export const connect = () => {
  console.warn('Intento de usar cloudflare:sockets en un entorno no compatible');
  // Devolver un objeto con los métodos básicos que podría necesitar el cliente pg
  return {
    on: (event, callback) => {},
    write: () => {},
    end: () => {},
    destroyed: false,
    destroy: () => {}
  };
};

// Exportar por defecto con las funciones necesarias
export default {
  connect
};
