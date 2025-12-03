import React from 'react';
import { Plus } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart }) => {
  return (
    <div 
      onClick={() => onAddToCart(product)}
      className="group bg-white rounded-3xl p-3 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-100 flex flex-col h-full relative"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 bg-slate-50">
        <img 
          src={product.image} 
          alt={product.name} 
          loading="lazy"
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
        {/* Floating Add Button */}
        <button className="absolute bottom-3 right-3 bg-white text-indigo-600 p-3 rounded-full shadow-lg opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 active:scale-95">
          <Plus size={20} strokeWidth={3} />
        </button>
      </div>
      
      <div className="flex flex-col flex-1 px-1">
        <h3 className="font-bold text-slate-800 text-sm leading-tight mb-1 line-clamp-2">
          {product.name}
        </h3>
        <p className="text-xs text-slate-400 font-medium mb-auto">{product.category}</p>
        
        <div className="pt-3 mt-2 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Price</span>
            <p className="text-lg font-black text-indigo-600 leading-none">
              {product.price.toLocaleString()} <span className="text-xs font-semibold text-indigo-400">₭</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};