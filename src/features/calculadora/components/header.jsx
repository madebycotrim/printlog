// src/features/calculadora/components/Header.jsx
import React from "react";
import { Printer, History, Settings2, ChevronDown } from "lucide-react";

export default function Header({
    nomeProjeto,
    setNomeProjeto,
    printers = [],
    selectedPrinterId,
    onCyclePrinter,
    onOpenHistory,
    onOpenSettings,
    needsConfig = false,
    hud
}) {
    // Localiza a impressora selecionada no array de hardware
    const impressoraAtual = printers.find(p => p.id === selectedPrinterId);
    
    // Define o nome de exibição (Fallback para quando não há hardware ou está offline)
    const nomeExibicaoHardware = impressoraAtual?.name || (printers.length > 0 ? "Selecionar Hardware" : "Offline");
    
    // Normaliza o valor da potência (Watts) aceitando 'power' ou 'potencia' do DB
    const potenciaHardware = Number(impressoraAtual?.power || impressoraAtual?.potencia || 0);

    return (
        <header className="h-20 px-10 flex items-center justify-between z-40 relative border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md shrink-0 gap-4">

            {/* LADO ESQUERDO: IDENTIFICAÇÃO COM INPUT ADAPTÁVEL */}
            <div className="flex flex-col min-w-[200px] max-w-xl group">
                <h1 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 leading-none mb-1.5 transition-colors group-focus-within:text-sky-500">
                    Cálculo de Produção
                </h1>
                
                {/* CONTAINER DO INPUT ADAPTÁVEL (Auto-ajuste de largura) */}
                <div className="relative inline-grid items-center">
                    {/* Elemento espelho invisível que dita o tamanho do container baseada no texto */}
                    <span className="invisible whitespace-pre text-xl font-bold px-0 uppercase tracking-tight">
                        {nomeProjeto || "NOME DO PROJETO..."}
                    </span>
                    
                    {/* Input real posicionado sobre o espelho */}
                    <input
                        value={nomeProjeto}
                        onChange={(e) => setNomeProjeto(e.target.value)}
                        placeholder="NOME DO PROJETO..."
                        className="absolute inset-0 bg-transparent uppercase border-none outline-none text-xl font-bold text-zinc-100 tracking-tight focus:text-sky-400 transition-colors placeholder:text-zinc-800 w-full"
                    />
                </div>
            </div>

            {/* CENTRO: O HUD (Heads-Up Display) Flutuante */}
            <div className="flex-1 flex justify-center px-4">
                {hud}
            </div>

            {/* LADO DIREITO: SELEÇÃO DE HARDWARE E ATALHOS */}
            <div className="flex items-center gap-6 shrink-0">

                <button 
                    type="button"
                    onClick={onCyclePrinter}
                    className="group relative flex items-center gap-3 pl-3 pr-4 py-1.5 bg-zinc-900/40 border border-zinc-800 hover:border-zinc-600 rounded-2xl transition-all duration-300 active:scale-[0.98]"
                >
                    <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-950 border border-zinc-800 group-hover:border-zinc-700 transition-colors shadow-inner">
                        <Printer size={15} className={`${impressoraAtual ? 'text-sky-400' : 'text-zinc-600'} transition-colors`} />
                        {impressoraAtual && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                        )}
                    </div>

                    <div className="flex flex-col items-start min-w-[120px] max-w-[180px]">
                        <div className="flex items-center gap-2 leading-none mb-1">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Hardware</span>
                            {impressoraAtual && potenciaHardware > 0 && (
                                <span className="flex items-center gap-0.5 text-[8px] font-mono font-bold text-emerald-500/80 bg-emerald-500/5 px-1 rounded border border-emerald-500/10">
                                    {potenciaHardware}W
                                </span>
                            )}
                        </div>
                        <span className="text-xs font-bold text-zinc-200 uppercase tracking-tight truncate w-full text-left">
                            {nomeExibicaoHardware}
                        </span>
                    </div>

                    <div className="pl-2 border-l border-zinc-800 group-hover:border-zinc-700">
                        <ChevronDown size={14} className="text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                    </div>
                </button>

                <div className="h-8 w-px bg-zinc-800/60" />

                <div className="flex bg-zinc-900/50 border border-zinc-800/50 p-1 rounded-xl backdrop-blur-sm">
                    <button
                        type="button"
                        onClick={onOpenSettings}
                        title="Configurações da Oficina"
                        className={`p-2 rounded-lg transition-all ${needsConfig ? 'text-amber-500 bg-amber-500/10 animate-pulse' : 'text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800'}`}
                    >
                        <Settings2 size={16} />
                    </button>
                    <button
                        type="button"
                        onClick={onOpenHistory}
                        title="Histórico de Orçamentos"
                        className="p-2 rounded-lg text-zinc-500 hover:text-sky-400 hover:bg-zinc-800 transition-all"
                    >
                        <History size={16} />
                    </button>
                </div>
            </div>
        </header>
    );
}