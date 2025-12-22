import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
    X, Save, Palette, Layers,
    PaintbrushVertical, DollarSign,
    Box, Activity, ShieldCheck, Plus, Binary, Fingerprint
} from "lucide-react";

import SearchSelect from "../../../components/SearchSelect";
import SpoolSideView from "./roloFilamento";

/* ---------- CONSTANTES ---------- */
const INITIAL_FILAMENT_STATE = {
    brand: "",
    name: "",
    type: "PLA",
    color: "#000000",
    price: "",
    weightTotal: 1000,
    weightCurrent: 1000,
};

const CORES_MAIS_VENDIDAS = [
    "#000000", "#ffffff", "#9ca3af", "#6b7280", "#ef4444", 
    "#3b82f6", "#22c55e", "#eab308", "#f97316", "#d1d5db", 
    "#facc15", "#78350f", "#8b5cf6", "#ec4899",
];

const parseNumeric = (v) => {
    if (v === "" || v === undefined) return 0;
    const cleaned = String(v).replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/* ---------- COMPONENTE DE INPUT ---------- */
const TechInput = ({ label, icon: Icon, value, onChange, placeholder, suffix, sectionColor, type = "text" }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div className="space-y-1 w-full group">
            <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 ml-1 group-hover:text-zinc-300">
                {label}
            </label>
            <div
                className={`relative rounded-lg border transition-all duration-300 bg-black/40 ${focused ? "ring-1" : "border-zinc-800"}`}
                style={focused ? { borderColor: sectionColor || '#0ea5e9', boxShadow: `0 0 10px ${sectionColor || '#0ea5e9'}20` } : {}}
            >
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 py-0.5 pr-2 border-r border-zinc-800">
                    <Icon size={11} className={focused ? "text-sky-500" : "text-zinc-600"} style={{ color: focused ? sectionColor : '' }} />
                </div>
                <input
                    type={type} value={value} onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    className="w-full bg-transparent border-none rounded-lg pl-10 pr-10 py-2 text-[11px] text-zinc-100 outline-none font-bold placeholder:text-zinc-800"
                />
                {suffix && <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[8px] font-bold text-zinc-700 uppercase">{suffix}</span>}
            </div>
        </div>
    );
};

export default function ModalFilamento({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const [form, setForm] = useState(INITIAL_FILAMENT_STATE);

    useEffect(() => {
        if (aberto) {
            setForm(dadosIniciais ? {
                ...INITIAL_FILAMENT_STATE, ...dadosIniciais,
                color: dadosIniciais.colorHex || dadosIniciais.color || INITIAL_FILAMENT_STATE.color,
            } : INITIAL_FILAMENT_STATE);
        }
    }, [aberto, dadosIniciais]);

    const marcasOptions = useMemo(() => [{
        group: "Marcas Comuns",
        items: [
            "Voolt3D", "3D Lab", "Cliever", "Printalot", "GTMax3D", 
            "F3D", "Creality", "Bambu Lab", "eSun", "Polymaker", 
            "Sunlu", "Overture", "Genérico"
        ].map(m => ({ value: m, label: m })),
    }], []);

    const tiposOptions = useMemo(() => [{
        group: "Materiais",
        items: [
            "PLA", "PLA+", "PETG", "ABS", "ASA", "TPU", "Nylon", 
            "PC", "Silk", "Mármore", "Madeira", "Fibra de Carbono", "Glow"
        ].map(t => ({ value: t, label: t })),
    }], []);

    const custoG = useMemo(() => {
        const p = parseNumeric(form.price);
        const w = parseNumeric(form.weightTotal) || 1;
        return (p / w).toFixed(4);
    }, [form.price, form.weightTotal]);

    const handleSalvar = useCallback(() => {
        aoSalvar({ ...form, price: parseNumeric(form.price), weightTotal: parseNumeric(form.weightTotal), weightCurrent: dadosIniciais ? parseNumeric(form.weightCurrent) : parseNumeric(form.weightTotal), colorHex: form.color, id: dadosIniciais?.id });
        aoFechar();
    }, [form, dadosIniciais, aoSalvar, aoFechar]);

    if (!aberto) return null;

    const isPresetColor = CORES_MAIS_VENDIDAS.some(c => c.toLowerCase() === form.color.toLowerCase());
    const isValid = form.brand && form.type && form.name.trim().length > 0 && parseNumeric(form.price) > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
            <div className="absolute inset-0" onClick={aoFechar} />

            <div className="relative bg-[#080808] border border-zinc-800 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">

                {/* --- LADO ESQUERDO: PREVIEW --- */}
                <div className="w-full md:w-[280px] bg-black/40 border-b md:border-b-0 md:border-r border-zinc-800/60 p-6 flex flex-col items-center justify-between shrink-0">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-[80px] opacity-10 transition-all duration-1000" style={{ backgroundColor: form.color }} />

                    <div className="relative z-10 w-full">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                            <Activity size={12} className="text-emerald-500" />
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Visualização</span>
                        </div>
                        <div className="flex justify-center py-2">
                            <SpoolSideView color={form.color} percent={100} size={130} />
                        </div>
                    </div>

                    <div className="relative z-10 w-full space-y-4">
                        <div className="text-center">
                            <h3 className="text-base font-bold text-white uppercase truncate mb-1">{form.name || "Sem nome"}</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[7px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase">{form.brand || "Marca?"}</span>
                                <span className="text-[7px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded uppercase">{form.type}</span>
                            </div>
                        </div>
                        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 backdrop-blur-md">
                            <span className="text-[7px] font-bold text-zinc-600 uppercase block mb-1">Preço por grama</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-mono font-bold text-emerald-500">R$ {custoG}</span>
                                <span className="text-[8px] font-bold text-zinc-700 uppercase">/g</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- LADO DIREITO: FORMULÁRIO --- */}
                <div className="flex-1 flex flex-col">
                    <header className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black border border-zinc-800 text-sky-500"><Box size={16} /></div>
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">{dadosIniciais ? "Editar Filamento" : "Novo Filamento no Estoque"}</h3>
                        </div>
                        <button onClick={aoFechar} className="p-1 text-zinc-600 hover:text-white transition-colors"><X size={18} /></button>
                    </header>

                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        {/* SEÇÃO 01: BÁSICO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-sky-500 font-mono">[ 01 ]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Marca e Material</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Marca</label>
                                    <SearchSelect value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} searchable options={marcasOptions} placeholder="Escolha..." />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Tipo de Material</label>
                                    <SearchSelect value={form.type} onChange={(v) => setForm({ ...form, type: v })} options={tiposOptions} />
                                </div>
                            </div>
                        </section>

                        {/* SEÇÃO 02: COR E NOME */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-emerald-500 font-mono">[ 02 ]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Cor do Filamento</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="p-4 bg-zinc-900/20 border border-zinc-800/60 rounded-xl space-y-4">
                                <div className="flex flex-wrap gap-2.5">
                                    {CORES_MAIS_VENDIDAS.map(c => (
                                        <button key={c} onClick={() => setForm(prev => ({ ...prev, color: c }))}
                                            className={`w-6 h-6 rounded-md border transition-all ${c.toLowerCase() === form.color.toLowerCase() ? "border-white ring-2 ring-white/10 scale-110" : "border-zinc-800 opacity-60"}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <div className="relative w-6 h-6">
                                        <div className={`w-full h-full rounded-md border flex items-center justify-center transition-all ${!isPresetColor ? "border-white scale-110" : "border-zinc-700 opacity-60"}`}
                                            style={{ background: !isPresetColor ? form.color : 'conic-gradient(from 180deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)' }}>
                                            {isPresetColor && <Plus size={10} className="text-white mix-blend-difference" />}
                                        </div>
                                        <input type="color" value={form.color} onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                                <TechInput label="Nome ou Apelido" icon={PaintbrushVertical} placeholder="Ex: Preto Silk da Oficina" value={form.name} onChange={(v) => setForm({ ...form, name: v })} sectionColor={form.color} />
                            </div>
                        </section>

                        {/* SEÇÃO 03: VALORES */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-amber-500 font-mono">[ 03 ]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Peso e Preço</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <TechInput label="Preço do Rolo" icon={DollarSign} value={form.price} onChange={(v) => setForm({ ...form, price: v })} suffix="BRL" placeholder="0.00" sectionColor="#10b981" />
                                <TechInput label="Peso do Rolo" icon={Layers} value={form.weightTotal} onChange={(v) => setForm({ ...form, weightTotal: v })} suffix="GRAMAS" placeholder="1000" sectionColor="#f59e0b" />
                            </div>
                        </section>
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-zinc-950/50 flex gap-3 mt-auto">
                        <button onClick={aoFechar} className="flex-1 py-2.5 rounded-lg border border-zinc-800 text-[9px] font-bold uppercase text-zinc-600 hover:text-white">Cancelar</button>
                        <button disabled={!isValid} onClick={handleSalvar} className={`flex-[2] py-2.5 rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${isValid ? "bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-900/20" : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"}`}>
                            <Box size={14} /> {dadosIniciais ? "Salvar Dados" : "Adicionar ao Estoque"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}