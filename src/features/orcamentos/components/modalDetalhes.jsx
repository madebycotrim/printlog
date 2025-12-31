import React, { useEffect } from "react";
import {
    X, FileText, MessageCircle, Trash2, User,
    TrendingUp, Weight, Clock, Monitor, Layers,
    Zap, Hash, ShieldCheck, ArrowDownCircle, 
    ExternalLink, Printer
} from "lucide-react";
import { formatCurrency } from "../../../utils/numbers";
import { CONFIG_STATUS } from "../../../pages/orcamentos"

export default function ModalDetalhes({ item, onClose, onExcluir }) {
    useEffect(() => {
        const handleEsc = (e) => (e.key === 'Escape') && onClose();
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!item) return null;

    const d = item.data || {};
    const res = d.resultados || {};
    const ent = d.entradas || {};
    
    const statusKey = d.status || 'rascunho';
    const config = CONFIG_STATUS[statusKey] || CONFIG_STATUS['rascunho'];

    const precoFinal = Number(res.precoComDesconto || res.precoSugerido || 0);
    const lucroReal = Number(res.lucroReal || 0);
    const margemPercent = precoFinal > 0 ? (lucroReal / precoFinal) * 100 : 0;

    const pesoTotalCalculado = Number(res.pesoTotal || 0) > 0 
        ? Number(res.pesoTotal) 
        : (Number(ent.material?.pesoModelo || ent.pesoPeca || 0) * Number(ent.quantidade || ent.qtdPecas || 1));

    // CORES LOGO: Emerald (Forte), Sky (Médio), Cyan (Início/Risco)
    const margemColor = margemPercent >= 25 ? 'bg-emerald-500' : margemPercent >= 15 ? 'bg-sky-500' : 'bg-cyan-500';

    return (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={onClose} />

            <div className="
                w-full max-w-lg h-full bg-zinc-950 border-l border-white/5 
                flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl relative z-10
            ">
                {/* LINHA DE GRADIENTE SUPERIOR (LOGO STYLE) */}
                <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-sky-500 to-emerald-500" />

                {/* HEADER */}
                <div className="p-8 border-b border-white/5 bg-zinc-900/20 shrink-0">
                    <div className="flex justify-between items-start mb-6">
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-[0.2em] border ${config.bg} ${config.color} ${config.border}`}>
                                    {config.label}
                                </div>
                                <span className="text-zinc-600 font-mono text-[9px] font-bold">SERIAL://{String(item.id || '').slice(-8).toUpperCase()}</span>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter leading-none">
                                {item.label || ent.nomeProjeto || "Projeto sem nome"}
                            </h2>
                        </div>
                        <button onClick={onClose} className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl text-zinc-500 transition-all border border-white/5 group">
                            <X size={18} className="group-hover:rotate-90 transition-transform" />
                        </button>
                    </div>

                    {/* QUICK STATS BAR */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Preço Final</span>
                            <span className="text-sm font-mono font-black text-white italic">{formatCurrency(precoFinal)}</span>
                        </div>
                        <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Margem %</span>
                            <span className={`text-sm font-mono font-black italic ${margemPercent >= 20 ? 'text-emerald-400' : 'text-sky-400'}`}>
                                {margemPercent.toFixed(1)}%
                            </span>
                        </div>
                        <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                            <span className="text-[7px] font-black text-zinc-500 uppercase block mb-1">Massa Total</span>
                            <span className="text-sm font-mono font-black text-zinc-300 italic">{pesoTotalCalculado.toFixed(0)}g</span>
                        </div>
                    </div>
                </div>

                {/* CONTENT */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-gradient-to-b from-transparent to-black/20">
                    
                    {/* FINANCEIRO */}
                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            Métricas Financeiras <div className="h-px flex-1 bg-white/5" />
                        </h4>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-zinc-900/30 p-5 rounded-2xl border border-white/5">
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">Custo Produção</span>
                                <span className="text-xl font-mono font-black text-zinc-400 italic">{formatCurrency(res.custoTotal || 0)}</span>
                            </div>
                            <div className="bg-emerald-500/[0.02] p-5 rounded-2xl border border-emerald-500/10">
                                <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest block mb-1">Lucro Líquido</span>
                                <span className="text-xl font-mono font-black text-emerald-500 italic">+{formatCurrency(lucroReal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* BLUEPRINT ESPECIFICAÇÕES */}
                    <div className="space-y-4">
                        <h4 className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center gap-3">
                            Blueprint Técnico <div className="h-px flex-1 bg-white/5" />
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                            {[
                                { icon: <User size={14} />, label: "Cliente", val: ent.clienteNome || "Venda Direta", color: "text-zinc-400" },
                                { icon: <Layers size={14} />, label: "Material", val: ent.material?.nome || "Polímero Padrão", color: "text-sky-400" },
                                { icon: <Printer size={14} />, label: "Setup Impressora", val: ent.selectedPrinterName || "Standby", color: "text-emerald-400" },
                                { icon: <Clock size={14} />, label: "Lead Time", val: `${res.tempoTotalHoras || 0} Horas`, color: "text-zinc-400" },
                            ].map((s, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-white/[0.01] rounded-xl border border-white/[0.03] hover:bg-white/[0.03] transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg bg-zinc-900 ${s.color} opacity-80`}>{s.icon}</div>
                                        <span className="text-[9px] font-bold text-zinc-500 uppercase">{s.label}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-zinc-200 uppercase tracking-tight italic">{s.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* TAXAS SUTIS */}
                    <div className="p-5 bg-rose-500/[0.01] border border-rose-500/5 rounded-2xl flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <ArrowDownCircle size={12} className="text-rose-900" />
                            <span className="text-[9px] font-bold text-zinc-600 uppercase">Deduções e Impostos</span>
                        </div>
                        <span className="text-xs font-mono font-bold text-rose-900">-{formatCurrency(res.valorImpostos || 0)}</span>
                    </div>
                </div>

                {/* FOOTER */}
                <div className="p-8 border-t border-white/5 bg-zinc-900/40 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button className="h-12 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-white/5 active:scale-95">
                            <FileText size={16} /> PDF Relatório
                        </button>
                        <button className="h-12 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95">
                            <MessageCircle size={16} /> Enviar WhatsApp
                        </button>
                    </div>

                    <button
                        onClick={() => window.confirm("Excluir permanentemente?") && onExcluir(item.id)}
                        className="w-full h-10 text-rose-900/40 hover:text-rose-500 text-[8px] font-black uppercase tracking-[0.3em] transition-all hover:bg-rose-500/5 rounded-lg"
                    >
                        Remover Registro do Banco
                    </button>
                </div>
            </div>
        </div>
    );
}