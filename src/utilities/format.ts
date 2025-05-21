// Utilidades para formateo de datos

/**
 * Formatea un número como moneda colombiana (COP)
 * @param value - Valor numérico o string numérico a formatear
 * @param decimals - Número de decimales a mostrar (por defecto 2)
 * @returns String formateado con el formato $X.XXX,XX
 */
export const formatCurrency = (value: number | string, decimals: number = 2): string => {
  // Convertir a número si es string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Verificar si es un número válido
  if (isNaN(numValue)) return '$0';
  
  // Formatear con el formato deseado: $ como símbolo, punto como separador de miles,
  // y coma como separador decimal (típico en Colombia)
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(numValue);
};