import { useEffect, useRef } from "react";

interface ComponenteTurnstileProps {
    aoValidar: (token: string) => void;
    aoExpirar?: () => void;
}

/**
 * ComponenteTurnstile
 * Widget do Cloudflare Turnstile adaptado para o tema PrintLog.
 * @param aoValidar - Callback disparado quando o desafio é superado.
 */
export function ComponenteTurnstile({ aoValidar, aoExpirar }: ComponenteTurnstileProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);

    useEffect(() => {
        // Verifica se o script do Turnstile foi carregado
        if (!(window as any).turnstile) return;

        // Renderiza o widget
        if (containerRef.current && !widgetIdRef.current) {
            widgetIdRef.current = (window as any).turnstile.render(containerRef.current, {
                sitekey: "1x00000000000000000000AA", // Chave de Teste da Cloudflare (Sempre funciona no localhost)
                theme: "dark",
                callback: (token: string) => {
                    aoValidar(token);
                },
                "expired-callback": () => {
                    aoExpirar?.();
                },
            });
        }

        // Cleanup: Remove o widget ao desmontar o componente
        return () => {
            if (widgetIdRef.current && (window as any).turnstile) {
                // (window as any).turnstile.remove(widgetIdRef.current);
            }
        };
    }, [aoValidar, aoExpirar]);

    return (
        <div className="flex justify-center my-4 overflow-hidden rounded-xl">
            <div ref={containerRef} />
        </div>
    );
}
