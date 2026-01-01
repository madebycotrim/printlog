import React from "react";
import { Edit2, Trash2, ArrowDownFromLine } from "lucide-react";
import SpoolSideView from "./carretel";

// --- SUB-COMPONENTE: BARRA SEGMENTADA REFINADA ---
const SegmentedProgress = ({ pct, color, pulse }) => {
    const segments = 24;
    // Garante que o percentual para a barra visual esteja entre 0 e 100
    const safePct = Math.max(0, Math.min(100, Number(pct) || 0));

    return (
        <div className={`h-3 w-full bg-zinc-950 border border-zinc-800/50 rounded-full px-1 flex items-center gap-[2px] relative overflow-hidden ${pulse ? 'animate-pulse' : ''}`}>
            {[...Array(segments)].map((_, i) => {
                const isActive = i < (safePct / (100 / segments));
                return (
                    <div
                        key={i}
                        className="h-[4px] flex-1 rounded-full transition-all duration-700"
                        style={{
                            backgroundColor: isActive ? color : '#27272a', 
                            boxShadow: isActive ? `0 0 10px ${color}30` : 'none',
                            opacity: isActive ? 1 : 0.3
                        }}
                    />
                );
            })}
        </div>
    );
};

// --- 1. COMPONENTE CARD (MODO GRADE) ---
export const FilamentCard = ({ item, onEdit, onDelete, onConsume }) => {
    // MAPEAMENTO PARA LÓGICA EM PT E TRATAMENTO DE NÚMEROS
    const capacidade = Math.max(1, Number(item?.peso_total) || 0); // Evita divisão por zero
    const atual = Math.max(0, Number(item?.peso_atual) || 0);
    const precoRolo = Number(item?.preco || 0);
    const corHex = item?.cor_hex || "#3b82f6";
    const marcaNome = (item?.marca || 'GENÉRICO').trim();
    const materialTipo = item?.material || "PLA";

    // Cálculo de percentual real para lógica de negócio (pode passar de 100 se houver erro no banco)
    // mas para a UI limitamos entre 0 e 100.
    const pctBruto = (atual / capacidade) * 100;
    const pct = Math.min(100, Math.max(0, Math.round(pctBruto)));
    
    const ehCritico = pct <= 20;
    
    // Cálculo do valor financeiro do que resta no rolo (Preço por grama * gramas atuais)
    const valorNoRolo = ((precoRolo / capacidade) * atual).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Tratamento do ID para exibição (Ex: "001A" ou o final do UUID)
    const idExibicao = String(item?.id || '0000').slice(-4).toUpperCase();

    return (
        <div className={`
            group relative bg-zinc-900/40 backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-300
            border ${ehCritico 
                ? 'border-rose-500/30 bg-rose-500/[0.02]' 
                : 'border-zinc-800/60 hover:border-zinc-700/80 shadow-sm'}
        `}>
            <div className="flex h-[190px]">

                {/* SIDEBAR LATERAL */}
                <div className="w-[70px] bg-zinc-950/40 border-r border-zinc-800/50 flex flex-col items-center py-6 justify-between shrink-0">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 bg-zinc-900/50 border border-zinc-800/50 ">
                        <SpoolSideView color={corHex} percent={pct} size={50} />
                    </div>

                    <div className="rotate-180 [writing-mode:vertical-lr] flex items-center">
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] whitespace-nowrap text-zinc-600">
                            {marcaNome}
                        </span>
                    </div>
                </div>

                {/* PAINEL CENTRAL */}
                <div className="flex-1 p-6 flex flex-col justify-between min-w-0">
                    <div className="flex justify-between items-start">
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-bold uppercase tracking-tight truncate leading-none text-zinc-100">
                                {item?.nome || "Filamento sem nome"}
                            </h3>
                            <p className="text-[10px] font-mono font-medium text-zinc-500 mt-2.5 uppercase tracking-widest">
                                REF: <span className="text-zinc-600">#{idExibicao}</span>
                            </p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-lg border text-[9px] font-bold uppercase tracking-wider ${ehCritico ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>
                            {ehCritico ? 'ESTOQUE CRÍTICO' : 'ESTOQUE OK'}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-baseline justify-between">
                            <div className="flex items-baseline gap-1.5">
                                <span className={`text-4xl font-bold tracking-tighter transition-colors ${ehCritico ? 'text-rose-400' : 'text-zinc-100'}`}>
                                    {Math.round(atual)}
                                </span>
                                <span className="text-xs font-bold text-zinc-500 uppercase">gramas</span>
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${ehCritico ? 'text-rose-400' : 'text-zinc-500'}`}>
                                {pct}% disponível
                            </span>
                        </div>
                        <SegmentedProgress pct={pct} color={corHex} pulse={ehCritico} />
                    </div>

                    <div className="flex justify-between items-end pt-3 mt-1 border-t border-zinc-800/40">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Polímero</span>
                            <span className="text-[11px] font-semibold text-zinc-400 uppercase leading-none tracking-wide">{materialTipo}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest leading-none mb-1">Valor em Saldo</span>
                            <span className="text-[13px] font-bold text-emerald-500/80 font-mono">R$ {valorNoRolo}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER AÇÕES */}
            <div className="grid grid-cols-[1fr_50px_50px] h-10 bg-zinc-950/50 border-t border-zinc-800/50">
                <button 
                    onClick={() => onConsume(item)} 
                    className="flex items-center justify-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800/30 transition-all duration-200 group"
                >
                    <ArrowDownFromLine size={14} className="text-zinc-600 group-hover:text-sky-400 transition-colors" />
                    Registrar Uso
                </button>
                <button 
                    onClick={() => onEdit(item)} 
                    className="flex items-center justify-center border-l border-zinc-800/50 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800/30 transition-all duration-200"
                >
                    <Edit2 size={14} />
                </button>
                <button 
                    onClick={() => onDelete(item?.id)} 
                    className="flex items-center justify-center border-l border-zinc-800/50 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
                >
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

// --- 2. COMPONENTE LINHA (MODO LISTA) ---
export const FilamentRow = ({ item, onEdit, onDelete, onConsume }) => {
    const capacidade = Math.max(1, Number(item?.peso_total) || 0);
    const atual = Math.max(0, Number(item?.peso_atual) || 0);
    const pct = Math.min(100, Math.max(0, Math.round((atual / capacidade) * 100)));
    const ehCritico = pct <= 20;
    const corHex = item?.cor_hex || "#3b82f6";

    return (
        <div className={`
            grid grid-cols-[70px_1fr_repeat(3,50px)] h-12 bg-zinc-900/40 rounded-xl overflow-hidden transition-all duration-300
            border border-zinc-800/60 hover:border-zinc-700/80 shadow-sm items-center
        `}>
            <div className="flex items-center justify-center bg-zinc-950/40 h-full border-r border-zinc-800/50 shrink-0">
                <SpoolSideView color={corHex} percent={pct} size={28} />
            </div>
            
            <div className="flex items-center px-6 justify-between min-w-0">
                <h3 className="text-xs font-bold uppercase tracking-wide truncate text-zinc-200">
                    {item?.nome || "Filamento sem identificação"}
                </h3>
                <div className="flex items-center gap-8">
                    <span className={`text-[12px] font-bold font-mono min-w-[50px] text-right ${ehCritico ? 'text-rose-400' : 'text-zinc-400'}`}>
                        {Math.round(atual)}g
                    </span>
                    <div className="w-36 hidden md:block">
                        <SegmentedProgress pct={pct} color={corHex} pulse={ehCritico} />
                    </div>
                </div>
            </div>

            <button onClick={() => onConsume(item)} title="Registrar Uso" className="flex items-center justify-center h-full text-zinc-600 hover:text-sky-400 hover:bg-zinc-800/40 transition-all"><ArrowDownFromLine size={16} /></button>
            <button onClick={() => onEdit(item)} title="Editar" className="flex items-center justify-center h-full border-l border-zinc-800/50 text-zinc-600 hover:text-zinc-100 hover:bg-zinc-800/40 transition-all"><Edit2 size={16} /></button>
            <button onClick={() => onDelete(item?.id)} title="Excluir" className="flex items-center justify-center h-full border-l border-zinc-800/50 text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"><Trash2 size={16} /></button>
        </div>
    );
};