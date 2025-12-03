
export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  category: string;
  image: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface HeldBill {
  id: string;
  items: CartItem[];
  date: string;
  note: string;
  total: number;
}

export interface Transaction {
  id: string;
  date: string;
  items: CartItem[];
  total: number;
  paymentMethod: 'cash' | 'qr';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff';
  avatar?: string;
}

export interface StoreSettings {
  storeName: string;
  storePhone: string;
  storeAddress: string;
  enablePhaJay: boolean;
  phajaySecretKey: string;
  phajayTag: string;
}

export interface PhaJayQRResponse {
  qrCode: string; // The base64 image or string data
  transactionId: string;
  link?: string;
  message?: string;
}

export type ViewState = 'pos' | 'dashboard' | 'products' | 'categories' | 'history' | 'users' | 'settings';

export type Language = 'lo' | 'en';