import React, { useState } from 'react';
import { useLocation } from "wouter";
import {
    Calculator, Package, ArrowRight, Zap,
    CheckCircle2, ShoppingBag, AlertTriangle,
    TrendingUp, Clock, Activity, Smartphone,
    Wrench, History, Boxes,
    Coins, ShieldAlert, Heart
} from 'lucide-react';
import logo from '../assets/logo-branca.png';

// --- UTILITÁRIOS VISUAIS ---

const diagnosticStyles = {
    rose: { bg: "bg-rose-500/10", border: "border-rose-500/20", text: "text-rose-500" },
    amber: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-500" },
    zinc: { bg: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-zinc-500" },
    sky: { bg: "bg-sky-500/10", border: "border-sky-500/20", text: "text-sky-500" },
};

const GlassCard = ({ children, className = "", noHover = false }) => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

    return (
        <div
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`relative bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/5 rounded-[2.5rem] overflow-hidden transition-all duration-500 ${!noHover && "hover:border-sky-500/30 hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.15)]"} ${className}`}
        >
            {!noHover && (
                <div
                    className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-500"
                    style={{
                        background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(14, 165, 233, 0.1), transparent 40%)`,
                        opacity: isHovered ? 1 : 0
                    }}
                />
            )}
            <div className="relative z-10 h-full p-8 flex flex-col">
                {children}
            </div>
        </div>
    );
};

const Badge = ({ icon: Icon, label, color }) => {
    const colors = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
        purple: "text-purple-400 bg-purple-500/10 border-purple-500/20",
        zinc: "text-zinc-400 bg-zinc-500/10 border-zinc-500/20",
    };
    return (
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${colors[color]} backdrop-blur-md w-fit`}>
            {Icon && <Icon size={12} strokeWidth={2.5} />}
            <span className="text-[10px] font-black uppercase tracking-[0.1em]">{label}</span>
        </div>
    );
};

// --- COMPONENTES DE SEÇÃO ---

const SystemFlowVisual = () => {
    return (
        <div className="relative w-full h-full min-h-[600px] flex items-center justify-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-600/10 rounded-full blur-[120px] animate-pulse"></div>

            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 400 400" fill="none">
                <path d="M 160 180 Q 100 150 60 80" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-40">
                    <animate attributeName="stroke-dashoffset" from="20" to="0" dur="2s" repeatCount="indefinite" />
                </path>
                <path d="M 240 250 Q 300 280 340 330" stroke="url(#lineGradient)" strokeWidth="1.5" strokeDasharray="4 4" className="opacity-40">
                    <animate attributeName="stroke-dashoffset" from="0" to="20" dur="2s" repeatCount="indefinite" />
                </path>
                <defs>
                    <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0" />
                        <stop offset="50%" stopColor="#0ea5e9" stopOpacity="1" />
                        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {/* CARD CENTRAL */}
            <div className="relative z-20 w-80 bg-[#0c0c0e] border border-white/10 rounded-[2.5rem] p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.9)] transform hover:scale-[1.02] transition-all duration-700 ease-out group">
                <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Pedido em Produção</span>
                        <h4 className="text-white font-bold text-lg leading-tight tracking-tight">Capacete Samurai</h4>
                    </div>
                    <div className="bg-sky-500/10 p-2.5 rounded-2xl text-sky-500 border border-sky-500/20">
                        <ShoppingBag size={20} />
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 space-y-3">
                        <div className="flex justify-between items-center text-[11px] text-zinc-500 uppercase font-bold tracking-wider">
                            <span className="flex items-center gap-2"><Zap size={12} className="text-amber-500" /> Energia</span>
                            <span className="text-rose-400">- R$ 22,40</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px] text-zinc-500 uppercase font-bold tracking-wider">
                            <span className="flex items-center gap-2"><History size={12} className="text-sky-500" /> Manutenção</span>
                            <span className="text-rose-400">- R$ 14,00</span>
                        </div>
                    </div>
                    <div className="pt-2 flex justify-between items-end">
                        <div className="space-y-0.5">
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block">Lucro Líquido</span>
                            <span className="text-2xl font-black text-white font-mono tracking-tighter">R$ 297,00</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* CARD 1: LUCRO BRUTO (TOP-LEFT) */}
            <div className="absolute top-4 left-0 z-30 w-48 bg-[#0e0e11]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-float-slow">
                <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={14} className="text-emerald-500" />
                    <span className="text-[9px] font-black text-zinc-500 uppercase">Faturamento Mês</span>
                </div>
                <div className="text-xl font-black text-white tracking-tight">R$ 4.280,00</div>
            </div>

            {/* CARD 2: FILAMENTO (BOTTOM-RIGHT) */}
            <div className="absolute bottom-4 right-0 z-30 w-52 bg-[#0e0e11]/90 backdrop-blur-xl border border-rose-500/20 rounded-2xl p-4 shadow-2xl animate-float-slow" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2 text-rose-500 mb-2">
                    <AlertTriangle size={14} />
                    <span className="text-[9px] font-black uppercase">Estoque Crítico</span>
                </div>
                <p className="text-[11px] font-bold text-white leading-tight">PLA Silk Red - Voolt3D</p>
                <div className="mt-3 space-y-1.5">
                    <div className="h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="bg-rose-500 h-full w-[15%] shadow-[0_0_8px_#f43f5e]"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function LandingPage() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-[#050506] text-zinc-100 font-sans selection:bg-sky-500/30 overflow-x-hidden">
            {/* BACKGROUND */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at 50% 0%, black 40%, transparent 100%)' }} />
                <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70%] h-[600px] bg-sky-900/10 blur-[120px] rounded-full animate-pulse-slow"></div>
            </div>

            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#050506]/60 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <img src={logo} alt="PrintLog" className="w-9 h-9" />
                        <span className="text-lg font-black tracking-tighter text-white uppercase">PrintLog</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <button onClick={() => setLocation('/login')} className="hidden sm:block text-xs font-black text-zinc-400 hover:text-white transition-colors uppercase tracking-[0.2em]">Entrar</button>
                        <button onClick={() => setLocation('/register')} className="bg-white text-black px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">Criar Conta</button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative pt-44 pb-20 px-8 z-10 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-10 text-center lg:text-left">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 justify-center lg:justify-start">
                                <Badge icon={Boxes} label="Setup em 2 minutos" color="sky" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest hidden sm:block">• Pensado por Makers</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.04em] leading-[0.85] text-white">
                                Menos planilha.<br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30">Mais lucro real.</span>
                            </h1>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xl text-zinc-400 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
                                Veja o lucro real de cada impressão, do material à manutenção, antes mesmo de apertar o play.
                            </p>
                            <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">
                                Do hobbyista ao dono de farm profissional.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
                            <button onClick={() => setLocation('/register')} className="h-16 px-10 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-black text-sm transition-all shadow-xl flex items-center justify-center gap-3 uppercase tracking-widest">
                                Começar agora <ArrowRight size={20} strokeWidth={3} />
                            </button>
                            <button onClick={() => setLocation('/preview')} className="h-16 px-10 rounded-2xl bg-zinc-900 border border-white/10 text-white font-black text-sm hover:bg-zinc-800 transition-all flex items-center justify-center gap-3 uppercase tracking-widest">
                                <Calculator size={20} /> Calculadora
                            </button>
                        </div>
                    </div>
                    <div className="hidden lg:block">
                        <SystemFlowVisual />
                    </div>
                </div>
            </section>

            {/* FEATURES GRID */}
            <section className="py-24 px-8 max-w-7xl mx-auto z-10 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
                    {/* CARD 1: FINANÇAS */}
                    <GlassCard className="md:col-span-12 lg:col-span-8 group min-h-[450px] flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                            <div className="space-y-4">
                                <Badge icon={Coins} label="Inteligência Financeira" color="emerald" />
                                <h3 className="text-4xl font-black text-white tracking-tighter leading-none">
                                    Pare de cobrar no <br /> <span className="text-emerald-500 italic">"olhômetro".</span>
                                </h3>
                                <p className="text-zinc-400 max-w-md text-lg leading-relaxed font-medium">
                                    O PrintLog calcula o que o seu Excel esquece: depreciação de bico, falhas de impressão e impostos de venda.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-6 mt-12 bg-black/20 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                            <div className="flex-1 grid grid-cols-1 gap-4">
                                {[
                                    { label: 'Custo kWh Real', val: 'R$ 1,02', icon: Zap, color: 'text-amber-400' },
                                    { label: 'Depreciação Nozzle/H', val: 'R$ 0,15', icon: Clock, color: 'text-sky-400' },
                                    { label: 'Taxa de Falha Estimada', val: '8%', icon: AlertTriangle, color: 'text-rose-400' }
                                ].map((item, i) => (
                                    <div key={i} className="flex justify-between items-center">
                                        <span className="flex items-center gap-3 text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
                                            <item.icon size={16} className={item.color} /> {item.label}
                                        </span>
                                        <span className="text-white font-mono font-bold">{item.val}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="w-px bg-white/5 hidden sm:block"></div>
                            <div className="flex-none flex flex-col justify-center items-center text-center px-4">
                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em]">Sugestão de Venda</span>
                                <div className="text-5xl font-black text-white font-mono tracking-tighter my-1">R$ 129<span className="text-2xl opacity-50">,90</span></div>
                                <div className="mt-2 text-[10px] text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full font-black uppercase border border-emerald-500/20">Lucro Real: R$ 52,00</div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* CARD 2: INSUMOS */}
                    <GlassCard className="md:col-span-6 lg:col-span-4 group flex flex-col">
                        <div className="space-y-4">
                            <Badge icon={Package} label="Gestão de Insumos" color="sky" />
                            <h3 className="text-2xl font-black text-white tracking-tight leading-tight">Sincronia real <br /> com o carretel.</h3>
                            <p className="text-zinc-500 text-sm font-medium leading-relaxed">Receba alertas de estoque antes do filamento acabar no meio de um print de 40 horas.</p>
                        </div>
                        <div className="mt-auto pt-8">
                            <div className="bg-zinc-900/80 border border-white/10 rounded-3xl p-5">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-black text-white uppercase">PLA Silk Gold</span>
                                    <div className="text-rose-500 font-black text-xs animate-pulse">CRÍTICO</div>
                                </div>
                                <div className="relative h-4 w-full bg-zinc-950 rounded-full overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-r from-rose-600 to-rose-400 w-[15%]"></div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>

                    {/* CARD 3: SAÚDE */}
                    <GlassCard className="md:col-span-6 lg:col-span-4 group">
                        <Badge icon={Activity} label="Health Check" color="purple" />
                        <h3 className="text-2xl font-black text-white tracking-tight mt-6 mb-4">Saúde da Máquina <br /> em tempo real.</h3>
                        <div className="space-y-6">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                <div className="flex justify-between text-[10px] font-black uppercase text-zinc-400 mb-3">
                                    <span>Troca de Nozzle Sugerida</span>
                                    <span className="text-purple-400">82% Rodado</span>
                                </div>
                                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                                    <div className="h-full bg-purple-600 w-[82%]"></div>
                                </div>
                            </div>
                            <p className="text-zinc-500 text-xs font-medium">Preveja manutenções antes que a máquina pare e você perca o prazo do cliente.</p>
                        </div>
                    </GlassCard>

                    {/* CARD 4: ORÇAMENTOS */}
                    <GlassCard className="md:col-span-12 lg:col-span-8 group">
                        <div className="flex flex-col md:flex-row gap-10 items-center h-full">
                            <div className="flex-1 space-y-6">
                                <Badge icon={Smartphone} label="Smart Sales" color="emerald" />
                                <h2 className="text-4xl font-black text-white tracking-tighter leading-none">Orçamentos que <br /><span className="text-emerald-500">fecham vendas.</span></h2>
                                <p className="text-zinc-400 text-lg font-medium leading-relaxed">Gere propostas profissionais em segundos e envie direto no WhatsApp do cliente.</p>
                            </div>
                            <div className="w-full md:w-80 relative bg-[#0b141a] rounded-[2rem] border border-white/10 p-4">
                                <div className="bg-[#202c33] rounded-2xl p-3 space-y-2 text-[11px] text-white/90">
                                    <p className="text-emerald-400 font-black">PROPOSTA #BR-882</p>
                                    <p>📦 <b>Yoda High Poly</b></p>
                                    <p>💰 <b>R$ 145,00</b></p>
                                    <div className="w-full py-2 bg-emerald-600 rounded-lg text-center font-black uppercase">Ver Proposta</div>
                                </div>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            </section>

            {/* DIAGNÓSTICO DO PREJUÍZO */}
            <section className="py-32 bg-[#050506] border-y border-white/5 relative z-10">
                <div className="max-w-[1400px] mx-auto px-8">
                    <div className="max-w-3xl mx-auto text-center mb-24 space-y-6">
                        <Badge label="Auditoria de Perdas" color="rose" icon={ShieldAlert} />
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-[0.9] uppercase">
                            Sua farm está <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-rose-600 italic">vazando dinheiro?</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: 'Falhas Ocultas', impact: '- R$ 42,00/mês avg.', desc: 'Peças que soltam com 90% custam mais que plástico. Elas roubam horas e vida útil do hardware.', icon: AlertTriangle, color: 'rose' },
                            { title: 'Fundo de Reserva', impact: 'Preveja R$ 0,85/h', desc: 'Se seu preço não prevê a próxima correia ou ventoinha, você está operando em prejuízo silencioso.', icon: Wrench, color: 'sky' },
                            { title: 'Marketplaces', impact: 'Até 20% de Taxa', desc: 'Calculamos o lucro real para Shopee e Mercado Livre. Pare de pagar para trabalhar.', icon: ShoppingBag, color: 'amber' },
                            { title: 'Carga Tributária', impact: 'DAS + Impostos', desc: 'Vender sem prever a guia do MEI ou o imposto da nota fiscal destrói seu caixa. Tenha previsibilidade.', icon: Coins, color: 'zinc' }
                        ].map((item, i) => (
                            <div key={i} className="p-8 rounded-[2rem] bg-[#0a0a0c] border border-white/5 transition-all hover:border-rose-500/30">
                                <div className={`p-3 rounded-xl w-fit mb-6 ${diagnosticStyles[item.color].bg} border ${diagnosticStyles[item.color].border} ${diagnosticStyles[item.color].text}`}>
                                    <item.icon size={24} />
                                </div>
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block mb-1">Impacto Estimado</span>
                                <span className="text-xs font-mono font-bold text-white bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20 inline-block mb-4">{item.impact}</span>
                                <h4 className="text-xl font-black text-white uppercase leading-tight mb-2">{item.title}</h4>
                                <p className="text-zinc-500 font-medium text-xs leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA FINAL */}
            <section className="py-32 px-8 relative z-10">
                <div className="max-w-4xl mx-auto text-center space-y-8">
                    <Badge label="A hora é agora" color="sky" icon={Zap} />
                    <h2 className="text-5xl md:text-6xl font-bold text-white tracking-tight leading-tight">
                        Descubra para onde seu <br />
                        <span className="text-zinc-500">dinheiro está indo.</span>
                    </h2>
                    <p className="text-lg text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                        Pare de perder margem sem perceber. Junte-se a centenas de makers que profissionalizaram sua gestão e viram o lucro real subir.
                    </p>
                    <div className="pt-4 flex flex-col items-center gap-6">
                        <button onClick={() => setLocation('/register')} className="h-16 px-10 rounded-2xl bg-white text-black text-sm font-black uppercase tracking-widest hover:bg-zinc-200 transition-all shadow-xl flex items-center gap-3">
                            Calcular meu lucro real agora <ArrowRight size={18} />
                        </button>
                        <div className="flex items-center gap-6 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                            <span className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /> Grátis para até 2 máquinas</span>
                            <span className="flex items-center gap-2"><Heart size={14} className="text-rose-500" /> Criado para quem já perdeu dinheiro com erros invisíveis</span>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="py-16 border-t border-white/5 bg-[#050506] relative z-10">
                <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all">
                        <img src={logo} alt="PrintLog" className="w-6 h-6" />
                        <span className="text-sm font-black tracking-tighter text-white uppercase">PrintLog</span>
                    </div>
                    <div className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.3em]">&copy; 2026 • Feito por Makers para Makers</div>
                </div>
            </footer>
        </div>
    );
}