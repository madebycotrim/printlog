import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { ArrowLeft, ShieldCheck, Cpu } from "lucide-react";
import { useLocation } from "wouter";

export default function SSOCallback() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6 overflow-hidden relative">
            {/* ELEMENTOS VISUAIS DE FUNDO */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 sm:w-96 h-64 sm:h-96 bg-sky-500/10 blur-[80px] sm:blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full max-w-xs sm:max-w-sm">
                {/* O Componente do Clerk lida com o processamento */}
                <AuthenticateWithRedirectCallback
                    signInForceRedirectUrl="/dashboard"
                    signUpForceRedirectUrl="/dashboard"
                />

                {/* LOADER ANIMADO (Visual apenas, para manter a consistência enquanto o Clerk processa) */}
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

                {/* BOTÃO DE CANCELAR (Fallback) */}
                <button
                    onClick={() => setLocation("/login")}
                    className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 text-[10px] font-black uppercase tracking-widest transition-all"
                >
                    <ArrowLeft size={14} />
                    Cancelar
                </button>
            </div>

            {/* DECORAÇÃO HUD (Rodapé) */}
            <div className="absolute bottom-10 left-10 opacity-10 hidden sm:block">
                <div className="font-mono text-[8px] text-sky-400 space-y-1 uppercase tracking-tighter">
                    <p>Status: Handshake_Processing...</p>
                    <p>Mode: Clerk_Native_Callback</p>
                    <p>Encryption: RSA_4096_Active</p>
                </div>
            </div>
        </div>
    );
}
