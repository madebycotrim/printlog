import React, { useState, useEffect } from "react";
import { X, AlertTriangle, Fuel, Activity, Terminal, ArrowDownToLine } from "lucide-react";
import SpoolSideView from "./carretel";
import { parseNumber } from "../../../utils/numbers";

export default function ModalBaixaRapida({ aberto, aoFechar, item, aoSalvar }) {
    const [consumo, setConsumo] = useState("");

    useEffect(() => {
        if (aberto) setConsumo("");
    }, [aberto]);

    if (!aberto || !item) return null;

    // --- LÓGICA DE CÁLCULO REVISADA ---
    const capacidade = Math.max(1, Number(item.peso_total) || 1000);
    const pesoAnterior = Number(item.peso_atual) || 0;
    
    // Tratamos o consumo: se não for número válido, tratamos como 0
    const qtdConsumo = Math.max(0, parseNumber(consumo) || 0);
    
    // Cálculo do peso final com trava de segurança (mínimo 0)
    // Usamos Math.round para evitar dízimas periódicas de balanças digitais/slicers
    const pesoFinal = Math.max(0, Math.round(pesoAnterior - qtdConsumo));

    // Percentuais para as barras de progresso (0 a 100)
    const pctAtual = Math.min(100, Math.max(0, (pesoAnterior / capacidade) * 100));
    const pctFinal = Math.min(100, Math.max(0, (pesoFinal / capacidade) * 100));

    // Validações de UI
    const erroSaldo = (pesoAnterior - qtdConsumo) < 0;
    const inputValido = consumo !== "" && qtdConsumo > 0;

    const corFilamento = item.cor_hex || "#3b82f6";

    const confirmar = async () => {
        if (!inputValido || erroSaldo) return;
        
        // Enviamos o peso final já processado
        await aoSalvar({ 
            ...item, 
            peso_atual: pesoFinal 
        });
        aoFechar();
    };

    // Helper para os botões de incremento rápido
    const adicionarConsumo = (valor) => {
        const atual = parseNumber(consumo) || 0;
        setConsumo((atual + valor).toString());
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0 z-0" onClick={aoFechar} />

            <div className="relative bg-zinc-950 border border-zinc-800/80 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh] z-10">

                {/* --- SIDEBAR LATERAL COM GRID DECORATIVO --- */}
                <div className="w-full md:w-[320px] bg-zinc-900/30 border-r border-zinc-800/50 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    
                    {/* BACKGROUND DECORATIVO: GRID (BUILD PLATE) */}
                    <div className="absolute inset-0 z-0 pointer-events-none opacity-30 select-none">
                        <div 
                            className="absolute inset-0" 
                            style={{
                                backgroundImage: `linear-gradient(to right, #27272a 1px, transparent 1px), linear-gradient(to bottom, #27272a 1px, transparent 1px)`,
                                backgroundSize: '40px 40px',
                                maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
                            }}
                        />
                        <div 
                            className="absolute inset-0 opacity-50" 
                            style={{
                                backgroundImage: `linear-gradient(to right, #18181b 1px, transparent 1px), linear-gradient(to bottom, #18181b 1px, transparent 1px)`,
                                backgroundSize: '10px 10px',
                                maskImage: 'radial-gradient(circle at center, black, transparent 90%)'
                            }}
                        />
                        <div className="absolute top-4 left-4 w-4 h-4 border-t border-l border-zinc-800" />
                        <div className="absolute top-4 right-4 w-4 h-4 border-t border-r border-zinc-800" />
                        <div className="absolute bottom-4 left-4 w-4 h-4 border-b border-l border-zinc-800" />
                        <div className="absolute bottom-4 right-4 w-4 h-4 border-b border-r border-zinc-800" />
                    </div>

                    <div className="space-y-10 relative z-10">
                        <div className="flex items-center gap-3 justify-center">
                            <div className="h-px w-4 bg-zinc-800" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Status do Material</span>
                            <div className="h-px w-4 bg-zinc-800" />
                        </div>

                        <div className="relative group p-12 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm">
                            <div className="absolute inset-0 bg-zinc-500/5 blur-3xl rounded-full" />
                            <div className="relative scale-110 drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]">
                                <SpoolSideView color={corFilamento} percent={pctFinal} size={110} />
                            </div>
                        </div>

                        <div className="text-center space-y-2">
                            <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate px-2">
                                {item.nome || "Filamento"}
                            </h3>
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                                {item.marca} • {item.material}
                            </span>
                        </div>
                    </div>

                    <div className={`${erroSaldo ? 'border-rose-500/20 bg-rose-500/10' : 'border-zinc-800 bg-zinc-950/50'} border rounded-2xl p-6 backdrop-blur-md relative z-10 shadow-xl transition-colors duration-300`}>
                        <div className="flex items-center gap-2 mb-4">
                            <Activity size={12} className={erroSaldo ? 'text-rose-500' : 'text-emerald-500/50'} />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Monitoramento de Massa</span>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Peso Atual</p>
                                    <p className="text-lg font-bold text-zinc-400 font-mono leading-none">{Math.round(pesoAnterior)}g</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-bold text-zinc-600 uppercase mb-1">Novo Saldo</p>
                                    <p className={`text-2xl font-bold font-mono leading-none ${erroSaldo ? 'text-rose-500' : 'text-zinc-100'}`}>
                                        {Math.round(pesoFinal)}<span className="text-xs ml-1 text-zinc-500 font-sans">g</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- CONTEÚDO PRINCIPAL --- */}
                <div className="flex-1 flex flex-col bg-zinc-950">
                    <header className="px-10 py-6 border-b border-zinc-800/50 bg-zinc-900/10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
                                <Fuel className="text-zinc-400" size={18} />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Estoque: Baixa de Material</h3>
                                <p className="text-[10px] text-zinc-500 font-medium leading-none mt-1.5">Subtraia o peso utilizado na sua última impressão</p>
                            </div>
                        </div>
                        <button onClick={aoFechar} className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 transition-all">
                            <X size={20} />
                        </button>
                    </header>

                    <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12">

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">01. Peso da Impressão</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>

                            <div className="relative group">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-zinc-100 transition-colors">
                                    <ArrowDownToLine size={20} />
                                </div>
                                <input
                                    autoFocus
                                    type="number"
                                    min="0"
                                    value={consumo}
                                    onChange={e => setConsumo(e.target.value)}
                                    placeholder="0.00"
                                    className={`w-full bg-zinc-900/50 border rounded-2xl py-6 pl-14 pr-24 text-3xl font-bold text-zinc-100 outline-none transition-all shadow-inner font-mono
                                        ${erroSaldo ? 'border-rose-500/40 focus:border-rose-500/60 ring-4 ring-rose-500/5' : 'border-zinc-800 focus:border-zinc-600 focus:bg-zinc-900'}`}
                                />
                                <div className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] border-l border-zinc-800 pl-5">
                                    Gramas
                                </div>
                            </div>

                            <div className="grid grid-cols-5 gap-3">
                                {[10, 25, 50, 100, 250].map(val => (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => adicionarConsumo(val)}
                                        className="py-3.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-500 hover:bg-zinc-800 text-[10px] font-bold text-zinc-500 hover:text-zinc-100 rounded-xl transition-all active:scale-[0.95] uppercase tracking-widest"
                                    >
                                        +{val}g
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">02. Previsão de Estoque</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>

                            <div className="p-8 bg-zinc-900/20 border border-zinc-800/50 rounded-[1.5rem] space-y-8">
                                <div className="flex justify-between items-end">
                                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Cálculo de Saldo</span>
                                    {erroSaldo && (
                                        <div className="flex items-center gap-2 text-rose-500 animate-pulse bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]">
                                            <AlertTriangle size={14} />
                                            <span className="text-[10px] font-bold uppercase tracking-tighter">Peso Insuficiente</span>
                                        </div>
                                    )}
                                </div>

                                <div className="h-4 w-full bg-zinc-950 rounded-full border border-zinc-800/50 overflow-hidden relative shadow-inner p-0.5">
                                    <div
                                        className="absolute h-full transition-all duration-500 opacity-10"
                                        style={{ width: `${pctAtual}%`, backgroundColor: corFilamento }}
                                    />
                                    <div
                                        className="absolute h-full transition-all duration-700 shadow-[0_0_20px_rgba(0,0,0,0.5)] rounded-full"
                                        style={{
                                            width: `${pctFinal}%`,
                                            backgroundColor: corFilamento,
                                            boxShadow: `0 0 20px ${corFilamento}33`
                                        }}
                                    />
                                </div>

                                <div className="flex justify-between text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">
                                    <span>Vazio</span>
                                    <div className="flex gap-6">
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full opacity-20" style={{ backgroundColor: corFilamento }} />
                                            Anterior
                                        </span>
                                        <span className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: corFilamento }} />
                                            <span className="text-zinc-300">Estimado: {Math.round(pctFinal)}%</span>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="p-8 border-t border-zinc-800/50 bg-zinc-900/10 flex gap-4">
                        <button
                            type="button"
                            onClick={aoFechar}
                            className="flex-1 py-4 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50 transition-all tracking-widest"
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            disabled={!inputValido || erroSaldo}
                            onClick={confirmar}
                            className={`flex-[2] py-4 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 tracking-widest
                                ${(!inputValido || erroSaldo)
                                    ? 'bg-zinc-900 text-zinc-700 border border-zinc-800 cursor-not-allowed opacity-50'
                                    : 'bg-zinc-100 text-zinc-950 hover:bg-white active:scale-[0.98] shadow-[0_4px_20px_rgba(255,255,255,0.1)]'}`}
                        >
                            <Terminal size={16} /> Confirmar Baixa
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}