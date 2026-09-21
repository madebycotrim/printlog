import { Toaster } from "sonner";
import { useContextoTema } from "@/configuracoes/tema/tema_provider";
import { Check, Info, XCircle, Loader2, AlertTriangle } from "lucide-react";

/**
 * Componente de Toaster de Luxo com Estética Ultra-Premium PrintLog.
 * - Barra de luz neon no topo superior (sucesso, erro, info, aviso).
 * - Brilho ambiental sutil no canto do cartão.
 * - Badges 3D de alta definição com gradiente de cor.
 * - Botão fechar (X) integrado e suporte a ações interativas.
 */
export function ToasterPremium() {
  const { modoEfetivo } = useContextoTema();
  const modoEscuro = modoEfetivo === "escuro";

  return (
    <Toaster
      position="bottom-right"
      theme={modoEscuro ? "dark" : "light"}
      closeButton
      visibleToasts={4}
      duration={4000}
      style={{ zIndex: 999999 }}
      toastOptions={{
        style: {
          borderRadius: '1.1rem',
          padding: '16px 20px',
          minWidth: '320px',
        },
        classNames: {
          toast: '!relative !overflow-visible !flex !items-center !gap-4 !rounded-2xl !border !border-zinc-200/90 dark:!border-white/10 !bg-white/95 dark:!bg-[#121217]/95 !backdrop-blur-2xl !shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:!shadow-[0_20px_50px_rgba(0,0,0,0.7)] !font-sans group-data-[type=success]:before:!bg-gradient-to-r group-data-[type=success]:before:!from-emerald-500 group-data-[type=success]:before:!via-teal-400 group-data-[type=success]:before:!to-emerald-300 group-data-[type=error]:before:!bg-gradient-to-r group-data-[type=error]:before:!from-rose-500 group-data-[type=error]:before:!via-pink-500 group-data-[type=error]:before:!to-red-400 group-data-[type=warning]:before:!bg-gradient-to-r group-data-[type=warning]:before:!from-amber-500 group-data-[type=warning]:before:!via-orange-400 group-data-[type=warning]:before:!to-yellow-400 group-data-[type=info]:before:!bg-gradient-to-r group-data-[type=info]:before:!from-cyan-500 group-data-[type=info]:before:!via-sky-400 group-data-[type=info]:before:!to-blue-400 before:!absolute before:!top-0 before:!left-0 before:!right-0 before:!h-[3px] before:!rounded-t-2xl',
          title: '!text-zinc-900 dark:!text-zinc-100 !font-bold !text-xs !tracking-tight !ml-2',
          description: '!text-zinc-500 dark:!text-zinc-400 !text-[11px] !font-medium !mt-0.5 !leading-relaxed !ml-2',
          content: '!ml-2',
          closeButton: '!z-[99999] !cursor-pointer !pointer-events-auto !border !border-zinc-200 dark:!border-white/10 !bg-white/90 dark:!bg-zinc-800/90 !text-zinc-600 dark:!text-zinc-300 hover:!bg-zinc-100 dark:hover:!bg-zinc-700 !transition-colors shadow-sm',
          actionButton: '!bg-sky-500 hover:!bg-sky-600 !text-white !font-bold !text-xs !rounded-xl !px-3 !py-1.5 !transition-all !shadow-sm active:!scale-95',
          cancelButton: '!bg-zinc-200 dark:!bg-zinc-800 hover:!bg-zinc-300 dark:hover:!bg-zinc-700 !text-zinc-700 dark:!text-zinc-200 !font-medium !text-xs !rounded-xl !px-3 !py-1.5 !transition-all',
        },
      }}
      icons={{
        success: (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-teal-500/5 text-emerald-500 dark:text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)] shrink-0">
            <Check size={18} strokeWidth={2.5} />
          </div>
        ),
        error: (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/20 via-rose-500/10 to-pink-500/5 text-rose-500 dark:text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.2)] shrink-0">
            <XCircle size={18} strokeWidth={2.5} />
          </div>
        ),
        warning: (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-orange-500/5 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
            <AlertTriangle size={18} strokeWidth={2.5} />
          </div>
        ),
        info: (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 via-cyan-500/10 to-sky-500/5 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)] shrink-0">
            <Info size={18} strokeWidth={2.5} />
          </div>
        ),
        loading: (
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-amber-500/10 to-orange-500/5 text-amber-500 dark:text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] shrink-0">
            <Loader2 size={18} className="animate-spin" />
          </div>
        ),
      }}
    />
  );
}
