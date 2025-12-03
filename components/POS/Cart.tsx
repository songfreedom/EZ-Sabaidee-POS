
import React, { useState } from 'react';
import { Trash2, Minus, Plus, ArrowRight, ShoppingBag, PauseCircle, RotateCcw, XCircle, Clock } from 'lucide-react';
import { CartItem, Language, HeldBill } from '../../types';
import { translations } from '../../translations';

interface CartProps {
  items: CartItem[];
  heldBills: HeldBill[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
  onHoldBill: () => void;
  onRecallBill: (bill: HeldBill) => void;
  onDiscardBill: (id: string) => void;
  lang: Language;
}

export const Cart: React.FC<CartProps> = ({ 
  items, heldBills, onUpdateQuantity, onRemoveItem, onCheckout, onHoldBill, onRecallBill, onDiscardBill, lang 
}) => {
  const t = (key: string) => translations[key]?.[lang] || key;
  const [showHeldBills, setShowHeldBills] = useState(false);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // If showing held bills
  if (showHeldBills) {
    return (
      <div className="flex flex-col h-full bg-slate-100 border-l border-white/50 shadow-2xl shadow-slate-300/50">
        <div className="px-6 pt-6 pb-4 bg-white z-10 border-b border-slate-200">
           <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                 <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
                   <PauseCircle size={20} />
                 </div>
                 <h2 className="text-lg font-extrabold text-slate-800">{t('heldBills')}</h2>
              </div>
              <button 
                onClick={() => setShowHeldBills(false)}
                className="text-slate-500 hover:text-slate-800 font-bold text-sm bg-slate-100 px-3 py-1.5 rounded-lg"
              >
                {t('cancel')}
              </button>
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
           {heldBills.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
               <PauseCircle size={48} strokeWidth={1.5} />
               <p className="font-medium text-sm">{t('noHeldBills')}</p>
             </div>
           ) : (
             heldBills.map(bill => (
               <div key={bill.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-3">
                     <div>
                       <div className="flex items-center gap-2 mb-1">
                          <Clock size={14} className="text-slate-400" />
                          <span className="text-xs font-bold text-slate-500">{new Date(bill.date).toLocaleTimeString(lang === 'lo' ? 'lo-LA' : 'en-US')}</span>
                       </div>
                       <p className="font-bold text-slate-800 text-sm">#{bill.note}</p>
                     </div>
                     <span className="font-black text-indigo-600">{bill.total.toLocaleString()} ₭</span>
                  </div>
                  <div className="text-xs text-slate-500 mb-4 bg-slate-50 p-2 rounded-lg">
                     {bill.items.map(i => i.name).join(', ').slice(0, 50)}...
                  </div>
                  <div className="flex gap-2">
                     <button 
                       onClick={() => {
                         onRecallBill(bill);
                         setShowHeldBills(false);
                       }}
                       className="flex-1 bg-slate-900 text-white py-2 rounded-xl text-xs font-bold hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2"
                     >
                       <RotateCcw size={14} />
                       {t('restore')}
                     </button>
                     <button 
                       onClick={() => onDiscardBill(bill.id)}
                       className="px-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    )
  }

  // Normal Cart View
  return (
    <div className="flex flex-col h-full bg-white/80 backdrop-blur-xl border-l border-white/50 shadow-2xl shadow-slate-300/50">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white/50 backdrop-blur-sm z-10 border-b border-slate-100/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 p-2 rounded-xl text-indigo-600">
              <ShoppingBag size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-800">{t('orderTitle')}</h2>
              <p className="text-xs text-slate-500 font-medium">#Order-2024-001</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {heldBills.length > 0 && (
              <button 
                onClick={() => setShowHeldBills(true)}
                className="relative bg-orange-100 text-orange-600 p-2 rounded-xl hover:bg-orange-200 transition-colors"
                title={t('heldBills')}
              >
                <PauseCircle size={20} />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-white">
                  {heldBills.length}
                </span>
              </button>
            )}
            
            <button 
              onClick={onHoldBill}
              disabled={items.length === 0}
              className="bg-slate-100 text-slate-600 p-2 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              title={t('holdBill')}
            >
              <PauseCircle size={20} />
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center">
             <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {items.reduce((acc, item) => acc + item.quantity, 0)} {t('items')}
          </span>
        </div>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 opacity-60">
            <ShoppingBag size={48} strokeWidth={1.5} />
            <p className="font-medium text-sm">{t('emptyCart')}</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group bg-white rounded-2xl p-3 shadow-sm border border-slate-100 flex gap-3 hover:shadow-md hover:border-indigo-100 transition-all">
              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover bg-slate-100" />
              <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-slate-700 text-sm truncate leading-tight">{item.name}</h4>
                  <p className="text-indigo-600 font-bold text-sm whitespace-nowrap">{(item.price * item.quantity).toLocaleString()}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1">
                    <button 
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      disabled={item.quantity <= 1}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus size={12} strokeWidth={3} />
                    </button>
                    <span className="text-sm font-bold w-4 text-center text-slate-800">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-slate-600 hover:text-green-600 transition-colors"
                    >
                      <Plus size={12} strokeWidth={3} />
                    </button>
                  </div>
                  <button 
                    onClick={() => onRemoveItem(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer / Total */}
      <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20">
        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">{t('subtotal')}</span>
            <span className="font-bold text-slate-700">{total.toLocaleString()} ₭</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 font-medium">{t('tax')}</span>
            <span className="font-bold text-slate-700">0 ₭</span>
          </div>
          <div className="flex justify-between items-end pt-4 border-t border-dashed border-slate-200">
            <span className="text-slate-900 font-extrabold text-lg">{t('total')}</span>
            <div className="text-right">
              <span className="text-3xl font-black text-indigo-600 leading-none block tracking-tight">{total.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">KIP (LAK)</span>
            </div>
          </div>
        </div>

        <button
          onClick={onCheckout}
          disabled={items.length === 0}
          className="w-full bg-slate-900 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl shadow-xl shadow-slate-200 hover:shadow-indigo-200 transition-all duration-300 flex items-center justify-between px-6 group active:scale-[0.98]"
        >
          <span className="font-bold tracking-wide">{t('payBtn')}</span>
          <div className="bg-white/20 p-2 rounded-full group-hover:bg-white/30 transition-colors">
             <ArrowRight size={20} className="text-white" />
          </div>
        </button>
      </div>
    </div>
  );
};