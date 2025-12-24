import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    X, Save, Palette, Layers,
    PaintbrushVertical, DollarSign,
    Box, Activity, Plus, Binary
} from "lucide-react";

import { UnifiedInput } from "../../../components/formInputs"; // Seu componente unificado
import SpoolSideView from "./roloFilamento";

/* ---------- CONSTANTES E CONFIGURAÇÕES ---------- */
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

const CONFIG = {
    marca: { label: "Marca / Fabricante", type: "select", searchable: true, placeholder: "Ex: Voolt3D, 3D Lab..." },
    tipo: { label: "Tipo de Material", type: "select" },
    nome: { label: "Nome ou apelido do rolo", icon: PaintbrushVertical, placeholder: "Ex: PLA Preto - Aberto em Jan/25", type: "text" },
    preco: { label: "Preço pago no rolo", icon: DollarSign, suffix: "R$", placeholder: "0.00", type: "number" },
    peso: { label: "Peso Líquido", icon: Layers, suffix: "GRAMAS", placeholder: "1000", type: "number" }
};

const parseNumeric = (v) => {
    if (v === "" || v === undefined) return 0;
    const cleaned = String(v).replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
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

    /* --- OPÇÕES DOS SELECTS --- */
    const marcasOptions = useMemo(() => [{
        group: "Marcas conhecidas",
        items: ["Voolt3D", "3D Lab", "Cliever", "Printalot", "GTMax3D", "F3D", "Creality", "Bambu Lab", "eSun", "Polymaker", "Sunlu", "Overture", "Outra"].map(m => ({ value: m, label: m })),
    }], []);

    const tiposOptions = useMemo(() => [{
        group: "Tipos de filamento",
        items: ["PLA", "PLA+", "PETG", "ABS", "ASA", "TPU", "Nylon", "PC", "Silk", "Mármore", "Madeira", "Fibra de Carbono", "Glow"].map(t => ({ value: t, label: t })),
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
                    <div className="flex flex-col items-center w-full">
                        <div className="flex items-center gap-2 mb-4 justify-center">
                            <Activity size={12} className="text-emerald-500" />
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Preview do Rolo</span>
                        </div>
                        <SpoolSideView color={form.color} percent={100} size={130} />
                    </div>

                    <div className="w-full space-y-4 relative z-10">
                        <div className="text-center">
                            <h3 className="text-base font-bold text-white uppercase truncate mb-1">{form.name || "Sem nome"}</h3>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-[7px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase">{form.brand || "Marca?"}</span>
                                <span className="text-[7px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1.5 py-0.5 rounded uppercase">{form.type}</span>
                            </div>
                        </div>
                        <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 backdrop-blur-md">
                            <span className="text-[7px] font-bold text-zinc-600 uppercase block mb-1">Custo/g</span>
                            <div className="flex items-baseline gap-1">
                                <span className="text-lg font-mono font-bold text-emerald-500">R$ {custoG}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- LADO DIREITO: FORMULÁRIO --- */}
                <div className="flex-1 flex flex-col">
                    <header className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black border border-zinc-800 text-sky-500"><Box size={16} /></div>
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Cadastro de Material</h3>
                        </div>
                        <button onClick={aoFechar} className="p-1 text-zinc-600 hover:text-white"><X size={18} /></button>
                    </header>

                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        {/* SEÇÃO 01: MARCA E TIPO (SELECTS UNIFICADOS) */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3"><span className="text-[10px] font-bold text-sky-500 font-mono">[01]</span><h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Origem</h4><div className="h-px bg-zinc-800/50 flex-1" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <UnifiedInput {...CONFIG.marca} options={marcasOptions} value={form.brand} onChange={(v) => setForm({ ...form, brand: v })} />
                                <UnifiedInput {...CONFIG.tipo} options={tiposOptions} value={form.type} onChange={(v) => setForm({ ...form, type: v })} />
                            </div>
                        </section>

                        {/* SEÇÃO 02: COR E NOME */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3"><span className="text-[10px] font-bold text-emerald-500 font-mono">[02]</span><h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Visual</h4><div className="h-px bg-zinc-800/50 flex-1" /></div>
                            <div className="p-4 bg-zinc-900/20 border border-zinc-800/60 rounded-xl space-y-5">
                                <div className="flex flex-wrap gap-2.5">
                                    {CORES_MAIS_VENDIDAS.map(c => (
                                        <button key={c} onClick={() => setForm(prev => ({ ...prev, color: c }))}
                                            className={`w-6 h-6 rounded-md border transition-all ${c.toLowerCase() === form.color.toLowerCase() ? "border-white ring-2 ring-white/10 scale-110" : "border-zinc-800 opacity-60"}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <div className="relative w-6 h-6">
                                        <div className={`w-full h-full rounded-md border flex items-center justify-center ${!isPresetColor ? "border-white scale-110" : "border-zinc-700 opacity-60"}`}
                                            style={{ background: !isPresetColor ? form.color : 'conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}>
                                            <Plus size={10} className="text-white mix-blend-difference" />
                                        </div>
                                        <input type="color" value={form.color} onChange={(e) => setForm(prev => ({ ...prev, color: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                                <UnifiedInput {...CONFIG.nome} value={form.name} onChange={(v) => setForm({ ...form, name: v.target.value })} isLucro={!isPresetColor} />
                            </div>
                        </section>

                        {/* SEÇÃO 03: DADOS TÉCNICOS */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3"><span className="text-[10px] font-bold text-amber-500 font-mono">[03]</span><h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Financeiro</h4><div className="h-px bg-zinc-800/50 flex-1" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <UnifiedInput {...CONFIG.preco} value={form.price} onChange={(v) => setForm({ ...form, price: v.target.value })} />
                                <UnifiedInput {...CONFIG.peso} value={form.weightTotal} onChange={(v) => setForm({ ...form, weightTotal: v.target.value })} />
                            </div>
                        </section>
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-zinc-950/50 flex gap-3">
                        <button onClick={aoFechar} className="flex-1 py-2.5 rounded-lg border border-zinc-800 text-[9px] font-bold uppercase text-zinc-600 hover:text-white transition-all">Cancelar</button>
                        <button disabled={!isValid} onClick={handleSalvar} className={`flex-[2] py-2.5 rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${isValid ? "bg-sky-600 hover:bg-sky-500 text-white" : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"}`}>
                             {dadosIniciais ? "Salvar alterações" : "Confirmar entrada"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}