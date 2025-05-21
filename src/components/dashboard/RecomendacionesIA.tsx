import React, { useState, useEffect } from 'react';
import AIRecommendationService, { AIRecommendation } from '../../services/AIRecommendationService';
import { X, RefreshCw, Lightbulb } from 'lucide-react';

interface RecomendacionesIAProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryData: any;
  delay?: number;
}

const RecomendacionesIA: React.FC<RecomendacionesIAProps> = ({ isOpen, onClose, inventoryData }) => {
  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  useEffect(() => {
    if (isOpen && inventoryData) {
      loadRecommendations();
    }
  }, [isOpen, inventoryData]);
  const loadRecommendations = async () => {
    if (!inventoryData) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      console.log("Cargando recomendaciones con datos:", inventoryData);
      const data = await AIRecommendationService.getDailyRecommendation(inventoryData);
      console.log("Recomendaciones recibidas:", data);
      setRecommendation(data);
    } catch (error) {
      console.error("Error al cargar recomendaciones:", error);
      // Crear una recomendación de error para mostrar al usuario
      setRecommendation({
        date: new Date().toLocaleDateString('es-ES'),
        summary: "Error al cargar recomendaciones",
        recommendations: ["Verifica la consola del navegador para más detalles"],
        observaciones: error instanceof Error ? error.message : "Error desconocido"
      });
    } finally {
      setLoading(false);
    }
  };  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      console.log("Generando nuevas recomendaciones con datos:", inventoryData);
      // Usamos getDailyRecommendation con forceRefresh=true para generar una nueva recomendación
      // y almacenarla en caché
      const data = await AIRecommendationService.getDailyRecommendation(inventoryData, true);
      console.log("Nuevas recomendaciones recibidas:", data);
      setRecommendation(data);
      
      // Forzamos la actualización en caché
      localStorage.setItem('last_ai_recommendation_refresh', new Date().toISOString());
    } catch (error) {
      console.error("Error al generar nuevas recomendaciones:", error);
      // Crear una recomendación de error para mostrar al usuario
      setRecommendation({
        date: new Date().toLocaleDateString('es-ES'),
        summary: "Error al generar nuevas recomendaciones",
        recommendations: ["Verifica la consola del navegador para más detalles"],
        observaciones: error instanceof Error ? error.message : "Error desconocido"
      });
    } finally {
      setRefreshing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Lightbulb className="w-6 h-6 text-yellow-500 mr-3" />
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Recomendaciones IA</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Contenido */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando recomendaciones...</p>
            </div>          ) : recommendation ? (
            <div className="space-y-6">              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-blue-800 dark:text-blue-300 mb-2">
                  Resumen del día {recommendation.date}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {typeof recommendation.summary === 'string' 
                    ? recommendation.summary 
                    : String(recommendation.summary)}
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-3">Recomendaciones</h3>
                <ul className="space-y-2">
                  {Array.isArray(recommendation.recommendations) 
                    ? recommendation.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm font-medium mr-3">
                            {index + 1}
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {typeof rec === 'string' ? rec : String(rec)}
                          </span>
                        </li>
                      ))
                    : <li className="text-gray-700 dark:text-gray-300">No hay recomendaciones disponibles</li>
                  }
                </ul>
              </div>
              
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-purple-800 dark:text-purple-300 mb-2">
                  Observaciones detalladas
                </h3>
                <pre className="text-gray-700 dark:text-gray-300 whitespace-pre-line text-sm font-normal overflow-auto">
                  {typeof recommendation.observaciones === 'string'
                    ? recommendation.observaciones
                    : typeof recommendation.observaciones === 'object'
                      ? JSON.stringify(recommendation.observaciones, null, 2)
                      : String(recommendation.observaciones)
                  }
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-lg text-center max-w-md">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300 mb-2">
                  No se pudieron cargar las recomendaciones
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Hubo un problema al generar las recomendaciones con IA. Por favor, intenta refrescar o verifica tu conexión a internet.
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                >
                  Intentar de nuevo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Pie */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Análisis con IA basado en datos de inventario actuales
          </p>          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:bg-blue-400"
          >
            {refreshing ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Actualizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Generar nuevas observaciones
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecomendacionesIA;
