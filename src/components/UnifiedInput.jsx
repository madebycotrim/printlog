import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from "lucide-react";

/* ---------- COMPONENTE: INTERNAL SELECT (Sem Portal) ---------- */
const InternalSelect = ({ value, onChange, options, placeholder, isOpen, setOpen }) => {
  const selected = useMemo(() => {
    for (const g of options || []) {
      const found = g.items?.find(i => String(i.value) === String(value));
      if (found) return found;
    }
    return null;
  }, [options, value]);

  return (
    <div className="w-full h-full flex items-center">
      {/* Gatilho do Select */}
      <div 
        onClick={() => setOpen(!isOpen)} 
        className="w-full h-full flex items-center cursor-pointer select-none"
      >
        <span className={`text-[11px] font-mono font-bold uppercase truncate ${selected ? "text-zinc-100" : "text-zinc-600"}`}>
          {selected ? selected.label : placeholder}
        </span>
      </div>

      {/* Menu Suspenso (Posicionamento Absoluto) */}
      {isOpen && (
        <div 
          className="absolute left-0 top-[calc(100%+6px)] bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl z-[1000] overflow-hidden w-max min-w-full max-w-[300px] animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="max-h-60 overflow-y-auto p-1.5 custom-scrollbar flex flex-col">
            {(options || []).map((g, i) => (
              <div key={i} className="mb-1 last:mb-0">
                {g.group && (
                  <div className="px-3 py-1 text-[7px] font-black text-zinc-600 uppercase tracking-widest">
                    {g.group}
                  </div>
                )}
                {g.items?.map(item => (
                  <div 
                    key={item.value} 
                    onClick={() => { onChange(item.value); setOpen(false); }}
                    className={`px-3 py-2.5 rounded-lg flex items-center justify-between text-[10px] font-bold uppercase cursor-pointer transition-colors whitespace-nowrap gap-4 ${
                      String(value) === String(item.value) 
                        ? "bg-sky-500/10 text-sky-400" 
                        : "text-zinc-400 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {String(value) === String(item.value) && (
                      <Check size={12} className="shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ---------- COMPONENTE PRINCIPAL: UNIFIED INPUT ---------- */
export const UnifiedInput = ({
  label, subtitle, icon: Icon, suffix, isLucro, type, options, variant = "default",
  hoursValue, onHoursChange, minutesValue, onMinutesChange, ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const containerRef = useRef(null);

  const isTime = type === "time";
  const isSelect = type === "select";
  const isGhost = variant === "ghost";
  const isActive = isFocused || isSelectOpen;

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClick = (e) => { 
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsSelectOpen(false); 
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    /* 
       ESTRATEGIA Z-INDEX: 
       Quando o select abre, esta div ganha 'z-50' e 'relative', 
       fazendo-a flutuar sobre os vizinhos do grid/flex sem precisar de Portal.
    */
    <div className={`flex-1 min-w-0 flex flex-col gap-1.5 transition-all duration-200 
      ${isSelectOpen ? 'relative z-50' : 'relative z-0'}`}
    >
      {label && !isGhost && (
        <div className="flex justify-between items-end px-1">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em]">
            {label}
          </label>
          {subtitle && (
            <span className="text-[7px] font-black text-zinc-700 uppercase">
              {subtitle}
            </span>
          )}
        </div>
      )}

      <div 
        ref={containerRef}
        className={`relative flex items-center h-11 transition-all duration-300 
          ${isGhost ? "bg-transparent border-none" : "bg-[#070708] border rounded-xl"} 
          ${!isGhost && (isActive || isLucro 
            ? "border-sky-500/60 shadow-[0_0_15px_-5px_rgba(14,165,233,0.3)] ring-1 ring-sky-500/10" 
            : "border-zinc-800/60 hover:border-zinc-700")}`}
      >
        {/* Ícone Lateral */}
        {Icon && (
          <div className={`absolute left-3.5 pointer-events-none ${isActive || isLucro ? "text-sky-500" : "text-zinc-600"}`}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
        )}

        {/* Área de Conteúdo (Grid p/ Time ou Flex p/ Normal) */}
        <div className={`flex-1 h-full grid ${isTime ? 'grid-cols-2 divide-x divide-zinc-900/50' : 'grid-cols-1'}`}>
          {isTime ? (
            <>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  value={hoursValue ?? ""} 
                  onChange={e => onHoursChange?.(e.target.value)} 
                  onFocus={(e) => { e.target.select(); setIsFocused(true); }} 
                  onBlur={() => setIsFocused(false)}
                  className={`w-full h-full bg-transparent text-zinc-100 text-[13px] font-mono font-bold outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${Icon ? 'pl-10' : ''} pr-6`} 
                  placeholder="0" 
                />
                <span className="absolute right-3 text-[8px] font-black text-zinc-800 uppercase">H</span>
              </div>
              <div className="relative flex items-center">
                <input 
                  type="number" 
                  max={59} 
                  value={minutesValue ?? ""} 
                  onChange={e => onMinutesChange?.(e.target.value)} 
                  onFocus={(e) => { e.target.select(); setIsFocused(true); }} 
                  onBlur={() => setIsFocused(false)}
                  className="w-full h-full bg-transparent text-zinc-100 text-[13px] font-mono font-bold outline-none text-center pl-2 pr-9 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  placeholder="00" 
                />
                <span className="absolute right-3 text-[8px] font-black text-zinc-800 uppercase">MIN</span>
              </div>
            </>
          ) : (
            <div className={`h-full flex items-center ${Icon ? 'pl-10' : 'pl-4'} ${suffix ? 'pr-8' : 'pr-4'}`}>
              {isSelect ? (
                <InternalSelect 
                  {...props} 
                  options={options} 
                  isOpen={isSelectOpen} 
                  setOpen={setIsSelectOpen} 
                />
              ) : (
                <input 
                  {...props} 
                  onFocus={(e) => { e.target.select(); setIsFocused(true); }} 
                  onBlur={() => setIsFocused(false)}
                  className="w-full h-full bg-transparent text-zinc-100 text-[13px] font-mono font-bold outline-none" 
                />
              )}
            </div>
          )}
        </div>

        {/* Suffix (R$, %, G...) */}
        {!isTime && suffix && (
          <span className={`absolute right-3 text-[9px] font-black uppercase ${isActive || isLucro ? "text-sky-500/50" : "text-zinc-700"}`}>
            {suffix}
          </span>
        )}

        {/* Seta do Select */}
        {isSelect && (
          <div className="absolute right-3 text-zinc-600 pointer-events-none">
            <ChevronDown size={14} className={`transition-transform duration-300 ${isSelectOpen ? "rotate-180 text-sky-500" : ""}`} />
          </div>
        )}
      </div>
    </div>
  );
};