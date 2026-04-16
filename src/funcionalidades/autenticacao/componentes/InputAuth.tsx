import { ComponentProps, useState, ElementType, ReactNode } from "react";

interface PropsInputAuth extends ComponentProps<"input"> {
  label: string;
  icone: ElementType;
  labelDireita?: ReactNode;
  erro?: string;
}

export function InputAuth({
  label,
  icone: Icone,
  labelDireita,
  ...props
}: PropsInputAuth) {
  const [focou, definirFocou] = useState(false);

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center ml-1">
        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
          {label}
        </label>
        {labelDireita}
      </div>
      <div className="relative group">
        <Icone
          size={18}
          className={`absolute left-0 top-1/2 -translate-y-1/2 transition-colors duration-300 ${focou ? "text-white" : "text-zinc-600 group-hover:text-zinc-500"
            }`}
        />
        <input
          {...props}
          onFocus={(e) => {
            definirFocou(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            definirFocou(false);
            props.onBlur?.(e);
          }}
          className={`w-full h-10 bg-transparent border-0 border-b-[3px] ${props.erro ? 'border-red-500' : 'border-gray-100 dark:border-white/10 focus:border-gray-300 dark:focus:border-white/20'} text-sm text-gray-900 dark:text-white outline-none transition-all duration-300 placeholder:text-gray-400/50 dark:placeholder:text-zinc-700 font-normal pl-8 ${props.className || ""}`}
        />
      </div>
    </div>
  );
}
