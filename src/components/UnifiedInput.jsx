import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Check } from "lucide-react";

/* ---------- COMPONENTE: INTERNAL SELECT ---------- */
const InternalSelect = ({ value, onChange, options, placeholder, isOpen, setOpen }) => {
  const selected = useMemo(() => {
    for (const g of options || []) {
      const found = g.items?.find(i => String(i.value) === String(value));
      if (found) return found;
    }
    return null;
  }, [options, value]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, setOpen]);

  return (
    <div className="w-full h-full flex items-center">
      {/* Gatilho interno apenas para área de texto */}
      <div className="w-full h-full flex items-center select-none">
        <span className={`text-[11px] font-mono font-bold uppercase truncate transition-colors ${selected ? "text-zinc-100" : "text-zinc-600"
          }`}>
          <div className="flex items-center gap-2 truncate">
            {selected?.color && selected.color !== 'transparent' && (
              <div className="w-2 h-2 rounded-full shrink-0 border border-white/10" style={{ backgroundColor: selected.color }} />
            )}
            {selected ? selected.label : placeholder}
          </div>
        </span>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 top-[calc(100%+6px)] bg-[#0c0c0e] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[1000] overflow-hidden w-max min-w-full max-w-[320px] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar flex flex-col">
            {(options || []).map((g, i) => (
              <div key={i} className="mb-2 last:mb-0">
                {g.group && (
                  <div className="px-3 py-1.5 text-[7px] font-black text-zinc-600 uppercase tracking-[0.2em] border-b border-white/5 mb-1">
                    {g.group}
                  </div>
                )}
                {g.items?.map(item => (
                  <div
                    key={item.value}
                    onClick={(e) => {
                      e.stopPropagation(); // Evita reabrir ao selecionar
                      onChange(item.value);
                      setOpen(false);
                    }}
                    className={`px-3 py-2.5 rounded-lg flex items-center justify-between text-[10px] font-bold uppercase cursor-pointer transition-all duration-200 whitespace-nowrap gap-6 ${String(value) === String(item.value)
                      ? "bg-sky-500/15 text-sky-400"
                      : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200"
                      }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {item.color && String(value) === "manual" && item.value !== "manual" ? null : (
                        item.color && item.color !== 'transparent' && <div className="w-2 h-2 rounded-full shrink-0 border border-white/10" style={{ backgroundColor: item.color }} />
                      )}
                      <span className="truncate">{item.label}</span>
                    </div>
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

  // Referências para disparar o foco
  const containerRef = useRef(null);
  const mainInputRef = useRef(null);
  const hoursInputRef = useRef(null);

  const isTime = type === "time";
  const isSelect = type === "select";
  const isGhost = variant === "ghost";
  const isActive = isFocused || isSelectOpen;

  // Gerenciador de clique no container
  const handleContainerClick = () => {
    if (isSelect) {
      setIsSelectOpen(!isSelectOpen);
    } else if (isTime) {
      hoursInputRef.current?.focus();
    } else {
      mainInputRef.current?.focus();
    }
  };

  const handleWheel = (e) => {
    if (type === "number" || isTime) e.target.blur();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsSelectOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`flex-1 min-w-[120px] flex flex-col gap-1.5 transition-all duration-300 
      ${isSelectOpen ? 'relative z-[60]' : 'relative z-0'}`}
    >
      {label && !isGhost && (
        <div className="flex justify-between items-end px-1.5 h-3">
          <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em] select-none uppercase">
            {label}
          </label>
          {subtitle && (
            <span className="text-[7px] font-black text-zinc-700 uppercase select-none">
              {subtitle}
            </span>
          )}
        </div>
      )}

      <div
        ref={containerRef}
        onClick={handleContainerClick}
        className={`relative flex items-center h-11 transition-all duration-300 cursor-pointer
          ${isGhost ? "bg-transparent border-none" : "bg-zinc-950/30 border rounded-xl"} 
          ${!isGhost && (isActive || isLucro
            ? "bg-zinc-950/60 border-sky-500/60 shadow-[0_0_20px_-5px_rgba(14,165,233,0.2)] ring-1 ring-sky-500/10"
            : "border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-950/60")}
          ${!isSelect ? "cursor-text" : "cursor-pointer"}`}
      >
        {/* Ícone agora responde ao clique do container pai */}
        {Icon && (
          <div className={`absolute left-3.5 transition-colors duration-300 
            ${isActive || isLucro ? "text-sky-500" : "text-zinc-600"}`}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
        )}

        <div className={`flex-1 h-full grid ${isTime ? 'grid-cols-2 divide-x divide-zinc-900/50' : 'grid-cols-1'}`}>
          {isTime ? (
            <>
              <div className="relative flex items-center group">
                <input
                  ref={hoursInputRef}
                  type="number"
                  value={hoursValue ?? ""}
                  onChange={e => onHoursChange?.(e.target.value)}
                  onFocus={(e) => { e.target.select(); setIsFocused(true); }}
                  onBlur={() => setIsFocused(false)}
                  onWheel={handleWheel}
                  className={`w-full h-full bg-transparent text-zinc-100 text-[13px] font-mono font-bold outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${Icon ? 'pl-9' : ''} pr-6`}
                  placeholder="0"
                />
                <span className="absolute right-2 text-[7px] font-black text-zinc-800 uppercase pointer-events-none group-focus-within:text-sky-500/40">H</span>
              </div>
              <div className="relative flex items-center group">
                <input
                  type="number"
                  min={0} max={59}
                  value={minutesValue ?? ""}
                  onChange={e => {
                    const val = Math.min(59, Math.max(0, parseInt(e.target.value || 0)));
                    onMinutesChange?.(e.target.value === "" ? "" : val);
                  }}
                  onFocus={(e) => { e.target.select(); setIsFocused(true); }}
                  onBlur={() => setIsFocused(false)}
                  onWheel={handleWheel}
                  className="w-full h-full bg-transparent text-zinc-100 text-[13px] font-mono font-bold outline-none text-center pl-2 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="00"
                />
                <span className="absolute right-2 text-[7px] font-black text-zinc-800 uppercase pointer-events-none group-focus-within:text-sky-500/40">MIN</span>
              </div>
            </>
          ) : (
            <div className={`h-full flex items-center ${Icon ? 'pl-10' : 'pl-4'} ${suffix || isSelect ? 'pr-9' : 'pr-4'}`}>
              {isSelect ? (
                <InternalSelect
                  {...props}
                  options={options}
                  isOpen={isSelectOpen}
                  setOpen={setIsSelectOpen}
                />
              ) : (
                <input
                  ref={mainInputRef}
                  {...props}
                  type={type}
                  onFocus={(e) => { e.target.select(); setIsFocused(true); }}
                  onBlur={() => setIsFocused(false)}
                  onWheel={handleWheel}
                  className="w-full h-full bg-transparent text-zinc-100 text-[12px] font-mono font-bold outline-none placeholder:text-zinc-800"
                />
              )}
            </div>
          )}
        </div>

        {!isTime && suffix && (
          <span className={`absolute right-3.5 text-[9px] font-black uppercase pointer-events-none transition-colors 
            ${isActive || isLucro ? "text-sky-500/50" : "text-zinc-700"}`}>
            {suffix}
          </span>
        )}

        {isSelect && (
          <div className="absolute right-3 text-zinc-600 pointer-events-none">
            <ChevronDown size={14} strokeWidth={3} className={`transition-all duration-300 
              ${isSelectOpen ? "rotate-180 text-sky-500" : ""}`} />
          </div>
        )}
      </div>
    </div>
  );
};