import { InputHTMLAttributes, forwardRef, ElementType, ChangeEvent, useState, useEffect } from "react";
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
    ({ rotulo, erro, prefixo = "BRL", icone: Icone = DollarSign, className = "", onChange, value, onBlur, ...props }, ref) => {
      const [valorTemporario, setValorTemporario] = useState<string | undefined>(undefined);
  
      /**
       * Intercepta o onChange para aplicar a máscara de centavos.
       */
      const lidarComMudanca = (e: ChangeEvent<HTMLInputElement>) => {
        const apenasNumeros = e.target.value.replace(/\D/g, "");
        const valorCentavos = apenasNumeros ? parseInt(apenasNumeros, 10) : 0;
        const valorDecimal = (valorCentavos / 100).toFixed(2);
  
        e.target.value = valorDecimal; // Atualiza o valor no evento para o register capturar o número
        setValorTemporario(valorDecimal);
        onChange?.(e);
      };
  
      const lidarComBlur = (e: any) => {
        // NÃO limpamos o valorTemporario aqui para evitar o reset visual no uncontrolled mode
        onBlur?.(e);
      };
  
      // Prioridade: Valor que está sendo digitado > Valor controlado externo > Vazio
      const formatarParaExibicao = (val: string | number | readonly string[] | undefined) => {
          if (val === undefined || val === null || val === "") return "";
          const numerico = typeof val === 'number' ? val : parseFloat(val as string);
          if (isNaN(numerico)) return val as string;
          return numerico.toFixed(2);
      };

      // Sincroniza mudanças externas (ex: setValue do react-hook-form ou cálculos manuais)
      useEffect(() => {
        if (value !== undefined && value !== null) {
          const novoValor = formatarParaExibicao(value);
          if (novoValor !== valorTemporario) {
            setValorTemporario(novoValor);
          }
        }
      }, [value]);

      const valorParaExibir = valorTemporario !== undefined 
        ? valorTemporario 
        : formatarParaExibicao(value);

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
            pattern="^[0-9]*[.,]?[0-9]*$"
            value={valorParaExibir}
            onBlur={lidarComBlur}
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
