import toast, { Toaster } from "react-hot-toast";
import { Check, Info, XCircle, X } from "lucide-react";

/**
 * Componente de Toaster customizado com estética Premium (Glassmorphism + Framer Motion).
 * Alinhado com o design da página de configurações.
 */
export function ToasterPremium() {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'transparent',
          boxShadow: 'none',
          border: 'none',
          padding: 0,
        },
      }}
    >
      {(t) => (
        <div
          className={`
            flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl backdrop-blur-md border 
            transition-all duration-300 transform
            ${t.visible ? "translate-y-0 opacity-100 scale-100" : "translate-y-4 opacity-0 scale-95"}
            ${
              t.type === "error"
                ? "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/30"
                : "bg-white/90 dark:bg-zinc-900/90 border-zinc-200 dark:border-white/10"
            }
          `}
          style={{ 
            maxWidth: '380px',
            width: '100%'
          }}
        >
          {/* Ícone customizado baseado no tipo */}
          <div className="shrink-0">
            {t.type === "success" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Check size={16} strokeWidth={3} />
              </div>
            )}
            {t.type === "error" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400">
                <XCircle size={16} strokeWidth={3} />
              </div>
            )}
            {t.type === "loading" && (
              <div className="flex h-8 w-8 items-center justify-center text-sky-500">
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {t.type !== "success" && t.type !== "error" && t.type !== "loading" && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400">
                <Info size={16} strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Conteúdo da Mensagem */}
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-bold text-zinc-900 dark:text-white leading-tight">
              {t.type === "success" ? "Sucesso" : t.type === "error" ? "Ops! Algo deu errado" : "Notificação"}
            </div>
            <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight truncate">
              {typeof t.message === 'function' ? t.message(t) : t.message}
            </div>
          </div>

          {/* Botão Fechar */}
          {t.type !== "loading" && (
            <button
              onClick={() => toast.dismiss(t.id)}
              className="p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-400 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}
    </Toaster>
  );
}
