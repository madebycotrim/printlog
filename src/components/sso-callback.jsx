import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import { useLocation } from "wouter";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function SSOCallback() {
    const [, setLocation] = useLocation();

    return (
        <div className="min-h-screen bg-[#050506] flex flex-col items-center justify-center p-6">
            {/* Elementos Visuais de Fundo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-500/10 blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
                {/* Loader Animado */}
                <div className="relative mb-8">
                    <div className="h-20 w-20 rounded-full border-t-2 border-sky-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldCheck size={24} className="text-sky-500 animate-pulse" />
                    </div>
                </div>

                <div className="text-center space-y-2 mb-10">
                    <h2 className="text-white font-black uppercase tracking-[0.4em] text-xs">
                        Sincronizando Identidade
                    </h2>
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest animate-pulse">
                        Aguarde a resposta do provedor...
                    </p>
                </div>

                {/* Botão de Voltar/Cancelar */}
                <button 
                    onClick={() => setLocation("/login")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-zinc-500 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                >
                    <ArrowLeft size={14} />
                    Cancelar e Voltar
                </button>
            </div>

            {/* Componente Lógico do Clerk (Oculto) */}
            <div className="hidden">
                <AuthenticateWithRedirectCallback 
                    afterSignInUrl="/dashboard"
                    afterSignUpUrl="/dashboard"
                />
            </div>
        </div>
    );
}