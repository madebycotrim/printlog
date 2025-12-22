// --- START OF FILE src/pages/notFound.jsx ---

import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import {
    Home, AlertTriangle, Terminal, ArrowLeft,
    RefreshCcw, AlertOctagon, Activity
} from 'lucide-react';

// --- VISUAL: TERMINAL DE G-CODE (Decoração) ---
const GCodeTerminal = () => {
    const [lines, setLines] = useState([
        "> G28 ; Homing all axes",
        "> G1 Z15.0 F9000 ; Move Z Axis up",
        "> M104 S205 ; Set Extruder Temp",
        "> ERROR: Layer shift detected at Z=14.2",
        "> ALERT: X-Axis coordinate mismatch",
        "> CRITICAL: 404_PAGE_NOT_FOUND_EXCEPTION",
        "> SYSTEM HALTED."
    ]);

    return (
        <div className="w-full max-w-sm mx-auto mt-6 mb-8 bg-black/50 border border-white/10 rounded-lg p-3 font-mono text-[10px] md:text-xs text-left shadow-2xl backdrop-blur-sm overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-rose-500/50 to-transparent opacity-50"></div>
            <div className="flex items-center gap-2 mb-2 border-b border-white/5 pb-2 text-zinc-500">
                <Terminal size={12} />
                <span className="uppercase tracking-wider">Console de Erro</span>
            </div>
            <div className="space-y-1 opacity-80">
                {lines.map((line, i) => (
                    <div key={i} className={`${line.includes('ERROR') || line.includes('CRITICAL') || line.includes('HALTED') ? 'text-rose-500 font-bold' : 'text-zinc-400'}`}>
                        <span className="opacity-50 mr-2">{(i + 100).toString()}:</span>
                        {line}
                    </div>
                ))}
                <div className="w-2 h-4 bg-rose-500 animate-pulse mt-1 inline-block align-middle"></div>
            </div>
        </div>
    );
};

// --- VISUAL: LAYER SHIFT ANIMADO ---
const LayerShiftVisual = () => {
    return (
        <div className="relative flex flex-col items-center justify-center opacity-90 scale-110 mb-4">
            {/* Camadas Corretas (Topo) */}
            <div className="w-24 h-3 bg-zinc-700/80 rounded-sm mb-1 shadow-sm"></div>
            <div className="w-24 h-3 bg-zinc-600/80 rounded-sm mb-1 shadow-sm"></div>

            {/* O ERRO (Layer Shift - Vibrando) */}
            <div className="relative group cursor-help">
                <div className="w-24 h-3 bg-rose-600 rounded-sm mb-1 translate-x-8 shadow-[0_0_20px_rgba(225,29,72,0.6)] animate-[glitch_2s_infinite]">
                    {/* Partículas caindo */}
                    <div className="absolute right-0 top-full w-1 h-2 bg-rose-500/50 blur-[1px] animate-pulse"></div>
                </div>
                {/* Tooltip on hover */}
                <div className="absolute -right-8 -top-8 bg-rose-950 text-rose-200 text-[9px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity border border-rose-500/30 whitespace-nowrap">
                    X-Axis Slip
                </div>
            </div>

            {/* Camadas Base (Espaguete) */}
            <div className="w-24 h-3 bg-zinc-800/60 rounded-sm mb-1 translate-x-1 blur-[0.5px]"></div>
            <div className="w-24 h-3 bg-zinc-800/40 rounded-sm mb-1 -translate-x-1 blur-[1px]"></div>
        </div>
    );
};

export default function NotFound() {
    const [, setLocation] = useLocation();

    // Função para voltar no histórico do navegador
    const handleGoBack = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-rose-500/30 overflow-hidden flex flex-col relative">

            {/* OVERLAY: SCANLINES (Efeito CRT) */}
            <div className="fixed inset-0 pointer-events-none z-50 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]"></div>
            <div className="fixed inset-0 pointer-events-none z-40 bg-gradient-to-b from-transparent via-rose-500/[0.02] to-transparent bg-[length:100%_4px]" style={{ backgroundSize: '100% 4px' }}></div>

            {/* BACKGROUND: GRID TÉCNICO */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div
                    className="absolute inset-0 opacity-[0.05]"
                    style={{
                        backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                        backgroundSize: '40px 40px',
                        maskImage: 'radial-gradient(circle at 50% 40%, black 20%, transparent 80%)'
                    }}
                />
                {/* Glow Central */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-600/10 blur-[100px] rounded-full animate-pulse-slow"></div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <main className="flex-grow flex items-center justify-center relative z-10 px-6 py-12">
                <div className="max-w-md w-full text-center animate-[fadeIn_0.8s_ease-out]">

                    {/* Badge de Erro Piscante */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/5 border border-rose-500/20 mb-8 backdrop-blur-md shadow-[0_0_15px_rgba(225,29,72,0.1)]">
                        <AlertOctagon size={14} className="text-rose-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-[0.2em]">
                            System Failure • 404
                        </span>
                    </div>

                    <LayerShiftVisual />

                    <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 mb-2 tracking-tighter drop-shadow-lg">
                        LAYER SHIFT
                    </h1>
                    <p className="text-rose-500/80 font-mono text-xs uppercase tracking-widest mb-6">
                        Coordenadas Perdidas
                    </p>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-6 max-w-xs mx-auto">
                        O bico tentou alcançar uma posição inexistente. O arquivo STL pode estar corrompido ou a URL foi alterada manualmente.
                    </p>

                    {/* Console Fake */}
                    <GCodeTerminal />

                    {/* Ações */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center w-full">
                        <button
                            onClick={handleGoBack}
                            className="h-11 px-6 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 font-medium text-sm hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all flex items-center justify-center gap-2 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar
                        </button>

                        <button
                            onClick={() => setLocation('/')}
                            className="h-11 px-6 rounded-lg bg-white text-black font-bold text-sm hover:bg-rose-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 uppercase tracking-wide group relative overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <Home size={16} className="group-hover:scale-110 transition-transform" />
                                Reiniciar Home
                            </span>
                            {/* Efeito de brilho no hover */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                        </button>
                    </div>

                    {/* Footer Técnico */}
                    <div className="mt-12 pt-6 border-t border-white/5 flex justify-between text-[10px] font-mono text-zinc-600 uppercase tracking-wider">
                        <div className="flex items-center gap-1">
                            <Activity size={10} /> Status: Halted
                        </div>
                        <div className="flex items-center gap-1">
                            Ref: 0x404_ERR
                        </div>
                        <div className="flex items-center gap-1">
                            <RefreshCcw size={10} /> Retry: Manual
                        </div>
                    </div>

                </div>
            </main>

            {/* --- FOOTER --- */}
            <footer className="py-4 border-t border-white/5 bg-[#050505]/80 backdrop-blur text-center z-10">
                <p className="text-[10px] text-zinc-700 font-bold uppercase tracking-[0.3em]">
                    PrintLog • Error Handler System
                </p>
            </footer>

            <style>{`
                @keyframes pulse-slow {
                    0%, 100% { opacity: 0.3; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.6; transform: translate(-50%, -50%) scale(1.05); }
                }
                @keyframes glitch {
                    0% { transform: translateX(2rem); }
                    2% { transform: translateX(2.1rem); }
                    4% { transform: translateX(1.9rem); }
                    6% { transform: translateX(2rem); }
                    90% { transform: translateX(2rem); }
                    92% { transform: translateX(1.8rem); }
                    94% { transform: translateX(2.2rem); }
                    100% { transform: translateX(2rem); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    100% { transform: translateX(100%); }
                }
                .animate-pulse-slow {
                    animation: pulse-slow 6s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
}