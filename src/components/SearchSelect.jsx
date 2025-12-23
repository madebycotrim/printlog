import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

export default function SearchSelect({
  value,
  onChange,
  options = [],
  renderValue,
  renderOption,
  placeholder = "ESCOLHA...",
  searchable = false,
  zIndex = "z-[9999]",
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = useMemo(() => {
    if (!value) return null;
    for (const group of options) {
      const found = group.items?.find((i) => String(i.value) === String(value));
      if (found) return found;
    }
    return null;
  }, [options, value]);

  const filteredOptions = useMemo(() => {
    return options
      .map((group) => ({
        ...group,
        items: (group.items || []).filter((item) =>
          item.label.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [options, search]);

  return (
    <div ref={ref} className="relative w-full font-mono">
      <div
        onClick={() => setOpen(!open)}
        className={`
          w-full h-11 px-4
          bg-[#0a0a0a] border rounded-xl
          flex items-center justify-between cursor-pointer
          transition-all duration-200
          ${open ? "border-sky-500/50 bg-[#0f0f0f]" : "border-white/5 hover:border-white/10"}
        `}
      >
        <span className={`text-[11px] font-bold uppercase tracking-tight ${selectedItem ? "text-zinc-100" : "text-zinc-600"}`}>
          {selectedItem ? (renderValue ? renderValue(selectedItem) : selectedItem.label) : placeholder}
        </span>
        
        <ChevronDown size={14} className={`text-zinc-600 transition-transform ${open ? "rotate-180 text-sky-500" : ""}`} />
      </div>

      {open && (
        <div className={`absolute top-[calc(100%+6px)] left-0 w-full bg-[#0c0c0e] border border-white/10 rounded-xl shadow-2xl overflow-hidden ${zIndex}`}>
          {searchable && (
            <div className="p-2 border-b border-white/5">
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="BUSCAR..."
                className="w-full h-8 bg-black border border-white/5 px-3 text-[10px] text-zinc-300 outline-none focus:border-sky-500/40 font-bold"
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.map((group, gi) => (
              <div key={gi} className="mb-2 last:mb-0">
                {group.group && <div className="px-3 py-1 text-[8px] font-black text-zinc-600 uppercase tracking-widest">{group.group}</div>}
                {group.items.map((item) => (
                  <div
                    key={item.value}
                    onClick={() => { onChange(item.value); setOpen(false); }}
                    className={`px-3 py-2 rounded-lg flex items-center justify-between text-[10px] font-bold uppercase 
                      ${String(value) === String(item.value) ? "bg-sky-500/10 text-sky-400" : "text-zinc-400 hover:bg-white/5"}`}
                  >
                    {item.label}
                    {String(value) === String(item.value) && <Check size={12} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}