import { InputHTMLAttributes, forwardRef, ElementType, ChangeEvent } from "react";
import { DollarSign } from "lucide-react";

interface CampoMonetarioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  rotulo?: string;
  erro?: string;
  prefixo?: string;
  icone?: ElementType;
}

/**
 * Campo monetário que aceita tanto vírgula (,) quanto ponto (.) como separador decimal.
 * Internamente converte vírgula → ponto para compatibilidade com parseFloat/valueAsNumber.
 * @lgpd Sem coleta de dados pessoais.
 */
export const CampoMonetario = forwardRef<HTMLInputElement, CampoMonetarioProps>(
  ({ rotulo, erro, prefixo = "BRL", icone: Icone = DollarSign, className = "", onChange, ...props }, ref) => {

    /**
     * Intercepta o onChange para normalizar vírgula → ponto.
     * Permite que o react-hook-form receba sempre o formato numérico correto.
     */
    const lidarComMudanca = (e: ChangeEvent<HTMLInputElement>) => {
      // Substitui vírgula por ponto para o valor real
      const valorCorrigido = e.target.value.replace(",", ".");
      
      // Cria um evento sintético com o valor corrigido
      const eventoCorrigido = {
        ...e,
        target: { ...e.target, value: valorCorrigido },
      } as ChangeEvent<HTMLInputElement>;

      onChange?.(eventoCorrigido);
    };

    return (
      <div className={`space-y-1.5 ${className}`}>
        {rotulo && (
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1">
            {rotulo}
          </label>
        )}
        <div className="relative flex items-center group">
          <Icone
            size={16}
            strokeWidth={2.5}
            className={`absolute left-0 transition-colors duration-300 
                            ${
                              erro
                                ? "text-red-500"
                                : "text-gray-400 dark:text-[var(--text-muted)] group-focus-within:text-gray-900 dark:group-focus-within:text-white"
                            }`}
          />
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            pattern="[0-9]*[.,]?[0-9]*"
            {...props}
            onChange={lidarComMudanca}
            className={`w-full h-10 bg-transparent border-0 border-b-2 outline-none transition-all duration-300 placeholder:text-gray-400/50 dark:placeholder:text-zinc-700 font-normal text-sm text-gray-900 dark:text-white pl-8 pr-12
                            ${
                              erro
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-100 dark:border-[var(--border-subtle)] focus:border-gray-400 dark:focus:border-white"
                            }`}
          />
          <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 dark:text-zinc-600 pointer-events-none uppercase">
            {prefixo}
          </span>
        </div>
        {erro && (
          <span className="text-[10px] font-bold text-red-500 mt-1 block animate-in fade-in slide-in-from-top-1">
            {erro}
          </span>
        )}
      </div>
    );
  },
);

CampoMonetario.displayName = "CampoMonetario";
