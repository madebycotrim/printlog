import { Toaster } from "sonner";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";

/**
 * Componente de Toaster customizado com estética Premium usando Sonner.
 */
export function ToasterPremium() {
  const modoEscuro = useArmazemConfiguracoes((s) => s.tema.modoEscuro);

  return (
    <Toaster
      position="bottom-right"
      theme={modoEscuro ? "dark" : "light"}
      toastOptions={{
        className: 'rounded-2xl border border-zinc-200 dark:border-white/10 shadow-2xl backdrop-blur-md bg-white/90 dark:bg-zinc-900/90 font-sans',
        descriptionClassName: 'text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 leading-tight',
        titleClassName: 'text-[13px] font-bold text-zinc-900 dark:text-white leading-tight',
        style: {
          padding: '12px 16px',
        },
      }}
    />
  );
}
