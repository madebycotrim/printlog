// src/features/impressoras/components/printerModal.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    X, Save, Zap, Timer, DollarSign, Tag,
    Activity, Binary, Terminal, Cpu, ShieldCheck,
    Monitor, Settings2, Factory
} from "lucide-react";

import { UnifiedInput } from "../../../components/formInputs";

/* ---------- CONFIGURAÇÃO DOS INPUTS (DADOS) ---------- */
const CONFIG = {
    marca: { label: "Marca / Fabricante", type: "select", placeholder: "Buscar marca...", searchable: true },
    modelo: { label: "Modelo", type: "select", placeholder: "Escolher modelo...", searchable: true },
    apelido: { label: "Nome ou Apelido da Máquina", icon: Tag, type: "text", placeholder: "Ex: Ender 3 do Canto" },
    potencia: { label: "Potência (Consumo)", icon: Zap, suffix: "Watts", type: "number", placeholder: "0" },
    preco: { label: "Valor pago nela", icon: DollarSign, suffix: "R$", type: "number", placeholder: "0.00" },
    horasUso: { label: "Horas totais de uso", icon: Timer, suffix: "Horas", type: "number", placeholder: "0" },
    manutencao: { label: "Manutenção a cada", icon: Activity, suffix: "Horas", type: "number", placeholder: "300" }
};

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

export default function PrinterModal({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const [form, setForm] = useState(INITIAL_PRINTER_STATE);
    const [database, setDatabase] = useState([]);
    const [manualEntry, setManualEntry] = useState({ brand: false, model: false });

    // Carregar banco de dados de impressoras (JSON)
    useEffect(() => {
        if (aberto && database.length === 0) {
            fetch('/printers.json')
                .then(res => res.json())
                .then(data => setDatabase(Array.isArray(data) ? data : []))
                .catch(() => { });
        }
    }, [aberto, database.length]);

    // Resetar ou carregar dados ao abrir
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
        return [{
            group: `Modelos da ${form.brand}`,
            items: models.map(m => ({ value: m.model, label: m.model, data: m }))
        }];
    }, [database, form.brand]);

    const handleModelChange = (val, item) => {
        const printerInfo = item?.data || database.find(p => p.model === val && p.brand === form.brand);
        setForm(prev => ({
            ...prev,
            model: val,
            power: printerInfo?.consumoKw ? Math.round(printerInfo.consumoKw * 1000).toString() : prev.power,
            name: prev.name || `${prev.brand} ${val}`
        }));
    };

    const custoHora = useMemo(() => {
        const p = parseNumeric(form.price);
        const i = parseNumeric(form.maintenanceInterval) || 1;
        return (p / i).toFixed(2);
    }, [form.price, form.maintenanceInterval]);

    const handleSalvar = useCallback(() => {
        aoSalvar({
            ...form,
            power: parseNumeric(form.power),
            price: parseNumeric(form.price),
            totalHours: parseNumeric(form.totalHours),
            maintenanceInterval: parseNumeric(form.maintenanceInterval)
        });
        aoFechar();
    }, [form, aoSalvar, aoFechar]);

    const isValid = form.name.trim() && form.brand && form.model && parseNumeric(form.power) > 0;

    if (!aberto) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={aoFechar} />

            <div className="relative bg-[#080808] border border-zinc-800 rounded-[2rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">

                {/* LADO ESQUERDO: STATUS */}
                <div className="w-full md:w-[280px] bg-black/40 border-r border-zinc-800/60 p-6 flex flex-col items-center justify-between shrink-0">
                    <div className="relative z-10 w-full text-center">
                        <div className="flex items-center gap-2 mb-6 justify-center">
                            <Activity size={12} className="text-emerald-500" />
                            <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">Status da Farm</span>
                        </div>
                        <div className="p-6 rounded-3xl bg-zinc-900/50 border border-zinc-800 mb-4">
                            <Cpu size={60} className="mx-auto text-zinc-700" />
                        </div>
                        <h3 className="text-base font-bold text-white uppercase truncate">{form.name || "Nova Máquina"}</h3>
                        <span className="text-[7px] font-bold text-zinc-500 uppercase">{form.brand} {form.model}</span>
                    </div>

                    <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-3 w-full backdrop-blur-md">
                        <span className="text-[7px] font-bold text-zinc-600 uppercase block mb-1">Custo de Desgaste</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-mono font-bold text-emerald-500">R$ {custoHora}</span>
                            <span className="text-[8px] font-bold text-zinc-700 uppercase">/h</span>
                        </div>
                    </div>
                </div>

                {/* LADO DIREITO: FORMULÁRIO */}
                <div className="flex-1 flex flex-col">
                    <header className="px-6 py-4 border-b border-white/5 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Binary size={16} className="text-sky-500" />
                            <h3 className="text-[10px] font-bold text-white uppercase tracking-widest">Hardware / Configuração</h3>
                        </div>
                        <button onClick={aoFechar} className="text-zinc-600 hover:text-white"><X size={18} /></button>
                    </header>

                    <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                        {/* SEÇÃO 01: IDENTIFICAÇÃO */}
                        <section className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-sky-500 font-mono text-[10px]">[01]</span>
                                <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Identificação</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[8px] font-bold text-zinc-500 uppercase">Marca</label>
                                        <button onClick={() => setManualEntry(p => ({ ...p, brand: !p.brand }))} className="text-[7px] text-sky-500 uppercase">
                                            {manualEntry.brand ? "Listar" : "Digitar"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        {...CONFIG.marca}
                                        type={manualEntry.brand ? "text" : "select"}
                                        options={brandOptions}
                                        value={form.brand}
                                        onChange={v => manualEntry.brand ? setForm({ ...form, brand: v.target.value, model: "" }) : setForm({ ...form, brand: v, model: "" })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between px-1">
                                        <label className="text-[8px] font-bold text-zinc-500 uppercase">Modelo</label>
                                        <button onClick={() => setManualEntry(p => ({ ...p, model: !p.model }))} className="text-[7px] text-sky-500 uppercase">
                                            {manualEntry.model ? "Listar" : "Digitar"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        {...CONFIG.modelo}
                                        type={manualEntry.model ? "text" : "select"}
                                        options={modelOptions}
                                        value={form.model}
                                        onChange={v => manualEntry.model ? setForm({ ...form, model: v.target.value }) : handleModelChange(v)}
                                    />
                                </div>
                            </div>
                            <UnifiedInput {...CONFIG.apelido} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                        </section>

                        {/* SEÇÃO 02: CUSTOS E MANUTENÇÃO */}
                        <section className="grid grid-cols-2 gap-x-4 gap-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-amber-500 font-mono text-[10px]">[02]</span>
                                    <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Energia / Preço</h4>
                                </div>
                                <UnifiedInput {...CONFIG.potencia} value={form.power} onChange={e => setForm({ ...form, power: e.target.value })} />
                                <UnifiedInput {...CONFIG.preco} value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <span className="text-orange-500 font-mono text-[10px]">[03]</span>
                                    <h4 className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Vida Útil</h4>
                                </div>
                                <UnifiedInput {...CONFIG.horasUso} value={form.totalHours} onChange={e => setForm({ ...form, totalHours: e.target.value })} />
                                <UnifiedInput {...CONFIG.manutencao} value={form.maintenanceInterval} onChange={e => setForm({ ...form, maintenanceInterval: e.target.value })} />
                            </div>
                        </section>
                    </div>

                    <footer className="p-6 border-t border-white/5 bg-zinc-950/50 flex gap-3">
                        <button onClick={aoFechar} className="flex-1 py-2.5 rounded-lg border border-zinc-800 text-[9px] font-bold uppercase text-zinc-600 hover:text-white transition-all">Cancelar</button>
                        <button disabled={!isValid} onClick={handleSalvar} className={`flex-[2] py-2.5 rounded-lg text-[9px] font-bold uppercase flex items-center justify-center gap-2 transition-all ${isValid ? "bg-emerald-600 text-white" : "bg-zinc-900 text-zinc-700 cursor-not-allowed border border-zinc-800"}`}>
                            <Terminal size={14} /> {dadosIniciais ? "Salvar alterações" : "Salvar na Farm"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}