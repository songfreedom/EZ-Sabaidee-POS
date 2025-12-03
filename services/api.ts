
import { Product, Category, User, Transaction, StoreSettings, HeldBill } from '../types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_USERS, DEFAULT_SETTINGS } from '../constants';

// ຕັ້ງຄ່າ: ປ່ຽນເປັນ true ເມື່ອທ່ານມີ Backend (Node.js/PHP) ແລະ MySQL ແລ້ວ
const USE_REAL_API = false;
const API_BASE_URL = 'http://localhost:3000/api'; // URL ຂອງ Server ທ່ານ

// ==========================================
// 1. ຕົວຢ່າງການເຊື່ອມຕໍ່ MySQL (Mock Logic)
// ==========================================

export const api = {
  // --- Products ---
  getProducts: async (): Promise<Product[]> => {
    if (USE_REAL_API) {
      // ຖ້າຕໍ່ MySQL ຈິງ:
      // const res = await fetch(`${API_BASE_URL}/products`);
      // return res.json();
      return [];
    } else {
      // ໃຊ້ LocalStorage (ແບບປັດຈຸບັນ)
      const saved = localStorage.getItem('sabaidee_products');
      let parsed = saved ? JSON.parse(saved) : MOCK_PRODUCTS;
      return parsed.map((p: any) => ({ ...p, active: p.active ?? true }));
    }
  },

  // --- Transactions (Sales) ---
  saveTransaction: async (transaction: Transaction): Promise<void> => {
    if (USE_REAL_API) {
      // ສົ່ງຂໍ້ມູນໄປບັນທຶກລົງ MySQL
      // await fetch(`${API_BASE_URL}/transactions`, {
      //   method: 'POST',
      //   headers: {'Content-Type': 'application/json'},
      //   body: JSON.stringify(transaction)
      // });
    } else {
      const saved = localStorage.getItem('sabaidee_transactions');
      const transactions = saved ? JSON.parse(saved) : [];
      transactions.push(transaction);
      localStorage.setItem('sabaidee_transactions', JSON.stringify(transactions));
    }
  },

  // --- Settings ---
  getSettings: async (): Promise<StoreSettings> => {
    const saved = localStorage.getItem('sabaidee_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  }
};
