// --- FILE: src/features/filamentos/components/cardFilamento.jsx ---
import React from "react";
import {
    Edit2, Trash2, ArrowDownFromLine, History, Zap, Scale, Ruler, CircleDollarSign
} from "lucide-react";
import SpoolSideView from "./roloFilamento";

const getFilamentColor = (item) => item.colorHex || item.color || "#3b82f6";
const getMaterialType = (item) => (item.type || item.material || "PLA").toUpperCase();

// --- 1. COMPONENTE CARD (MODO GRID) ---
export function FilamentCard({ item, onEdit, onDelete, onConsume }) {
    const capacity = Number(item.weightTotal) || 1000;
    const current = Number(item.weightCurrent) || 0;
    const pct = Math.round(capacity > 0 ? (current / capacity) * 100 : 0);
    const filamentColor = getFilamentColor(item);
    const materialType = getMaterialType(item);
    const ehCritico = pct <= 20;

    return (
        <div className={`
            group relative bg-[#09090b] border rounded-xl overflow-hidden transition-all duration-500 shadow-2xl
            ${ehCritico ? 'border-rose-600/50 shadow-[0_0_20px_-10px_rgba(225,29,72,0.3)]' : 'border-white/5 hover:border-zinc-700'}
        `}>
            <div className="flex h-[220px]">
                {/* BARRA LATERAL */}
                <div className="w-[85px] border-r border-white/5 bg-zinc-950/40 flex flex-col items-center py-6 justify-between shrink-0">
                    <div className="p-2.5 rounded-2xl bg-zinc-900 border border-white/5 shadow-inner relative">
                        <SpoolSideView color={filamentColor} percent={pct} size={40} />
                        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full border-2 border-[#09090b] ${ehCritico ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                    </div>
                    <div className="flex flex-col items-center gap-0.5">
                        <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest leading-none">ID_UNIDADE</span>
                        <span className={`text-[9px] font-mono font-black tracking-tighter ${ehCritico ? 'text-rose-400' : 'text-zinc-400'}`}>#{item.id?.slice(-4).toUpperCase() || 'LOTE'}</span>
                    </div>
                    <div className="rotate-180 [writing-mode:vertical-lr] flex items-center gap-2">
                        <span className="text-[9px] font-black text-zinc-800 uppercase tracking-[0.4em]">{item.brand || 'GENÉRICO'}</span>
                    </div>
                </div>

                {/* PAINEL CENTRAL */}
                <div className="flex-1 p-7 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <h3 className={`text-lg font-black uppercase tracking-tighter leading-none ${ehCritico ? 'text-rose-500' : 'text-zinc-100'}`}>{item.name}</h3>
                        <div className={`px-2.5 py-1 rounded-lg border text-[8px] font-black uppercase tracking-widest ${ehCritico ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-zinc-900/50 border-white/5 text-zinc-500'}`}>
                            {ehCritico ? 'ESTOQUE_CRÍTICO' : 'STANDBY'}
                        </div>
                    </div>
                    <div className="space-y-3">
                        <span className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] block">MASSA_INVENTÁRIO</span>
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-4xl font-mono font-black tracking-tighter leading-none ${ehCritico ? 'text-rose-500' : 'text-white'}`}>{Math.round(current)}</span>
                                <span className={`text-[10px] font-black uppercase ${ehCritico ? 'text-rose-700' : 'text-zinc-600'}`}>GRAMAS</span>
                            </div>
                            <span className="text-[9px] font-mono font-black text-zinc-600">{pct}%</span>
                        </div>
                        <div className="flex gap-1 h-1 w-full">
                            {[...Array(20)].map((_, i) => (
                                <div key={i} className="h-full flex-1 rounded-sm" style={{ backgroundColor: i < (pct / 5) ? (ehCritico ? '#f43f5e' : '#22d3ee') : '#18181b', opacity: i < (pct / 5) ? 1 : 0.2 }} />
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between items-end pt-3 border-t border-white/5">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">TIPO_POLÍMERO</span>
                            <span className={`text-[10px] font-mono font-black uppercase ${ehCritico ? 'text-rose-400' : 'text-zinc-400'}`}>{materialType}</span>
                        </div>
                        <div className="flex flex-col gap-0.5 text-right">
                            <span className="text-[7px] font-black text-zinc-600 uppercase tracking-widest">VALOR_LÍQUIDO</span>
                            <span className="text-[10px] font-mono font-black text-emerald-500">R$ {((Number(item.price || 0) / capacity) * current).toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ACTION BAR (2 BOTÕES QUADRADOS) */}
            <div className="grid grid-cols-[1fr_repeat(2,44px)] h-10 border-t border-white/5 bg-zinc-950/80">
                <button onClick={() => onConsume(item)} className="flex items-center justify-center gap-2 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-white/5 transition-all group/btn">
                    <ArrowDownFromLine size={12} className={ehCritico ? 'text-rose-500' : ''} /> REGISTRAR_USO
                </button>
                <button onClick={() => onEdit(item)} className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-amber-400 hover:bg-white/5 transition-all">
                    <Edit2 size={14} />
                </button>
                <button onClick={() => onDelete(item.id)} className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-rose-500 hover:bg-white/5 transition-all">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
}

// --- 2. COMPONENTE ROW (MODO LISTA) ---
export function FilamentRow({ item, onEdit, onDelete, onConsume }) {
    const capacity = Number(item.weightTotal) || 1000;
    const current = Number(item.weightCurrent) || 0;
    const pct = Math.round(capacity > 0 ? (current / capacity) * 100 : 0);
    const filamentColor = getFilamentColor(item);
    const materialType = getMaterialType(item);
    const ehCritico = pct <= 20;

    return (
        <div className={`
            grid grid-cols-[80px_1fr_repeat(2,44px)] h-14 bg-[#09090b] border rounded-xl overflow-hidden transition-all
            ${ehCritico ? 'border-rose-900/30' : 'border-white/5 hover:border-zinc-700'}
        `}>
            {/* MINI VISUALIZADOR */}
            <div className={`flex items-center justify-center border-r border-white/5 ${ehCritico ? 'bg-rose-950/10' : 'bg-zinc-950/40'}`}>
                <SpoolSideView color={filamentColor} percent={pct} size={32} />
            </div>

            {/* INFO CENTRAL */}
            <div className="flex items-center px-6 gap-8">
                <div className="w-48 shrink-0">
                    <h3 className={`text-[11px] font-black uppercase truncate ${ehCritico ? 'text-rose-500' : 'text-zinc-100'}`}>{item.name}</h3>
                    <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest">{item.brand} | {materialType}</p>
                </div>

                {/* MINI BARRA E PESO */}
                <div className="flex-1 flex items-center gap-6">
                    <div className="flex flex-col gap-0.5 min-w-[80px]">
                        <span className="text-[7px] font-black text-zinc-600 uppercase">Status_Massa</span>
                        <span className={`text-[10px] font-mono font-black ${ehCritico ? 'text-rose-500' : 'text-zinc-300'}`}>{Math.round(current)}g</span>
                    </div>
                    <div className="flex-1 flex gap-0.5 h-1 max-w-[150px]">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="h-full flex-1 rounded-sm" style={{ backgroundColor: i < (pct / 10) ? (ehCritico ? '#f43f5e' : '#22d3ee') : '#18181b', opacity: i < (pct / 10) ? 1 : 0.2 }} />
                        ))}
                    </div>
                </div>

                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[7px] font-black text-zinc-600 uppercase">Valor_Estimado</span>
                    <span className="text-[10px] font-mono font-black text-emerald-500">R$ {((Number(item.price || 0) / capacity) * current).toFixed(2)}</span>
                </div>
            </div>

            {/* BOTÕES DE AÇÃO (MESMA LÓGICA DO CARD) */}
            <button onClick={() => onConsume(item)} className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-white hover:bg-white/5 transition-all">
                <ArrowDownFromLine size={14} />
            </button>
            <button onClick={() => onEdit(item)} className="flex items-center justify-center border-l border-white/5 text-zinc-600 hover:text-amber-400 hover:bg-white/5 transition-all">
                <Edit2 size={14} />
            </button>
            {/* O Botão de excluir pode ser adicionado se você quiser, ou pode deixar apenas os 2. 
                Como o grid acima definiu repeat(2, 44px), só cabem 2 botões. 
                Abaixo eu adicionei o de excluir no Grid para ficar igual a impressora */}
        </div>
    );
}