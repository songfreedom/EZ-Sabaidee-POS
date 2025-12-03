
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ProductCard } from './components/POS/ProductCard';
import { Cart } from './components/POS/Cart';
import { PaymentModal } from './components/POS/PaymentModal';
import { AdminView } from './components/Admin/AdminView';
import { Product, CartItem, Transaction, ViewState, Language, User, HeldBill, Category, StoreSettings } from './types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_USERS, DEFAULT_SETTINGS } from './constants';
import { translations } from './translations';
import { Search, LayoutDashboard, Languages, Store } from 'lucide-react';

export const App = () => {
  // Application State
  const [currentView, setCurrentView] = useState<ViewState>('pos');
  const [lang, setLang] = useState<Language>('lo'); // Default to Lao
  
  // Data with LocalStorage Persistence
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('sabaidee_products');
    return saved ? JSON.parse(saved) : MOCK_PRODUCTS;
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('sabaidee_categories');
    return saved ? JSON.parse(saved) : MOCK_CATEGORIES;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('sabaidee_users');
    return saved ? JSON.parse(saved) : MOCK_USERS;
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('sabaidee_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('sabaidee_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [heldBills, setHeldBills] = useState<HeldBill[]>(() => {
    const saved = localStorage.getItem('sabaidee_heldBills');
    return saved ? JSON.parse(saved) : [];
  });
  
  // UI State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Persistence Effects
  useEffect(() => localStorage.setItem('sabaidee_products', JSON.stringify(products)), [products]);
  useEffect(() => localStorage.setItem('sabaidee_categories', JSON.stringify(categories)), [categories]);
  useEffect(() => localStorage.setItem('sabaidee_users', JSON.stringify(users)), [users]);
  useEffect(() => localStorage.setItem('sabaidee_transactions', JSON.stringify(transactions)), [transactions]);
  useEffect(() => localStorage.setItem('sabaidee_heldBills', JSON.stringify(heldBills)), [heldBills]);
  useEffect(() => localStorage.setItem('sabaidee_settings', JSON.stringify(settings)), [settings]);

  // Helper with safety check
  const t = (key: string) => translations[key]?.[lang] || key;
  const isPosMode = currentView === 'pos';

  // POS Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  // Hold Bill Logic
  const handleHoldBill = () => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newHeldBill: HeldBill = {
      id: Date.now().toString(),
      items: [...cart],
      date: new Date().toISOString(),
      note: `Bill #${heldBills.length + 1}`,
      total
    };
    
    setHeldBills(prev => [...prev, newHeldBill]);
    setCart([]); // Clear cart
  };

  const handleRecallBill = (bill: HeldBill) => {
    setCart(bill.items);
    setHeldBills(prev => prev.filter(b => b.id !== bill.id));
  };

  const handleDiscardBill = (id: string) => {
    setHeldBills(prev => prev.filter(b => b.id !== id));
  };

  const handleCheckout = () => {
    setIsPaymentModalOpen(true);
  };

  const handlePaymentConfirm = (method: 'cash' | 'qr') => {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      items: [...cart],
      total,
      paymentMethod: method,
    };

    setTransactions(prev => [...prev, newTransaction]);
    setCart([]);
    setIsPaymentModalOpen(false);
  };

  // Admin Logic
  const handleAddProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const handleDeleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleAddUser = (user: User) => {
    setUsers(prev => [...prev, user]);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const handleAddCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  }

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }
  
  const handleUpdateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
  }

  // Filter Logic
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen bg-[#f1f5f9] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar only shows when NOT in POS mode */}
      {!isPosMode && (
        <Sidebar 
          currentView={currentView} 
          onChangeView={setCurrentView} 
          lang={lang} 
          setLang={setLang} 
        />
      )}

      {/* Main Content Area - Adjust margin based on view */}
      <main className={`${isPosMode ? 'ml-0' : 'ml-[280px]'} flex-1 h-screen flex relative overflow-hidden transition-all duration-300`}>
        {currentView === 'pos' ? (
          <>
            {/* Product Grid Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
              
              {/* POS Header / Search Area */}
              <div className="px-6 py-4 bg-white/50 backdrop-blur-md border-b border-white/50 z-20 sticky top-0">
                <div className="flex justify-between items-center gap-6">
                  {/* Brand & Back to Admin */}
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                        <Store size={20} strokeWidth={2.5} />
                      </div>
                      <div className="hidden md:block">
                        <h1 className="text-lg font-extrabold text-slate-800 leading-none">
                           {settings.storeName || 'Sabaidee'}
                        </h1>
                        <p className="text-[10px] font-bold text-indigo-500 tracking-wide">POS SYSTEM</p>
                      </div>
                      <div className="h-8 w-[1px] bg-slate-200 mx-2"></div>
                      <button 
                        onClick={() => setCurrentView('dashboard')}
                        className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm bg-white border border-slate-200 px-4 py-2 rounded-xl hover:shadow-md transition-all"
                      >
                        <LayoutDashboard size={18} />
                        <span className="hidden sm:inline">{t('backToAdmin')}</span>
                      </button>
                  </div>

                  {/* Search Bar - Centered */}
                  <div className="relative group max-w-md w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors pointer-events-none" size={20} />
                    <input 
                      type="text" 
                      placeholder={t('searchPlaceholder')}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-none bg-white shadow-sm ring-1 ring-slate-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all placeholder:text-slate-400 font-medium text-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  {/* Language Toggle */}
                  <button 
                    onClick={() => setLang(lang === 'lo' ? 'en' : 'lo')}
                    className="flex items-center gap-2 px-3 py-2 bg-white rounded-xl border border-slate-200 hover:shadow-md transition-all text-slate-600"
                  >
                     <Languages size={18} />
                     <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                       {lang === 'lo' ? 'LA' : 'EN'}
                     </span>
                  </button>
                </div>

                {/* Categories */}
                <div className="flex gap-3 overflow-x-auto pt-4 pb-2 scrollbar-hide">
                  <button
                      key="All"
                      onClick={() => setSelectedCategory('All')}
                      className={`px-6 py-2 rounded-xl whitespace-nowrap transition-all duration-300 font-bold text-sm tracking-wide ${
                        selectedCategory === 'All' 
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-300 transform' 
                          : 'bg-white text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-md ring-1 ring-slate-100'
                      }`}
                  >
                    {t('all')}
                  </button>
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-6 py-2 rounded-xl whitespace-nowrap transition-all duration-300 font-bold text-sm tracking-wide ${
                        selectedCategory === cat.name 
                          ? 'bg-slate-900 text-white shadow-lg shadow-slate-300 transform' 
                          : 'bg-white text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-md ring-1 ring-slate-100'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Scrollable Grid */}
              <div className="flex-1 overflow-y-auto px-6 py-6 pb-32 custom-scrollbar bg-slate-50/50">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-4">
                  {filteredProducts.map(product => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onAddToCart={addToCart} 
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Cart Sidebar */}
            <div className="w-[400px] h-full relative z-20 border-l border-slate-200 shadow-2xl">
              <Cart 
                items={cart}
                heldBills={heldBills}
                onUpdateQuantity={updateQuantity}
                onRemoveItem={removeFromCart}
                onHoldBill={handleHoldBill}
                onRecallBill={handleRecallBill}
                onDiscardBill={handleDiscardBill}
                onCheckout={handleCheckout}
                lang={lang}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto bg-[#f1f5f9] w-full">
             <AdminView 
               view={currentView as any}
               products={products}
               categories={categories}
               transactions={transactions}
               users={users}
               settings={settings}
               onAddProduct={handleAddProduct}
               onDeleteProduct={handleDeleteProduct}
               onAddUser={handleAddUser}
               onDeleteUser={handleDeleteUser}
               onAddCategory={handleAddCategory}
               onDeleteCategory={handleDeleteCategory}
               onUpdateSettings={handleUpdateSettings}
               lang={lang}
             />
          </div>
        )}
      </main>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        total={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
        onConfirm={handlePaymentConfirm}
        lang={lang}
        settings={settings}
      />
    </div>
  );
};