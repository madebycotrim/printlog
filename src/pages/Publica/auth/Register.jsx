import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useAuth } from "../../../contexts/AuthContext";
import {
    Mail, Lock, ArrowLeft, Chrome,
    User, Send, Eye, EyeOff,
    KeyRound, AlertTriangle, ShieldCheck,
    Zap, Fingerprint, LayoutDashboard,
    Layers, Package, Database, Layout
} from 'lucide-react';

import logo from '../../../assets/logo-branca.png';
import { getClerkErrorMessage, isValidEmail, validatePassword } from "../../../utils/auth";
import { auth } from "../../../services/firebase";

// --- COMPONENTE: UI ---

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
                    <span>Criando oficina...</span>
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

// --- COMPONENTES AUXILIARES ---

const AuthModeToggle = ({ mode, setMode }) => (
    <div className="bg-zinc-900/50 p-1 rounded-xl flex relative mb-6 border border-white/5">
        <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 rounded-lg shadow-sm transition-all duration-300 ease-spring ${mode === 'magic' ? 'left-1' : 'left-[calc(50%+4px)]'}`}
        />
        <button
            type="button"
            onClick={() => setMode('magic')}
            className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wide py-2.5 rounded-lg transition-colors ${mode === 'magic' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            <Zap size={14} /> Link Mágico
        </button>
        <button
            type="button"
            onClick={() => setMode('password')}
            className={`flex-1 relative z-10 flex items-center justify-center gap-2 text-[11px] font-bold uppercase tracking-wide py-2.5 rounded-lg transition-colors ${mode === 'password' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
            <KeyRound size={14} /> Senha
        </button>
    </div>
);

const InventoryWidget = () => (
    <div className="w-80 bg-zinc-950/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl group hover:border-sky-500/20 transition-colors duration-500">
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <Badge label="Materiais" color="sky" icon={Database} />
                <h4 className="text-white font-bold text-lg mt-2 group-hover:text-sky-400 transition-colors">Meus Filamentos</h4>
            </div>
            <Package className="text-zinc-600 group-hover:text-sky-500 transition-colors" size={20} />
        </div>
        <div className="space-y-4">
            {[
                { name: 'PETG Carbono', weight: '820g', color: 'bg-sky-500', shadow: 'shadow-[0_0_10px_rgba(14,165,233,0.5)]', percent: '82%' },
                { name: 'PLA Silk Ouro', weight: '150g', color: 'bg-amber-400', shadow: 'shadow-[0_0_10px_rgba(251,191,36,0.5)]', percent: '15%', alert: true },
            ].map((item, i) => (
                <div key={i} className="space-y-2 group/item">
                    <div className="flex justify-between items-center text-[11px] font-medium">
                        <span className="text-zinc-400 flex items-center gap-2 group-hover/item:text-white transition-colors">
                            {item.alert && <AlertTriangle size={12} className="text-amber-500" />}
                            {item.name}
                        </span>
                        <span className={item.alert ? "text-amber-500" : "text-white"}>{item.weight}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div
                            className={`h-full ${item.color} ${item.shadow} rounded-full animate-[fillBarReg_1.5s_ease-out_forwards]`}
                            style={{ '--w': item.percent, animationDelay: `${i * 0.2}s`, width: '0%' }}
                        />
                        <style>{`@keyframes fillBarReg { to { width: var(--w); } }`}</style>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function RegisterPage() {
    const { signUp, signInWithGoogle, isSignedIn, isLoaded } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [regMode, setRegMode] = useState('password'); // Default to password
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [agreed, setAgreed] = useState(false);
    const [, setLocation] = useLocation();

    // Captura o redirecionamento inteligente
    const queryParams = new URLSearchParams(window.location.search);
    const redirectUrl = queryParams.get("redirect") || "/dashboard";

    useEffect(() => {
        if (isLoaded && isSignedIn) setLocation(redirectUrl);
    }, [isLoaded, isSignedIn, setLocation, redirectUrl]);

    const handleGoogleSignUp = async () => {
        if (!agreed) {
            setError("Você precisa aceitar os Termos e a Política de Privacidade.");
            return;
        }
        if (isGoogleLoading) return;
        setIsGoogleLoading(true);
        try {
            await signInWithGoogle();
            setLocation(redirectUrl);
        } catch (err) {
            console.error("Google SignUp Error:", err);
            setError(getClerkErrorMessage(err));
        } finally {
            setIsGoogleLoading(false);
        }
    };

    const handlePasswordSignUp = async (e) => {
        e.preventDefault();

        // VALIDAÇÕES CLIENT-SIDE
        if (!agreed) {
            setError("Você precisa aceitar os Termos e a Política de Privacidade.");
            return;
        }
        if (!isValidEmail(email)) {
            setError("E-mail inválido. Verifique o endereço digitado.");
            return;
        }
        const passwordCheck = validatePassword(password);
        if (!passwordCheck.valid) {
            setError(passwordCheck.message);
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Sincroniza o Nome do usuário
            await signUp(email, password, name);
            // In Firebase, user is signed in immediately after signup usually.
            // Verification email can be sent, but we can redirect directly or show a message.
            // For now, let's redirect to dashboard.
            // User verification can be enforced in ProtectedRoute if needed by checking user.emailVerified
            setLocation(redirectUrl);

        } catch (err) {
            setError(getClerkErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    const handleMagicLinkSignUp = async (e) => {
        e.preventDefault();
        setError("O cadastro por link mágico ainda não está disponível. Por favor, use sua senha.");
        setRegMode('password');
    };

    // Code verification logic is removed as Firebase simple flow doesn't require manual code entry by default unless using specific flows.
    // If we want email verification: sendEmailVerification(user).

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex overflow-hidden">

            <div className="flex-1 flex flex-col justify-center items-center p-8 relative z-10 w-full lg:w-1/2">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-500/5 blur-[120px] pointer-events-none" />

                <div className="absolute top-10 left-10">
                    <button onClick={() => setLocation('/')} className="flex items-center gap-3 text-xs font-bold text-zinc-500 hover:text-white">
                        <ArrowLeft size={16} />
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
                                {pendingVerification ? "CONFIRME SEU ACESSO" : "TRANSFORME FILAMENTO EM"} <span className="text-sky-500 italic">{pendingVerification ? "." : "LUCRO REAL."}</span>
                            </h2>
                            <p className="text-zinc-500 text-sm font-medium">
                                Junte-se a outros makers e organize sua produção 3D.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-xs font-medium animate-shake">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isSent && !pendingVerification ? (
                        <form onSubmit={regMode === 'magic' ? handleMagicLinkSignUp : handlePasswordSignUp} className="space-y-5">

                            <AuthModeToggle mode={regMode} setMode={(m) => { setRegMode(m); setError(""); }} />

                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-zinc-500 ml-1 transition-colors group-focus-within:text-sky-500">Seu Nome ou Nome da Oficina</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500 focus:bg-zinc-900/80 focus:shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all duration-300 text-white placeholder:text-zinc-700" placeholder="Ex: João ou Minha Oficina 3D" />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-zinc-500 ml-1 transition-colors group-focus-within:text-sky-500">Seu melhor e-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500 focus:bg-zinc-900/80 focus:shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all duration-300 text-white placeholder:text-zinc-700" placeholder="seu@email.com" />
                                </div>
                            </div>

                            {regMode === 'password' && (
                                <div className="space-y-2 group animate-fade-in-up">
                                    <label className="text-xs font-bold text-zinc-500 ml-1 transition-colors group-focus-within:text-sky-500">Crie uma senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"} required value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-zinc-900/50 border border-zinc-800/50 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-sky-500 focus:bg-zinc-900/80 focus:shadow-[0_0_20px_rgba(14,165,233,0.1)] transition-all duration-300 text-white placeholder:text-zinc-700"
                                            placeholder="Use pelo menos 8 caracteres"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-white transition-colors">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* CONSENTIMENTO - LGPD */}
                            <div className="flex items-start gap-3 px-1 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                                <div className="relative flex items-center">
                                    <input
                                        type="checkbox"
                                        id="terms"
                                        checked={agreed}
                                        onChange={(e) => setAgreed(e.target.checked)}
                                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-700 bg-zinc-900/50 checked:border-sky-500 checked:bg-sky-500 transition-all shadow-sm"
                                    />
                                    <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 peer-checked:opacity-100 transition-opacity">
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M10 3L4.5 8.5L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                </div>
                                <label htmlFor="terms" className="text-xs text-zinc-500 leading-relaxed cursor-pointer select-none hover:text-zinc-300 transition-colors">
                                    Li e concordo com os <a href="/terms-of-service" target="_blank" className="text-sky-500 hover:text-sky-400 hover:underline font-bold">Termos de Uso</a> e a <a href="/privacy-policy" target="_blank" className="text-sky-500 hover:text-sky-400 hover:underline font-bold">Política de Privacidade</a> do PrintLog.
                                </label>
                            </div>

                            <div className="space-y-4">
                                <PrimaryButton type="submit" variant="sky" className="w-full" isLoading={isLoading} disabled={!agreed} icon={regMode === 'magic' ? Zap : LayoutDashboard}>
                                    {regMode === 'magic' ? "Receber link por e-mail" : "Abrir minha oficina"}
                                </PrimaryButton>
                            </div>
                        </form>

                    ) : (
                        <div className="bg-sky-500/5 border border-sky-500/20 rounded-[2.5rem] p-10 text-center space-y-6">
                            {/* Success message UI */}
                            <div className="relative mx-auto w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400">
                                <Send size={30} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-bold text-xl uppercase">Sucesso!</h3>
                                <p className="text-zinc-400 text-sm">Sua conta foi criada.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 border-t border-white/5" />
                            <span className="relative bg-zinc-950 px-4 text-[10px] font-bold uppercase text-zinc-600">Ou cadastre-se com</span>
                        </div>
                        <button onClick={handleGoogleSignUp} disabled={isGoogleLoading || isLoading || !agreed} className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 font-bold text-sm text-white disabled:opacity-50 transition-colors">
                            {isGoogleLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full" /> : <><Chrome size={20} /> Continuar com Google</>}
                        </button>
                        <p className="text-center text-zinc-500 text-sm">
                            Já tem acesso? <button onClick={() => setLocation('/login')} className="text-sky-500 font-bold hover:text-sky-400 ml-2">Entrar agora</button>
                        </p>
                    </div>
                </div>
            </div>

            {/* LADO DIREITO (PREVIEW) */}
            <div className="hidden lg:flex flex-1 bg-zinc-950/40 border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[180px] rounded-full" />

                <div className="relative z-10 scale-110">
                    <div className="translate-x-[-30px]"><InventoryWidget /></div>

                    <div className="bg-zinc-950/60 backdrop-blur-xl border border-sky-500/20 rounded-[2rem] p-6 shadow-2xl ml-auto -mt-12 mr-[-40px] relative z-20 w-64 text-center hover:scale-105 transition-transform duration-500">
                        <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/20 text-sky-500 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                            <Layout size={24} />
                        </div>
                        <span className="text-sm font-bold text-white block uppercase">Tudo em uma tela</span>
                        <span className="text-[11px] text-zinc-500 block mt-1">Tudo o que você precisa em uma única tela</span>
                    </div>

                    <div className="absolute -bottom-40 -left-20 opacity-10 font-mono text-[10px] text-sky-500 space-y-1 text-left">
                        <p>G28 ; Iniciar Home</p>
                        <p>M104 S210 ; Aquecer Bico</p>
                        <p>G1 Z15 F3000</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
