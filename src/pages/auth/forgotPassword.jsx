import React, { useState } from 'react';
import { useLocation } from "wouter";
import { 
  Mail, ArrowLeft, CheckCircle2, ShieldCheck, Cloud, 
  Lock, KeyRound, Fingerprint, Server, ShieldAlert, 
  RefreshCcw, LayoutDashboard, Send
} from 'lucide-react';
import logo from '../../assets/logo-branca.png';

// --- COMPONENTES DE UI (PADRONIZADOS) ---

const Badge = ({ icon: Icon, label, color = "sky" }) => {
    const variants = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${variants[color]} backdrop-blur-md w-fit`}>
            {Icon && <Icon size={10} strokeWidth={3} />}
            <span className="text-[9px] font-black uppercase tracking-[0.15em]">{label}</span>
        </div>
    );
};

const PrimaryButton = ({ children, onClick, icon: Icon, variant = "sky", className = "", disabled, type = "button", isLoading }) => {
    const styles = {
        sky: "bg-sky-600 text-white hover:bg-sky-500 shadow-xl shadow-sky-900/20",
        white: "bg-white text-black hover:bg-zinc-200 shadow-xl shadow-white/5",
        outline: "bg-transparent border border-white/10 text-white hover:bg-white/5",
    };
    return (
        <button 
            type={type}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={`h-16 px-8 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
        >
            {isLoading ? "Processando..." : children}
            {!isLoading && (Icon ? <Icon size={18} strokeWidth={2.5} /> : <Send size={18} strokeWidth={2.5} />)}
        </button>
    );
};

// --- WIDGETS DE PREVIEW (LADO DIREITO) ---

const SecurityWidget = () => (
    <div className="w-80 bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] transition-all duration-700">
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <Badge label="Proteção de Dados" color="emerald" icon={ShieldCheck} />
                <h4 className="text-white font-bold text-lg mt-2 tracking-tight">Recuperação Segura</h4>
            </div>
            <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500 border border-emerald-500/20">
                <Fingerprint size={20} />
            </div>
        </div>

        <div className="space-y-3">
            {[
                { label: 'Criptografia', status: 'AES-256', icon: Lock },
                { label: 'Cloud Sync', status: 'Ativo', icon: RefreshCcw }
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <item.icon size={14} className="text-zinc-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">{item.status}</span>
                </div>
            ))}
        </div>
    </div>
);

const CloudWidget = () => (
    <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-sky-500/20 rounded-[2rem] p-6 shadow-2xl animate-float-slow ml-auto -mt-12 mr-[-30px] relative z-20 w-64">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 border border-sky-500/20">
                <Server size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-sky-500">Backup</span>
                <span className="text-[11px] font-bold text-white">Redundância Ativa</span>
            </div>
        </div>
        <p className="text-[10px] text-zinc-500 font-medium leading-relaxed">Sua farm nunca para. Seus dados estão protegidos em múltiplos datacenters.</p>
    </div>
);

// --- COMPONENTE PRINCIPAL ---

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [email, setEmail] = useState("");
    const [, setLocation] = useLocation();

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setIsSent(true);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#050506] text-zinc-100 font-sans flex overflow-hidden">
            
            {/* LADO ESQUERDO: FORMULÁRIO */}
            <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 w-full lg:w-1/2">
                {/* Glow de fundo */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-500/5 blur-[120px] pointer-events-none" />

                <div className="absolute top-10 left-10">
                    <button onClick={() => setLocation('/login')} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-all group">
                        <div className="p-2 rounded-xl border border-white/5 bg-zinc-900 group-hover:border-white/20 group-hover:scale-110 transition-all">
                            <ArrowLeft size={14} />
                        </div>
                        Voltar para Login
                    </button>
                </div>

                <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                    <div className="space-y-4 text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <img src={logo} alt="PrintLog" className="w-10 h-10" />
                            <span className="text-xl font-black tracking-tighter uppercase text-white">PrintLog</span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.9] text-white uppercase">
                                {isSent ? "E-MAIL" : "RECUPERE SEU"} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-sky-600 italic">
                                    {isSent ? "ENVIADO." : "ACESSO."}
                                </span>
                            </h2>
                            <p className="text-zinc-500 text-sm font-medium">
                                {isSent 
                                    ? `As instruções de segurança foram enviadas para ${email}.` 
                                    : "Não se preocupe! Insira seu e-mail e enviaremos um link de recuperação."}
                            </p>
                        </div>
                    </div>

                    {!isSent ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2 group">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 group-focus-within:text-sky-500 transition-colors">E-mail Cadastrado</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-sky-500 transition-colors" size={18} />
                                    <input 
                                        type="email" 
                                        required 
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/5 transition-all font-medium text-white placeholder:text-zinc-800" 
                                        placeholder="seu@email.com" 
                                    />
                                </div>
                            </div>

                            <PrimaryButton type="submit" variant="sky" className="w-full h-16 mt-4" isLoading={isLoading} icon={KeyRound}>
                                Enviar Link Seguro
                            </PrimaryButton>
                        </form>
                    ) : (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                            <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-[2rem] flex items-start gap-4">
                                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-black text-white uppercase tracking-tight">Verifique sua caixa de entrada</p>
                                    <p className="text-xs text-zinc-500 leading-relaxed font-medium">O link de recuperação expira em 30 minutos por motivos de segurança.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                                <PrimaryButton variant="outline" className="w-full" onClick={() => setIsSent(false)}>
                                    Tentar outro e-mail
                                </PrimaryButton>
                                <button onClick={() => setLocation('/login')} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors">
                                    Voltar ao Login
                                </button>
                            </div>
                        </div>
                    )}

                    {!isSent && (
                        <div className="text-center pt-4">
                            <p className="text-zinc-500 text-xs font-medium">
                                Lembrou a senha?{' '}
                                <button onClick={() => setLocation('/login')} className="text-white font-black uppercase tracking-widest text-[10px] hover:text-sky-400 transition-colors ml-2 underline underline-offset-8">
                                    Fazer Login
                                </button>
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* LADO DIREITO: VISUAL */}
            <div className="hidden lg:flex flex-1 bg-[#09090b] border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full animate-pulse-slow" />
                
                <div className="relative z-10 space-y-0">
                    <div className="translate-x-[-20px]"><SecurityWidget /></div>
                    <CloudWidget />
                    
                    <div className="absolute -bottom-32 left-0 right-0 text-center space-y-4">
                        <div className="flex items-center justify-center gap-6">
                            <div className="flex items-center gap-2 text-zinc-500">
                                <ShieldCheck size={16} className="text-emerald-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Autenticação Blindada</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-500">
                                <Cloud size={16} className="text-sky-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.2em]">Sync Cloud</span>
                            </div>
                        </div>
                        <p className="text-xs text-zinc-600 font-medium max-w-xs mx-auto leading-relaxed tracking-tighter">
                            Gerencie sua farm de qualquer lugar com total tranquilidade.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes float-slow {
                    0%, 100% { transform: translateY(0px) rotate(0deg); }
                    50% { transform: translateY(-20px) rotate(1deg); }
                }
                .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
                .animate-pulse-slow { animation: pulse 12s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            `}</style>
        </div>
    );
}