import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";
import { useSignUp, useAuth } from "@clerk/clerk-react";
import {
    Mail, ArrowLeft, Chrome, Database,
    User, Package, Send, Lock, Eye, EyeOff,
    KeyRound, AlertTriangle, ShieldCheck,
    Zap, Fingerprint, Layout,
    Layers, Cpu, BoxSelect, Activity, X // Adicionei o X aqui
} from 'lucide-react';
import logo from '../../assets/logo-branca.png';

// --- CONTEÚDOS LEGAIS ---

const TERMS_CONTENT = (
    <div className="space-y-6">
        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Database size={14} className="text-sky-500" />
                1. O que é o PrintLog
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog é um sistema de gestão feito para makers e donos de
                farms de impressão 3D que precisam organizar custos, processos e o histórico
                de produção.
            </p>
        </section>
        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Cpu size={14} className="text-sky-500" />
                2. Melhorias e Evolução
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog está sempre recebendo atualizações. Podemos ajustar ou criar
                novas funções para deixar o sistema mais útil para a sua produção.
            </p>
        </section>
        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle size={14} className="text-sky-500" />
                3. Uso Correto
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O uso deve ser manual e focado na gestão da sua farm. Comportamentos abusivos podem gerar suspensão.
            </p>
        </section>
    </div>
);

const PRIVACY_CONTENT = (
    <div className="space-y-6">
        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
            <ShieldCheck className="text-emerald-500" size={24} />
            <div>
                <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Segurança em primeiro lugar</p>
                <p className="text-xs text-zinc-500">Sua farm, seus dados e sua privacidade.</p>
            </div>
        </div>
        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <Lock size={14} className="text-sky-500" />
                1. Dados Protegidos
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                Seus custos e margens de lucro são protegidos com criptografia antes de entrarem no nosso banco de dados.
            </p>
        </section>
        <section className="space-y-2">
            <h4 className="text-white font-black text-xs uppercase tracking-widest flex items-center gap-2">
                <EyeOff size={14} className="text-sky-500" />
                2. Seus dados são só seus
            </h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
                O PrintLog não vende e não repassa seus dados para ninguém.
            </p>
        </section>
    </div>
);

// --- COMPONENTE: MODAL ---

const LegalModal = ({ isOpen, onClose, title, content }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-xl bg-[#0a0a0c] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#0d0d0f]">
                    <h3 className="text-lg font-bold text-white uppercase italic tracking-tighter">{title}</h3>
                    <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors"><X size={20} /></button>
                </div>
                <div className="p-8 overflow-y-auto">{content}</div>
                <div className="p-6 border-t border-white/5 bg-[#0d0d0f] flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-sky-500 hover:text-white transition-all">Entendido</button>
                </div>
            </div>
        </div>
    );
};

// --- COMPONENTE: UI (Badges e Buttons) ---

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
            className={`h-14 px-8 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 ${styles[variant]} ${className}`}
        >
            {isLoading ? (
                <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Preparando acesso...</span>
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

const InventoryWidget = () => (
    <div className="w-80 bg-[#0c0c0e]/80 backdrop-blur-xl border border-white/10 rounded-[2rem] p-6 shadow-2xl">
        <div className="flex justify-between items-start mb-6">
            <div className="space-y-1">
                <Badge label="Materiais" color="sky" icon={Database} />
                <h4 className="text-white font-bold text-lg mt-2">Meus Filamentos</h4>
            </div>
            <Package className="text-zinc-700" size={20} />
        </div>
        <div className="space-y-4">
            {[
                { name: 'PETG Carbono', weight: '820g', color: 'bg-sky-500', percent: 'w-[82%]' },
                { name: 'PLA Silk Ouro', weight: '150g', color: 'bg-amber-400', percent: 'w-[15%]', alert: true },
            ].map((item, i) => (
                <div key={i} className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] font-medium">
                        <span className="text-zinc-400 flex items-center gap-2">
                            {item.alert && <AlertTriangle size={12} className="text-amber-500" />}
                            {item.name}
                        </span>
                        <span className={item.alert ? "text-amber-500" : "text-white"}>{item.weight}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                        <div className={`h-full ${item.percent} ${item.color} rounded-full`} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export default function RegisterPage() {
    const { isLoaded, signUp, setActive } = useSignUp();
    const { isSignedIn } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [pendingVerification, setPendingVerification] = useState(false);
    const [code, setCode] = useState("");
    const [regMode, setRegMode] = useState('magic');
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState("");
    const [, setLocation] = useLocation();

    // ESTADO DO MODAL
    const [modal, setModal] = useState({ isOpen: false, title: '', content: null });

    useEffect(() => {
        if (isLoaded && isSignedIn) setLocation("/dashboard");
    }, [isLoaded, isSignedIn, setLocation]);

    const handleClerkError = (err) => {
        const msg = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || "Não conseguimos criar seu acesso agora.";
        setError(msg);
    };

    const signUpWithGoogle = async () => {
        if (!isLoaded) return;
        setIsGoogleLoading(true);
        try {
            await signUp.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/sso-callback",
                redirectUrlComplete: "/dashboard",
            });
        } catch (err) { setIsGoogleLoading(false); handleClerkError(err); }
    };

    const handlePasswordSignUp = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setIsLoading(true);
        setError("");
        try {
            await signUp.create({ emailAddress: email, password, firstName: name });
            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            setPendingVerification(true);
        } catch (err) { handleClerkError(err); } finally { setIsLoading(false); }
    };

    const handleMagicLinkSignUp = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;
        setIsLoading(true);
        setError("");
        try {
            await signUp.create({ emailAddress: email, firstName: name });
            await signUp.prepareEmailAddressVerification({
                strategy: 'email_link',
                redirectUrl: `${window.location.origin}/dashboard`,
            });
            setIsSent(true);
        } catch (err) { handleClerkError(err); setIsSent(false); } finally { setIsLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#050506] text-zinc-100 font-sans flex overflow-hidden">

            {/* COMPONENTE MODAL CHAMADO AQUI */}
            <LegalModal
                isOpen={modal.isOpen}
                title={modal.title}
                content={modal.content}
                onClose={() => setModal({ ...modal, isOpen: false })}
            />

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
                                {pendingVerification ? "CONFIRME SEU" : "TRANSFORME FILAMENTO EM"} <br />
                                <span className="text-sky-500 italic">{pendingVerification ? "ACESSO." : "LUCRO REAL."}</span>
                            </h2>
                            <p className="text-zinc-500 text-sm font-medium">
                                Junte-se a outros makers e organize sua produção 3D.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400 text-xs font-medium">
                            <AlertTriangle size={16} className="shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isSent && !pendingVerification ? (
                        <form onSubmit={regMode === 'magic' ? handleMagicLinkSignUp : handlePasswordSignUp} className="space-y-5">
                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-zinc-500 ml-1">Seu Nome ou Nome da Oficina</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 transition-all text-white placeholder:text-zinc-800" placeholder="Ex: João ou Minha Oficina 3D" />
                                </div>
                            </div>

                            <div className="space-y-2 group">
                                <label className="text-xs font-bold text-zinc-500 ml-1">Seu melhor e-mail</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-sky-500/50 transition-all text-white placeholder:text-zinc-800" placeholder="seu@email.com" />
                                </div>
                            </div>

                            {regMode === 'password' && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <label className="text-xs font-bold text-zinc-500 ml-1">Crie uma senha</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"} required value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-[#0a0a0c] border border-white/5 rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-sky-500/50 transition-all text-white placeholder:text-zinc-800"
                                            placeholder="Use pelo menos 8 caracteres"
                                        />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white">
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4 pt-2">
                                <PrimaryButton type="submit" variant="sky" className="w-full" isLoading={isLoading} icon={Zap}>
                                    {regMode === 'magic' ? "Receber link por e-mail" : "Abrir minha farm"}
                                </PrimaryButton>

                                <button type="button" onClick={() => { setRegMode(regMode === 'magic' ? 'password' : 'magic'); setError(""); }} className="flex items-center gap-2 mx-auto text-xs font-bold text-zinc-500 hover:text-white transition-colors">
                                    <KeyRound size={14} className="text-sky-500" />
                                    {regMode === 'magic' ? "Prefiro usar e-mail e senha" : "Cadastrar sem senha (Link rápido)"}
                                </button>
                            </div>
                        </form>
                    ) : pendingVerification ? (
                        <form onSubmit={async (e) => {
                            e.preventDefault();
                            setIsLoading(true);
                            try {
                                const completeSignUp = await signUp.attemptEmailAddressVerification({ code });
                                if (completeSignUp.status === "complete") {
                                    await setActive({ session: completeSignUp.createdSessionId });
                                    setLocation("/dashboard");
                                }
                            } catch (err) { handleClerkError(err); } finally { setIsLoading(false); }
                        }} className="space-y-6">
                            <div className="space-y-4 text-center bg-sky-500/5 border border-sky-500/20 p-8 rounded-[2rem]">
                                <label className="text-xs font-bold uppercase text-sky-500 block">Código de Confirmação</label>
                                <input
                                    type="text" maxLength={6} required value={code}
                                    onChange={(e) => setCode(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 text-center text-3xl font-mono font-bold tracking-[0.4em] text-white outline-none focus:border-sky-500 transition-all"
                                    placeholder="000000"
                                />
                                <p className="text-[11px] text-zinc-500 font-medium">Confira o código que chegou no seu e-mail.</p>
                            </div>
                            <PrimaryButton type="submit" variant="sky" className="w-full" isLoading={isLoading} icon={ShieldCheck}>Validar e entrar</PrimaryButton>
                            <button onClick={() => setPendingVerification(false)} className="block mx-auto text-zinc-500 text-xs font-bold hover:text-white">Corrigir e-mail</button>
                        </form>
                    ) : (
                        <div className="bg-sky-500/5 border border-sky-500/20 rounded-[2.5rem] p-10 text-center space-y-6">
                            <div className="relative mx-auto w-16 h-16 bg-sky-500/20 rounded-full flex items-center justify-center text-sky-400">
                                <Send size={30} />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-white font-bold text-xl uppercase">E-mail enviado!</h3>
                                <p className="text-zinc-400 text-sm">Dê uma olhada na sua caixa de entrada em <strong>{email}</strong> para ativar sua oficina.</p>
                            </div>
                            <button onClick={() => setIsSent(false)} className="text-zinc-500 text-xs font-bold uppercase hover:text-white transition-colors">← Tentar outro e-mail</button>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 border-t border-white/5" />
                            <span className="relative bg-[#050506] px-4 text-[10px] font-bold uppercase text-zinc-600">Ou cadastre-se com</span>
                        </div>
                        <button onClick={signUpWithGoogle} disabled={isGoogleLoading || isLoading} className="flex items-center justify-center gap-3 w-full h-14 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all font-bold text-sm text-white disabled:opacity-50">
                            {isGoogleLoading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Chrome size={20} /> Continuar com Google</>}
                        </button>
                        <p className="text-center text-zinc-500 text-sm">
                            Já tem acesso? <button onClick={() => setLocation('/login')} className="text-sky-500 font-bold hover:text-sky-400 ml-2">Entrar agora</button>
                        </p>

                        {/* TEXTO DE CONCORDÂNCIA ATUALIZADO PARA ABRIR MODAL */}
                        <p className="text-[10px] text-zinc-600 leading-relaxed uppercase tracking-wider max-w-[280px] mx-auto text-center">
                            Ao criar sua conta, você concorda com nossos <br />
                            <button
                                onClick={() => setModal({ isOpen: true, title: 'Termos de Uso', content: TERMS_CONTENT })}
                                className="text-zinc-400 hover:text-sky-500 underline decoration-zinc-800 underline-offset-4 transition-colors"
                            >
                                Termos de Uso
                            </button>
                            {' '} e {' '}
                            <button
                                onClick={() => setModal({ isOpen: true, title: 'Política de Privacidade', content: PRIVACY_CONTENT })}
                                className="text-zinc-400 hover:text-sky-500 underline decoration-zinc-800 underline-offset-4 transition-colors"
                            >
                                Privacidade
                            </button>.
                        </p>
                    </div>
                </div>
            </div>

            {/* LADO DIREITO (PREVIEW) */}
            <div className="hidden lg:flex flex-1 bg-[#09090b] border-l border-white/5 relative items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-sky-500/10 blur-[180px] rounded-full" />

                <div className="relative z-10 scale-110">
                    <div className="translate-x-[-30px]"><InventoryWidget /></div>

                    <div className="bg-[#0c0c0e]/90 backdrop-blur-xl border border-sky-500/20 rounded-[2rem] p-6 shadow-2xl ml-auto -mt-12 mr-[-40px] relative z-20 w-64 text-center">
                        <div className="w-12 h-12 bg-sky-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-sky-500/20 text-sky-500">
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