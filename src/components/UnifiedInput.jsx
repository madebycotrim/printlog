import React, { useState, useRef, useEffect, useMemo, useId } from 'react';
import { ChevronDown, Check, Search } from "lucide-react";
import { Tooltip } from "./ui/Tooltip";

// Force Refresh

/* ---------- COMPONENTE: INTERNAL SELECT ---------- */
import { createPortal } from 'react-dom';

const InternalSelect = ({ value, onChange, options, placeholder, isOpen, setOpen, onSearch }) => {
  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [searchTerm, setSearchTerm] = useState("");

  const selected = useMemo(() => {
    for (const g of options || []) {
      const found = g.items?.find(i => String(i.value) === String(value));
      if (found) return found;
    }
    return null;
  }, [options, value]);

  // Filter options based on search
  const filteredOptions = useMemo(() => {
    if (!searchTerm) return options;
    return options.map(group => ({
      ...group,
      items: group.items?.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.value === 'new_client') // Always show actions
      )
    })).filter(group => group.items && group.items.length > 0);
  }, [options, searchTerm]);

  useEffect(() => {
    if (!isOpen) {
      if (onSearch) onSearch("");
      return;
    }

    // Reset search
    setSearchTerm("");
    if (onSearch) onSearch("");

    // Focus search input after render
    setTimeout(() => searchRef.current?.focus(), 50);

    // Calcula posição
    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCoords({
          top: rect.bottom + 6,
          left: rect.left,
          width: rect.width
        });
      }
    };

    updatePosition();

    // Listeners para fechar/recalcular
    const handleScroll = () => {
      // Se o scroll ocorrer fora do dropdown, fecha
      // (Opcional: ou recalcula, mas fechar é mais seguro para evitar desync visual)
      // setOpen(false); // COMENTADO: Scroll dentro do dropdown fecha ele se não cuidar. 
      // Idealmente, checar se target está dentro do dropdown. 
      // Mas para simplificar e garantir UX, vamos fechar SÓ se for scroll da window/body não controlado.
      // E.target pode ser capturado.
    };
    const handleResize = () => setOpen(false);
    const handleEsc = (e) => e.key === 'Escape' && setOpen(false);

    window.addEventListener('keydown', handleEsc);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true); // Capture phase para pegar scroll de qualquer div

    return () => {
      window.removeEventListener('keydown', handleEsc);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen, setOpen, onSearch]);

  // Conteúdo do Dropdown (via Portal)
  const dropdownContent = (
    <div
      style={{
        position: 'fixed',
        top: coords.top,
        left: coords.left,
        width: Math.max(coords.width, 240), // Min width for better UX
        zIndex: 9999
      }}
      className="bg-[#0c0c0e] border border-white/10 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Campo de Pesquisa */}
      <div className="p-2 border-b border-white/10 sticky top-0 bg-[#0c0c0e] z-10">
        <div className="relative flex items-center">
          <Search size={12} className="absolute left-3 text-zinc-500 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            placeholder="Pesquisar..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (onSearch) onSearch(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-zinc-900/50 border border-white/5 rounded-lg py-1.5 pl-8 pr-3 text-[10px] font-bold text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-sky-500/50 focus:bg-zinc-900 transition-all uppercase"
          />
        </div>
      </div>

      <div className="max-h-64 overflow-y-auto p-1.5 custom-scrollbar flex flex-col">
        {filteredOptions.length > 0 ? (
          filteredOptions.map((g, i) => (
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
                    e.stopPropagation();
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
          ))
        ) : (
          <div className="p-4 text-center">
            <span className="text-[9px] font-bold text-zinc-600 uppercase">Nenhuma opção encontrada</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full h-full flex items-center">
      {/* Gatilho interno */}
      <div className="w-full h-full flex items-center select-none">
        <div className={`flex items-center gap-2 w-full text-[11px] font-mono font-bold uppercase transition-colors ${selected ? "text-zinc-100" : "text-zinc-600"
          }`}>
          {selected?.color && selected.color !== 'transparent' && (
            <div className="w-2 h-2 rounded-full shrink-0 border border-white/10" style={{ backgroundColor: selected.color }} />
          )}
          <span className="truncate">{selected ? selected.label : placeholder}</span>
        </div>
      </div>

      {isOpen && createPortal(dropdownContent, document.body)}
    </div>
  );
};

/* ---------- COMPONENTE PRINCIPAL: UNIFIED INPUT ---------- */
export const UnifiedInput = ({
  label, subtitle, icon: Icon, suffix, isLucro, type, options, variant = "default",
  hoursValue, onHoursChange, minutesValue, onMinutesChange, onSearch, tooltip, error, accentColor, ...props
}) => {
  const generatedId = useId();
  const inputId = props.id || generatedId;

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
  const handleContainerClick = (e) => {
    if (e.target.tagName === 'INPUT') return;

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
    <div className={`flex-1 min-w-0 w-full flex flex-col gap-1.5 
      ${isSelectOpen ? 'relative z-[60]' : 'relative z-0'}`}
    >
      {label && !isGhost && (
        <div className="flex justify-between items-end px-1.5 h-3">
          <div className="flex items-center gap-1.5">
            <label
              htmlFor={!isSelect && !isTime ? inputId : undefined}
              className={`text-[9px] font-black uppercase tracking-[0.15em] select-none ${error ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}
            >
              {label}
            </label>
            {tooltip && <Tooltip text={tooltip} />}
          </div>
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
        className={`relative flex items-center h-10 transition duration-300 ease-in-out cursor-pointer
          ${isGhost ? "bg-transparent border-none" : "bg-zinc-950/50 border rounded-xl shadow-sm"}
          ${!isGhost && error
            ? "border-rose-500/50 shadow-[0_0_15px_-3px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/20"
            : (!isGhost ? "border-zinc-800/60" : "")}
          ${!isGhost && !error && (isActive || isLucro
            ? (accentColor
              ? `border-${accentColor}-500/50 shadow-[0_0_15px_-3px_rgba(var(--${accentColor}-500-rgb),0.15)] ring-1 ring-${accentColor}-500/20`
              : "border-sky-500/50 shadow-[0_0_15px_-3px_rgba(14,165,233,0.15)] ring-1 ring-sky-500/20")
            : "hover:border-zinc-700 hover:bg-zinc-900/40")}
          ${!isSelect ? "cursor-text" : "cursor-pointer"}`}
      >
        {/* Ícone agora responde ao clique do container pai */}
        {Icon && (
          <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-300 pointer-events-none
            ${isActive || isLucro
              ? (accentColor ? `text-${accentColor}-500` : "text-sky-500")
              : "text-zinc-600"}`}>
            <Icon size={14} strokeWidth={2.5} />
          </div>
        )}

        <div className={`flex-1 h-full ${isTime ? `flex justify-center items-center ${Icon ? 'pl-7' : ''}` : 'grid grid-cols-1'}`}>
          {isTime ? (
            <>
              <div className="flex items-center justify-center gap-1 w-full h-full">
                {/* HORAS */}
                <input
                  ref={hoursInputRef}
                  type="number"
                  value={hoursValue ?? ""}
                  onChange={e => onHoursChange?.(e.target.value)}
                  onFocus={(e) => { e.target.select(); setIsFocused(true); }}
                  onBlur={() => setIsFocused(false)}
                  onWheel={handleWheel}
                  className="w-9 h-full bg-transparent text-zinc-100 text-[13px] font-mono font-bold outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-zinc-800"
                  placeholder="00"
                />

                {/* SEPARADOR */}
                <span className="text-zinc-600 font-black text-[10px]">:</span>

                {/* MINUTOS */}
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
                  className="w-9 h-full bg-transparent text-zinc-100 text-[13px] font-mono font-bold outline-none text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-zinc-800"
                  placeholder="00"
                />
              </div>
            </>
          ) : (
            <div className={`h-full flex items-center ${Icon ? 'pl-9' : 'pl-2'} ${suffix || isSelect ? (props.compact ? "pr-5" : "pr-7") : 'pr-2'}`}>
              {isSelect ? (
                <InternalSelect
                  {...props}
                  options={options}
                  isOpen={isSelectOpen}
                  setOpen={setIsSelectOpen}
                  onSearch={onSearch}
                />
              ) : (
                <input
                  id={inputId}
                  ref={mainInputRef}
                  {...props}
                  type={type}
                  onFocus={(e) => { e.target.select(); setIsFocused(true); }}
                  onBlur={() => setIsFocused(false)}
                  onWheel={handleWheel}
                  className={`w-full h-full bg-transparent text-zinc-100 text-[12px] font-mono font-bold outline-none placeholder:text-zinc-800 ${props.align === 'right' ? 'text-right' : props.align === 'center' ? 'text-center' : 'text-left'} ${props.className || ''}`}
                />
              )}
            </div>
          )}
        </div>


        {!isTime && suffix && (
          <span className={`absolute ${props.compact ? "right-1" : "right-2"} text-[9px] font-black uppercase pointer-events-none transition-colors 
            ${isActive || isLucro ? "text-sky-500/50" : "text-zinc-700"}`}>
            {suffix}
          </span>
        )}

        {isSelect && (
          <div className="absolute right-1.5 text-zinc-600 pointer-events-none">
            <ChevronDown size={14} strokeWidth={3} className={`transition-all duration-300 
              ${isSelectOpen ? "rotate-180 text-sky-500" : ""}`} />
          </div>
        )}
      </div>
    </div>
  );
};
