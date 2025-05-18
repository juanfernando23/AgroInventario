import React, { useState, useEffect } from 'react';
import MainLayout from '../components/estructura/principal';
import SalesForm from '../components/ventas/FormularioVentas';
import SalesList from '../components/ventas/ListaVentas';
import SaleDetails from '../components/ventas/DetalleVentas';
import Modal from '../components/comun/Modal';
import { Sale, SaleItem } from '../types';
import { ClipboardList, ShoppingCart } from 'lucide-react';
import { useProductService } from '../services/ProductService';
import { useSaleService } from '../services/SaleService';
import { useNotification } from '../context/NotificationContext';

const SalesPage: React.FC = () => {
  // Servicios y contextos
  const { products, loading: productsLoading } = useProductService();
  const { sales, loading: salesLoading, error: salesError, addSale, searchSales, loadSales } = useSaleService();
  const { showNotification } = useNotification();

  // Estados del componente
  const [view, setView] = useState<'form' | 'history'>('form');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastSaleId, setLastSaleId] = useState<string | null>(null);
  const [showSaleDetails, setShowSaleDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Usuario simulado - En una app real, obtendríamos esto de un contexto de autenticación
  const currentUser = { id: '1', name: 'Admin Usuario' };

  // Manejar la confirmación de una nueva venta  // Cargar ventas al cambiar a la vista de historial
  useEffect(() => {
    if (view === 'history') {
      // Asegurarnos de cargar las ventas actualizadas cada vez que se muestre el historial
      loadSales();
    }
  }, [view, loadSales]);
  const handleConfirmSale = async (saleData: {
    customer: string;
    date: string;
    items: SaleItem[];
    total: number;
    estado?: string;
  }) => {
    try {
      // Prepare the sale data with user info
      const fullSaleData = {
        ...saleData,
        userId: currentUser.id,
        userName: currentUser.name
      };
      
      // Add the sale via API
      const newSale = await addSale(fullSaleData);
      
      // Show success message
      setLastSaleId(newSale.id);
      setShowSuccessMessage(true);
      showNotification('success', `Venta #${newSale.id} registrada correctamente`);
      
      // Hide success message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error: any) {
      console.error('Error al confirmar venta:', error);
      showNotification('error', `Error al registrar venta: ${error.message || 'Error desconocido'}`);
    }
  };

  const handleViewSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setShowSaleDetails(true);
  };

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {view === 'form' ? 'Registrar Nueva Venta' : 'Historial de Ventas'}
          </h1>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setView('form')}
              className={`flex items-center px-4 py-2 border rounded-md ${
                view === 'form'
                  ? 'bg-[#255466] text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } transition-colors duration-200`}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              Nueva Venta
            </button>
            
            <button
              onClick={() => setView('history')}
              className={`flex items-center px-4 py-2 border rounded-md ${
                view === 'history'
                  ? 'bg-[#255466] text-white border-transparent'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              } transition-colors duration-200`}
            >
              <ClipboardList className="h-5 w-5 mr-2" />
              Historial
            </button>
          </div>
        </div>
        
        {view === 'form' && showSuccessMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  Venta #{lastSaleId} registrada correctamente. Los productos se han descontado del inventario.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {view === 'form' ? (          <SalesForm 
            products={products || []} 
            onConfirmSale={handleConfirmSale} 
          />
        ) : (
          <SalesList 
            sales={sales}
            onViewDetails={handleViewSaleDetails} 
          />
        )}
      </div>
      
      {/* Modal para ver detalles de venta */}
      <Modal
        isOpen={showSaleDetails}
        onClose={() => setShowSaleDetails(false)}
        title={`Detalles de Venta #${selectedSale?.id || ''}`}
        size="lg"
      >
        {selectedSale && (
          <SaleDetails sale={selectedSale} />
        )}
        <div className="flex justify-end mt-6">
          <button
            type="button"
            onClick={() => setShowSaleDetails(false)}
            className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Cerrar
          </button>
        </div>
      </Modal>
    </MainLayout>
  );
};

export default SalesPage;