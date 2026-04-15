import { InputHTMLAttributes, forwardRef, ElementType } from "react";
import { DollarSign } from "lucide-react";

interface CampoMonetarioProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  rotulo?: string;
  erro?: string;
  prefixo?: string;
  icone?: ElementType;
}

export const CampoMonetario = forwardRef<HTMLInputElement, CampoMonetarioProps>(
  ({ rotulo, erro, prefixo = "BRL", icone: Icone = DollarSign, className = "", ...props }, ref) => {
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
            type="number"
            step="0.01"
            {...props}
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
