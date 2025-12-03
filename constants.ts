
import { Product, User, Category, StoreSettings } from './types';

// PHAJAY CONFIGURATION
export const PHAJAY_CONFIG = {
  API_URL: 'https://payment-gateway.phajay.co/v1/api/payment/generate-bcel-qr',
  // WARNING: In production, do not store secret key in frontend code. 
  // Call your own backend, which then calls PhaJay.
  SECRET_KEY: 'YOUR_PLATFORM_SECRET_KEY_HERE' 
};

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Sabaidee POS',
  storePhone: '020-5555-8888',
  storeAddress: 'Vientiane, Laos',
  enablePhaJay: true,
  phajaySecretKey: '', // Empty by default, user must enter it
  phajayTag: 'POS_01'
};

export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: 'Food' },
  { id: '2', name: 'Drink' },
  { id: '3', name: 'Side' },
  { id: '4', name: 'Dessert' }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'ຕຳໝາກຫຸ່ງ (Papaya Salad)',
    price: 25000,
    cost: 12000,
    category: 'Food',
    image: 'https://picsum.photos/id/1080/200/200',
  },
  {
    id: '2',
    name: 'ເຝີ (Pho Noodle)',
    price: 35000,
    cost: 18000,
    category: 'Food',
    image: 'https://picsum.photos/id/225/200/200',
  },
  {
    id: '3',
    name: 'ລາບໄກ່ (Chicken Laap)',
    price: 40000,
    cost: 25000,
    category: 'Food',
    image: 'https://picsum.photos/id/312/200/200',
  },
  {
    id: '4',
    name: 'ເຂົ້າໜຽວ (Sticky Rice)',
    price: 5000,
    cost: 2000,
    category: 'Side',
    image: 'https://picsum.photos/id/431/200/200',
  },
  {
    id: '5',
    name: 'ເບຍລາວ (Beer Lao)',
    price: 15000,
    cost: 11000,
    category: 'Drink',
    image: 'https://picsum.photos/id/420/200/200',
  },
  {
    id: '6',
    name: 'ນ້ຳດື່ມ (Water)',
    price: 5000,
    cost: 2500,
    category: 'Drink',
    image: 'https://picsum.photos/id/500/200/200',
  },
  {
    id: '7',
    name: 'ກາເຟເຢັນ (Iced Coffee)',
    price: 20000,
    cost: 8000,
    category: 'Drink',
    image: 'https://picsum.photos/id/700/200/200',
  },
  {
    id: '8',
    name: 'ປີ້ງໄກ່ (Grilled Chicken)',
    price: 50000,
    cost: 35000,
    category: 'Food',
    image: 'https://picsum.photos/id/800/200/200',
  },
];

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Somsak Manager',
    email: 'admin@sabaidee.la',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
  },
  {
    id: '2',
    name: 'Noy Service',
    email: 'noy@sabaidee.la',
    role: 'staff',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Noy'
  }
];