import { useEffect, useRef, useState } from "react";
import { CheckCircle2 } from "lucide-react";

/**
 * Chave do Turnstile:
 * - Produção: variável de ambiente VITE_TURNSTILE_SITE_KEY
 */
const CHAVE_TURNSTILE = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

// Verifica se está rodando em ambiente de desenvolvimento local
const MODO_DESENVOLVIMENTO = typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");

interface ComponenteTurnstileProps {
    aoValidar: (token: string) => void;
    aoExpirar?: () => void;
}

/**
 * ComponenteTurnstile
 * Gerencia o desafio do Cloudflare de forma dinâmica.
 * No modo de desenvolvimento, realiza um bypass automático para evitar erros de Permissions-Policy.
 */
export function ComponenteTurnstile({ aoValidar, aoExpirar }: ComponenteTurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [scriptCarregado, setScriptCarregado] = useState(false);
    
    // Usa refs para os callbacks para evitar que o widget seja re-renderizado
    // quando o componente pai atualizar de estado (loop infinito).
    const aoValidarRef = useRef(aoValidar);
    const aoExpirarRef = useRef(aoExpirar);

    useEffect(() => {
        aoValidarRef.current = aoValidar;
        aoExpirarRef.current = aoExpirar;
    }, [aoValidar, aoExpirar]);

    // Efeito para carregar o script apenas quando o componente montar (Ignora no dev)
    useEffect(() => {
        if (MODO_DESENVOLVIMENTO) {
            // Em dev, auto-valida após um curto delay para simular o widget
            const timer = setTimeout(() => {
                aoValidarRef.current("dev-bypass-token-12345");
            }, 500);
            return () => clearTimeout(timer);
        }

        if ((window as any).turnstile) {
            setScriptCarregado(true);
            return;
        }

        // Verifica se o script já foi injetado no DOM por outra instância
        const scriptExistente = document.getElementById("cloudflare-turnstile-script");
        if (scriptExistente) {
            scriptExistente.addEventListener("load", () => setScriptCarregado(true));
            // Se já carregou antes de chegarmos aqui
            if ((window as any).turnstile) setScriptCarregado(true);
            return;
        }

        const script = document.createElement("script");
        script.id = "cloudflare-turnstile-script";
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        script.async = true;
        script.defer = true;
        script.onload = () => setScriptCarregado(true);
        document.head.appendChild(script);
    }, []);

    useEffect(() => {
        if (MODO_DESENVOLVIMENTO) return; // Não renderiza o widget real em dev
        if (!scriptCarregado || !containerRef.current) return;

        let ocupado = false;

        const renderizarWidget = () => {
            if (!containerRef.current || widgetIdRef.current || ocupado) return;
            
            ocupado = true;
            try {
                widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
                    sitekey: CHAVE_TURNSTILE,
                    theme: "dark",
                    callback: (token: string) => aoValidarRef.current(token),
                    "expired-callback": () => {
                        aoExpirarRef.current?.();
                        if (widgetIdRef.current) (window as any).turnstile.reset(widgetIdRef.current);
                    },
                    "error-callback": (errorCode: string) => {
                        console.warn(`[Turnstile] Erro ${errorCode}: Verifique a configuração do domínio.`);
                    }
                });
            } catch (erro) {
                console.warn("[Turnstile] Falha ao renderizar:", erro);
            } finally {
                ocupado = false;
            }
        };

        // Renderiza imediatamente se o objeto global estiver disponível
        if ((window as any).turnstile) {
            renderizarWidget();
        }

        return () => {
            if (widgetIdRef.current && (window as any).turnstile) {
                try {
                    const id = widgetIdRef.current;
                    widgetIdRef.current = null;
                    (window as any).turnstile.remove(id);
                } catch {
                    // Ignora erros na desmontagem
                }
            }
        };
    }, [scriptCarregado]);

    // UI customizada para o bypass no ambiente de desenvolvimento
    if (MODO_DESENVOLVIMENTO) {
        return (
            <div className="flex justify-center my-4 overflow-hidden rounded-xl">
                <div className="flex items-center gap-2 px-4 py-3 bg-[#0c0c0e]/50 border border-[#0ea5e9]/30 rounded-xl">
                    <CheckCircle2 size={16} className="text-[#0ea5e9]" />
                    <span className="text-xs font-semibold text-zinc-400">Verificação local (Dev Mode)</span>
                </div>
            </div>
        );
    }

    // Prevenção contra loop infinito em produção por falta de chave
    const erroChaveEmProducao = !MODO_DESENVOLVIMENTO && CHAVE_TURNSTILE === "1x00000000000000000000AA";

    return (
        <div className="flex flex-col items-center justify-center my-4 overflow-hidden rounded-xl min-h-[65px]">
            {erroChaveEmProducao ? (
                <div className="text-center px-4 py-2 border border-red-500/30 bg-red-500/10 rounded-xl text-xs text-red-400 w-full">
                    ⚠️ Erro de Configuração: VITE_TURNSTILE_SITE_KEY ausente na hospedagem.
                </div>
            ) : (
                <div ref={containerRef} id="cloudflare-turnstile-container" />
            )}
        </div>
    );
}
