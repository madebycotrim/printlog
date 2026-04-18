import { useEffect, useRef, useState } from "react";

/**
 * Chave do Turnstile:
 * - Produção: variável de ambiente VITE_TURNSTILE_SITE_KEY
 * - Desenvolvimento: fallback para chave de teste da Cloudflare (sempre passa)
 */
const CHAVE_TURNSTILE =
    (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"))
        ? "1x00000000000000000000AA"
        : import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA";

interface ComponenteTurnstileProps {
    aoValidar: (token: string) => void;
    aoExpirar?: () => void;
}

/**
 * ComponenteTurnstile
 * Gerencia o desafio do Cloudflare de forma dinâmica.
 */
export function ComponenteTurnstile({ aoValidar, aoExpirar }: ComponenteTurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [scriptCarregado, setScriptCarregado] = useState(false);

    // Efeito para carregar o script apenas quando o componente montar
    useEffect(() => {
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
        if (!scriptCarregado || !containerRef.current) return;

        let montado = true;

        const renderizarWidget = () => {
            if (!containerRef.current || widgetIdRef.current || !montado) return;

            try {
                widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
                    sitekey: CHAVE_TURNSTILE,
                    theme: "dark",
                    callback: (token: string) => {
                        if (montado) aoValidar(token);
                    },
                    "expired-callback": () => {
                        if (montado) {
                            aoExpirar?.();
                            // Reset apenas em expiração, pois o token ficou velho
                            if (widgetIdRef.current) (window as any).turnstile.reset(widgetIdRef.current);
                        }
                    },
                    "error-callback": (errorCode: string) => {
                        // Não resetamos em caso de erro crítico (110200 etc) para evitar loops infinitos
                        console.warn(`[Turnstile] Erro ${errorCode}: Verifique se o domínio está autorizado para esta SiteKey.`);
                    }
                });
            } catch (erro) {
                console.warn("[Turnstile] Falha ao renderizar widget:", erro);
            }
        };

        // Pequeno delay para garantir que o containerRef está estável no DOM
        const timer = setTimeout(renderizarWidget, 100);

        return () => {
            montado = false;
            clearTimeout(timer);
            if (widgetIdRef.current && (window as any).turnstile) {
                try {
                    const id = widgetIdRef.current;
                    widgetIdRef.current = null;
                    (window as any).turnstile.remove(id);
                } catch {
                    // Silencia erros de remoção tardia
                }
            }
        };
    }, [scriptCarregado, aoValidar, aoExpirar]);

    return (
        <div className="flex justify-center my-4 overflow-hidden rounded-xl min-h-[65px]">
            <div ref={containerRef} id="cloudflare-turnstile-container" />
        </div>
    );
}
