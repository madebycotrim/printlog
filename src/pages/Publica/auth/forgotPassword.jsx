import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useAuth } from "../../../contexts/AuthContext";
import {
    Mail, ArrowLeft, CheckCircle2, ShieldCheck,
    Lock, ShieldAlert, RefreshCcw, Send,
    Eye, EyeOff, Zap, Cpu, Settings, Layers
} from 'lucide-react';
import logo from '../../../assets/logo-branca.png';
import { getAuthErrorMessage } from "../../../utils/auth";

// --- COMPONENTE: UI ---

const Badge = ({ icon: Icon, label, color = "sky" }) => {
    const variants = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
        amber: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
    return (
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${variants[color]} backdrop-blur-md w-fit`}>
            {Icon && <Icon size={12} strokeWidth={2.5} />}
            <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
        </div>
    );
};

const PrimaryButton = ({ children, onClick, icon: Icon, variant = "sky", className = "", disabled, type = "button", isLoading }) => {
    const styles = {
        sky: "bg-sky-600 text-white hover:bg-sky-500 shadow-lg shadow-sky-500/20",
        white: "bg-white text-black hover:bg-zinc-200 shadow-xl",
    };
    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            onClick={onClick}
            className={`h-14 px-8 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 ${styles[variant]} ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processando...</span>
                </div>
            ) : (
                <>
                    {children}
                    {Icon ? <Icon size={18} strokeWidth={2.5} /> : <Send size={18} strokeWidth={2.5} />}
                </>
            )}
        </button>
    );
};

// --- WIDGETS DE PREVIEW ---

const RecoveryStatusWidget = () => (
    <div className="w-80 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl group hover:border-amber-500/20 transition-colors duration-500">
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <Badge label="Segurança" color="amber" icon={Settings} />
                <h4 className="text-white font-bold text-lg mt-2 uppercase group-hover:text-amber-400 transition-colors">Recuperação</h4>
            </div>
            <Cpu className="text-zinc-600 group-hover:text-amber-500 transition-colors" size={20} />
        </div>
        <div className="space-y-4">
            <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/30 space-y-3 group-hover:bg-amber-500/5 transition-colors duration-500">
                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                    <span>Nível de Proteção</span>
                    <span className="text-amber-400">100%</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full w-[0%] animate-[fillBarAmber_1.5s_ease-out_forwards] bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{ '--w': '100%' }} />
                    <style>{`@keyframes fillBarAmber { to { width: 100%; } }`}</style>
                </div>
            </div>

            {[
                { label: 'Criptografia', status: 'Ativa', icon: ShieldCheck },
                { label: 'Sincronia Maker', status: 'Online', icon: RefreshCcw }
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 group/item hover:border-amber-500/20 transition-colors">
                    <div className="flex items-center gap-3">
                        <item.icon size={14} className="text-sky-500/70 group-hover/item:text-amber-500 transition-colors" />
                        <span className="text-[10px] font-bold uppercase text-zinc-400 group-hover/item:text-white transition-colors">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-bold text-sky-400 uppercase">{item.status}</span>
                </div>
            ))}
        </div>
    </div>
);

export default function ForgotPasswordPage() {
    const { resetPassword, isLoaded } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [isSent, setIsSent] = useState(false);
    const [error, setError] = useState("");
    const [, setLocation] = useLocation();

    // 1. Iniciar o reset de senha
    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!isLoaded || isLoading) return;
        setIsLoading(true);
        setError("");

        try {
            await resetPassword(email);
            setIsSent(true);
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex overflow-hidden">
            <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 w-full lg:w-1/2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-500/5 blur-[120px] pointer-events-none" />

                <div className="absolute top-10 left-10">
                    <button
                        onClick={() => {
                            setError("");
                            setLocation('/login');
                        }}
                        className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        Voltar ao login
                    </button>
                </div>

                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-4 text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <img src={logo} alt="PrintLog" className="w-10 h-10 object-contain" />
                            <span className="text-xl font-bold text-white uppercase tracking-tight">PRINTLOG <span className="text-sky-500 text-[10px] ml-1 uppercase">Suporte</span></span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.95] text-white uppercase">
                                RECUPERE SEU <span className="text-sky-500 italic">ACESSO.</span>
                            </h2>
                            <p className="text-zinc-500 text-sm font-medium">
                                Digite seu e-mail e enviaremos um link para redefinir sua senha.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-xs font-medium animate-shake">
                            <ShieldAlert size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isSent ? (
                        <form onSubmit={handleSendCode} className="space-y-6">
                            <div className="space-y-5">
                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-zinc-500 ml-1 transition-colors group-focus-within:text-sky-500">Qual seu e-mail cadastrado?</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                                        <input
                                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500 focus:bg-zinc-900/80 focus:shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all duration-300 text-white placeholder:text-zinc-700"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <PrimaryButton type="submit" variant="sky" className="w-full" isLoading={isLoading} icon={Zap}>
                                    Receber email de redefinição
                                </PrimaryButton>
                            </div>
                        </form>
                    ) : (
                        <div className="space-y-6 animate-fade-in-up">
                            <div className="space-y-4 text-center bg-sky-500/5 border border-sky-500/20 p-8 rounded-[2rem]">
                                <label className="text-xs font-bold uppercase tracking-widest text-sky-500 block">E-mail Enviado</label>
                                <p className="text-zinc-300">
                                    Verifique sua caixa de entrada no e-mail <strong>{email}</strong>.
                                </p>
                            </div>
                            <PrimaryButton type="button" onClick={() => setLocation('/login')} variant="sky" className="w-full" icon={CheckCircle2}>
                                Voltar para Login
                            </PrimaryButton>
                        </div>
                    )}

                    <div className="text-center pt-4">
                        <p className="text-zinc-500 text-sm">
                            Já lembrou a senha?
                            <button onClick={() => setLocation('/login')} className="text-sky-500 font-bold hover:text-sky-400 ml-2">
                                Ir para o Login
                            </button>
                        </p>
                    </div>
                </div>
            </div>

            {/* PAINEL LATERAL */}
            <div className="hidden lg:flex flex-1 bg-[#09090b] border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[180px] rounded-full" />

                <div className="relative z-10 scale-110">
                    <div className="translate-x-[-30px]">
                        <RecoveryStatusWidget />
                    </div>

                    <div className="bg-zinc-950/60 backdrop-blur-xl border border-sky-500/20 rounded-[2rem] p-6 shadow-2xl mt-6 mx-auto w-72 hover:scale-105 transition-transform duration-500">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 size={24} />
                            </div>
                            <div className="text-left">
                                <span className="text-[10px] font-bold uppercase text-emerald-500 block">Proteção Maker</span>
                                <span className="text-[12px] font-bold text-white uppercase">Oficina Blindada</span>
                            </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 text-left leading-relaxed uppercase font-bold opacity-60">
                            Sua conta está segura com criptografia de ponta a ponta.
                        </p>
                    </div>

                    <div className="absolute -bottom-40 -left-20 opacity-10 text-white">
                        <Layers size={200} strokeWidth={0.5} />
                    </div>
                </div>
            </div>
        </div>
    );
}
