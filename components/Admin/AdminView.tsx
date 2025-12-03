
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Plus, Trash2, TrendingUp, DollarSign, ShoppingBag, Calendar, QrCode, History, Banknote, Package, Search, Users, Shield, Tag, Settings, Save, Lock, Receipt, Printer, Image, Power, Pencil } from 'lucide-react';
import { Product, Transaction, ViewState, Language, User, Category, StoreSettings } from '../../types';
import { translations } from '../../translations';

interface AdminViewProps {
  view: ViewState;
  products: Product[];
  categories: Category[];
  transactions: Transaction[];
  users: User[];
  settings?: StoreSettings;
  onSaveProduct: (product: Product) => void;
  onToggleProductStatus: (id: string) => void;
  onAddUser: (user: User) => void;
  onDeleteUser: (id: string) => void;
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
  onUpdateSettings?: (settings: StoreSettings) => void;
  lang: Language;
}

export const AdminView: React.FC<AdminViewProps> = ({ 
  view, products, categories, transactions, users, settings, onSaveProduct, onToggleProductStatus, onAddUser, onDeleteUser, onAddCategory, onDeleteCategory, onUpdateSettings, lang
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [newProduct, setNewProduct] = useState<Partial<Product>>({ category: categories[0]?.name || 'Food', active: true });
  const [newUser, setNewUser] = useState<Partial<User>>({ role: 'staff' });
  const [newCategory, setNewCategory] = useState<Partial<Category>>({});
  const [isAdding, setIsAdding] = useState(false);
  
  // Settings Local State
  const [localSettings, setLocalSettings] = useState<StoreSettings>(settings || {
    storeName: '',
    storePhone: '',
    storeAddress: '',
    enablePhaJay: true,
    phajaySecretKey: '',
    phajayTag: '',
    receiptHeader: '',
    receiptFooter: '',
    logoUrl: '',
    printerPaperSize: '80mm'
  });
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  // Dashboard Stats
  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalOrders = transactions.length;
  const cashPayments = transactions.filter(t => t.paymentMethod === 'cash').length;
  const qrPayments = transactions.filter(t => t.paymentMethod === 'qr').length;

  // Chart Data
  const salesByDate = transactions.reduce((acc, t) => {
    const date = new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
    acc[date] = (acc[date] || 0) + t.total;
    return acc;
  }, {} as Record<string, number>);
  
  const chartData = Object.entries(salesByDate).map(([date, amount]) => ({
    name: date,
    sales: amount
  }));

  const handleSaveProduct = () => {
    if (newProduct.name && newProduct.price) {
      onSaveProduct({
        id: newProduct.id || Date.now().toString(),
        name: newProduct.name,
        price: Number(newProduct.price),
        cost: Number(newProduct.cost) || 0,
        category: newProduct.category || categories[0]?.name || 'Food',
        image: newProduct.image || 'https://picsum.photos/200/200',
        active: newProduct.active ?? true,
      });
      setIsAdding(false);
      setNewProduct({ category: categories[0]?.name || 'Food', active: true });
    }
  };

  const handleEditProduct = (product: Product) => {
    setNewProduct({ ...product });
    setIsAdding(true);
  };

  const handleSaveUser = () => {
    if (newUser.name && newUser.email) {
      onAddUser({
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role || 'staff',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.name}`
      });
      setIsAdding(false);
      setNewUser({ role: 'staff' });
    }
  };

  const handleSaveCategory = () => {
    if (newCategory.name) {
      onAddCategory({
        id: Date.now().toString(),
        name: newCategory.name
      });
      setIsAdding(false);
      setNewCategory({});
    }
  }
  
  const handleSaveSettings = () => {
    if (onUpdateSettings) {
      onUpdateSettings(localSettings);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 3000);
    }
  }

  const StatCard = ({ title, value, sub, icon: Icon, color }: any) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-full hover:shadow-lg transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
          <Icon size={24} className={color.replace('bg-', 'text-')} />
        </div>
        {sub && <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded-lg">{sub}</span>}
      </div>
      <div>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight">{value}</h3>
        <p className="text-sm text-slate-500 font-bold mt-1">{title}</p>
      </div>
    </div>
  );

  if (view === 'dashboard') {
    return (
      <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-slate-800">{t('overview')}</h2>
            <p className="text-slate-500 font-medium">{t('dailyOverview')}</p>
          </div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500 bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm">
            <Calendar size={16} />
            <span>Today: {new Date().toLocaleDateString('lo-LA')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title={t('totalRevenue')}
            value={`${totalRevenue.toLocaleString()} ₭`} 
            icon={DollarSign} 
            color="bg-indigo-500" 
          />
          <StatCard 
            title={t('totalOrders')} 
            value={totalOrders} 
            sub="+12%"
            icon={ShoppingBag} 
            color="bg-blue-500" 
          />
          <StatCard 
            title={t('cashPayments')} 
            value={cashPayments} 
            icon={Banknote} 
            color="bg-green-500" 
          />
          <StatCard 
            title={t('qrPayments')} 
            value={qrPayments} 
            icon={QrCode} 
            color="bg-purple-500" 
          />
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp size={24} className="text-indigo-600" />
              {t('salesOverview')}
            </h3>
          </div>
          <div className="h-80 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[8, 8, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'products') {
    return (
      <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">{t('manageProducts')}</h2>
            <p className="text-slate-500 font-medium">{t('manageInv')}</p>
          </div>
          <button 
            onClick={() => {
              setNewProduct({ category: categories[0]?.name || 'Food', active: true });
              setIsAdding(true);
            }}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 font-bold"
          >
            <Plus size={20} />
            <span>{t('addProduct')}</span>
          </button>
        </div>

        {isAdding && (
          <div className="mb-8 bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-in slide-in-from-top-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
             <h3 className="text-xl font-bold text-slate-800 mb-6">{newProduct.id ? t('editProduct') : t('addNewProduct')}</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('prodName')}</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white" 
                    value={newProduct.name || ''}
                    onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                    placeholder="e.g. Fried Rice"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('category')}</label>
                   <select
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white"
                    value={newProduct.category}
                    onChange={e => setNewProduct({...newProduct, category: e.target.value})}
                   >
                     {categories.map(c => (
                       <option key={c.id} value={c.name}>{c.name}</option>
                     ))}
                   </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('cost')} (LAK)</label>
                  <input 
                    type="number" 
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white" 
                    value={newProduct.cost || ''}
                    onChange={e => setNewProduct({...newProduct, cost: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('price')} (LAK)</label>
                  <input 
                    type="number" 
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white" 
                    value={newProduct.price || ''}
                    onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2 col-span-2 md:col-span-4">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('imageUrl')}</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white" 
                    value={newProduct.image || ''}
                    onChange={e => setNewProduct({...newProduct, image: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
             </div>
             <div className="flex justify-end gap-3 mt-8">
               <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">{t('cancelBtn')}</button>
               <button onClick={handleSaveProduct} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">{newProduct.id ? t('updateBtn') : t('saveBtn')}</button>
             </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-6 border-b border-slate-100">Image</th>
                <th className="p-6 border-b border-slate-100">{t('prodName')}</th>
                <th className="p-6 border-b border-slate-100">{t('category')}</th>
                <th className="p-6 border-b border-slate-100 text-right">{t('cost')}</th>
                <th className="p-6 border-b border-slate-100 text-right">{t('price')}</th>
                <th className="p-6 border-b border-slate-100 text-right">{t('profit')}</th>
                <th className="p-6 border-b border-slate-100 text-center">{t('status')}</th>
                <th className="p-6 border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {products.map((p) => {
                const profit = p.price - (p.cost || 0);
                return (
                  <tr key={p.id} className={`transition-colors group ${p.active ? 'hover:bg-slate-50/50' : 'bg-slate-50/50 opacity-60'}`}>
                    <td className="p-5 pl-6">
                      <img src={p.image} alt="" className="w-14 h-14 rounded-xl object-cover shadow-sm bg-slate-100" />
                    </td>
                    <td className="p-5 font-bold text-slate-700">{p.name}</td>
                    <td className="p-5">
                      <span className="bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide border border-slate-200">{p.category}</span>
                    </td>
                    <td className="p-5 text-right font-medium text-slate-500">{(p.cost || 0).toLocaleString()}</td>
                    <td className="p-5 text-right font-black text-slate-700">{p.price.toLocaleString()}</td>
                    <td className="p-5 text-right font-bold text-green-600">{profit.toLocaleString()}</td>
                    <td className="p-5 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${p.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {p.active ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="p-5 text-center flex items-center justify-center gap-2">
                       <button 
                        onClick={() => handleEditProduct(p)}
                        className="text-slate-400 hover:text-indigo-600 p-2 hover:bg-indigo-50 rounded-xl transition-all"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => onToggleProductStatus(p.id)}
                        className={`p-2 rounded-xl transition-all ${p.active ? 'text-slate-300 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 hover:text-green-500 hover:bg-green-50'}`}
                        title={p.active ? t('disable') : t('enable')}
                      >
                        <Power size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (view === 'categories') {
    return (
      <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">{t('manageCategories')}</h2>
            <p className="text-slate-500 font-medium">{t('manageCatDesc')}</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 font-bold"
          >
            <Plus size={20} />
            <span>{t('addCategory')}</span>
          </button>
        </div>

        {isAdding && (
          <div className="mb-8 bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-in slide-in-from-top-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
             <h3 className="text-xl font-bold text-slate-800 mb-6">{t('addNewCategory')}</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('catName')}</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white" 
                    value={newCategory.name || ''}
                    onChange={e => setNewCategory({...newCategory, name: e.target.value})}
                    placeholder="e.g. Desserts"
                  />
                </div>
             </div>
             <div className="flex justify-end gap-3 mt-8">
               <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">{t('cancelBtn')}</button>
               <button onClick={handleSaveCategory} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">{t('saveBtn')}</button>
             </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-6 border-b border-slate-100 w-24">{t('transId')}</th>
                <th className="p-6 border-b border-slate-100">{t('catName')}</th>
                <th className="p-6 border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {categories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 font-mono text-slate-400">#{c.id}</td>
                  <td className="p-5 font-bold text-slate-700">{c.name}</td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => onDeleteCategory(c.id)}
                      className="text-slate-300 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (view === 'users') {
    return (
      <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800">{t('manageUsers')}</h2>
            <p className="text-slate-500 font-medium">{t('manageStaff')}</p>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 font-bold"
          >
            <Plus size={20} />
            <span>{t('addUser')}</span>
          </button>
        </div>

        {isAdding && (
          <div className="mb-8 bg-white p-8 rounded-3xl shadow-xl border border-indigo-100 animate-in slide-in-from-top-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
             <h3 className="text-xl font-bold text-slate-800 mb-6">{t('addNewUser')}</h3>
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('name')}</label>
                  <input 
                    type="text" 
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white" 
                    value={newUser.name || ''}
                    onChange={e => setNewUser({...newUser, name: e.target.value})}
                    placeholder="Full Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('email')}</label>
                  <input 
                    type="email" 
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white" 
                    value={newUser.email || ''}
                    onChange={e => setNewUser({...newUser, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                <div className="space-y-2">
                   <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('role')}</label>
                   <select 
                    className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white"
                    value={newUser.role}
                    onChange={e => setNewUser({...newUser, role: e.target.value as any})}
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
             </div>
             <div className="flex justify-end gap-3 mt-8">
               <button onClick={() => setIsAdding(false)} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors">{t('cancelBtn')}</button>
               <button onClick={handleSaveUser} className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">{t('saveBtn')}</button>
             </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-6 border-b border-slate-100 pl-8">User</th>
                <th className="p-6 border-b border-slate-100">{t('email')}</th>
                <th className="p-6 border-b border-slate-100">{t('role')}</th>
                <th className="p-6 border-b border-slate-100 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="p-5 pl-8">
                    <div className="flex items-center gap-4">
                      <img src={u.avatar} alt={u.name} className="w-12 h-12 rounded-full bg-slate-100 border-2 border-white shadow-sm" />
                      <div>
                        <p className="font-bold text-slate-800">{u.name}</p>
                        <p className="text-xs text-slate-400 font-mono">ID: {u.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-slate-600 font-medium">{u.email}</td>
                  <td className="p-5">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border uppercase tracking-wide ${
                      u.role === 'admin' 
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-100' 
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {u.role === 'admin' ? <Shield size={12}/> : <Users size={12}/>}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-5 text-center">
                    <button 
                      onClick={() => onDeleteUser(u.id)}
                      className="text-slate-300 hover:text-red-500 p-2.5 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ... (Settings and History views remain largely the same, included via ...rest in actual implementation or just returning null if handled elsewhere, but for completeness in this file replacement I will assume they are here or not modified in a breaking way. Given the instructions, I've kept the file complete.)
  
  if (view === 'settings') {
     // ... (Existing Settings UI Code)
     return (
      <div className="p-8 max-w-[1000px] mx-auto animate-in fade-in duration-500">
         <div className="mb-8">
            <h2 className="text-3xl font-black text-slate-800 flex items-center gap-3">
              <Settings size={32} className="text-indigo-600" />
              {t('systemSettings')}
            </h2>
            <p className="text-slate-500 font-medium">{t('configDesc')}</p>
         </div>

         {showSaveSuccess && (
           <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-xl flex items-center gap-2 font-bold animate-in fade-in slide-in-from-top-2">
             <div className="bg-green-100 p-1 rounded-full"><Package size={16} /></div>
             {t('settingsSaved')}
           </div>
         )}

         <div className="space-y-8 pb-16">
            {/* General Settings */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <h3 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50">{t('generalSettings')}</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('storeName')}</label>
                    <input 
                      type="text"
                      className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white"
                      value={localSettings.storeName}
                      onChange={e => setLocalSettings({...localSettings, storeName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('storePhone')}</label>
                    <input 
                      type="text"
                      className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white"
                      value={localSettings.storePhone}
                      onChange={e => setLocalSettings({...localSettings, storePhone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('storeAddress')}</label>
                    <input 
                      type="text"
                      className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white"
                      value={localSettings.storeAddress}
                      onChange={e => setLocalSettings({...localSettings, storeAddress: e.target.value})}
                    />
                  </div>
               </div>
            </div>

            {/* Receipt Settings */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
               <h3 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-50 flex items-center gap-2">
                 <Receipt size={20} className="text-indigo-600" />
                 {t('receiptSettings')}
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                       <Image size={14} />
                       {t('logoUrl')}
                    </label>
                    <input 
                      type="text"
                      placeholder="https://..."
                      className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white"
                      value={localSettings.logoUrl}
                      onChange={e => setLocalSettings({...localSettings, logoUrl: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('receiptHeader')}</label>
                    <textarea 
                      className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white resize-none"
                      rows={3}
                      value={localSettings.receiptHeader}
                      onChange={e => setLocalSettings({...localSettings, receiptHeader: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('receiptFooter')}</label>
                    <textarea 
                      className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white resize-none"
                      rows={3}
                      value={localSettings.receiptFooter}
                      onChange={e => setLocalSettings({...localSettings, receiptFooter: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2 pt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                       <Printer size={14} />
                       {t('paperSize')}
                    </label>
                    <div className="flex gap-4">
                      <button 
                         onClick={() => setLocalSettings({...localSettings, printerPaperSize: '58mm'})}
                         className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all ${localSettings.printerPaperSize === '58mm' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        {t('paper58')}
                      </button>
                      <button 
                         onClick={() => setLocalSettings({...localSettings, printerPaperSize: '80mm'})}
                         className={`flex-1 p-4 rounded-xl border-2 font-bold transition-all ${localSettings.printerPaperSize === '80mm' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        {t('paper80')}
                      </button>
                    </div>
                  </div>
               </div>
            </div>

            {/* PhaJay Config */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-32 bg-gradient-to-br from-indigo-500/5 to-purple-500/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
               <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-50 relative z-10">
                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                   <QrCode size={20} className="text-purple-600" />
                   {t('paymentSettings')}
                 </h3>
                 <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-slate-500">{t('enablePhaJay')}</span>
                   <button 
                     onClick={() => setLocalSettings({...localSettings, enablePhaJay: !localSettings.enablePhaJay})}
                     className={`w-12 h-6 rounded-full transition-colors relative ${localSettings.enablePhaJay ? 'bg-indigo-600' : 'bg-slate-200'}`}
                   >
                     <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${localSettings.enablePhaJay ? 'left-7' : 'left-1'}`}></div>
                   </button>
                 </div>
               </div>

               <div className={`grid grid-cols-1 gap-6 relative z-10 transition-all ${localSettings.enablePhaJay ? 'opacity-100' : 'opacity-50 pointer-events-none grayscale'}`}>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Lock size={12} />
                      {t('secretKey')}
                    </label>
                    <input 
                      type="password"
                      placeholder="sk_live_..."
                      className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-mono text-sm transition-colors bg-slate-50 focus:bg-white"
                      value={localSettings.phajaySecretKey}
                      onChange={e => setLocalSettings({...localSettings, phajaySecretKey: e.target.value})}
                    />
                    <p className="text-[10px] text-slate-400 font-medium">Use the Secret Key from your PhaJay Portal (Key Management)</p>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('storeTag')}</label>
                    <input 
                      type="text"
                      className="w-full border-2 border-slate-100 p-4 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none font-semibold transition-colors bg-slate-50 focus:bg-white"
                      value={localSettings.phajayTag}
                      onChange={e => setLocalSettings({...localSettings, phajayTag: e.target.value})}
                      placeholder="e.g. SHOP_01"
                    />
                  </div>
               </div>
            </div>

            <div className="flex justify-end pt-4">
               <button 
                 onClick={handleSaveSettings}
                 className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-200 transition-all active:scale-95"
               >
                 <Save size={20} />
                 {t('saveBtn')}
               </button>
            </div>
         </div>
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="p-8 max-w-[1600px] mx-auto animate-in fade-in duration-500">
        <h2 className="text-3xl font-black text-slate-800 mb-2">{t('transHistory')}</h2>
        <p className="text-slate-500 mb-8 font-medium">{t('recentSales')}</p>
        
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <tr>
                <th className="p-6 border-b border-slate-100">{t('transId')}</th>
                <th className="p-6 border-b border-slate-100">{t('dateTime')}</th>
                <th className="p-6 border-b border-slate-100">{t('items')}</th>
                <th className="p-6 border-b border-slate-100">{t('payment')}</th>
                <th className="p-6 border-b border-slate-100 text-right">{t('total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...transactions].reverse().map((t) => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 font-mono text-xs font-bold text-slate-400">#{t.id.slice(-8)}</td>
                  <td className="p-6 text-slate-700 font-bold text-sm">
                    {new Date(t.date).toLocaleDateString('lo-LA')} 
                    <span className="text-slate-400 ml-2 font-normal">{new Date(t.date).toLocaleTimeString('lo-LA')}</span>
                  </td>
                  <td className="p-6 text-slate-600">
                    <span className="flex items-center gap-2 font-medium text-sm">
                       <Package size={16} className="text-slate-400" />
                       {t.items.length} items
                    </span>
                  </td>
                  <td className="p-6">
                     <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
                       t.paymentMethod === 'qr' 
                         ? 'bg-purple-50 text-purple-700 border-purple-100' 
                         : 'bg-green-50 text-green-700 border-green-100'
                     }`}>
                       {t.paymentMethod === 'qr' ? <QrCode size={14}/> : <Banknote size={14}/>}
                       {t.paymentMethod === 'qr' ? 'QR Pay' : 'Cash'}
                     </span>
                  </td>
                  <td className="p-6 text-right font-black text-slate-800">{t.total.toLocaleString()} ₭</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-20 text-center text-slate-400 flex flex-col items-center gap-4">
                    <div className="p-6 bg-slate-50 rounded-full">
                      <History size={32} strokeWidth={1.5} />
                    </div>
                    <span className="font-medium">{t('noTrans')}</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
};
