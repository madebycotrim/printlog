import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    X, Save, Zap, Timer, 
    DollarSign, Tag, Activity, Binary, Terminal, Cpu, ShieldCheck
} from "lucide-react";

import SearchSelect from "../../../components/SearchSelect";

const INITIAL_PRINTER_STATE = {
    name: "",
    brand: "",
    model: "",
    power: "",
    price: "",
    status: "idle",
    totalHours: 0,
    maintenanceInterval: 300,
};

const parseNumeric = (v) => {
    if (v === "" || v === undefined) return 0;
    const cleaned = String(v).replace(',', '.');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
};

/* ---------- INPUT DA OFICINA ---------- */
const HUDInput = ({ label, icon: Icon, value, onChange, placeholder, suffix, sectionColor, type = "text" }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div className="space-y-1 w-full group">
            <label className="text-[8px] font-bold uppercase tracking-widest text-zinc-500 ml-1 group-hover:text-zinc-300 transition-colors">
                {label}
            </label>
            <div
                className={`relative rounded-lg border transition-all duration-300 bg-black/40 ${focused ? "ring-1" : "border-zinc-800"}`}
                style={focused ? { borderColor: sectionColor || '#0ea5e9', boxShadow: `0 0 10px ${sectionColor || '#0ea5e9'}20` } : {}}
            >
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 py-0.5 pr-2 border-r border-zinc-800">
                    <Icon size={11} className={focused ? "" : "text-zinc-600"} style={{ color: focused ? sectionColor : '' }} />
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

export default function PrinterModal({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const [form, setForm] = useState(INITIAL_PRINTER_STATE);
    const [database, setDatabase] = useState([]);
    const [manualEntry, setManualEntry] = useState({ brand: false, model: false });

    useEffect(() => {
        const handleEsc = (e) => { if (e.key === 'Escape') aoFechar(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [aoFechar]);

    useEffect(() => {
        if (aberto && database.length === 0) {
            fetch('/printers.json').then(res => res.json()).then(data => setDatabase(Array.isArray(data) ? data : [])).catch(() => {});
        }
    }, [aberto, database.length]);

    useEffect(() => {
        if (aberto) {
            setForm(dadosIniciais ? { ...INITIAL_PRINTER_STATE, ...dadosIniciais } : INITIAL_PRINTER_STATE);
            setManualEntry({ brand: false, model: false });
        }
    }, [aberto, dadosIniciais]);

    const brandOptions = useMemo(() => {
        const brands = [...new Set(database.map(p => p.brand))].sort();
        return [{ group: "Marcas conhecidas", items: brands.map(b => ({ value: b, label: b })) }];
    }, [database]);

    const modelOptions = useMemo(() => {
        if (!form.brand) return [];
        const models = database.filter(p => p.brand.toLowerCase() === form.brand.toLowerCase());
        return [{ group: `Modelos da ${form.brand}`, items: models.map(m => ({ value: m.model, label: m.model, data: m })) }];
    }, [database, form.brand]);

    const custoHora = useMemo(() => {
        const p = parseNumeric(form.price);
        const i = parseNumeric(form.maintenanceInterval) || 1;
        return (p / i).toFixed(2);
    }, [form.price, form.maintenanceInterval]);

    const handleSalvar = useCallback(() => {
        aoSalvar({ ...form, power: parseNumeric(form.power), price: parseNumeric(form.price), totalHours: parseNumeric(form.totalHours), maintenanceInterval: parseNumeric(form.maintenanceInterval) });
        aoFechar();
    }, [form, aoSalvar, aoFechar]);

    const isValid = form.name.trim() && form.brand && form.model && parseNumeric(form.power) > 0;

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={aoFechar} />

            <div className="relative bg-[#080808] border border-zinc-800 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
                
                {/* --- LADO ESQUERDO: RESUMO --- */}
                <div className="w-full md:w-[280px] bg-black/40 border-b md:border-b-0 md:border-r border-zinc-800/60 p-6 flex flex-col items-center justify-between shrink-0">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

                    <div className="relative z-10 w-full text-center">
                        <div className="flex items-center gap-2 mb-6 justify-center">
                            <Activity size={12} className="text-emerald-500" />
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Dados da Máquina</span>
                        </div>
                        
                        <div className="flex justify-center py-4 relative">
                            <div className="absolute inset-0 bg-emerald-500/5 blur-2xl rounded-full" />
                            <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 shadow-inner relative z-10">
                                <Cpu size={60} className="text-zinc-700" />
                            </div>
                        </div>

                        <h3 className="text-base font-bold text-white uppercase truncate mt-4">{form.name || "Nova Impressora"}</h3>
                        <div className="flex items-center justify-center gap-2 mt-1">
                            <span className="text-[7px] font-bold bg-zinc-900 text-zinc-500 border border-zinc-800 px-1.5 py-0.5 rounded uppercase">{form.brand || "Sem Marca"}</span>
                        </div>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 backdrop-blur-md w-full">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[7px] font-bold text-zinc-600 uppercase">Custo por Hora</span>
                            <ShieldCheck size={10} className="text-emerald-500" />
                        </div>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-mono font-bold text-emerald-500">R$ {custoHora}</span>
                            <span className="text-[8px] font-bold text-zinc-700 uppercase">/h</span>
                        </div>
                    </div>
                </div>

                {/* --- LADO DIREITO: FORMULÁRIO --- */}
                <div className="flex-1 flex flex-col">
                    <header className="px-6 py-4 border-b border-white/5 bg-zinc-900/20 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-black border border-zinc-800 text-sky-500"><Binary size={16} /></div>
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">{dadosIniciais ? "Editar Impressora" : "Cadastrar Nova Impressora"}</h3>
                        </div>
                        <button onClick={aoFechar} className="p-1 text-zinc-600 hover:text-white transition-colors"><X size={18} /></button>
                    </header>

                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                        
                        {/* MÓDULO 01: QUEM É ELA */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-sky-500 font-mono">[ 01 ]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Identificação</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[8px] font-bold text-zinc-500 uppercase">Fabricante</label>
                                        <button type="button" onClick={() => setManualEntry(p => ({...p, brand: !p.brand}))} className="text-[7px] font-bold text-sky-500 uppercase">{manualEntry.brand ? "[ Ver Lista ]" : "[ Digitar ]"}</button>
                                    </div>
                                    {manualEntry.brand ? <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value, model: ""})} className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-sky-500" placeholder="Ex: Creality..." /> : <SearchSelect value={form.brand} onChange={v => setForm({...form, brand: v, model: ""})} options={brandOptions} searchable placeholder="Escolha..." />}
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[8px] font-bold text-zinc-500 uppercase">Modelo</label>
                                        <button type="button" onClick={() => setManualEntry(p => ({...p, model: !p.model}))} className="text-[7px] font-bold text-sky-500 uppercase">{manualEntry.model ? "[ Ver Lista ]" : "[ Digitar ]"}</button>
                                    </div>
                                    {manualEntry.model ? <input value={form.model} onChange={e => setForm({...form, model: e.target.value})} className="w-full bg-black/40 border border-zinc-800 rounded-lg px-3 py-2 text-[11px] text-white outline-none focus:border-sky-500" placeholder="Ex: Ender 3 S1..." /> : <SearchSelect value={form.model} onChange={(val, extra) => setForm(prev => ({...prev, model: val, power: extra?.consumoKw ? Math.round(extra.consumoKw * 1000) : prev.power, name: prev.name || `${prev.brand} ${val}`}))} options={modelOptions} searchable placeholder="Escolha..." />}
                                </div>
                            </div>
                            <HUDInput label="Apelido da Máquina" icon={Tag} value={form.name} onChange={v => setForm({...form, name: v})} placeholder="Ex: Ender da Esquerda" sectionColor="#0ea5e9" />
                        </section>

                        {/* MÓDULO 02: ENERGIA E CUSTO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-amber-500 font-mono">[ 02 ]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Energia e Preço</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <HUDInput label="Consumo Médio" icon={Zap} value={form.power} onChange={v => setForm({...form, power: v})} suffix="Watts" sectionColor="#f59e0b" />
                                <HUDInput label="Preço de Compra" icon={DollarSign} value={form.price} onChange={v => setForm({...form, price: v})} suffix="BRL" sectionColor="#10b981" />
                            </div>
                        </section>

                        {/* MÓDULO 03: USO E MANUTENÇÃO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold text-orange-500 font-mono">[ 03 ]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Tempo e Manutenção</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <HUDInput label="Horas já trabalhadas" icon={Timer} value={form.totalHours} onChange={v => setForm({...form, totalHours: v})} suffix="Horas" sectionColor="#f97316" />
                                <HUDInput label="Revisar a cada" icon={Activity} value={form.maintenanceInterval} onChange={v => setForm({...form, maintenanceInterval: v})} suffix="Horas" sectionColor="#f97316" />
                            </div>
                        </section>
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-zinc-950/50 flex gap-3 mt-auto">
                        <button onClick={aoFechar} className="flex-1 py-2.5 rounded-lg border border-zinc-800 text-[9px] font-bold uppercase text-zinc-600 hover:text-white transition-all">Cancelar</button>
                        <button disabled={!isValid} onClick={handleSalvar} className={`flex-[2] py-2.5 rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${isValid ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20" : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"}`}>
                            <Terminal size={14} /> {dadosIniciais ? "Salvar Alterações" : "Adicionar à Oficina"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}