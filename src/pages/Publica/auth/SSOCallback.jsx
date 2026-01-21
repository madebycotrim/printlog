import { useClerk, useAuth } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { ArrowLeft, ShieldCheck, Cpu, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function SSOCallback() {
    const clerk = useClerk();
    const { isLoaded, isSignedIn } = useAuth();
    const [, setLocation] = useLocation();
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const handleCallback = async () => {
            try {
                // Extrai o redirect da URL
                const params = new URLSearchParams(window.location.search);
                const targetUrl = params.get("redirect")
                    ? decodeURIComponent(params.get("redirect"))
                    : "/dashboard";

                // Se já está autenticado, redireciona imediatamente
                if (isLoaded && isSignedIn) {
                    console.log("✅ Already authenticated, redirecting to:", targetUrl);
                    setLocation(targetUrl);
                    return;
                }

                // Aguarda o Clerk processar o callback OAuth
                if (clerk.loaded) {
                    console.log("🔄 Processing OAuth callback...");

                    // Aguarda um pouco para o Clerk processar
                    await new Promise(resolve => setTimeout(resolve, 1500));

                    // Verifica se a autenticação foi bem sucedida
                    if (clerk.session) {
                        console.log("✅ Session established, redirecting to:", targetUrl);
                        setLocation(targetUrl);
                    } else {
                        console.log("⚠️ No session after callback");
                        // Aguarda mais um pouco e tenta novamente
                        await new Promise(resolve => setTimeout(resolve, 1000));

                        if (clerk.session) {
                            setLocation(targetUrl);
                        } else {
                            throw new Error("Falha ao estabelecer sessão");
                        }
                    }
                }
            } catch (err) {
                console.error("❌ SSO Callback Error:", err);
                setError(err.message || "Erro ao processar login");
                setIsProcessing(false);
            }
        };

        // Timeout de segurança de 10 segundos
        const timeout = setTimeout(() => {
            if (isProcessing) {
                console.log("⏱️ Timeout reached, checking auth state...");
                if (isSignedIn) {
                    const params = new URLSearchParams(window.location.search);
                    const targetUrl = params.get("redirect") || "/dashboard";
                    setLocation(targetUrl);
                } else {
                    setError("Tempo esgotado. Tente fazer login novamente.");
                    setIsProcessing(false);
                }
            }
        }, 10000);

        handleCallback();

        return () => clearTimeout(timeout);
    }, [clerk, isLoaded, isSignedIn, setLocation, isProcessing]);

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 blur-[120px] pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center w-full max-w-md space-y-6">
                    <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <AlertCircle size={32} className="text-rose-500" />
                    </div>

                    <div className="text-center space-y-2">
                        <h2 className="text-white font-black uppercase text-xl">Erro na Autenticação</h2>
                        <p className="text-zinc-400 text-sm">{error}</p>
                    </div>

                    <button
                        onClick={() => setLocation("/login")}
                        className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-black uppercase tracking-wider transition-all"
                    >
                        <ArrowLeft size={14} />
                        Voltar ao Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 overflow-hidden relative">
            {/* ELEMENTOS VISUAIS DE FUNDO */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-sky-500/10 blur-[80px] sm:blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-xs sm:max-w-sm">
                {/* LOADER ANIMADO */}
                <div className="relative mb-8 sm:mb-10">
                    <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-4 border-transparent border-t-sky-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck size={20} className="text-sky-500 sm:w-6 sm:h-6" />
                    </div>
                </div>

                {/* TEXTOS TÉCNICOS */}
                <div className="text-center space-y-3 mb-10 sm:mb-12">
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Cpu size={12} className="text-sky-500" />
                        <span className="text-[8px] font-black text-sky-500 uppercase tracking-[0.3em]">Protocolo_Auth</span>
                    </div>
                    <h2 className="text-white font-black uppercase tracking-[0.2em] sm:tracking-[0.4em] text-[10px] sm:text-xs italic">
                        Sincronizando Identidade
                    </h2>
                    <p className="text-zinc-600 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">
                        Validando credenciais do núcleo...
                    </p>
                </div>

                {/* BOTÃO DE CANCELAR */}
                <button
                    onClick={() => setLocation("/login")}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <ArrowLeft size={14} />
                    Abortar Processo
                </button>
            </div>

            {/* DECORAÇÃO HUD (Rodapé) */}
            <div className="absolute bottom-10 left-10 opacity-10 hidden sm:block">
                <div className="font-mono text-[8px] text-sky-400 space-y-1 uppercase tracking-tighter">
                    <p>Status: Handshake_Processing...</p>
                    <p>Session: {isSignedIn ? "Active" : "Pending"}</p>
                    <p>Encryption: RSA_4096_Active</p>
                </div>
            </div>
        </div>
    );
}
