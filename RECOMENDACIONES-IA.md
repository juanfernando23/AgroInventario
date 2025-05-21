# Funcionalidad de Recomendaciones con IA en AgroInventario

Esta funcionalidad permite obtener recomendaciones inteligentes sobre el inventario a través de la API de OpenAI (GPT-4.1 nano).

## Características

- Análisis diario del inventario con IA
- Resumen del estado actual del inventario
- Recomendaciones accionables para optimizar la gestión
- Observaciones detalladas sobre tendencias y oportunidades
- Opción para generar nuevas recomendaciones bajo demanda

## Configuración

Para utilizar esta funcionalidad, necesitas:

1. Una clave de API de OpenAI
2. Configurar la variable de entorno `VITE_OPENAI_API_KEY` en el archivo `.env`

```
VITE_OPENAI_API_KEY=tu_clave_api_de_openai
```

## Cómo funciona

1. La aplicación recopila y analiza los datos del inventario (productos, movimientos, niveles de stock).
2. Se envía esta información a la API de OpenAI utilizando el modelo GPT-4.1 nano.
3. La IA genera un análisis completo que incluye:
   - Resumen del estado actual
   - Recomendaciones específicas
   - Observaciones detalladas

## Uso

- Haz clic en el botón "Recomendaciones IA" en la parte superior derecha del panel de control.
- Las recomendaciones se generan una vez al día y se almacenan en caché para optimizar el uso de la API.
- Para generar nuevas recomendaciones manualmente, utiliza el botón "Generar nuevas observaciones" dentro del panel de recomendaciones.

## Consideraciones técnicas

- El modelo utiliza `gpt-4o-mini`, que ofrece una buena relación rendimiento-costo.
- Las recomendaciones se almacenan en el almacenamiento local del navegador para reducir llamadas a la API.
- El formato de respuesta es JSON estructurado para facilitar el procesamiento.

## Personalización

Para modificar el tipo de análisis o recomendaciones, edita el archivo `AIRecommendationService.ts` en la carpeta `services`.
