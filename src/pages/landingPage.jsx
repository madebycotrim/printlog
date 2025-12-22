import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import {
    Calculator, Package, ArrowRight, Zap,
    ShoppingBag, AlertTriangle,
    TrendingUp, Clock, Activity,
    Wrench, History, Boxes,
    Coins, ShieldAlert, BarChart3,
    Check, MessageSquare, Database,
    ChevronLeft, Cpu, X, Settings2, Lock
} from 'lucide-react';
import logo from '../assets/logo-branca.png';

import CookieConsent from '../components/CookieConsent';

// --- COMPONENTES DE UI AUXILIARES ---

const Badge = ({ icon: Icon, label, color, className = "" }) => {
    const colors = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${colors[color] || colors.sky} backdrop-blur-md w-fit ${className}`}>
            {Icon && <Icon size={12} strokeWidth={3} />}
            <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{label}</span>
        </div>
    );
};

const GlassCard = ({ children, className = "" }) => (
    <div className={`bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-8 lg:p-10 overflow-hidden transition-all duration-700 hover:border-white/10 group ${className}`}>
        {children}
    </div>
);

const HeroVisual = () => (
    <div className="relative w-full h-[550px] flex items-center justify-center scale-90 lg:scale-100">

        {/* SVG DE CONEXÕES PONTILHADAS */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 500 500" fill="none">
            {/* Linha para o card Meu Lucro */}
            <path
                d="M120 120 L200 180"
                stroke="url(#gradient-sky)"
                strokeWidth="2"
                strokeDasharray="4 6"
                className="animate-dash-move opacity-30"
            />
            {/* Linha para o card Estoque Baixo */}
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

        {/* CARD: MEU LUCRO (Top Left) */}
        <div className="absolute top-12 left-0 xl:left-[-40px] z-30 bg-[#0c0c0e]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-[0_0_30px_rgba(16,185,129,0.1)] animate-float-slow">
            <div className="absolute inset-0 bg-emerald-500/5 rounded-2xl" />
            <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 bg-emerald-500/20 rounded-lg">
                        <TrendingUp size={14} className="text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Meu Lucro</span>
                </div>
                <div className="text-2xl font-black text-white italic tracking-tighter">+ R$ 2.450</div>
            </div>
        </div>

        {/* CARD PRINCIPAL: IMPRESSÃO ATIVA */}
        <div className="relative z-20 w-[360px] md:w-[400px] bg-[#0c0c0e] border border-sky-500/30 rounded-[3rem] p-10 shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">
            {/* Efeito de brilho interno no topo */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

            <div className="flex justify-between items-start mb-10">
                <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 rounded-full flex items-center gap-2 text-emerald-400 font-bold text-[10px] uppercase tracking-[0.2em] shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Ativa
                </div>
                <div className="bg-sky-500/10 p-3 rounded-2xl text-sky-500 border border-sky-500/20 shadow-inner">
                    <BarChart3 size={20} />
                </div>
            </div>

            <h4 className="text-white font-black text-3xl italic uppercase mb-10 tracking-tighter leading-none">
                Peça_Final<span className="text-sky-500">.gcode</span>
            </h4>

            <div className="space-y-5 mb-10">
                {[
                    { icon: Zap, label: "Energia", val: "R$ 12,30", color: "text-amber-500", bg: "bg-amber-500/10" },
                    { icon: Clock, label: "Bico", val: "R$ 2,15", color: "text-sky-500", bg: "bg-sky-500/10" },
                    { icon: ShieldAlert, label: "Falhas", val: "R$ 5,00", color: "text-rose-500", bg: "bg-rose-500/10" },
                ].map((item, i) => (
                    <div key={i} className="group flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className={`p-2 ${item.bg} rounded-xl group-hover:scale-110 transition-transform`}>
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
                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.3em]">Lucro Líquido</p>
                </div>
                <div className="text-5xl font-black text-white font-mono italic tracking-tighter leading-none flex items-baseline gap-1">
                    <span className="text-2xl text-zinc-600 not-italic mr-1">R$</span> 185<span className="text-xl opacity-30">,00</span>
                </div>
            </div>
        </div>

        {/* CARD: ESTOQUE BAIXO (Bottom Right) */}
        <div
            className="absolute bottom-10 right-0 xl:right-[-50px] z-30 w-72 bg-[#0c0c0e]/90 backdrop-blur-xl border border-rose-500/20 rounded-[2rem] p-6 shadow-2xl animate-float-slow"
            style={{ animationDelay: '2s' }}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-rose-500">
                    <div className="p-1.5 bg-rose-500/20 rounded-lg">
                        <Package size={14} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest">Estoque Crítico</span>
                </div>
                <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">12%</span>
            </div>
            <p className="text-xs font-black text-white uppercase italic mb-3 tracking-tight">PLA Silk Dourado</p>
            <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden p-[2px]">
                <div className="bg-gradient-to-r from-rose-600 to-rose-400 h-full w-[12%] rounded-full animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.5)]" />
            </div>
        </div>

        {/* GLOWS DE PROFUNDIDADE */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full -z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-500/5 blur-[80px] rounded-full -z-10" />
    </div>
);


export default function LandingPage() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-[#050506] text-zinc-100 font-sans selection:bg-sky-500/30 overflow-x-hidden relative">

            {/* EFEITO BLUEPRINT */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden min-h-[1500px]">
                <div className="absolute inset-0 opacity-[0.06]"
                    style={{
                        backgroundImage: 'linear-gradient(#0ea5e9 1px, transparent 1px), linear-gradient(90deg, #0ea5e9 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        maskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, transparent 100%)'
                    }}
                />
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[700px] bg-sky-500/10 blur-[160px] rounded-full" />
            </div>

            {/* NAV BAR */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050506]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src={logo} alt="PrintLog" className="w-8 h-8 object-contain" />
                        <span className="text-xl font-bold tracking-tighter uppercase italic text-white">PrintLog</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <button onClick={() => setLocation('/login')} className="hidden sm:block text-[10px] font-bold text-zinc-500 hover:text-white transition-all uppercase tracking-widest">Entrar</button>
                        <button onClick={() => setLocation('/register')} className="bg-white text-black px-7 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all active:scale-95">Criar Conta</button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION - Ajustada para prevenir sobreposição */}
            <section className="relative pt-44 pb-32 px-8 z-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 xl:gap-24 items-center">
                    <div className="space-y-12 text-center lg:text-left">
                        <div className="space-y-6">
                            <Badge icon={Boxes} label="Organização Maker" color="sky" />
                            <h1 className="text-5xl md:text-8xl lg:text-[75px] xl:text-[100px] font-black tracking-[-0.05em] leading-[0.8] text-white uppercase italic">
                                TRANSFORME <br />
                                <span className="text-sky-500">PLÁSTICO</span> <br />
                                EM LUCRO.
                            </h1>
                            <p className="text-xl text-zinc-500 max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed italic">
                                Chega de chutar o preço das suas peças. Calcule o custo real de cada impressão em segundos, do hobby à farm profissional.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
                            <button onClick={() => setLocation('/register')} className="h-16 px-10 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-xl shadow-sky-500/20">
                                Começar agora <ArrowRight size={18} strokeWidth={3} />
                            </button>
                            <button onClick={() => setLocation('/preview')} className="h-16 px-10 rounded-2xl bg-[#1a1a1c] border border-white/5 text-white font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-zinc-800 transition-all flex items-center justify-center gap-3">
                                <Calculator size={18} /> Calculadora rápida
                            </button>
                        </div>
                    </div>
                    {/* Visual agora em um container que empurra para a direita */}
                    <div className="hidden lg:block relative overflow-visible">
                        <HeroVisual />
                    </div>
                </div>
            </section>

            {/* RECURSOS */}
            <section className="py-24 px-8 max-w-7xl mx-auto z-10 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
                    <GlassCard className="lg:col-span-8">
                        <div className="space-y-6">
                            <Badge icon={Coins} label="Finanças" color="emerald" />
                            <h3 className="text-5xl font-black text-white tracking-tighter uppercase italic leading-none">Pare de cobrar no <span className="text-emerald-500">"olhômetro".</span></h3>
                            <p className="text-zinc-500 text-lg max-w-lg">Calculamos a luz, o desgaste do bico e até o custo daquela peça que deu errado.</p>
                        </div>
                        <div className="mt-12 grid grid-cols-3 gap-8 bg-black/40 p-8 rounded-[2rem] border border-white/5 font-bold uppercase italic">
                            <div><p className="text-[10px] text-zinc-600 mb-1">Energia</p><p className="text-2xl text-white">R$ 1,12/h</p></div>
                            <div className="border-l border-white/5 pl-8"><p className="text-[10px] text-zinc-600 mb-1">Desgaste</p><p className="text-2xl text-white">R$ 0,15/h</p></div>
                            <div className="border-l border-white/5 pl-8"><p className="text-[10px] text-emerald-500 mb-1">Sugerido</p><p className="text-3xl text-emerald-400">R$ 145,90</p></div>
                        </div>
                    </GlassCard>

                    <GlassCard className="lg:col-span-4 flex flex-col justify-between">
                        <div className="space-y-4">
                            <Badge icon={Database} label="Materiais" color="sky" />
                            <h3 className="text-2xl font-bold uppercase italic leading-tight">Meus <br /> Filamentos.</h3>
                            <p className="text-zinc-500 text-sm font-medium italic">Saiba quanto resta antes do carretel acabar.</p>
                        </div>
                        <div className="space-y-3 mt-8">
                            {[
                                { name: "PLA Silk Ouro", weight: "820g", color: "bg-amber-500", p: 82 },
                                { name: "PETG Preto", weight: "110g", color: "bg-rose-500", p: 11, alert: true },
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                    <div className="flex justify-between items-center mb-2 font-bold text-[9px] uppercase">
                                        <span className="text-zinc-400">{item.name}</span>
                                        <span className={item.alert ? "text-rose-500 animate-pulse" : "text-white"}>{item.weight}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                        <div className={`h-full ${item.color}`} style={{ width: `${item.p}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>

                    <GlassCard className="lg:col-span-12 flex flex-col md:flex-row items-center gap-12">
                        <div className="flex-1 space-y-6">
                            <Badge icon={MessageSquare} label="Orçamentos" color="emerald" />
                            <h3 className="text-5xl font-black text-white uppercase italic leading-[0.9] tracking-tighter">Envie o preço direto <br /> no <span className="text-emerald-500">WhatsApp.</span></h3>
                            <p className="text-zinc-500 text-lg max-w-sm italic">Gere um orçamento profissional em segundos e mande para o seu cliente.</p>
                        </div>
                        <div className="w-full max-w-[380px] bg-[#0c0c0e] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <div className="flex justify-between items-center p-5 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400"><Cpu size={18} /></div>
                                    <p className="text-[10px] font-bold text-white uppercase leading-none">PrintLog<br /><span className="text-sky-500 text-[8px]">Assistente</span></p>
                                </div>
                            </div>
                            <div className="p-6 space-y-4 bg-[#0a0a0c]">
                                <div className="p-5 bg-[#0c0c0e] rounded-xl border border-white/5 font-mono text-[10px] space-y-3 text-zinc-300">
                                    <p className="text-zinc-500">*ORÇAMENTO*</p>
                                    <p>*Peça:* Samurai V2</p>
                                    <p>*Investimento:* <span className="text-emerald-400 font-bold">R$ 180,00</span></p>
                                </div>
                                <button className="w-full bg-emerald-500 hover:bg-emerald-400 py-3.5 rounded-xl text-black font-bold text-[10px] uppercase transition-all">Copiar e Enviar</button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* PERDAS */}
            <section className="py-32 bg-[#050506] border-y border-white/5 relative z-10 text-center">
                <div className="max-w-7xl mx-auto px-8">
                    <Badge label="Evite Prejuízos" color="rose" icon={ShieldAlert} className="mx-auto" />
                    <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase italic mt-8 mb-24">PARA ONDE ESTÁ <br /><span className="text-rose-500">INDO SEU DINHEIRO?</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                        {[
                            { title: 'Impressão Falhou', icon: AlertTriangle, desc: 'Cálculo automático de perdas de material e tempo.' },
                            { title: 'Manutenção', icon: Wrench, desc: 'Fundo de reserva para bicos, correias e peças.' },
                            { title: 'Taxas de Venda', icon: ShoppingBag, desc: 'Lucro real após descontar taxas de marketplaces.' },
                            { title: 'Máquina Parada', icon: History, desc: 'Saiba o custo de oportunidade da sua impressora.' }
                        ].map((item, i) => (
                            <div key={i} className="p-10 rounded-[2.5rem] bg-[#0a0a0c] border border-white/5 hover:border-rose-500/20 transition-all">
                                <item.icon size={28} className="text-rose-500 mb-8" />
                                <h4 className="text-xl font-bold text-white uppercase mb-3 italic tracking-tighter">{item.title}</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-40 px-8 relative z-10 text-center">
                <div className="max-w-4xl mx-auto space-y-14">
                    <Badge label="Hora de crescer" color="sky" icon={Zap} />
                    <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.85] uppercase italic">MENOS CHUTE. <br /><span className="text-zinc-800">MAIS LUCRO.</span></h2>
                    <button onClick={() => setLocation('/register')} className="h-20 px-14 rounded-[2.5rem] bg-white text-black text-[13px] font-bold uppercase tracking-widest hover:bg-sky-500 hover:text-white transition-all shadow-2xl flex items-center gap-4 active:scale-95 group mx-auto">
                        Começar agora <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
                    </button>
                </div>
            </section>

            <footer className="py-20 border-t border-white/5 bg-[#050506] relative z-10">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-12">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="PrintLog" className="w-6 h-6 opacity-90" />
                        <span className="text-sm font-bold uppercase italic text-white">PrintLog</span>
                    </div>
                    <div className="text-[10px] font-bold text-zinc-700 uppercase">© 2026 PrintLog</div>
                </div>
            </footer>

            {/* SISTEMA DE COOKIES */}
            <CookieConsent />
        </div>
    );
}