import React, { useState } from 'react';
import MainLayout from '../components/estructura/principal';
import MovementsList from '../components/movimientos/movimientosLista';
import MovementForm from '../components/movimientos/movimientosFormulario';
import Modal from '../components/comun/Modal';
import { Plus } from 'lucide-react';
import { Movement } from '../types';
import { useMovementService } from '../services/MovementService';
import { useProductService } from '../services/ProductService';
import { useNotification } from '../context/NotificationContext';

const MovementsPage: React.FC = () => {
  const { 
    movements, 
    loading, 
    error, 
    addMovement, 
    searchMovements 
  } = useMovementService();
  
  const { products } = useProductService();
  const { showNotification } = useNotification();
  
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastMovementType, setLastMovementType] = useState<string>('');  const handleAddMovement = async (movementData: Omit<Movement, 'id' | 'userName' | 'userId' | 'productName' | 'productSku'>) => {
    try {
      // Encontrar el producto para obtener su nombre y SKU
      // Convertir productId a string para asegurar la compatibilidad
      const productId = String(movementData.productId);
      console.log('Buscando producto con ID:', productId);
      console.log('Productos disponibles:', products.map(p => ({id: p.id, name: p.name})));
      
      const product = products.find(p => String(p.id) === productId);
      
      if (!product) {
        showNotification('error', 'No se encontró el producto seleccionado');
        return;
      }
      
      const newMovementData: Omit<Movement, 'id'> = {
        productName: product.name,
        productSku: product.sku,
        userId: '1', // Suponemos que es el usuario actual
        userName: 'Admin Usuario', // Suponemos que es el usuario actual
        ...movementData
      };
      
      // Añadir el nuevo movimiento a través del servicio
      const newMovement = await addMovement(newMovementData, true);
      
      // Cerrar el modal y mostrar mensaje de éxito
      setShowMovementForm(false);
      setLastMovementType(newMovement.type);
      setShowSuccessMessage(true);
      showNotification('success', `Movimiento de ${newMovement.type} registrado correctamente`);
      
      // Ocultar el mensaje de éxito después de unos segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (error) {
      console.error('Error al añadir movimiento:', error);
      showNotification('error', `Error al registrar movimiento: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>
          <button
            type="button"
            onClick={() => setShowMovementForm(true)}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#255466] hover:bg-[#1d4050] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466] transition-colors duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Registrar Movimiento Manual
          </button>
        </div>
          {showSuccessMessage && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">
                  {lastMovementType === 'entrada' && 'Entrada de producto registrada correctamente.'}
                  {lastMovementType === 'salida' && 'Salida de producto registrada correctamente.'}
                  {lastMovementType === 'venta' && 'Venta registrada correctamente.'}
                  {lastMovementType === 'ajuste' && 'Ajuste de inventario registrado correctamente.'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        <MovementsList 
          movements={movements}
          loading={loading}
          onSearch={(filters) => {
            try {
              searchMovements(filters);
            } catch (error) {
              console.error('Error al buscar movimientos:', error);
              showNotification('error', `Error al buscar movimientos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
            }
          }}
        />
        
        {/* Modal de registro de movimiento */}
        <Modal
          isOpen={showMovementForm}
          onClose={() => setShowMovementForm(false)}
          title="Registrar Movimiento Manual"
          size="md"
        >
          <MovementForm
            onSave={handleAddMovement}
            onCancel={() => setShowMovementForm(false)}
          />
        </Modal>
      </div>
    </MainLayout>
  );
};

export default MovementsPage;