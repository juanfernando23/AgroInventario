// filepath: c:\Users\jball\OneDrive\Documentos\Programacion web\agroinventario2\main\AgroInventario\src\paginas\PanelDeControl.tsx
import React, { useEffect, useState } from 'react';
import { 
  Package2, 
  DollarSign, 
  AlertTriangle
} from 'lucide-react';
import StatCard from '../components/comun/TarjetaEstadisticas';
import RecentList from '../components/dashboard/ListaReciente';
import MainLayout from '../components/estructura/principal';
import BotonRecomendaciones from '../components/dashboard/BotonRecomendaciones';
import RecomendacionesIA from '../components/dashboard/RecomendacionesIA';
import { mockProducts } from '../data/SimulacionDatos';
import { useMovementService } from '../services/MovementService';
import { useProductService } from '../services/ProductService';
import { Movement, Product } from '../types';
import { formatCurrency } from '../utilities/format';

const DashboardPage: React.FC = () => {
  const { movements, loading: movementsLoading } = useMovementService();
  const { products } = useProductService();
  const [recentMovements, setRecentMovements] = useState<Movement[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [movementsError, setMovementsError] = useState<string | null>(null);
  const [isRecommendationsOpen, setIsRecommendationsOpen] = useState<boolean>(false);

  // Estado para almacenar datos de inventario para análisis de IA
  const [inventoryAnalysisData, setInventoryAnalysisData] = useState<any>(null);

  useEffect(() => {
    // Obtener los movimientos más recientes del estado general de movements
    if (movements && movements.length > 0) {
      // Ordenar por fecha de forma descendente y tomar los 5 primeros
      const sortedMovements = [...movements]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
      
      setRecentMovements(sortedMovements);
      setMovementsError(null);
    }
  }, [movements]);

  useEffect(() => {
    // Usar products del servicio si están disponibles, o mockProducts como respaldo
    const availableProducts = products.length > 0 ? products : mockProducts;
    const recent = [...availableProducts]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
    setRecentProducts(recent);

    // Preparar datos para el análisis de IA
    prepareInventoryDataForAnalysis(availableProducts);
  }, [products]);

  // Preparar datos de inventario para análisis con IA
  const prepareInventoryDataForAnalysis = (products: Product[]) => {
    // Categorizar productos
    const lowStockItems = products.filter(p => p.stock <= p.minStock);
    const topValueItems = [...products].sort((a, b) => (b.price * b.stock) - (a.price * a.stock)).slice(0, 5);
    
    // Calcular métricas
    const totalValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
    const averageStock = products.reduce((sum, p) => sum + p.stock, 0) / products.length;
    
    // Agregar cualquier otro dato relevante
    const analysisData = {
      totalProducts: products.length,
      totalValue,
      averageStock,
      lowStockItems: lowStockItems.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: p.stock,
        minStock: p.minStock,
        unit: p.unit,
        price: p.price
      })),
      topValueItems: topValueItems.map(p => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        currentStock: p.stock,
        totalValue: p.price * p.stock,
        price: p.price
      })),
      // Si tienes datos de movimientos, incluye tendencias
      recentMovements: movements.slice(0, 20).map(m => ({
        productName: m.productName,
        type: m.type,
        quantity: m.quantity,
        date: m.date
      }))
    };
    
    setInventoryAnalysisData(analysisData);
  };

  // Calculate dashboard statistics
  const totalProducts = products.length > 0 ? products.length : mockProducts.length;
  const totalInventoryValue = formatCurrency((products.length > 0 ? products : mockProducts).reduce(
    (total, product) => total + (product.price * product.stock), 
    0
  ));
  
  const lowStockProducts = (products.length > 0 ? products : mockProducts).filter(
    product => product.stock <= product.minStock
  ).length;

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Movement type badge color class
  const getMovementTypeClass = (type: string) => {
    switch(type) {
      case 'entrada': return 'bg-green-100 text-green-800';
      case 'salida': return 'bg-blue-100 text-blue-800';
      case 'venta': return 'bg-purple-100 text-purple-800';
      case 'ajuste': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <BotonRecomendaciones 
            onClick={() => setIsRecommendationsOpen(true)}
            delay={100}
          />
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 md:mb-8">
          <StatCard 
            title="Total de Productos"
            value={totalProducts}
            icon={<Package2 className="h-6 w-6" />}
            color="blue"
            delay={100}
          />
          <StatCard 
            title="Valor Total del Inventario"
            value={totalInventoryValue}
            icon={<DollarSign className="h-6 w-6" />}
            color="green"
            delay={200}
          />
          <StatCard 
            title="Productos con Stock Bajo"
            value={lowStockProducts}
            icon={<AlertTriangle className="h-6 w-6" />}
            color={lowStockProducts > 0 ? "red" : "green"}
            delay={300}
          />
        </div>
        
        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Products */}
          <RecentList title="Productos Agregados Recientemente" delay={500}>
            <div className="divide-y divide-gray-200">
              {recentProducts.map(product => (
                <div key={product.id} className="px-6 py-4 flex items-center hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex-shrink-0 h-12 w-12 rounded bg-gray-200 overflow-hidden">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <Package2 className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="ml-4 flex-1">
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {product.stock} {product.unit}
                  </div>
                </div>
              ))}
            </div>
          </RecentList>
          
          {/* Recent Movements */}
          <RecentList 
            title="Últimos Movimientos Registrados" 
            delay={600}
            isLoading={movementsLoading}
            error={movementsError}
          >
            <div className="divide-y divide-gray-200">
              {recentMovements.length > 0 ? recentMovements.map(movement => (
                <div key={movement.id} className="px-6 py-4 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-900">{movement.productName}</div>
                      <div className="text-sm text-gray-500">SKU: {movement.productSku}</div>
                    </div>
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMovementTypeClass(movement.type)}`}
                    >
                      {movement.type.charAt(0).toUpperCase() + movement.type.slice(1)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cantidad: {movement.quantity}</span>
                      <span className="text-gray-500">{formatDate(movement.date)}</span>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center text-gray-500">
                  No hay movimientos registrados recientemente
                </div>
              )}
            </div>
          </RecentList>
        </div>

        {/* AI Recommendations Modal */}
        {isRecommendationsOpen && inventoryAnalysisData && (
          <RecomendacionesIA 
            isOpen={isRecommendationsOpen} 
            onClose={() => setIsRecommendationsOpen(false)} 
            inventoryData={inventoryAnalysisData}
            delay={800}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default DashboardPage;
