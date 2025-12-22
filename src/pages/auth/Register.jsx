import React, { useState } from 'react';
import { useLocation } from "wouter";
import {
    User, Mail, Lock, ArrowLeft, Github, Chrome, Check, Package,
    PieChart, AlertTriangle, Database, CheckCircle2,
    TrendingUp, ShieldCheck, X // Adicionado X para fechar o modal
} from 'lucide-react';
import logo from '../../assets/logo-branca.png';

import { TERMS_CONTENT, PRIVACY_CONTENT } from '../../constants/legalContent';

// --- COMPONENTES DE UI ---

const Badge = ({ icon: Icon, label, color = "sky" }) => {
    const variants = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
        rose: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    };
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${variants[color]} backdrop-blur-md w-fit`}>
            {Icon && <Icon size={10} strokeWidth={3} />}
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
        </div>
    );
};

const PrimaryButton = ({ children, onClick, icon: Icon, variant = "primary", className = "", disabled, type = "button" }) => {
    const styles = {
        primary: "bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5",
        sky: "bg-sky-600 text-white hover:bg-sky-500 shadow-xl shadow-sky-900/20",
        outline: "bg-transparent border border-white/10 text-white hover:bg-white/5",
    };
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`h-14 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
        >
            {children}
            {Icon && <Icon size={18} strokeWidth={2.5} />}
        </button>
    );
};

// Componente Modal Reutilizável
const Modal = ({ title, isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[#0c0c0e] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">
                <div className="p-8 border-b border-white/5 flex justify-between items-center">
                    <h3 className="text-xl font-black uppercase tracking-tighter text-white">{title}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>
                <div className="p-8 overflow-y-auto custom-scrollbar text-zinc-400 text-sm leading-relaxed space-y-4 font-medium">
                    {children}
                </div>
                <div className="p-6 border-t border-white/5 bg-zinc-900/20">
                    <button onClick={onClose} className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-[11px] rounded-2xl hover:bg-zinc-200 transition-all">
                        Entendi e concordo
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- WIDGETS DE PREVIEW (LADO DIREITO) ---

const InventoryWidget = () => (
    <div className="w-80 bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-all duration-700">
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <Badge label="Estoque Inteligente" color="sky" icon={Database} />
                <h4 className="text-white font-bold text-lg mt-2 tracking-tight">Insumos em Tempo Real</h4>
            </div>
            <div className="bg-sky-500/10 p-3 rounded-2xl text-sky-500 border border-sky-500/20">
                <Package size={20} />
            </div>
        </div>

        <div className="space-y-5">
            {[
                { name: 'PLA Silk Gold', weight: '820g', color: 'bg-amber-400', percent: 'w-[82%]' },
                { name: 'PETG Black CF', weight: '120g', color: 'bg-rose-500', percent: 'w-[12%]', alert: true },
            ].map((item, i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                        <span className="text-zinc-500 flex items-center gap-2">
                            {item.alert && <AlertTriangle size={12} className="text-rose-500 animate-pulse" />}
                            {item.name}
                        </span>
                        <span className={item.alert ? "text-rose-500" : "text-white"}>{item.weight}</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div className={`h-full ${item.percent} ${item.color} rounded-full shadow-[0_0_8px_rgba(255,255,255,0.1)]`} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const ProfitWidget = () => (
    <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-6 shadow-2xl animate-float-slow ml-auto -mt-12 mr-[-30px] relative z-20 w-60">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20">
                <TrendingUp size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-500">Lucro Médio</span>
                <span className="text-[11px] font-bold text-white">Por Impressão</span>
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white font-mono tracking-tighter">64</span>
            <span className="text-xl font-black text-white/50 font-mono">%</span>
            <span className="ml-auto text-[10px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded">Alta</span>
        </div>
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [activeModal, setActiveModal] = useState(null); // Estado para controlar popups
    const [, setLocation] = useLocation();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!termsAccepted) return;
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setLocation('/dashboard');
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#050506] text-zinc-100 font-sans flex overflow-hidden">

            {/* LADO ESQUERDO: FORMULÁRIO */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 w-full lg:w-1/2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-500/5 blur-[120px] pointer-events-none" />

                <div className="absolute top-10 left-10">
                    <button onClick={() => setLocation('/')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all group">
                        <div className="p-2 rounded-xl border border-white/5 bg-zinc-900 group-hover:border-white/20 group-hover:scale-110 transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        Voltar para Início
                    </button>
                </div>

                <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="space-y-4 text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <img src={logo} alt="PrintLog" className="w-10 h-10" />
                            <span className="text-xl font-black tracking-tighter uppercase text-white">PrintLog</span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] text-white">
                                COMECE A <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600 italic">LUCRAR REAL.</span>
                            </h2>
                            <p className="text-zinc-500 text-sm font-medium">Junte-se a centenas de makers que profissionalizaram sua gestão.</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 group-focus-within:text-sky-500 transition-colors">Nome do Maker / Farm</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-sky-500 transition-colors" size={18} />
                                <input type="text" required className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all font-medium text-white placeholder:text-zinc-800" placeholder="Ex: Oficina do Vader" />
                            </div>
                        </div>

                        <div className="space-y-2 group">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 group-focus-within:text-sky-500 transition-colors">E-mail Profissional</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-sky-500 transition-colors" size={18} />
                                <input type="email" required className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all font-medium text-white placeholder:text-zinc-800" placeholder="seu@email.com" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 group-focus-within:text-sky-500 transition-colors">Senha</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-sky-500 transition-colors" size={18} />
                                    <input type="password" required className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all font-medium text-white placeholder:text-zinc-800" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 group-focus-within:text-sky-500 transition-colors">Confirmar</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-sky-500 transition-colors" size={18} />
                                    <input type="password" required className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all font-medium text-white placeholder:text-zinc-800" placeholder="••••••••" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="relative flex items-center shrink-0 mt-0.5">
                                    <input
                                        type="checkbox"
                                        className="peer appearance-none w-5 h-5 rounded-lg border border-white/10 bg-zinc-900 checked:bg-sky-600 checked:border-sky-600 transition-all cursor-pointer"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                    />
                                    <Check size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={4} />
                                </div>

                                <span className="text-[11px] text-zinc-500 leading-relaxed group-hover:text-zinc-400 transition-colors font-medium">
                                    Estou de acordo com os{' '}
                                    <button type="button" onClick={() => setActiveModal('terms')} className="text-sky-500 hover:text-sky-400 underline underline-offset-4 transition-colors font-bold italic">Termos de Uso</button>
                                    {' '}e a{' '}
                                    <button type="button" onClick={() => setActiveModal('privacy')} className="text-sky-500 hover:text-sky-400 underline underline-offset-4 transition-colors font-bold italic">Política de Privacidade</button> para profissionalizar minha gestão.
                                </span>
                            </label>
                        </div>

                        <PrimaryButton type="submit" variant="sky" className="w-full h-16 mt-4" disabled={isLoading || !termsAccepted}>
                            {isLoading ? "Criando seu império..." : "Criar minha conta grátis"}
                        </PrimaryButton>
                    </form>

                    <div className="space-y-6">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 border-t border-white/5" />
                            <span className="relative bg-[#050506] px-4 text-[9px] font-black uppercase tracking-[0.4em] text-zinc-700">Ou continue com</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-white">
                                <Chrome size={18} /> Google
                            </button>
                            <button className="flex items-center justify-center gap-3 h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest text-white">
                                <Github size={18} /> GitHub
                            </button>
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-zinc-500 text-xs font-medium">
                                Já profissionalizou sua farm?{' '}
                                <button onClick={() => setLocation('/login')} className="text-white font-black uppercase tracking-widest text-[10px] hover:text-sky-400 transition-colors ml-2 underline underline-offset-8">
                                    Fazer Login
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* LADO DIREITO: VISUAL */}
            <div className="hidden lg:flex flex-1 bg-[#09090b] border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[120px] rounded-full animate-pulse-slow" />

                <div className="relative z-10 space-y-0">
                    <div className="translate-x-[-20px]"><InventoryWidget /></div>
                    <ProfitWidget />

                    <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-max text-center space-y-4">
                        <div className="flex items-center justify-center gap-8">
                            <div className="flex items-center gap-2 text-zinc-500 shrink-0">
                                <ShieldCheck size={16} className="text-sky-500 shrink-0" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Dados Criptografados</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500 shrink-0">
                                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap">Sincronia Nuvem</span>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium max-w-[320px] mx-auto leading-relaxed shrink-0">
                            Acesse seu estoque, ordens de serviço e precificação de qualquer lugar do mundo.
                        </p>
                    </div>
                </div>
            </div>

            {/* MODAIS (DENTRO DO COMPONENTE) */}
            <Modal title="Termos de Uso" isOpen={activeModal === 'terms'} onClose={() => setActiveModal(null)}>
                {TERMS_CONTENT}
            </Modal>

            <Modal title="Privacidade & Segurança" isOpen={activeModal === 'privacy'} onClose={() => setActiveModal(null)}>
                {PRIVACY_CONTENT}
            </Modal>

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(1deg); }
                }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
            `}</style>
        </div>
    );
}