import React from 'react';
import { Edit2, Trash2, Package } from 'lucide-react';

export default function CardInsumo({ item, onEdit, onDelete }) {
    return (
        <div className="group relative bg-zinc-900/40 border border-white/5 rounded-2xl p-5 hover:border-emerald-500/30 hover:bg-zinc-900/60 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-900/10">
            <div className="flex justify-between items-start mb-4">
                <div className="w-10 h-10 bg-zinc-950 rounded-lg flex items-center justify-center border border-zinc-800 group-hover:border-emerald-500/30 transition-colors">
                    <Package className="text-zinc-500 group-hover:text-emerald-400 transition-colors" size={20} />
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onEdit(item)} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors">
                        <Edit2 size={16} />
                    </button>
                    <button onClick={() => onDelete(item)} className="p-2 hover:bg-rose-500/10 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors">
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <h3 className="text-white font-semibold text-lg line-clamp-1 mb-1">{item.name}</h3>
            <p className="text-zinc-500 text-xs font-mono mb-4">ID: {item?.id?.slice?.(0, 8) || '...'}</p>

            <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-white/5">
                    <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-0.5">Preço</span>
                    <span className="text-emerald-400 font-mono font-bold">R$ {Number(item.price).toFixed(2)}</span>
                </div>
                <div className="bg-zinc-950/50 p-2.5 rounded-lg border border-white/5">
                    <span className="block text-[10px] text-zinc-500 uppercase font-black tracking-wider mb-0.5">Estoque</span>
                    <span className="text-zinc-200 font-mono font-bold">{item.currentStock} <span className="text-[10px] text-zinc-600">{item.unit}</span></span>
                </div>
            </div>
        </div>
    );
}
