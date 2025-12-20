// --- START OF FILE src/pages/landingPage.jsx ---

import React from 'react';
import { useLocation } from "wouter";
import {
    Calculator, Package, ArrowRight, Zap,
    CheckCircle2, Store,
    Printer, Coins, ShoppingBag, AlertTriangle, TrendingUp,
    Share2, Clock, Heart, Layers, Cpu, Globe, ShieldCheck,
    AlertCircle, Activity, Box, Smartphone
} from 'lucide-react';
import logo from '../assets/logo-branca.png';

// --- UTILITÁRIOS VISUAIS ---

const GlassCard = ({ children, className = "", noHover = false }) => (
    <div className={`relative bg-[#0e0e12]/60 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden group transition-all duration-500 ${!noHover && "hover:border-sky-500/20 hover:bg-[#0e0e12]/80 hover:shadow-2xl hover:shadow-sky-500/5"} ${className}`}>
        {/* Glow Hover Effect */}
        {!noHover && (
            <div className="absolute -inset-px bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        )}
        <div className="relative z-10 h-full p-6 flex flex-col">
            {children}
        </div>
    </div>
);

const Badge = ({ icon: Icon, label, color }) => {
    const colors = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
    };
    return (
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${colors[color]} w-fit transition-transform group-hover:scale-105`}>
            {Icon && <Icon size={10} />}
            <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
        </div>
    );
};

// --- HERO VISUAL: O FLUXO CONECTADO ---
const SystemFlowVisual = () => {
    return (
        <div className="relative w-full h-full min-h-[550px] flex items-center justify-center perspective-1000">

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>

            {/* --- 1. CARD CENTRAL: VENDAS (O Início) --- */}
            <div className="relative z-20 w-80 bg-[#09090b] border border-zinc-800 rounded-2xl p-5 shadow-2xl transform rotate-y-6 rotate-x-2 transition-transform duration-500 hover:rotate-0 hover:scale-105 group">
                {/* Cabeçalho */}
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                            <Box size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] font-bold text-zinc-500 uppercase block tracking-wider">Novo Pedido #402</span>
                            <span className="text-xs font-bold text-white">IronMan_Mark85_Bust.stl</span>
                        </div>
                    </div>
                </div>

                {/* Corpo Financeiro */}
                <div className="space-y-3">
                    <div className="flex justify-between text-xs text-zinc-400">
                        <span>Preço Venda</span>
                        <span className="text-white font-mono font-bold">R$ 350,00</span>
                    </div>

                    {/* Taxas (Destaque amigável) */}
                    <div className="bg-rose-500/5 border border-rose-500/10 rounded-lg p-2 space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-rose-400">
                            <span className="flex items-center gap-1"><Store size={10} /> Taxa Marketplace</span>
                            <span className="font-mono">-R$ 38,50</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-rose-400">
                            <span className="flex items-center gap-1"><Zap size={10} /> Energia (K1 Max)</span>
                            <span className="font-mono">-R$ 18,20</span>
                        </div>
                    </div>

                    <div className="h-px bg-zinc-800 my-2"></div>

                    <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Lucro Líquido</span>
                        <div className="text-right">
                            <span className="text-xl font-bold text-white font-mono block leading-none">+R$ 182,40</span>
                            <span className="text-[9px] text-zinc-500">Margem real: 52%</span>
                        </div>
                    </div>
                </div>

                {/* Botão Fake */}
                <div className="mt-4 h-10 bg-emerald-600/20 border border-emerald-500/30 rounded-lg flex items-center justify-center text-xs font-bold text-emerald-400 uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                    <CheckCircle2 size={14} className="mr-2" /> Lucro Confirmado
                </div>
            </div>

            {/* --- 2. CARD FLUTUANTE: ESTOQUE (Consequência) --- */}
            <div className="absolute top-12 -right-6 z-10 w-64 bg-[#0e0e11] border border-zinc-800 rounded-xl p-3 shadow-xl animate-float-slow" style={{ animationDelay: '1s' }}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Package size={14} className="text-sky-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Baixa Automática</span>
                    </div>
                    <span className="text-[9px] font-mono text-rose-400 bg-rose-500/10 px-1 rounded">-420g</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-2 border-zinc-700 flex items-center justify-center relative bg-zinc-800">
                        {/* Spool Icon */}
                        <div className="absolute inset-0 border-2 border-sky-500 rounded-full border-t-transparent -rotate-45"></div>
                    </div>
                    <div className="flex-1">
                        <div className="text-xs font-bold text-white">PLA Silk Gold <span className="text-zinc-600 font-normal">| Voolt3D</span></div>
                        <div className="flex justify-between items-center mt-1">
                            <div className="w-[70%] bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-sky-500 w-[20%] h-full"></div>
                            </div>
                            <span className="text-[8px] text-red-400 font-bold animate-pulse">Rest: 80g</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- 3. CARD FLUTUANTE: MÁQUINA (Consequência) --- */}
            <div className="absolute bottom-16 -left-10 z-30 w-56 bg-[#0e0e11] border border-zinc-800 rounded-xl p-3 shadow-xl animate-float-slow" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/5">
                    <div className="flex items-center gap-2">
                        <Printer size={14} className="text-indigo-500" />
                        <span className="text-[10px] font-bold text-zinc-400 uppercase">Farm Status</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1 rounded">Online</span>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Bambu P1S (01)
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-300">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Ender 3 V3 (02)
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></div> K1 Max (03) - <span className="text-amber-500 font-bold">Manutenção</span>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default function LandingPage() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-sky-500/30 overflow-x-hidden">

            {/* BACKGROUND: MESA DE IMPRESSÃO (BLUEPRINT) */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[#050505]">
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
                        backgroundSize: '50px 50px',
                        maskImage: 'radial-gradient(circle at 50% 0%, black 40%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(circle at 50% 0%, black 40%, transparent 100%)'
                    }}
                />
                {/* Glows Ambientais */}
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[60%] h-[500px] bg-sky-500/5 blur-[120px] rounded-full"></div>
                <div className="absolute bottom-0 right-0 w-[40%] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full"></div>
            </div>

            {/* --- NAVBAR --- */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo(0, 0)}>
                        <img src={logo} alt="PrintLog" className="w-8 h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" />
                        <span className="text-sm font-bold tracking-tight text-white">PrintLog</span>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={() => setLocation('/login')} className="hidden sm:block text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wide">
                            Login
                        </button>
                        <button onClick={() => setLocation('/register')} className="bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded-lg text-xs font-bold transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_25px_rgba(255,255,255,0.2)] uppercase tracking-wide flex items-center gap-2">
                            Criar Conta <ArrowRight size={12} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <section className="relative pt-32 pb-10 px-6 z-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Texto Amigável */}
                    <div className="space-y-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 backdrop-blur-sm hover:border-sky-500/30 transition-colors cursor-default">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
                            </span>
                            <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                                Versão 2.0 • Para Hobbyists & Farms Profissionais
                            </span>
                        </div>

                        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95] text-white">
                            Menos planilha.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-white to-emerald-400">
                                Mais impressão que dá lucro.
                            </span>
                        </h1>

                        <p className="text-lg text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            Chega de anotar custo em caderno ou planilha bagunçada.
                            Calcule custos reais, acompanhe o estoque de filamento
                            e veja o lucro de cada impressão — em centavos, não no achismo.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
                            <button onClick={() => setLocation('/register')} className="h-12 px-8 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm transition-all shadow-lg shadow-sky-900/20 flex items-center justify-center gap-2 group uppercase tracking-wide hover:scale-105">
                                Começar Grátis <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button onClick={() => setLocation('/calculadoraFree')} className="h-12 px-8 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-bold text-sm hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 uppercase tracking-wide hover:border-zinc-600">
                                <Calculator size={16} className="text-zinc-500" /> Testar Calculadora
                            </button>
                        </div>

                        <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-x-6 gap-y-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            <span className="flex items-center gap-1"><CheckCircle2 size={12} className="text-emerald-500" /> Adeus Excel</span>
                            <span className="flex items-center gap-1"><Heart size={12} className="text-rose-500" /> Feito por Makers</span>
                            <span className="flex items-center gap-1"><ShieldCheck size={12} className="text-sky-500" /> Backup na Nuvem</span>
                        </div>
                    </div>

                    {/* Visual */}
                    <div className="hidden lg:block scale-90 xl:scale-100">
                        <SystemFlowVisual />
                    </div>
                </div>
            </section>

            {/*
                <section className="py-8 border-y border-white/5 bg-[#08080a] relative z-10 overflow-hidden">
                    <div className="max-w-7xl mx-auto px-6 text-center">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">
                        Compatível com seu Workflow
                        </p>

                        <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-lg font-black text-white flex items-center gap-2">
                            <Layers size={20} /> Cura
                        </span>

                        <span className="text-lg font-black text-white flex items-center gap-2">
                            <Box size={20} /> PrusaSlicer
                        </span>

                        <span className="text-lg font-black text-green-500 flex items-center gap-2">
                            <Cpu size={20} /> Bambu Studio
                        </span>

                        <span className="text-lg font-black text-blue-500 flex items-center gap-2">
                            <Globe size={20} /> OrcaSlicer
                        </span>
                        </div>
                    </div>
                </section>
            */}



            {/* --- BENTO GRID COMPACTO --- */}
            <section className="py-12 px-6 max-w-7xl mx-auto z-10 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* 1. CALCULADORA (Precificação Real) */}
                    <GlassCard className="lg:col-span-2 group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                <ShoppingBag size={20} />
                            </div>
                            <Badge label="Precificação" color="emerald" />
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-white leading-tight">
                                Preço sem achismo
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1">
                                Nada de “vezes 3”. O cálculo considera consumo real de energia,
                                desgaste da máquina e margem de falha — para o lucro sobrar no fim.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                            <div className="flex-1 space-y-1.5">
                                <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800">
                                    <span className="text-[11px] text-zinc-400 flex items-center gap-2">
                                        <Zap size={12} className="text-yellow-500" /> Energia (26h)
                                    </span>
                                    <span className="text-[11px] text-white font-mono">R$ 14,20</span>
                                </div>
                                <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800">
                                    <span className="text-[11px] text-zinc-400 flex items-center gap-2">
                                        <AlertTriangle size={12} className="text-rose-500" /> Falhas estimadas
                                    </span>
                                    <span className="text-[11px] text-white font-mono">R$ 5,50</span>
                                </div>
                                <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800">
                                    <span className="text-[11px] text-zinc-400 flex items-center gap-2">
                                        <Clock size={12} className="text-indigo-500" /> Hora/máquina
                                    </span>
                                    <span className="text-[11px] text-white font-mono">R$ 15,00</span>
                                </div>
                            </div>

                            <div className="flex-none w-full sm:w-48 bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                                <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                                    Preço saudável
                                </span>
                                <div className="text-3xl font-bold text-white font-mono tracking-tighter my-1">
                                    R$ 129,90
                                </div>
                                <span className="text-[9px] text-emerald-300 bg-emerald-500/20 px-2 rounded-full font-bold">
                                    Lucro real: R$ 52,00
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 2. ESTOQUE */}
                    <GlassCard className="lg:col-span-1 group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2.5 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20">
                                <Package size={20} />
                            </div>
                            <Badge label="Filamento" color="sky" />
                        </div>

                        <div className="mb-3">
                            <h3 className="text-lg font-bold text-white leading-tight">
                                Esse rolo aguenta?
                            </h3>
                            <p className="text-xs text-zinc-400 mt-1">
                                Nada pior que faltar filamento no final da impressão.
                                Veja exatamente quanto resta em cada carretel.
                            </p>
                        </div>

                        <div className="mt-auto space-y-2">
                            <div className="bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-800">
                                <div className="flex justify-between text-[9px] font-bold uppercase text-zinc-500 mb-1">
                                    <span>PETG Preto</span>
                                    <span className="text-white">120g restantes</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-800 mb-1.5">
                                    <div className="h-full bg-rose-500 w-[15%]" />
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <AlertCircle size={10} className="text-rose-500" />
                                    <span className="text-[9px] text-rose-400 font-mono">
                                        Não aguenta esse job
                                    </span>
                                </div>
                            </div>

                            <div className="bg-sky-500/5 border border-sky-500/10 p-2 rounded-lg flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-sky-500 shrink-0">
                                    <Package size={12} />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-[9px] font-bold text-white truncate">
                                        Sugestão automática
                                    </p>
                                    <p className="text-[8px] text-zinc-500 truncate">
                                        PLA Preto • Rolo cheio (1000g)
                                    </p>
                                </div>
                                <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 rounded">
                                    OK
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 3. MANUTENÇÃO PREVENTIVA (Melhorado) */}
                    <GlassCard className="lg:col-span-1 group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                                <Activity size={18} />
                            </div>
                            <Badge label="Preventiva" color="purple" />
                        </div>

                        <h3 className="text-base font-bold text-white mb-1">
                            Saúde da Máquina
                        </h3>
                        <p className="text-[11px] text-zinc-400 mb-3 leading-snug">
                            Não espere quebrar. O sistema avisa a hora exata de lubrificar eixos ou trocar peças.
                        </p>

                        <div className="mt-auto bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 space-y-3">
                            {/* Cabeçalho da Impressora */}
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-white">Bambu P1S</span>
                                </div>
                                <span className="text-[9px] font-mono text-indigo-300 bg-indigo-500/10 px-1.5 rounded border border-indigo-500/20">
                                    642h Totais
                                </span>
                            </div>

                            {/* Item 1: Crítico (Nozzle) */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[9px]">
                                    <span className="text-zinc-400 font-bold uppercase">Nozzle (Uso c/ Carbon)</span>
                                    <span className="text-amber-500 font-bold">Troca Rec.</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 w-[95%] shadow-[0_0_8px_rgba(245,158,11,0.4)]"></div>
                                </div>
                            </div>

                            {/* Item 2: Saudável (Lubrificação) */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[9px]">
                                    <span className="text-zinc-500 font-bold uppercase">Lubrificação Eixos</span>
                                    <span className="text-emerald-500 font-bold">OK</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
                                    <div className="h-full bg-zinc-800 w-[40%]"></div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* 4. WHATSAPP */}
                    <GlassCard
                        className="lg:col-span-1 group cursor-pointer hover:bg-zinc-900/60"
                        onClick={() => setLocation('/calculadoraFree')}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                                <Smartphone size={18} />
                            </div>
                        </div>

                        <h3 className="text-base font-bold text-white mb-1">
                            Orçamento pronto pro WhatsApp
                        </h3>
                        <p className="text-[11px] text-zinc-400 mb-3 leading-snug">
                            Gere um resumo claro com preço, material e foto
                            e envie pro cliente em um clique.
                        </p>

                        <div className="mt-auto bg-[#050505] border border-zinc-800 rounded-lg p-2.5">
                            <div className="bg-[#005c4b]/30 border border-emerald-500/20 rounded p-2 mb-2">
                                <div className="space-y-0.5 text-[9px] text-zinc-300 font-mono">
                                    <p>📦 <strong className="text-white">1x BabyYoda.stl</strong></p>
                                    <p>✨ Mat: <span className="text-white">PLA Silk</span></p>
                                    <p>💰 Total: <strong className="text-emerald-400">R$ 145,00</strong></p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-2 w-full py-1.5 rounded bg-emerald-600 text-white text-[9px] font-bold uppercase shadow-lg shadow-emerald-900/20">
                                <Share2 size={10} /> Enviar orçamento
                            </div>
                        </div>
                    </GlassCard>

                    {/* 5. ROI / PAYBACK (Focado em Saldo Restante) */}
                    <GlassCard className="lg:col-span-1 group">
                        <div className="flex items-center justify-between mb-3">
                            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                                <TrendingUp size={18} />
                            </div>
                            <Badge label="Investimento" color="purple" />
                        </div>

                        <h3 className="text-base font-bold text-white mb-1">
                            Payback do Equipamento
                        </h3>
                        <p className="text-[11px] text-zinc-400 mb-3 leading-snug">
                            Acompanhe o retorno financeiro. Saiba exatamente quanto falta para sua impressora virar lucro puro.
                        </p>

                        <div className="mt-auto bg-zinc-900/50 p-3 rounded-lg border border-zinc-800 space-y-2">
                            {/* Header: Nome + Valores Recuperados */}
                            <div className="flex justify-between items-end">
                                <span className="text-[10px] font-bold text-white uppercase mb-0.5">
                                    Creality K1 Max
                                </span>
                                <div className="text-right">
                                    <span className="text-[9px] text-zinc-500 block uppercase tracking-wide">Recuperado</span>
                                    <span className="text-[11px] font-mono font-bold text-purple-400">
                                        R$ 2.890
                                        <span className="text-zinc-600 font-normal text-[9px]"> / R$ 3.599</span>
                                    </span>
                                </div>
                            </div>

                            {/* Barra de Progresso */}
                            <div className="relative h-2 w-full bg-zinc-950 rounded-full overflow-hidden">
                                <div className="absolute inset-0 bg-zinc-800/50"></div>
                                <div className="h-full bg-gradient-to-r from-purple-600 to-purple-400 w-[80%] shadow-[0_0_10px_rgba(168,85,247,0.4)] relative"></div>
                            </div>

                            {/* Footer: Saldo Restante */}
                            <div className="flex justify-between items-center pt-1 border-t border-white/5 mt-1">
                                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider">
                                    80% Concluído
                                </span>
                                <span className="text-[9px] font-mono text-zinc-400">
                                    Faltam: <span className="text-white font-bold">R$ 709,00</span>
                                </span>
                            </div>
                        </div>
                    </GlassCard>

                </div>
            </section>


            {/* --- CUSTOS INVISÍVEIS --- */}
            <section className="py-24 bg-[#09090b] border-y border-white/5 relative z-10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="mb-12 text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-4">
                            <AlertTriangle size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                                O erro mais comum
                            </span>
                        </div>

                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Você está pagando para trabalhar?
                        </h2>

                        <p className="text-zinc-400 max-w-xl text-lg">
                            A maioria dos prejuízos na impressão 3D não vem do preço baixo,
                            mas dos custos esquecidos. Aqui entram os gastos que o slicer ignora —
                            e que fazem a diferença no fim do mês.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        {/* Item 1 */}
                        <div className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-rose-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-rose-500 group-hover:scale-110 transition-transform shadow-inner">
                                <Box size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Falhas e “spaghetti”
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Todo maker já acordou com uma “peruca” na mesa.
                                    Sem prever uma margem de falha, cada erro vira prejuízo direto
                                    — pago do seu próprio bolso.
                                </p>
                            </div>
                        </div>

                        {/* Item 2 */}
                        <div className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-amber-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-inner">
                                <Zap size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    A conta de luz de verdade
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Impressões longas com mesa aquecida consomem mais do que parece.
                                    O custo real vem do consumo da sua máquina em Watts,
                                    não de estimativas genéricas.
                                </p>
                            </div>
                        </div>

                        {/* Item 3 */}
                        <div className="flex flex-col gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 transition-colors group">
                            <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-indigo-500 group-hover:scale-110 transition-transform shadow-inner">
                                <Coins size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">
                                    Desgaste da máquina
                                </h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    Correias gastam, bicos entopem, hotends morrem.
                                    Cada hora de impressão precisa pagar alguns centavos
                                    da manutenção futura da sua farm.
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </section>


            {/* --- CTA FINAL --- */}
            <section className="py-24 px-6 relative overflow-hidden text-center">
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Transforme sua impressão 3D em lucro.
                    </h2>

                    <p className="text-zinc-400 mb-10 text-lg">
                        Pare de decidir preço no instinto.
                        Tenha controle real de custos, estoque e margem
                        e saiba exatamente quanto cada impressão está rendendo.
                    </p>

                    <button
                        onClick={() => setLocation('/register')}
                        className="h-14 px-10 rounded-xl bg-white text-black text-sm font-bold uppercase tracking-wide hover:scale-105 transition-transform shadow-2xl shadow-sky-500/20 flex items-center justify-center gap-3 mx-auto"
                    >
                        Começar agora (é grátis) <ArrowRight size={18} />
                    </button>

                    <p className="mt-6 text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
                        Sem cartão de crédito • Acesso imediato
                    </p>
                </div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="py-8 border-t border-white/5 bg-[#050505] text-center">
                <div className="flex justify-center items-center gap-2 mb-2 opacity-50">
                    <img src={logo} alt="LayerForge" className="w-4 h-4" />
                    <span className="text-xs font-bold text-zinc-400">PrintLog</span>
                </div>
                <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
                    &copy; 2024 • Feito por Makers, para Makers
                </p>
            </footer>

            <style>{`
                .perspective-1000 { perspective: 1000px; }
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-12px); }
                }
                .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
            `}</style>
        </div >
    );
}