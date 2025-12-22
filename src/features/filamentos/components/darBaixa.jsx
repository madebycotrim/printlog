import React, { useState, useEffect } from "react";
import { 
    X, ArrowRight, AlertTriangle, Scale, History, 
    Fuel, Activity, Binary, Box, Zap
} from "lucide-react";
import SpoolSideView from "./roloFilamento";

// --- HELPER VISUAL PARA CONTRASTE ---
const isColorDark = (color) => {
    if (!color) return false;
    let hex = color.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 4), 16);
    const b = parseInt(hex.substr(4, 6), 16);
    return (0.2126 * r + 0.7152 * g + 0.0722 * b) < 140;
};

export default function ModalBaixaRapida({ aberto, aoFechar, item, aoSalvar }) {
    const [consumo, setConsumo] = useState("");

    useEffect(() => {
        if (aberto) setConsumo("");
    }, [aberto]);

    if (!aberto || !item) return null;

    const capacidade = Number(item.weightTotal) || 1000;
    const pesoAtual = Number(item.weightCurrent) || 0;
    const qtdConsumo = Number(consumo);
    const pesoFinal = Math.max(0, pesoAtual - qtdConsumo);
    const pctFinal = capacidade > 0 ? (pesoFinal / capacidade) * 100 : 0;

    const erroSaldo = (pesoAtual - qtdConsumo) < 0 && qtdConsumo > 0;
    const inputValido = consumo !== "" && qtdConsumo > 0;
    const corFilamento = item.colorHex || item.color || "#3b82f6";
    const textoEscuro = isColorDark(corFilamento);

    const confirmar = () => {
        if (!inputValido || erroSaldo) return;
        aoSalvar({ ...item, weightCurrent: pesoFinal });
        aoFechar();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0 z-0" onClick={aoFechar} />

            <div className="relative bg-[#080808] border border-zinc-800 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh] z-10">
                
                {/* --- LADO ESQUERDO: SCANNER (COMPACTO) --- */}
                <div className="w-full md:w-[280px] bg-black/40 border-b md:border-b-0 md:border-r border-zinc-800/60 p-6 flex flex-col items-center justify-between shrink-0">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                        style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }}
                    />

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] opacity-10 transition-all duration-700"
                        style={{ backgroundColor: corFilamento }}
                    />

                    <div className="relative z-10 w-full">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                            <Activity size={12} className="text-sky-500 animate-pulse" />
                            <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em]">Visual_Delta_Sim</span>
                        </div>

                        <div className="flex justify-center py-2">
                            <SpoolSideView color={corFilamento} percent={pctFinal} size={130} />
                        </div>
                    </div>

                    <div className="relative z-10 w-full space-y-4">
                        <div className="text-center">
                            <h3 className="text-base font-black text-white tracking-tighter uppercase truncate mb-1">{item.name || "UNNAMED"}</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[7px] font-mono font-black bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase">
                                    {item.brand}
                                </span>
                                <span className="text-[7px] font-mono font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 px-1.5 py-0.5 rounded uppercase">
                                    {item.type || item.material}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- LADO DIREITO: FORMULÁRIO --- */}
                <div className="flex-1 flex flex-col">
                    
                    <header className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black border border-zinc-800 text-amber-500">
                                <Fuel size={16} />
                            </div>
                            <h3 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Inventory_Reduction_Node</h3>
                        </div>
                        <button onClick={aoFechar} className="p-1 text-zinc-600 hover:text-white transition-colors"><X size={18} /></button>
                    </header>

                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                        
                        {/* MÓDULO 01: ENTRADA DE CARGA */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-sky-500 font-mono">[ 01 ]</span>
                                <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Input_Mass_Delta</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>

                            <div className="relative group">
                                <input
                                    autoFocus type="number" value={consumo}
                                    onChange={e => setConsumo(e.target.value)}
                                    placeholder="000"
                                    className={`w-full bg-zinc-900/20 border-2 rounded-2xl py-6 px-6 text-5xl font-mono font-black text-center outline-none transition-all duration-300
                                        ${erroSaldo ? 'border-rose-500/40 text-rose-500' : 'border-zinc-800/80 text-white focus:border-sky-500/50 shadow-inner'}`}
                                />
                                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-zinc-700 font-black text-sm font-mono opacity-40 uppercase">Grams</div>
                            </div>

                            <div className="grid grid-cols-4 gap-2">
                                {[10, 50, 100, 250].map(val => (
                                    <button
                                        key={val}
                                        onClick={() => setConsumo(prev => (Number(prev) + val).toString())}
                                        className="py-2 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-600 text-[9px] font-mono font-bold text-zinc-500 hover:text-zinc-100 rounded-lg transition-all"
                                    >
                                        +{val}g
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* MÓDULO 02: TELEMETRIA RESIDUAL */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-black text-emerald-500 font-mono">[ 02 ]</span>
                                <h4 className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">Residual_Telemetry</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>

                            <div className="p-4 bg-zinc-900/20 border border-zinc-800/60 rounded-xl space-y-4">
                                <div className="flex justify-between items-end">
                                    <div>
                                        <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest mb-1">Massa_Líquida_Restante</p>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className={`text-2xl font-mono font-black ${erroSaldo ? 'text-rose-500' : 'text-zinc-100'}`}>
                                                {Math.round(pesoFinal)}
                                            </span>
                                            <span className="text-[9px] font-bold text-zinc-600 uppercase">g</span>
                                        </div>
                                    </div>
                                    
                                    {erroSaldo && (
                                        <div className="flex items-center gap-1.5 text-rose-500 animate-pulse mb-1">
                                            <AlertTriangle size={12} />
                                            <span className="text-[8px] font-black uppercase">Low_Storage_Error</span>
                                        </div>
                                    )}
                                </div>

                                <div className="h-1.5 w-full bg-zinc-950 rounded-full border border-zinc-800/50 overflow-hidden">
                                    <div className="h-full transition-all duration-700 ease-out"
                                        style={{ width: `${pctFinal}%`, backgroundColor: corFilamento, boxShadow: `0 0 10px ${corFilamento}40` }} 
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-zinc-950/50 flex gap-3">
                        <button onClick={aoFechar} className="flex-1 py-2.5 rounded-lg border border-zinc-800 text-[9px] font-black uppercase text-zinc-600 hover:text-white transition-all">Abort_Task</button>
                        <button
                            disabled={!inputValido || erroSaldo}
                            onClick={confirmar}
                            className={`flex-[2] py-2.5 rounded-lg text-[9px] font-black uppercase flex items-center justify-center gap-2 transition-all
                                ${(!inputValido || erroSaldo) ? 'bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800' : 'hover:brightness-110 active:scale-[0.98]'}`}
                            style={(!inputValido || erroSaldo) ? {} : {
                                backgroundColor: corFilamento,
                                color: textoEscuro ? '#ffffff' : '#050505',
                                boxShadow: `0 8px 20px -6px ${corFilamento}60`
                            }}
                        >
                            <History size={14} /> Commit_Asset_Reduction
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}