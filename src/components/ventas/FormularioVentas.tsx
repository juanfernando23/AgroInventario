import React, { useState } from 'react';
import { Search, Trash2, ShoppingCart } from 'lucide-react';
import { Product, SaleItem } from '../../types';
import { formatCurrency } from '../../utilities/format';

interface SalesFormProps {
  products: Product[];
  onConfirmSale: (saleData: {
    customer: string;
    date: string;
    items: SaleItem[];
    total: number;
    estado?: string;
  }) => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ products, onConfirmSale }) => {
  const [searchTerm, setSearchTerm] = useState('');  const [customer, setCustomer] = useState('');
  // Ya no usaremos la fecha como un campo editable, solo como valor inicial
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const [estado, setEstado] = useState<string>('completada');

  const searchResults = searchTerm 
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5)
    : [];
  const handleAddToCart = (product: Product) => {
    // Check if product already exists in cart
    const existingItem = cartItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      // Verificar si hay suficiente stock para añadir otro producto
      const productInStock = products.find(p => p.id === product.id);
      const currentInCart = existingItem.quantity;
      
      // Solo permitir añadir si hay suficiente stock
      if (productInStock && currentInCart < productInStock.stock) {
        // Update quantity if already in cart
        setCartItems(
          cartItems.map(item => 
            item.productId === product.id 
              ? { 
                  ...item, 
                  quantity: item.quantity + 1,
                  subtotal: (item.quantity + 1) * item.price 
                } 
              : item
          )
        );
      } else {
        // Mostrar alerta si no hay suficiente stock
        alert(`No hay suficiente stock disponible para ${product.name}. Stock disponible: ${productInStock?.stock || 0}`);
      }
    } else {
      // Verificar que haya stock antes de añadir
      if (product.stock <= 0) {
        alert(`No hay stock disponible para ${product.name}`);
        return;
      }
      
      // Add new item to cart
      setCartItems([
        ...cartItems,
        {
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          quantity: 1,
          price: product.price,
          subtotal: product.price
        }
      ]);
    }
    
    // Clear search
    setSearchTerm('');
  };
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    // Verificar stock disponible para este producto
    const product = products.find(p => p.id === productId);
    
    // Si el producto existe, verificar el stock disponible
    if (product && newQuantity > product.stock) {
      // Limitar la cantidad al stock disponible
      newQuantity = product.stock;
    }
    
    setCartItems(
      cartItems.map(item => 
        item.productId === productId 
          ? { 
              ...item, 
              quantity: newQuantity,
              subtotal: newQuantity * item.price 
            } 
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(cartItems.filter(item => item.productId !== productId));
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  const handleConfirmSale = () => {
    if (cartItems.length === 0) return;
    
    // Usar la fecha y hora actual para la venta
    const currentDateTime = new Date().toISOString();
    
    onConfirmSale({
      customer,
      date: currentDateTime, // Usar fecha y hora actual
      items: cartItems,
      total: totalAmount,
      estado
    });
    
    // Reset form
    setCartItems([]);
    setCustomer('');
    setEstado('completada');
  };
  const handleCancelSale = () => {
    setCartItems([]);
    setCustomer('');
    setEstado('completada');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Product Search Section */}
      <div className="lg:col-span-1 bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Buscar Productos</h2>
        
        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o SKU..."
            className="pl-10 pr-3 py-2 w-full border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 bg-white p-3 h-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {searchTerm && (
          <div className="mt-2 border-2 rounded-md overflow-hidden divide-y divide-gray-200">
            {searchResults.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                No se encontraron productos.
              </div>
            ) : (
              searchResults.map(product => (
                <div key={product.id} className="flex justify-between items-center p-4 hover:bg-gray-50">
                  <div>
                    <div className="font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">
                      SKU: {product.sku} | Stock: 
                      <span className={
                        product.stock <= 0 ? "text-red-600 font-bold ml-1" : 
                        product.stock <= 5 ? "text-orange-600 font-semibold ml-1" : 
                        "text-green-600 ml-1"
                      }>
                        {product.stock}
                      </span> {product.unit}
                    </div>
                    <div className="text-sm font-medium">{formatCurrency(product.price)}</div>
                  </div>
                  <button
                    type="button"
                    className={`ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      product.stock <= 0 
                        ? "bg-gray-400 cursor-not-allowed" 
                        : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 transition-colors duration-200"
                    }`}
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock <= 0}
                  >
                    {product.stock <= 0 ? "Sin Stock" : "Añadir"}
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Cart and Summary Section */}
      <div className="lg:col-span-2 space-y-6">
        {/* Cart Items */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">Productos en esta Venta</h2>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="p-8 text-center">
              <ShoppingCart className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos</h3>
              <p className="mt-1 text-sm text-gray-500">
                Busque y añada productos a la venta utilizando el panel de búsqueda.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Producto
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subtotal
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.productId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                        <div className="text-sm text-gray-500">{item.productSku}</div>
                      </td>                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            className="text-gray-500 focus:outline-none focus:text-gray-600 p-1"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            max={products.find(p => p.id === item.productId)?.stock || 1}
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value) || 1)}
                            className="mx-2 border-2 rounded w-16 text-center p-1 h-8"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            className={`text-gray-500 focus:outline-none focus:text-gray-600 p-1 ${
                              item.quantity >= (products.find(p => p.id === item.productId)?.stock || 0) 
                                ? "opacity-50 cursor-not-allowed" 
                                : ""
                            }`}
                            disabled={item.quantity >= (products.find(p => p.id === item.productId)?.stock || 0)}
                          >
                            +
                          </button>
                        </div>
                        <div className={`text-xs mt-1 ${
                          ((products.find(p => p.id === item.productId)?.stock || 0) <= 5) 
                            ? "text-red-500 font-semibold" 
                            : "text-gray-500"
                        }`}>
                          Stock disponible: {(products.find(p => p.id === item.productId)?.stock || 0)}
                        </div>
                      </td>                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatCurrency(item.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(item.subtotal)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="text-red-600 hover:text-red-900 transition-colors duration-200"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sale Summary */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="customer" className="block text-sm font-medium text-gray-700 text-left mb-2">
                  Cliente (Opcional)
                </label>
                <div>
                  <input
                    type="text"
                    id="customer"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
                  />
                </div>
              </div>
                <div className="sm:col-span-3">
                <label htmlFor="saleDate" className="block text-sm font-medium text-gray-700 text-left mb-2">
                  Fecha de Venta
                </label>
                <div>
                  <input
                    type="text"
                    id="saleDate"
                    value={new Date().toLocaleString('es-ES')}
                    readOnly
                    className="shadow-sm bg-gray-50 block w-full sm:text-sm border-2 border-gray-300 rounded-md p-3 h-10"
                  />
                  <p className="mt-1 text-xs text-gray-500">Se registrará la fecha y hora actual al confirmar la venta</p>
                </div>
              </div>
              
              <div className="sm:col-span-3">
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 text-left mb-2">
                  Estado de Venta
                </label>
                <div>
                  <select
                    id="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-2 border-gray-300 rounded-md bg-white p-3 h-10"
                  >
                    <option value="completada">Completada</option>
                    <option value="pendiente">Pendiente</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">              <div className="flex justify-between text-base font-medium text-gray-900">
                <p>Total</p>
                <p>{formatCurrency(totalAmount)}</p>
              </div>
              <p className="mt-0.5 text-sm text-gray-500">Impuestos incluidos.</p>
            </div>
            
            <div className="mt-6 flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancelSale}
                className="px-6 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466] h-10"
              >
                Cancelar Venta
              </button>
              <button
                type="button"
                onClick={handleConfirmSale}
                disabled={cartItems.length === 0}
                className="px-6 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#255466] hover:bg-[#1d4050] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#255466] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 h-10"
              >
                Confirmar Venta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;