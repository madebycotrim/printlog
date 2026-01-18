import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const InstallPwa = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Previne o prompt padrão do Chrome
            e.preventDefault();
            // Salva o evento para disparar depois
            setDeferredPrompt(e);
            // Mostra o botão
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Verifica se já está instalado
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsVisible(false);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Mostra o prompt nativo
        deferredPrompt.prompt();

        // Espera a escolha do usuário
        const { outcome } = await deferredPrompt.userChoice;

        // Log do resultado (opcional)
        console.log(`User response to the install prompt: ${outcome}`);

        // Limpa o prompt, pois ele só pode ser usado uma vez
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="relative group bg-zinc-950/90 backdrop-blur-xl border border-zinc-800 p-1 pl-1 rounded-2xl shadow-2xl flex items-center gap-4 pr-6 overflow-hidden">

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-sky-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="w-12 h-12 bg-zinc-900 rounded-xl flex items-center justify-center shrink-0 border border-zinc-800 shadow-inner">
                    <Smartphone size={24} className="text-zinc-100" strokeWidth={1.5} />
                </div>

                <div className="flex flex-col mr-2">
                    <span className="text-zinc-100 font-bold text-sm tracking-tight">Instalar App</span>
                    <span className="text-zinc-500 text-[10px] uppercase tracking-wider font-bold">Acesso Rápido & Offline</span>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={handleInstall}
                        className="bg-zinc-100 hover:bg-white text-zinc-950 font-black px-4 py-2 rounded-lg text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-zinc-950/50"
                    >
                        Instalar
                    </button>
                    <button
                        onClick={() => setIsVisible(false)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-900 text-zinc-500 hover:text-zinc-300 transition-colors"
                        aria-label="Fechar"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};
