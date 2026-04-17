import { SelectHTMLAttributes, forwardRef } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

interface OpcaoSelect {
  valor: string;
  formatado: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange"> {
  label?: string;
  error?: string;
  opcoes: OpcaoSelect[];
  valorSelecionado: string;
  aoMudar: (valor: string) => void;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", opcoes, valorSelecionado, aoMudar, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && <label className="block text-xs font-bold text-gray-700 dark:text-zinc-400 mb-1.5">{label}</label>}
        <div className="relative group flex items-center">
          <select
            ref={ref}
            value={valorSelecionado}
            onChange={(e) => aoMudar(e.target.value)}
            className={`w-full h-11 px-4 pr-10 appearance-none bg-gray-50 hover:bg-gray-100 dark:bg-zinc-900 dark:hover:bg-zinc-800/80 border ${error ? "border-red-500" : "border-gray-200 dark:border-white/5 focus:border-zinc-800 focus:ring-1 focus:ring-zinc-800 dark:focus:border-white dark:focus:ring-white"} focus:bg-white dark:focus:bg-[#0c0c0e] rounded-lg text-sm text-gray-900 dark:text-white outline-none transition-all font-medium ${className}`}
            {...props}
          >
            <option disabled value="">
              Selecione...
            </option>
            {opcoes.map((opc) => (
              <option key={opc.valor} value={opc.valor}>
                {opc.formatado}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && (
          <span className="text-[10px] font-bold text-red-500 mt-1 flex items-center gap-1">
            <AlertCircle size={12} /> {error}
          </span>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";
