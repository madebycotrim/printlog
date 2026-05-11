import { InputHTMLAttributes, ElementType, forwardRef, ChangeEvent } from "react";

interface CampoTextoProps extends InputHTMLAttributes<HTMLInputElement> {
  rotulo?: string;
  icone?: ElementType;
  erro?: string;
}

/**
 * Campo de texto genérico. Quando type="number", automaticamente aceita
 * tanto vírgula (,) quanto ponto (.) como separador decimal.
 */
export const CampoTexto = forwardRef<HTMLInputElement, CampoTextoProps>(
  ({ rotulo, icone: Icone, erro, className = "", type, onChange, ...props }, ref) => {

    /** Se é campo numérico, converte vírgula → ponto no onChange */
    const ehNumerico = type === "number";

    const lidarComMudanca = (e: ChangeEvent<HTMLInputElement>) => {
      if (ehNumerico) {
        const valorCorrigido = e.target.value.replace(",", ".");
        const eventoCorrigido = {
          ...e,
          target: { ...e.target, value: valorCorrigido },
        } as ChangeEvent<HTMLInputElement>;
        onChange?.(eventoCorrigido);
      } else {
        onChange?.(e);
      }
    };

    return (
      <div className={`space-y-1.5 ${className}`}>
        {rotulo && (
          <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1">
            {rotulo}
          </label>
        )}
        <div className="relative flex items-center group">
          {Icone && (
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
          )}
          <input
            ref={ref}
            type={ehNumerico ? "text" : type}
            inputMode={ehNumerico ? "decimal" : undefined}
            pattern={ehNumerico ? "[0-9]*[.,]?[0-9]*" : undefined}
            {...props}
            onChange={lidarComMudanca}
            className={`w-full h-10 bg-transparent border-0 border-b-2 border-gray-100 dark:border-[var(--border-subtle)] outline-none transition-all duration-300 placeholder:text-gray-400/50 dark:placeholder:text-zinc-700 font-normal text-sm text-gray-900 dark:text-white 
                            ${Icone ? "pl-8" : "pl-1"} 
                            ${
                              erro
                                ? "border-red-500 focus:border-red-600"
                                : "focus:border-gray-400 dark:focus:border-white"
                            }`}
          />
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

CampoTexto.displayName = "CampoTexto";
