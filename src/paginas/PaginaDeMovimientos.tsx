import React, { useState } from 'react';
import MainLayout from '../components/estructura/principal';
import MovementsList from '../components/movimientos/movimientosLista';
import MovementForm from '../components/movimientos/movimientosFormulario';
import Modal from '../components/comun/Modal';
import { Plus } from 'lucide-react';
import { mockMovements, mockProducts } from '../data/SimulacionDatos';
import { Movement } from '../types';

const MovementsPage: React.FC = () => {
  const [movements, setMovements] = useState<Movement[]>(mockMovements);
  const [showMovementForm, setShowMovementForm] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [lastMovementType, setLastMovementType] = useState<string>('');

  const handleAddMovement = (movementData: Omit<Movement, 'id' | 'userName' | 'userId' | 'productName' | 'productSku'>) => {
    // Encontrar el producto para obtener su nombre y SKU
    const product = mockProducts.find(p => p.id === movementData.productId);
    
    if (!product) return;
    
    const newMovement: Movement = {
      id: `${movements.length + 1}`,
      productName: product.name,
      productSku: product.sku,
      userId: '1', // Suponemos que es el usuario actual
      userName: 'Admin Usuario', // Suponemos que es el usuario actual
      ...movementData
    };
    
    // Añadir el nuevo movimiento a la lista
    setMovements([newMovement, ...movements]);
    
    // Cerrar el modal y mostrar mensaje de éxito
    setShowMovementForm(false);
    setLastMovementType(movementData.type);
    setShowSuccessMessage(true);
    
    // Ocultar el mensaje de éxito después de unos segundos
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 5000);
  };

  return (
    <MainLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Historial de Movimientos</h1>
          <button
            type="button"
            onClick={() => setShowMovementForm(true)}
            className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
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
                  {lastMovementType === 'ajuste' && 'Ajuste de inventario registrado correctamente.'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <MovementsList movements={movements} />
        
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