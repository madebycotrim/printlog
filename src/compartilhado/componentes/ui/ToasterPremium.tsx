import { Toaster } from "sonner";
import { useContextoTema } from "@/configuracoes/tema/tema_provider";
import { Check, Info, XCircle, Loader2 } from "lucide-react";

/**
 * Componente de Toaster customizado alinhado ao Design System do PrintLog.
 * Cartões no formato rounded-2xl com bordas de acento neon, glassmorphism e sombras elegantes.
 */
export function ToasterPremium() {
  const { modoEfetivo } = useContextoTema();
  const modoEscuro = modoEfetivo === "escuro";

  return (
    <Toaster
      position="bottom-right"
      theme={modoEscuro ? "dark" : "light"}
      toastOptions={{
        style: {
          borderRadius: '1rem',
          padding: '14px 18px',
          minWidth: '300px',
        },
        classNames: {
          toast: '!rounded-2xl !border !border-zinc-200 dark:!border-zinc-800/80 !bg-white/95 dark:!bg-[#18181b]/95 !backdrop-blur-2xl !shadow-[0_15px_35px_rgba(0,0,0,0.15)] dark:!shadow-[0_15px_35px_rgba(0,0,0,0.6)] !font-sans group-data-[type=success]:!border-l-4 group-data-[type=success]:!border-l-emerald-500 group-data-[type=error]:!border-l-4 group-data-[type=error]:!border-l-rose-500 group-data-[type=info]:!border-l-4 group-data-[type=info]:!border-l-cyan-500 group-data-[type=loading]:!border-l-4 group-data-[type=loading]:!border-l-amber-500',
          title: '!text-zinc-900 dark:!text-white !font-bold !text-xs tracking-tight',
          description: '!text-zinc-500 dark:!text-zinc-400 !text-[11px] !font-medium !mt-0.5',
          icon: '!mr-3.5',
        },
      }}
      icons={{
        success: (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)] shrink-0 mr-3.5">
            <Check size={16} strokeWidth={2.5} />
          </div>
        ),
        error: (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)] shrink-0 mr-3.5">
            <XCircle size={16} strokeWidth={2.5} />
          </div>
        ),
        info: (
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border border-cyan-500/20 shadow-[0_0_10px_rgba(6,182,212,0.15)] shrink-0 mr-3.5">
            <Info size={16} strokeWidth={2.5} />
          </div>
        ),
        loading: (
          <div className="flex h-8 w-8 items-center justify-center text-amber-500 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl shrink-0 mr-3.5">
            <Loader2 size={16} className="animate-spin" />
          </div>
        ),
      }}
    />
  );
}
