// Función para comprobar y corregir problemas de codificación en archivos TypeScript
const fs = require('fs');
const path = require('path');

// Lista de archivos para verificar
const filesToCheck = [
  './src/services/AuthService.ts',
  './src/fuente/Autenticacion.tsx',
  './src/paginas/PaginaDeUsuarios.tsx',
  './src/components/autorizacion/InicioSesion.tsx'
];

// Función para corregir la codificación de un archivo
function fixFileEncoding(filePath) {
  try {
    console.log(`Verificando archivo: ${filePath}`);
    const fileContent = fs.readFileSync(filePath, 'utf8');
    
    // Reescribir el archivo con codificación UTF-8
    fs.writeFileSync(filePath, fileContent, { encoding: 'utf8' });
    console.log(`Archivo ${filePath} verificado y guardado en UTF-8`);
  } catch (error) {
    console.error(`Error al procesar el archivo ${filePath}:`, error);
  }
}

// Procesar todos los archivos
filesToCheck.forEach(fixFileEncoding);

console.log('Proceso completado');
