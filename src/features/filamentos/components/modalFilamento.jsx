import React, { useState, useEffect, useMemo, useCallback } from "react";
import { X, Layers, PaintbrushVertical, DollarSign, Box, Activity, Plus, Terminal } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import SpoolSideView from "./carretel";

const safeParse = (val) => {
    if (typeof val === 'number') return val;
    if (!val || val === "") return 0;

    // Remove R$, espaços e pontos de milhar, depois troca a vírgula decimal por ponto
    const clean = String(val)
        .replace(/[R$\s]/g, '')    
        .replace(/\./g, '')        
        .replace(',', '.');        

    return parseFloat(clean) || 0;
};

// --- ESTADO INICIAL ---
const INITIAL_STATE = {
    marca: "",
    nome: "",
    material: "PLA",
    cor_hex: "#3b82f6",
    preco: "",
    peso_total: "1000"
};

const CORES_MAIS_VENDIDAS = [
    "#000000", "#ffffff", "#9ca3af", "#6b7280", "#ef4444",
    "#3b82f6", "#22c55e", "#f97316", "#eab308", "#78350f"
];

const CONFIG = {
    marca: { label: "Fabricante", type: "select", searchable: true, placeholder: "Selecione o fabricante..." },
    material: { label: "Tipo de Material", type: "select", placeholder: "Selecione o polímero..." },
    nome: { label: "Identificação do Filamento", icon: PaintbrushVertical, placeholder: "Ex: PLA Silk Azul Metálico", type: "text" },
    preco: { label: "Preço do Carretel", icon: DollarSign, suffix: "BRL", placeholder: "0,00", type: "text" },
    peso_total: { label: "Massa Líquida", icon: Layers, suffix: "gramas", placeholder: "1000", type: "text" }
};

export default function ModalFilamento({ aberto, aoFechar, aoSalvar, dadosIniciais }) {
    const [form, setForm] = useState(INITIAL_STATE);
    const [manualEntry, setManualEntry] = useState({ marca: false });

    useEffect(() => {
        if (aberto) {
            if (dadosIniciais) {
                // Sincronização e Normalização de dados para o formulário
                setForm({
                    id: dadosIniciais.id || null,
                    marca: dadosIniciais.marca || dadosIniciais.brand || "",
                    nome: dadosIniciais.nome || dadosIniciais.name || "",
                    material: dadosIniciais.material || dadosIniciais.type || "PLA",
                    cor_hex: dadosIniciais.cor_hex || dadosIniciais.colorHex || INITIAL_STATE.cor_hex,
                    preco: String(dadosIniciais.preco || ""),
                    peso_total: String(dadosIniciais.peso_total || "1000"),
                    peso_atual: dadosIniciais.peso_atual // Preservado para edição
                });
            } else {
                setForm(INITIAL_STATE);
            }
            setManualEntry({ marca: false });
        }
    }, [aberto, dadosIniciais]);

    const marcasOptions = useMemo(() => [{
        group: "Fabricantes Populares",
        items: ["Voolt3D", "3D Lab", "Cliever", "Printalot", "GTMax3D", "F3D", "Creality", "Bambu Lab", "eSun", "Polymaker", "Sunlu", "Overture"].map(m => ({ value: m, label: m }))
    }], []);

    const tiposOptions = useMemo(() => [{
        group: "Categorias de Filamento",
        items: ["PLA", "PLA+", "PETG", "ABS", "ASA", "TPU", "Nylon", "PC", "Silk", "Mármore", "Madeira", "Glow"].map(t => ({ value: t, label: t }))
    }], []);

    const custoG = useMemo(() => {
        const p = safeParse(form.preco);
        const w = safeParse(form.peso_total);
        if (w <= 0) return "0,0000";
        return (p / w).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    }, [form.preco, form.peso_total]);

    const handleSalvar = useCallback(() => {
        const pesoTotalNum = Math.max(1, safeParse(form.peso_total));
        const precoNum = Math.max(0, safeParse(form.preco));
        
        // Se for novo, peso_atual = total. Se for edição, mantém o atual, mas trava no novo total.
        let pesoAtualFinal;
        if (dadosIniciais) {
            const pesoAtualAntigo = Number(form.peso_atual) ?? pesoTotalNum;
            pesoAtualFinal = Math.min(pesoAtualAntigo, pesoTotalNum);
        } else {
            pesoAtualFinal = pesoTotalNum;
        }

        const payload = {
            ...form,
            nome: form.nome.trim(),
            marca: form.marca.trim(),
            preco: precoNum,
            peso_total: pesoTotalNum,
            peso_atual: pesoAtualFinal,
            id: form.id || undefined
        };

        aoSalvar(payload);
        aoFechar();
    }, [form, dadosIniciais, aoSalvar, aoFechar]);

    if (!aberto) return null;

    const isPresetColor = CORES_MAIS_VENDIDAS.some(c => c.toLowerCase() === form.cor_hex.toLowerCase());
    const isValid = form.marca.trim() !== "" && form.material !== "" && form.nome.trim().length > 0 && safeParse(form.peso_total) > 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="absolute inset-0" onClick={aoFechar} />
            <div className="relative bg-zinc-950 border border-zinc-800/80 rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[96vh]">

                {/* Lateral de Preview */}
                <div className="w-full md:w-[320px] bg-zinc-900/30 border-b md:border-b-0 md:border-r border-zinc-800/50 p-10 flex flex-col justify-between shrink-0 relative overflow-hidden">
                    {/* Background decorativo omitido para brevidade, mas mantido no JSX original */}
                    <div className="flex flex-col items-center w-full space-y-10 relative z-10">
                        <div className="flex items-center gap-3 justify-center">
                            <div className="h-px w-4 bg-zinc-800" />
                            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Preview do Material</span>
                            <div className="h-px w-4 bg-zinc-800" />
                        </div>

                        <div className="relative group p-10 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm">
                            <div className="relative scale-110">
                                <SpoolSideView color={form.cor_hex} percent={100} size={110} />
                            </div>
                        </div>

                        <div className="text-center space-y-3">
                            <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate px-2 leading-tight">
                                {form.nome || "Novo Material"}
                            </h3>
                            <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                                {form.marca || "Fabricante"} • {form.material}
                            </span>
                        </div>
                    </div>

                    <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 relative z-10">
                        <div className="flex items-center gap-2 mb-2">
                            <Activity size={12} className="text-emerald-500/50" />
                            <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-wider">Custo por grama</span>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold text-zinc-100 tracking-tighter">R$ {custoG}</span>
                        </div>
                    </div>
                </div>

                {/* Conteúdo do Formulário */}
                <div className="flex-1 flex flex-col bg-zinc-950">
                    <header className="px-10 py-6 border-b border-zinc-800/50 bg-zinc-900/10 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800">
                                <Box size={18} className="text-zinc-400" />
                            </div>
                            <div>
                                <h3 className="text-xs font-bold text-zinc-100 uppercase tracking-widest">Inventário: Cadastro de Filamento</h3>
                                <p className="text-[10px] text-zinc-500 font-medium leading-none mt-1.5">Ajuste as especificações técnicas e valores de custo</p>
                            </div>
                        </div>
                        <button onClick={aoFechar} className="p-2 rounded-full hover:bg-zinc-900 text-zinc-500 transition-all">
                            <X size={20} />
                        </button>
                    </header>

                    <div className="p-10 overflow-y-auto custom-scrollbar flex-1 space-y-12">
                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">01. Procedência e Composição</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-2.5">
                                    <div className="flex justify-between items-center px-1">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{CONFIG.marca.label}</label>
                                        <button onClick={() => setManualEntry(p => ({ marca: !p.marca }))} className="text-[10px] text-zinc-600 hover:text-zinc-300 transition-colors font-medium">
                                            {manualEntry.marca ? "Usar lista" : "Entrada manual"}
                                        </button>
                                    </div>
                                    <UnifiedInput
                                        {...CONFIG.marca}
                                        label=""
                                        type={manualEntry.marca ? "text" : "select"}
                                        options={marcasOptions}
                                        value={form.marca}
                                        onChange={(v) => {
                                            const val = manualEntry.marca ? v.target.value : v;
                                            setForm(prev => ({ ...prev, marca: val }));
                                        }}
                                    />
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">{CONFIG.material.label}</label>
                                    <UnifiedInput
                                        {...CONFIG.material}
                                        label=""
                                        options={tiposOptions}
                                        value={form.material}
                                        onChange={(v) => setForm(prev => ({ ...prev, material: v }))}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-8">
                            <div className="flex items-center gap-4">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">02. Descrição e Cor</h4>
                                <div className="h-px bg-zinc-800/50 flex-1" />
                            </div>
                            <div className="p-8 bg-zinc-900/20 border border-zinc-800/50 rounded-2xl space-y-8">
                                <div className="flex flex-wrap gap-3.5">
                                    {CORES_MAIS_VENDIDAS.map(c => (
                                        <button key={c} onClick={() => setForm(prev => ({ ...prev, cor_hex: c }))}
                                            className={`w-8 h-8 rounded-lg border transition-all duration-300 ${c.toLowerCase() === form.cor_hex.toLowerCase() ? "border-zinc-100 ring-4 ring-zinc-100/10 scale-110" : "border-zinc-800 opacity-40 hover:opacity-100"}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                    <div className="relative w-8 h-8">
                                        <div className={`w-full h-full rounded-lg border flex items-center justify-center ${!isPresetColor ? "border-zinc-100 scale-110" : "border-zinc-700 opacity-40"}`}
                                            style={{ background: !isPresetColor ? form.cor_hex : 'conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}>
                                            <Plus size={14} className="text-zinc-100 mix-blend-difference" />
                                        </div>
                                        <input type="color" value={form.cor_hex} onChange={(e) => setForm(prev => ({ ...prev, cor_hex: e.target.value }))} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    </div>
                                </div>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">{CONFIG.nome.label}</label>
                                    <UnifiedInput {...CONFIG.nome} label="" value={form.nome} onChange={(e) => setForm(prev => ({ ...prev, nome: e.target.value }))} />
                                </div>
                            </div>
                        </section>

                        <section className="grid grid-cols-2 gap-12">
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">03. Preço de Aquisição</h4>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">{CONFIG.preco.label}</label>
                                    <UnifiedInput {...CONFIG.preco} label="" value={form.preco} onChange={(e) => setForm(prev => ({ ...prev, preco: e.target.value }))} />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">04. Massa do Carretel</h4>
                                <div className="space-y-2.5">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">{CONFIG.peso_total.label}</label>
                                    <UnifiedInput {...CONFIG.peso_total} label="" value={form.peso_total} onChange={(e) => setForm(prev => ({ ...prev, peso_total: e.target.value }))} />
                                </div>
                            </div>
                        </section>
                    </div>

                    <footer className="p-8 border-t border-zinc-800/50 bg-zinc-900/10 flex gap-4">
                        <button onClick={aoFechar} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all">
                            Cancelar
                        </button>
                        <button
                            disabled={!isValid}
                            onClick={handleSalvar}
                            className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all ${isValid ? "bg-zinc-100 text-zinc-950" : "bg-zinc-900 text-zinc-600 cursor-not-allowed"}`}
                        >
                            <Terminal size={16} /> {dadosIniciais ? "Salvar Alterações" : "Adicionar ao Estoque"}
                        </button>
                    </footer>
                </div>
            </div>
        </div>
    );
}