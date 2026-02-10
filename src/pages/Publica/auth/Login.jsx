import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useAuth } from "../../../contexts/AuthContext";
import {
    ArrowLeft, Chrome, Activity,
    LayoutDashboard, Lock, Eye, EyeOff, AlertCircle,
    Cpu, Layers, BoxSelect, Mail
} from 'lucide-react';
import logo from '../../../assets/logo-branca.png';
import { getAuthErrorMessage, getRedirectUrl, isValidEmail } from "../../../utils/auth";

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
            className={`h-14 px-8 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 ${styles[variant]} ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Entrando na oficina...</span>
                </div>
            ) : (
                <>
                    {children}
                    {Icon && <Icon size={18} strokeWidth={2.5} />}
                </>
            )}
        </button>
    );
};

// --- HOOKS & COMPONENTES AUXILIARES ---

// Hook para animar nmeros (Count Up)
const useCounter = (end, duration = 2000) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime;
        let animationFrame;
        const step = (timestamp) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                animationFrame = requestAnimationFrame(step);
            }
        };
        animationFrame = requestAnimationFrame(step);
        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);
    return count;
};

// --- WIDGETS DE PREVIEW ---

const OficinaStatusWidget = () => (
    <div className="w-80 bg-zinc-950/40 backdrop-blur-xl border border-zinc-800/50 rounded-[2rem] p-6 shadow-2xl group hover:border-emerald-500/20 transition-colors duration-500">
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <Badge label="Em operao" color="emerald" icon={Activity} />
                <h4 className="text-white font-bold text-lg mt-2 group-hover:text-emerald-400 transition-colors">Status da Oficina</h4>
            </div>
            <Cpu className="text-zinc-600 group-hover:text-emerald-500 transition-colors" size={20} />
        </div>
        <div className="space-y-4">
            <div className="p-4 bg-zinc-900/30 rounded-2xl border border-zinc-800/30 space-y-3 group-hover:bg-emerald-500/5 transition-colors duration-500">
                <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-500">
                    <span>Impressoras Rodando</span>
                    <span className="text-emerald-400">8 de 8</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div className="h-full w-[0%] animate-[fillBar_1.5s_ease-out_forwards] bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ '--w': '85%' }} />
                    <style>{`@keyframes fillBar { to { width: 85%; } }`}</style>
                </div>
                <div className="flex justify-between items-center pt-1">
                    <span className="text-[9px] text-zinc-500 font-bold uppercase">Temperatura do Bico</span>
                    <span className="text-[10px] text-white font-mono">215C</span>
                </div>
            </div>
        </div>
    </div>
);

const ProductionWidget = () => {
    const count = useCounter(1482);

    return (
        <div className="bg-zinc-950/60 backdrop-blur-xl border border-sky-500/20 rounded-[2rem] p-6 shadow-2xl ml-auto -mt-12 mr-[-30px] relative z-20 w-72 hover:scale-105 transition-transform duration-500">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-500 border border-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                    <Layers size={20} />
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-sky-500 uppercase">Produo do Ms</span>
                    <span className="text-[11px] font-bold text-white uppercase">Peas Prontas</span>
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-white tracking-tighter tabular-nums">{count.toLocaleString()}</span>
                <span className="text-[10px] font-bold text-zinc-500 ml-1 uppercase">itens</span>
            </div>
            <div className="mt-4 pt-4 border-t border-zinc-800/30 flex justify-between">
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
};

export default function LoginPage() {
    const { signIn, signInWithGoogle, isSignedIn, isLoaded } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [, setLocation] = useLocation();

    // Captura a rota de destino caso venha de um ProtectedRoute
    const queryParams = new URLSearchParams(window.location.search);
    const redirectUrl = queryParams.get("redirect") || "/dashboard";

    useEffect(() => {
        if (isLoaded && isSignedIn) setLocation(redirectUrl);
    }, [isLoaded, isSignedIn, setLocation, redirectUrl]);

    const handlePasswordSignIn = async (e) => {
        e.preventDefault();

        // VALIDAO CLIENT-SIDE
        if (!isValidEmail(email)) {
            setError("Por favor, insira um e-mail vlido.");
            return;
        }
        if (!password) {
            setError("Por favor, digite sua senha.");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await signIn(email, password);
            const url = getRedirectUrl() || redirectUrl;
            setLocation(url);
        } catch (err) {
            setError(getAuthErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (isGoogleLoading) return;
        setIsGoogleLoading(true);
        try {
            await signInWithGoogle();
            setLocation(redirectUrl);
        } catch (err) {
            console.error("Google Login Error:", err);
            setError(getAuthErrorMessage(err));
        } finally {
            setIsGoogleLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex overflow-hidden">
            <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 w-full lg:w-1/2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-500/5 blur-[120px] pointer-events-none" />

                <div className="absolute top-10 left-10">
                    <button onClick={() => setLocation('/')} className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-white transition-colors">
                        <ArrowLeft size={16} aria-hidden="true" />
                        Voltar ao site
                    </button>
                </div>

                <div className="w-full max-w-md space-y-10">
                    <div className="space-y-4 text-center sm:text-left">
                        <div className="flex items-center gap-3 justify-center sm:justify-start">
                            <img src={logo} alt="PrintLog" className="w-10 h-10 object-contain" />
                            <span className="text-xl font-bold text-white">PRINTLOG <span className="text-sky-500 text-[10px] uppercase ml-1">BETA</span></span>
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter leading-[0.95] text-white uppercase">
                                BEM-VINDO DE VOLTA <span className="text-sky-500 italic">MAKER.</span>
                            </h2>
                            <p className="text-zinc-500 text-sm font-medium">
                                Acesse seu painel para gerenciar custos, materiais e impressoras.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-xs font-medium animate-shake">
                            <AlertCircle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handlePasswordSignIn} className="space-y-6">
                        <div className="space-y-2 group">
                            <label htmlFor="email" className="text-xs font-bold text-zinc-500 ml-1 transition-colors group-focus-within:text-sky-500">E-mail de acesso</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={18} aria-hidden="true" />
                                <input
                                    id="email"
                                    type="email" required value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500 focus:bg-zinc-900/80 focus:shadow-[0_0_20px_rgba(14,165,233,0.1)] text-white placeholder:text-zinc-700 transition-all duration-300"
                                    placeholder="seu@office.com"
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div className="space-y-2 group animate-fade-in-up">
                            <div className="flex justify-between items-center px-1">
                                <label htmlFor="password" className="text-xs font-bold text-zinc-500 transition-colors group-focus-within:text-sky-500">Sua senha</label>
                                <button type="button" onClick={() => setLocation('/forgot-password')} className="text-[10px] font-bold text-zinc-500 hover:text-sky-400 uppercase transition-colors">Esqueci a senha</button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={18} aria-hidden="true" />
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"} required value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-sky-500 focus:bg-zinc-900/80 focus:shadow-[0_0_20px_rgba(14,165,233,0.1)] text-white placeholder:text-zinc-700 transition-all duration-300"
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors"
                                    aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                                >
                                    {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer group animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-zinc-800/50 bg-zinc-900/50 text-sky-500 focus:ring-2 focus:ring-sky-500/20 transition-all"
                                />
                                <span className="text-xs font-semibold text-zinc-500 group-hover:text-zinc-300 transition-colors">
                                    Manter-me conectado
                                </span>
                            </label>

                            <PrimaryButton type="submit" variant="sky" className="w-full" isLoading={isLoading} icon={LayoutDashboard}>
                                Entrar na Oficina
                            </PrimaryButton>
                        </div>
                    </form>

                    <div className="space-y-6">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 border-t border-white/5" />
                            <span className="relative bg-zinc-950 px-4 text-[10px] font-bold uppercase text-zinc-600">Ou entre com</span>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isGoogleLoading || isLoading}
                            className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 font-bold text-sm text-white disabled:opacity-50"
                        >
                            {isGoogleLoading ? (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (
                                <>
                                    <Chrome size={20} />
                                    Entrar com Google
                                </>
                            )}
                        </button>

                        <div className="text-center pt-6">
                            <p className="text-zinc-500 text-sm">
                                Ainda no tem acesso?
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

            <div className="hidden lg:flex flex-1 bg-zinc-950/40 border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[180px] rounded-full" />

                <div className="relative z-10 scale-110">
                    <div className="translate-x-[-30px]"><OficinaStatusWidget /></div>
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
