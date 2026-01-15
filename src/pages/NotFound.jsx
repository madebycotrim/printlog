import React, { useState } from 'react';
import { useLocation } from "wouter";
import {
    Home, AlertTriangle, Terminal, ArrowLeft,
    RefreshCcw, AlertOctagon, Activity
} from 'lucide-react';

// --- VISUAL: MONITOR DE ERRO (Console) ---
const GCodeTerminal = () => {
    const [lines] = useState([
        "> G28 ; Voltando ao início",
        "> G1 Z15.0 ; Subindo o bico",
        "> M104 S205 ; Aquecendo...",
        "> ERRO: A camada deslocou no eixo Z",
        "> ALERTA: Caminho não encontrado",
        "> CRÍTICO: PÁGINA_NÃO_EXISTE",
        "> IMPRESSÃO PARADA."
    ]);

    return (
        <div className="w-full max-w-sm mx-auto mt-6 mb-8 bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-[10px] md:text-xs text-left shadow-2xl backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-50"></div>
            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2 text-zinc-500">
                <Terminal size={12} />
                <span className="uppercase tracking-wider">Monitor de Erro</span>
            </div>
            <div className="space-y-1 opacity-80">
                {lines.map((line, i) => (
                    <div key={i} className={`${line.includes('ERRO') || line.includes('CRÍTICO') || line.includes('PARADA') ? 'text-rose-500 font-bold' : 'text-zinc-400'}`}>
                        <span className="opacity-50 mr-2">{(i + 100).toString()}:</span>
                        {line}
                    </div>
                ))}
                <div className="w-2 h-4 bg-rose-500 mt-1 inline-block align-middle"></div>
            </div>
        </div>
    );
};

// --- VISUAL: PEÇA COM DESLOCAMENTO ---
const LayerShiftVisual = () => {
    return (
        <div className="relative flex flex-col items-center justify-center opacity-90 scale-110 mb-4">
            <div className="w-24 h-3 bg-zinc-700/80 rounded-sm mb-1 shadow-sm"></div>
            <div className="w-24 h-3 bg-zinc-600/80 rounded-sm mb-1 shadow-sm"></div>

            <div className="relative group cursor-help">
                <div className="w-24 h-3 bg-rose-600 rounded-sm mb-1 translate-x-8 shadow-[0_0_20px_rgba(225,29,72,0.6)]">
                    <div className="absolute right-0 top-full w-1 h-2 bg-rose-500/50 blur-[1px]"></div>
                </div>
                <div className="absolute -right-8 -top-8 bg-rose-950 text-rose-200 text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 border border-rose-500/30 whitespace-nowrap">
                    O eixo falhou
                </div>
            </div>

            <div className="w-24 h-3 bg-zinc-800/60 rounded-sm mb-1 translate-x-1 blur-[0.5px]"></div>
            <div className="w-24 h-3 bg-zinc-800/40 rounded-sm mb-1 -translate-x-1 blur-[1px]"></div>
        </div>
    );
};

export default function NotFound() {
    const [, setLocation] = useLocation();

    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-rose-500/30 overflow-hidden flex flex-col relative">

            <div className="fixed inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>

            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(circle at 50% 40%, black 20%, transparent 80%)'
                    }}
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 blur-[100px] rounded-full-slow"></div>
            </div>

            <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-12">
                <div className="max-w-md w-full text-center">

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/5 border border-rose-500/20 mb-8 backdrop-blur-md">
                        <AlertOctagon size={14} className="text-rose-500" />
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">
                            Erro de Impressão • 404
                        </span>
                    </div>

                    <LayerShiftVisual />

                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter uppercase italic">
                        Deu Ruim.
                    </h1>
                    <p className="text-rose-500/80 font-mono text-xs uppercase tracking-widest mb-6">
                        Caminho Perdido
                    </p>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                        O bico tentou ir para um lugar que não existe. O link pode estar errado ou a página mudou de posição.
                    </p>

                    <GCodeTerminal />

                    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                        <button
                            onClick={handleGoBack}
                            className="h-12 px-6 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 flex items-center justify-center gap-2"
                        >
                            <ArrowLeft size={16} />
                            Voltar
                        </button>

                        <button
                            onClick={() => setLocation('/')}
                            className="h-12 px-6 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-widest hover:bg-rose-50 flex items-center justify-center gap-2"
                        >
                            <Home size={16} />
                            Voltar ao Início
                        </button>
                    </div>

                    <div className="mt-12 pt-6 border-t border-white/5 flex justify-between text-[9px] font-mono text-zinc-600 uppercase tracking-widest">
                        <div className="flex items-center gap-1">
                            <Activity size={10} /> Status: Parado
                        </div>
                        <div className="flex items-center gap-1">
                            Ref: ERRO_404
                        </div>
                        <div className="flex items-center gap-1">
                            <RefreshCcw size={10} /> Recalibrar: Manual
                        </div>
                    </div>

                </div>
            </main>

            <footer className="py-6 border-t border-white/5 bg-[#050505] text-center z-10">
                <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
                    PrintLog • Sistema de Erros
                </p>
            </footer>
        </div>
    );
}