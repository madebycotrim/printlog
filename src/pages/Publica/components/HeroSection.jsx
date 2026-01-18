import React from 'react';
import { useLocation } from "wouter";
import {
    ArrowRight, Zap, Calculator,
    TrendingUp, BarChart3, Clock, ShieldAlert,
    Package
} from 'lucide-react';

const HeroVisual = () => (
    <div className="relative w-full h-[550px] flex items-center justify-center scale-90 lg:scale-100">

        {/* CONEXÕES TÉCNICAS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 500 500" fill="none">
            <path
                d="M120 120 L200 180"
                stroke="url(#gradient-sky)"
                strokeWidth="2"
                strokeDasharray="4 6"
                className="animate-dash-move opacity-30"
            />
            <path
                d="M380 320 L300 380"
                stroke="url(#gradient-rose)"
                strokeWidth="2"
                strokeDasharray="4 6"
                className="animate-dash-move opacity-30"
            />
            <defs>
                <linearGradient id="gradient-sky" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0ea5e9" />
                    <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
                <linearGradient id="gradient-rose" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#0ea5e9" />
                </linearGradient>
            </defs>
        </svg>

        {/* CARD: LUCRO REAL */}
        <div className="absolute top-12 left-0 xl:left-[-40px] z-30 bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-float">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl" />
            <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-emerald-500/20 rounded-lg">
                        <TrendingUp size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Lucro Real</span>
                </div>
                <div className="text-2xl font-black text-white italic tracking-tighter">+ R$ 2.450</div>
            </div>
        </div>

        {/* CARD CENTRAL: MONITORAMENTO DE IMPRESSÃO */}
        <div className="relative z-20 w-[360px] md:w-[400px] bg-[#0c0c0e] border border-sky-500/30 rounded-[3rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

            <div className="flex justify-between items-start mb-10">
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Imprimindo
                </div>
                <div className="bg-sky-500/10 p-3 rounded-2xl text-sky-500 border border-sky-500/20 shadow-inner">
                    <BarChart3 size={20} />
                </div>
            </div>

            <h4 className="text-white font-black text-3xl italic uppercase mb-10 tracking-tighter leading-none">
                Peça_Final<span className="text-sky-500 animate-pulse">.gcode</span>
            </h4>

            <div className="space-y-5 mb-10">
                {[
                    { icon: Zap, label: "Gasto de Energia", val: "R$ 3,45", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { icon: Clock, label: "Depreciação/Manut.", val: "R$ 1,80", color: "text-sky-500", bg: "bg-sky-500/10" },
                    { icon: ShieldAlert, label: "Reserva para Falhas", val: "R$ 2,50", color: "text-rose-500", bg: "bg-rose-500/10" },
                ].map((item, i) => (
                    <div key={i} className="group flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 ${item.bg} rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                                <item.icon size={16} className={item.color} />
                            </div>
                            <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">{item.label}</span>
                        </div>
                        <span className="text-white font-mono font-bold text-sm">{item.val}</span>
                    </div>
                ))}
            </div>

            <div className="pt-8 border-t border-white/5 relative">
                <div className="flex items-center gap-2 mb-2">
                    <div className="h-1 w-1 rounded-full bg-emerald-500" />
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Dinheiro limpo por peça</p>
                </div>
                <div className="text-5xl font-black text-white font-mono italic tracking-tighter leading-none flex items-baseline gap-1">
                    <span className="text-2xl text-zinc-600 not-italic mr-1">R$</span> 85<span className="text-xl opacity-30">,00</span>
                </div>
            </div>
        </div>

        {/* CARD: FILAMENTO ACABANDO */}
        <div
            className="absolute bottom-10 right-0 xl:right-[-50px] z-30 w-72 bg-[#0c0c0e]/90 backdrop-blur-xl border border-rose-500/20 rounded-[2rem] p-6 shadow-2xl animate-float-delayed"
            style={{ animationDelay: '2s' }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-rose-500">
                    <div className="p-1.5 bg-rose-500/20 rounded-lg">
                        <Package size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Rolo no fim</span>
                </div>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">12%</span>
            </div>
            <p className="text-xs font-black text-white uppercase italic mb-3 tracking-tight">PLA Silk Dourado (1kg)</p>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden p-[2px]">
                <div className="bg-gradient-to-r from-rose-600 to-rose-400 h-full w-[12%] rounded-full shadow-[0_0_12px_rgba(244,63,94,0.5)]" />
            </div>
        </div>

        {/* EFEITOS DE PROFUNDIDADE */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full -z-10" />
    </div>
);

export default function HeroSection() {
    const [, setLocation] = useLocation();

    return (
        <section className="relative pt-32 sm:pt-44 pb-20 sm:pb-32 px-6 sm:px-8 z-10 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 xl:gap-24 items-center">
                <div className="space-y-8 sm:space-y-12 text-center lg:text-left">
                    <div className="space-y-6">
                        <div className="flex justify-center lg:justify-start">
                            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/30 bg-sky-500/10 backdrop-blur-md mb-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                                </span>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-sky-400">Beta Público Liberado</span>
                            </div>
                        </div>
                        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[75px] xl:text-[90px] font-black tracking-[-0.05em] leading-[0.9] text-white uppercase italic">
                            TRANSFORME <br />
                            <span className="text-sky-500">FILAMENTO</span> <br />
                            EM LUCRO.
                        </h1>
                        <p className="text-lg sm:text-xl text-zinc-500 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed italic">
                            Pare de precificar no olhômetro. Use o PrintLog <strong className="text-white">gratuitamente durante o Beta</strong> e profissionalize sua impressão 3D hoje mesmo.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start w-full sm:w-auto">
                        <button onClick={() => setLocation('/register')} className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl shadow-sky-500/20 w-full sm:w-auto transition-all hover:scale-105 active:scale-95">
                            Acessar Beta Grátis <ArrowRight size={18} strokeWidth={3} />
                        </button>
                        <button onClick={() => {
                            const el = document.getElementById('pricing');
                            el && el.scrollIntoView({ behavior: 'smooth' });
                        }} className="h-14 sm:h-16 px-8 sm:px-10 rounded-2xl bg-[#1a1a1c]/50 border border-white/5 text-white font-bold text-[10px] sm:text-[11px] uppercase tracking-[0.2em] hover:bg-white/10 flex items-center justify-center gap-3 w-full sm:w-auto backdrop-blur-md transition-all">
                            <Calculator size={18} /> Ver Planos
                        </button>
                    </div>
                </div>

                {/* Hero Visual - Agora visível em mobile mas simplificado/ajustado */}
                <div className="relative overflow-visible scale-[0.85] sm:scale-100 lg:translate-x-0">
                    <HeroVisual />
                </div>
            </div>
        </section>
    );
}
