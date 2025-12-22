// src/components/BaseSearchSelect.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

export default function SearchSelect({
  value,
  onChange,
  options = [],
  renderValue = (item) => item?.label, // Fallback caso não seja passado
  renderOption = (item) => item?.label, // Fallback caso não seja passado
  placeholder = "Selecione...",
  searchable = false,
  zIndex = "z-[9999]",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  /* ---------- CLICK FORA ---------- */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------- LIMPAR BUSCA AO FECHAR ---------- */
  useEffect(() => {
    if (!open) setSearch("");
  }, [open]);

  /* ---------- ITEM SELECIONADO ---------- */
  const selectedItem = useMemo(() => {
    if (!value) return null;
    // Percorre os grupos e procura o item pelo value
    for (const group of options) {
      const found = (group.items || []).find((i) => String(i.value) === String(value));
      if (found) return found;
    }
    return null;
  }, [options, value]);

  /* ---------- FILTRO ---------- */
  const filteredOptions = useMemo(() => {
    if (!searchable || !search) return options;

    return options
      .map((group) => ({
        ...group,
        items: (group.items || []).filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [options, search, searchable]);

  return (
    <div ref={ref} className="relative w-full font-mono">
      {/* TRIGGER */}
      <div
        onClick={() => setOpen(!open)}
        className={`
          w-full h-11 px-3
          bg-black/40 border rounded-xl
          flex items-center justify-between cursor-pointer
          transition-all duration-200
          ${open
            ? "border-sky-500 ring-1 ring-sky-500/20 shadow-[0_0_15px_rgba(14,165,233,0.1)]"
            : "border-zinc-800 hover:border-zinc-700"
          }
        `}
      >
        <div className="truncate text-xs text-zinc-300 uppercase tracking-tighter">
          {selectedItem ? renderValue(selectedItem) : <span className="text-zinc-600">{placeholder}</span>}
        </div>

        <ChevronDown
          size={14}
          className={`text-zinc-500 transition-transform duration-300 ${open ? "rotate-180 text-sky-500" : ""}`}
        />
      </div>

      {/* DROPDOWN */}
      {open && (
        <div
          className={`
            absolute top-[calc(100%+6px)] left-0 w-full
            bg-[#080808] border border-zinc-800
            rounded-xl shadow-2xl shadow-black
            animate-in fade-in zoom-in-95 duration-150
            overflow-hidden
            ${zIndex}
          `}
        >
          {/* SEARCH */}
          {searchable && (
            <div className="p-2 border-b border-white/5 bg-zinc-900/20">
              <div className="relative">
                <Search
                  size={12}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-600"
                />
                <input
                  autoFocus
                  value={search}
                  onClick={(e) => e.stopPropagation()} // Importante para não fechar ao clicar no input
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="FILTRAR..."
                  className="
                    w-full h-8 rounded-lg
                    bg-black border border-zinc-800
                    pl-8 pr-2 text-[10px] text-zinc-300
                    outline-none transition-all
                    placeholder:text-zinc-700 uppercase
                    focus:border-sky-500/50
                  "
                />
              </div>
            </div>
          )}

          {/* OPTIONS */}
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {filteredOptions.map((group, gi) => (
              <div key={gi} className="mb-2 last:mb-0">
                {group.group && (
                  <div className="px-3 py-1.5 text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] bg-white/[0.02] rounded-md mb-1">
                    {group.group}
                  </div>
                )}

                {(group.items || []).map((item) => {
                  const isSelected = String(value) === String(item.value);
                  return (
                    <div
                      key={item.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        // AJUSTE: Passa o value e os dados originais (item.data) para o Modal
                        onChange(item.value, item.data || item);
                        setOpen(false);
                      }}
                      className={`px-3 py-2.5 rounded-lg cursor-pointer flex items-center justify-between text-[10px] transition-all mb-0.5 ${isSelected ? "bg-sky-500/10 text-sky-400 font-bold" : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-200"}`}
                    >
                      <div className="flex-1 uppercase tracking-tighter">
                        {renderOption(item)}
                      </div>
                      {isSelected && <Check size={12} className="ml-2" />}
                    </div>
                  );
                })}
              </div>
            ))}

            {filteredOptions.length === 0 && (
              <div className="p-6 text-center text-[10px] text-zinc-700 uppercase font-black tracking-widest">
                0_RESULTADOS_ENCONTRADOS
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}