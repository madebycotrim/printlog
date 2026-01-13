import React, { useState } from 'react';
import { useLocation } from "wouter";
import { useSignIn } from "@clerk/clerk-react";
import {
    Mail, ArrowLeft, CheckCircle2, ShieldCheck,
    Lock, ShieldAlert, RefreshCcw, Send,
    Eye, EyeOff, Zap, Cpu, Settings, Layers
} from 'lucide-react';
import logo from '../../assets/logo-branca.png';

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
        white: "bg-white text-black hover:bg-zinc-200",
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
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                    <span>Validando...</span>
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
    <div className="w-80 bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <Badge label="Segurança" color="amber" icon={Settings} />
                <h4 className="text-white font-bold text-lg mt-2 uppercase">Voltar para a oficina</h4>
            </div>
            <Cpu className="text-zinc-600" size={20} />
        </div>
        <div className="space-y-3">
            {[
                { label: 'Criptografia', status: 'Ativa', icon: ShieldCheck },
                { label: 'Sincronia Maker', status: 'Online', icon: RefreshCcw }
            ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                        <item.icon size={14} className="text-sky-500/70" />
                        <span className="text-[10px] font-bold uppercase text-zinc-400">{item.label}</span>
                    </div>
                    <span className="text-[9px] font-bold text-sky-400 uppercase">{item.status}</span>
                </div>
            ))}
        </div>
    </div>
);

export default function ForgotPasswordPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [code, setCode] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [, setLocation] = useLocation();

    // 1. Iniciar o reset de senha
    const handleSendCode = async (e) => {
        e.preventDefault();
        if (!isLoaded || isLoading) return;
        setIsLoading(true);
        setError("");

        try {
            await signIn.create({
                strategy: "reset_password_email_code",
                identifier: email,
            });
            setStep(2);
        } catch (err) {
            setError(err.errors?.[0]?.longMessage || "Não encontramos esse e-mail na nossa base.");
        } finally {
            setIsLoading(false);
        }
    };

    // 2. Validar código e definir nova senha
    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (!isLoaded || isLoading) return;
        setIsLoading(true);
        setError("");

        try {
            const result = await signIn.attemptFirstFactor({
                strategy: "reset_password_email_code",
                code,
                password,
            });

            if (result.status === "complete") {
                // Ao finalizar, criamos a sessão e jogamos para o Dashboard
                await setActive({ session: result.createdSessionId });
                setLocation("/dashboard");
            } else {
                // Caso exija um segundo fator (2FA)
                console.warn("Status adicional requerido:", result.status);
            }
        } catch (err) {
            setError(err.errors?.[0]?.longMessage || "Código incorreto ou senha muito curta.");
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
                            step === 1 ? setLocation('/login') : setStep(1);
                        }}
                        className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-white"
                    >
                        <ArrowLeft size={16} />
                        {step === 1 ? "Voltar ao login" : "Trocar e-mail"}
                    </button>
                </div>

                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-4 text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <img src={logo} alt="PrintLog" className="w-10 h-10 object-contain" />
                            <span className="text-xl font-bold text-white uppercase tracking-tight">PrintLog <span className="text-sky-500 text-[10px] ml-1 uppercase">Suporte</span></span>
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
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-xs font-medium">
                            <ShieldAlert size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={step === 1 ? handleSendCode : handleResetPassword} className="space-y-6">
                        {step === 1 ? (
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-500 ml-1">Qual seu e-mail cadastrado?</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                        <input
                                            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 focus:bg-zinc-900/70 transition-all duration-200 text-white placeholder:text-zinc-800"
                                            placeholder="seu@email.com"
                                        />
                                    </div>
                                </div>

                                <div id="clerk-captcha"></div>
                                <PrimaryButton type="submit" variant="sky" className="w-full" isLoading={isLoading} icon={Zap}>
                                    Receber código de acesso
                                </PrimaryButton>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="space-y-4 text-center bg-sky-500/5 border border-sky-500/20 p-8 rounded-[2rem]">
                                    <label className="text-xs font-bold uppercase tracking-widest text-sky-500 block">Digite o código do e-mail</label>
                                    <input
                                        type="text" required value={code} onChange={(e) => setCode(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 text-center text-3xl font-mono font-bold tracking-[0.4em] text-white outline-none focus:border-sky-500"
                                        placeholder="000000"
                                        maxLength={6}
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="text-xs font-bold text-zinc-500 ml-1">Crie sua nova senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-sky-500/50 focus:bg-zinc-900/70 transition-all duration-200 text-white placeholder:text-zinc-800"
                                            placeholder="Mínimo de 8 caracteres"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <PrimaryButton type="submit" variant="sky" className="w-full" isLoading={isLoading} icon={ShieldCheck}>
                                    Redefinir senha e entrar
                                </PrimaryButton>
                            </div>
                        )}
                    </form>

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

                    <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-sky-500/20 rounded-[2rem] p-6 shadow-2xl mt-6 mx-auto w-72">
                        <div className="flex items-center gap-4 mb-3">
                            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500 border border-emerald-500/20">
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

                    <div className="absolute -bottom-40 -left-20 opacity-10">
                        <Layers size={200} strokeWidth={0.5} className="text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}
