import OpenAI from 'openai';

// Interfaz para las recomendaciones
export interface AIRecommendation {
  date: string;
  summary: string;
  recommendations: string[];
  observaciones: string;  // Cambiado de "insights" a "observaciones"
}

class AIRecommendationService {
  private openai: OpenAI;
  private static STORAGE_KEY = 'ai_recommendation_cache';
  
  constructor() {
    // Inicializar el cliente de OpenAI con la clave de API
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY, // Asegúrate de tener esta variable en tu .env
      dangerouslyAllowBrowser: true // Solo para desarrollo, en producción usa el backend
    });
  }
  /**
   * Obtiene el resumen de inventario para hoy
   * @param inventoryData Datos del inventario para analizar
   * @param forceRefresh Si es true, ignora la caché y genera una nueva recomendación
   * @returns La recomendación generada o almacenada en caché
   */  async getDailyRecommendation(inventoryData: any, forceRefresh = false): Promise<AIRecommendation> {
    // Si forceRefresh es true, generamos una nueva recomendación
    if (forceRefresh) {
      // Generamos una nueva recomendación y la almacenamos en caché
      return await this.generateRecommendation(inventoryData, true);
    }
    
    // Comprobar si ya tenemos una recomendación para hoy
    const cachedRecommendation = this.getTodaysCachedRecommendation();
    if (cachedRecommendation) {
      return cachedRecommendation;
    }

    // Si no hay recomendación en caché, generar una nueva
    return await this.generateRecommendation(inventoryData);
  }

  /**
   * Generar una nueva recomendación a pedido
   * @param inventoryData Datos actuales del inventario
   * @returns Una nueva recomendación
   */
  async generateOnDemandRecommendation(inventoryData: any): Promise<AIRecommendation> {
    return await this.generateRecommendation(inventoryData, false);
  }

  /**
   * Genera una recomendación usando la API de OpenAI
   * @param inventoryData Datos del inventario
   * @param shouldCache Si se debe almacenar en caché
   * @returns La recomendación generada
   */  private async generateRecommendation(inventoryData: any, shouldCache = true): Promise<AIRecommendation> {
    try {
      const formattedDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const prompt = this.createPrompt(inventoryData);
      
      // Imprimir detalles para depuración
      console.log("Enviando solicitud a OpenAI...");
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1-nano",
        messages: [
          {
            role: "system",
            content: "Eres un asistente especializado en análisis de inventario agrícola. Tu tarea es proporcionar un resumen conciso, recomendaciones accionables y observaciones detalladas basadas en los datos de inventario proporcionados. Estructura tu respuesta en formato JSON con campos para summary (string), recommendations (array de strings) e insights (string - para observaciones detalladas) (recordar que la moneda es colombiana)."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });
      
      console.log("Respuesta recibida de OpenAI:", response.choices[0].message.content);
      
      // Extraer y parsear la respuesta
      const aiResponseText = response.choices[0].message.content || '{}';
      let aiResponse;
      try {
        aiResponse = JSON.parse(aiResponseText);
      } catch (parseError) {
        console.error("Error al parsear la respuesta JSON:", parseError);
        throw new Error("La respuesta de la API no es un JSON válido: " + aiResponseText);
      }
        // Asegurarse de que insights sea una cadena de texto
      let summary = "No se pudo generar un resumen";
      if (aiResponse.summary) {
        summary = typeof aiResponse.summary === 'string' 
          ? aiResponse.summary 
          : JSON.stringify(aiResponse.summary);
      }
      
      // Asegurarse de que recommendations sea un array de strings
      let recommendations = ["No hay recomendaciones disponibles"];
      if (aiResponse.recommendations && Array.isArray(aiResponse.recommendations)) {
        recommendations = aiResponse.recommendations.map(rec => 
          typeof rec === 'string' ? rec : JSON.stringify(rec)
        );
      }
      
      // Asegurarse de que insights sea una cadena de texto
      let observaciones = "No se pudieron generar observaciones detalladas";
      if (aiResponse.insights) {
        if (typeof aiResponse.insights === 'string') {
          observaciones = aiResponse.insights;
        } else if (typeof aiResponse.insights === 'object') {
          // Convertir el objeto a texto si es un objeto
          try {
            observaciones = JSON.stringify(aiResponse.insights, null, 2);
          } catch (e) {
            console.error("Error al convertir insights a string:", e);
            observaciones = "Error al procesar las observaciones detalladas";
          }
        }
      }
      
      console.log("Procesando respuesta:");
      console.log("- Summary:", summary);
      console.log("- Recommendations:", recommendations);
      console.log("- Observaciones:", observaciones);
      
      const recommendation: AIRecommendation = {
        date: formattedDate,
        summary: summary,
        recommendations: recommendations,
        observaciones: observaciones
      };

      // Guardar en caché si es necesario
      if (shouldCache) {
        this.cacheRecommendation(recommendation);
      }

      return recommendation;    } catch (error) {
      console.error("Error al generar recomendaciones:", error);
      
      // Mostrar detalles específicos del error para facilitar la depuración
      let errorMessage = "Error desconocido";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      // Devolver una recomendación de error
      return {
        date: new Date().toLocaleDateString('es-ES'),
        summary: `Error al generar recomendaciones: ${errorMessage}`,
        recommendations: [
          "Verifica tu conexión a internet", 
          "Comprueba que la clave API de OpenAI sea válida",
          "Asegúrate de que el formato de los datos sea correcto"
        ],
        observaciones: `No se pudieron obtener observaciones detalladas debido a un error: ${errorMessage}. Detalles completos en la consola del navegador.`
      };
    }
  }  /**
   * Crea el prompt para la API de OpenAI
   */  
  private createPrompt(inventoryData: any): string {
    return `Analiza los siguientes datos de inventario agrícola y proporciona:
1. Un resumen conciso del estado actual del inventario
2. 3-5 recomendaciones accionables para optimizar el inventario
3. Observaciones detalladas sobre tendencias, productos críticos o oportunidades

DATOS DE INVENTARIO:
${JSON.stringify(inventoryData, null, 2)}

IMPORTANTE: Responde ÚNICAMENTE con un objeto JSON con esta estructura exacta:
{
  "summary": "texto del resumen como string",
  "recommendations": ["recomendación 1 como string", "recomendación 2 como string", "etc"],
  "insights": "texto de observaciones como UN SOLO string. NO uses un objeto aquí, usa un texto plano con toda la información"
}

RECUERDA: El campo "insights" DEBE ser un único string, NO un objeto. Si necesitas separar secciones, usa saltos de línea dentro del string.`;
  }

  /**
   * Almacena una recomendación en el almacenamiento local
   */
  private cacheRecommendation(recommendation: AIRecommendation): void {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Obtener recomendaciones existentes
    const existingCache = localStorage.getItem(AIRecommendationService.STORAGE_KEY);
    const cache = existingCache ? JSON.parse(existingCache) : {};
    
    // Guardar la recomendación de hoy
    cache[today] = recommendation;
    
    // Guardar en localStorage
    localStorage.setItem(AIRecommendationService.STORAGE_KEY, JSON.stringify(cache));
  }

  /**
   * Obtiene la recomendación almacenada para hoy, si existe
   */
  private getTodaysCachedRecommendation(): AIRecommendation | null {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      const cache = JSON.parse(localStorage.getItem(AIRecommendationService.STORAGE_KEY) || '{}');
      return cache[today] || null;
    } catch (error) {
      console.error("Error al recuperar caché de recomendaciones:", error);
      return null;
    }
  }
}

export default new AIRecommendationService();
