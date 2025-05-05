export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  unit: string;
  imageUrl: string;
  createdAt: string;
}

export interface Movement {
  id: string;
  date: string;
  type: 'entrada' | 'salida' | 'venta' | 'ajuste';
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  userId: string;
  userName: string;
  reason: string;
  notes?: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  date: string;
  customer?: string;
  items: SaleItem[];
  total: number;
  userId: string;
  userName: string;
}