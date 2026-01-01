import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useSignIn, useAuth } from "@clerk/clerk-react";
import {
    Mail, ArrowLeft, Chrome, Activity,
    LayoutDashboard, Send, Lock, Eye, EyeOff, KeyRound, AlertCircle,
    Zap, Cpu, Layers, BoxSelect
} from 'lucide-react';
import logo from '../../assets/logo-branca.png';

// --- COMPONENTES DE UI ---

const Badge = ({ icon: Icon, label, color = "sky" }) => {
    const variants = {
        emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
        sky: "text-sky-400 bg-sky-500/10 border-sky-500/20",
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
            className={`h-14 px-8 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 ${styles[variant]} ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Entrando na oficina...</span>
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

// --- WIDGETS DE PREVIEW (Lado direito) ---

const FarmStatusWidget = () => (
    <div className="w-80 bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <Badge label="Em operação" color="emerald" icon={Activity} />
                <h4 className="text-white font-bold text-lg mt-2">Status da Farm</h4>
            </div>
            <Cpu className="text-zinc-700" size={20} />
        </div>
        <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                    <span>Impressoras Rodando</span>
                    <span className="text-emerald-400">8 de 8</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full w-[85%] bg-emerald-500" />
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Temperatura do Bico</span>
                    <span className="text-[10px] text-white">215°C</span>
                </div>
            </div>
        </div>
    </div>
);

const ProductionWidget = () => (
    <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-sky-500/20 rounded-[2rem] p-6 shadow-2xl animate-float-slow ml-auto -mt-12 mr-[-30px] relative z-20 w-72">
        <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 border border-sky-500/20">
                <Layers size={20} />
            </div>
            <div className="flex flex-col">
                <span className="text-[9px] font-bold text-sky-500 uppercase">Produção do Mês</span>
                <span className="text-[11px] font-bold text-white uppercase">Peças Prontas</span>
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white tracking-tighter">1.482</span>
            <span className="text-[10px] font-bold text-zinc-500 ml-1 uppercase">itens</span>
        </div>
        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between">
            <div className="text-center">
                <p className="text-[8px] text-zinc-500 font-bold uppercase">Filamento</p>
                <p className="text-xs text-white">42kg</p>
            </div>
            <div className="text-center">
                <p className="text-[8px] text-zinc-500 font-bold uppercase">Taxa de Acerto</p>
                <p className="text-xs text-emerald-400">99%</p>
            </div>
        </div>
    </div>
);

export default function LoginPage() {
    const { isLoaded, signIn, setActive } = useSignIn();
    const { isSignedIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [loginMode, setLoginMode] = useState('magic');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [, setLocation] = useLocation();

    useEffect(() => {
        if (isLoaded && isSignedIn) setLocation("/dashboard");
    }, [isLoaded, isSignedIn, setLocation]);

    const handleClerkError = (err) => {
        const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Houve um problema ao entrar na oficina.";
        setError(msg);
    };

    const handlePasswordSignIn = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setIsLoading(true);
        setError("");
        try {
            const result = await signIn.create({ identifier: email, password });
            if (result.status === "complete") {
                await setActive({ session: result.createdSessionId });
                setLocation("/dashboard");
            }
        } catch (err) { handleClerkError(err); } finally { setIsLoading(false); }
    };

    const handleMagicLinkSignIn = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setIsLoading(true);
        setError("");
        try {
            const { supportedFirstFactors } = await signIn.create({ identifier: email });
            const emailCodeFactor = supportedFirstFactors.find((f) => f.strategy === "email_link");

            if (emailCodeFactor) {
                await signIn.prepareFirstFactor({
                    strategy: "email_link",
                    emailAddressId: emailCodeFactor.emailAddressId,
                    redirectUrl: `${window.location.origin}/dashboard`,
                });
                setIsSent(true);
            } else {
                setError("O login por link não está disponível para este e-mail.");
            }
        } catch (err) {
            handleClerkError(err);
            setIsSent(false);
        } finally {
            setIsLoading(false);
        }
    };

    const signInWithGoogle = async () => {
        if (!isLoaded) return;
        setIsGoogleLoading(true);
        try {
            await signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
            });
        } catch (err) {
            setIsGoogleLoading(false);
            handleClerkError(err);
        }
    };

    return (
        <div className="min-h-screen bg-[#050506] text-zinc-100 font-sans flex overflow-hidden">
            <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 w-full lg:w-1/2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-500/5 blur-[120px] pointer-events-none" />

                <div className="absolute top-10 left-10">
                    <button onClick={() => setLocation('/')} className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-white transition-all">
                        <ArrowLeft size={16} />
                        Voltar ao site
                    </button>
                </div>

                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-4 text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <img src={logo} alt="PrintLog" className="w-10 h-10 object-contain" />
                            <span className="text-xl font-bold text-white">PrintLog <span className="text-sky-500 text-[10px] uppercase ml-1">v1.0</span></span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.95] text-white uppercase">
                                BEM-VINDO DE VOLTA <br />
                                <span className="text-sky-500 italic">MAKER.</span>
                            </h2>
                            <p className="text-zinc-500 text-sm font-medium">
                                Acesse seu painel para gerenciar custos, materiais e impressoras.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-xs font-medium">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isSent ? (
                        <form onSubmit={loginMode === 'magic' ? handleMagicLinkSignIn : handlePasswordSignIn} className="space-y-6">
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-zinc-500 ml-1">E-mail de acesso</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                    <input
                                        type="email" required value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 transition-all text-white placeholder:text-zinc-800"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            {loginMode === 'password' && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-xs font-bold text-zinc-500">Sua senha</label>
                                        <button type="button" onClick={() => setLocation('/forgot-password')} className="text-[10px] font-bold text-sky-500 hover:text-sky-400 uppercase">Esqueci a senha</button>
                                    </div>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"} required value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-sky-500/50 transition-all text-white placeholder:text-zinc-800"
                                            placeholder="••••••••"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <PrimaryButton type="submit" variant="sky" className="w-full" isLoading={isLoading} icon={loginMode === 'magic' ? Zap : LayoutDashboard}>
                                    {loginMode === 'magic' ? "Receber link por e-mail" : "Entrar na Oficina"}
                                </PrimaryButton>

                                <div className="text-center">
                                    <button
                                        type="button"
                                        onClick={() => { setLoginMode(loginMode === 'magic' ? 'password' : 'magic'); setError(""); }}
                                        className="flex items-center gap-2 mx-auto text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                                    >
                                        <KeyRound size={14} className="text-sky-500" />
                                        {loginMode === 'magic' ? "Entrar com e-mail e senha" : "Entrar sem senha (Link Rápido)"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="bg-sky-500/5 border border-sky-500/20 rounded-[2.5rem] p-10 text-center space-y-6">
                            <div className="relative mx-auto w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400">
                                <Send size={30} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-bold text-xl uppercase">E-mail enviado!</h3>
                                <p className="text-zinc-400 text-sm">
                                    Dê uma olhada na sua caixa de entrada. Enviamos um link para: <br />
                                    <span className="text-sky-400 font-bold">{email}</span>
                                </p>
                            </div>
                            <button onClick={() => setIsSent(false)} className="text-zinc-500 text-xs font-bold uppercase hover:text-white transition-colors">
                                ← Voltar para o login
                            </button>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 border-t border-white/5" />
                            <span className="relative bg-[#050506] px-4 text-[10px] font-bold uppercase text-zinc-600">Ou entre com</span>
                        </div>

                        <button
                            onClick={signInWithGoogle}
                            disabled={isGoogleLoading || isLoading}
                            className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-bold text-sm text-white disabled:opacity-50"
                        >
                            {isGoogleLoading ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Chrome size={20} />
                                    Entrar com Google
                                </>
                            )}
                        </button>

                        <div className="text-center pt-6">
                            <p className="text-zinc-500 text-sm">
                                Ainda não tem acesso?
                                <button
                                    onClick={() => setLocation('/register')}
                                    className="text-sky-500 font-bold hover:text-sky-400 ml-2"
                                >
                                    Abrir minha oficina
                                </button>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden lg:flex flex-1 bg-[#09090b] border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[180px] rounded-full" />

                <div className="relative z-10 scale-110">
                    <div className="translate-x-[-30px]"><FarmStatusWidget /></div>
                    <ProductionWidget />

                    <div className="absolute -bottom-40 -left-20 opacity-10 font-mono text-[10px] text-sky-500 space-y-1 text-left">
                        <p>G1 X105.4 Y98.2 E0.0452</p>
                        <p>M106 S255 ; Ventoinha 100%</p>
                        <p>G1 Z0.400 F12000</p>
                    </div>

                    <div className="absolute -top-40 -right-10 opacity-5">
                        <BoxSelect size={200} strokeWidth={0.5} className="text-white" />
                    </div>
                </div>
            </div>
        </div>
    );
}