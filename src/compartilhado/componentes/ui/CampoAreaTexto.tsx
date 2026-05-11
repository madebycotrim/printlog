import { TextareaHTMLAttributes, ElementType, forwardRef } from "react";

interface CampoAreaTextoProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  rotulo: string;
  icone?: ElementType;
  erro?: string;
}

export const CampoAreaTexto = forwardRef<HTMLTextAreaElement, CampoAreaTextoProps>(
  ({ rotulo, icone: Icone, erro, className = "", ...props }, ref) => {
    return (
      <div className={`space-y-2 ${className}`}>
        <label className="block text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest px-1">
          {rotulo}
        </label>
        <div className="relative flex items-start">
          {Icone && (
            <Icone
              size={16}
              strokeWidth={2}
              className={`absolute left-0 top-3 transition-colors duration-300 
                                ${
                                  erro
                                    ? "text-red-500"
                                    : "text-gray-400 dark:text-zinc-600 group-focus-within:text-zinc-900 dark:group-focus-within:text-white"
                                }`}
            />
          )}
          <textarea
            ref={ref}
            {...props}
            className={`w-full min-h-[100px] bg-transparent border-0 border-b-[3px] outline-none transition-all duration-300 placeholder:text-gray-400/50 dark:placeholder:text-zinc-700 font-normal text-sm text-gray-900 dark:text-white py-2 resize-none 
                            ${Icone ? "pl-8" : "pl-0"} 
                            ${
                              erro
                                ? "border-red-500 focus:border-red-600"
                                : "border-gray-100 dark:border-white/10 focus:border-gray-300 dark:focus:border-white/20"
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

CampoAreaTexto.displayName = "CampoAreaTexto";
