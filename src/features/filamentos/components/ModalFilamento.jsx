import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PaintbrushVertical, DollarSign, Layers, Plus, Terminal, AlertCircle, Loader2, Calendar, Tag } from "lucide-react";
import SpoolVectorView from "./Carretel";
import { UnifiedInput } from "../../../components/UnifiedInput";
import FormFeedback from "../../../components/FormFeedback";
import { useFormFeedback } from "../../../hooks/useFormFeedback";
import { validateInput, schemas } from "../../../utils/validation";
import Modal from "../../../components/ui/Modal";
import { parseNumber } from "../../../utils/numbers";

// Limpeza avançada de valores numéricos
const safeParse = parseNumber;

const INITIAL_STATE = {
    marca: "",
    nome: "",
    material: "",
    cor_hex: "#3b82f6",
    preco: "",
    peso_total: "1000",
    data_abertura: new Date().toISOString().split('T')[0]
};

const CORES_MAIS_VENDIDAS = [
    "#000000", // Preto
    "#ffffff", // Branco
    "#9ca3af", // Cinza/Prata
    "#ef4444", // Vermelho
    "#3b82f6", // Azul
    "#22c55e", // Verde
    "#eab308", // Amarelo
    "#f97316", // Laranja
    "#a855f7", // Roxo
    "#ec4899", // Rosa
    "#1e3a8a", // Azul Marinho
    "#78350f", // Marrom
    "#ffd700", // Dourado
    "#06b6d4", // Ciano/Turquesa
    "#f5f5f5", // Natural/Transparente
];

export default function ModalFilamento({ aberto, aoFechar, aoSalvar, dadosIniciais = null }) {
    const [form, setForm] = useState(INITIAL_STATE);
    const [manualEntry, setManualEntry] = useState({ marca: false });
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { feedback, showSuccess, showError, hide: hideFeedback } = useFormFeedback();

    useEffect(() => {
        if (aberto) {
            if (dadosIniciais) {
                setForm({
                    id: dadosIniciais.id || null,
                    marca: dadosIniciais.marca || "",
                    nome: dadosIniciais.nome || "",
                    material: dadosIniciais.material || "PLA",
                    cor_hex: dadosIniciais.cor_hex || INITIAL_STATE.cor_hex,
                    preco: String(dadosIniciais.preco || ""),
                    peso_total: String(dadosIniciais.peso_total || "1000"),
                    peso_atual: dadosIniciais.peso_atual,
                    data_abertura: dadosIniciais.data_abertura
                        ? (dadosIniciais.data_abertura.split('T')[0])
                        : (dadosIniciais.created_at ? dadosIniciais.created_at.split('T')[0] : new Date().toISOString().split('T')[0])
                });
            } else {
                setForm(INITIAL_STATE);
            }
            setManualEntry({ marca: false });
            setIsDirty(false);
            setIsSaving(false);
        }
    }, [aberto, dadosIniciais]);

    const handleTentativaFechar = useCallback(() => {
        if (isSaving) return;
        if (isDirty) {
            if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
                aoFechar();
            }
        } else {
            aoFechar();
        }
    }, [isSaving, isDirty, aoFechar]);

    const marcasOptions = useMemo(() => [{
        group: "Fabricantes",
        items: ["Voolt3D", "3D Lab", "Cliever", "Printalot", "GTMax3D", "F3D", "Creality", "Bambu Lab", "eSun", "Polymaker", "Sunlu", "Overture"].map(m => ({ value: m, label: m }))
    }], []);

    const tiposOptions = useMemo(() => [{
        group: "Materiais",
        items: ["PLA", "PLA+", "PETG", "ABS", "ASA", "TPU", "Nylon", "PC", "Silk", "Mármore", "Madeira", "Glow"].map(t => ({ value: t, label: t }))
    }], []);

    // Atualiza nome se material mudar e nome estiver vazio ou padrão
    const updateForm = (field, value) => {
        if (isSaving) return;
        setForm(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSalvar = useCallback(async () => {
        if (isSaving) return;

        const pesoTotalNum = Math.max(1, safeParse(form.peso_total));
        const precoNum = Math.max(0, safeParse(form.preco));

        let pesoAtualFinal = dadosIniciais
            ? Math.min(Number(form.peso_atual) || pesoTotalNum, pesoTotalNum)
            : pesoTotalNum;

        const payload = {
            ...form,
            nome: form.nome.trim(),
            marca: form.marca.trim(),
            preco: precoNum,
            peso_total: pesoTotalNum,
            peso_atual: pesoAtualFinal,
            favorito: form.favorito || false
        };

        const check = validateInput(payload, schemas.filament);
        if (!check.valid) {
            showError(check.errors[0]);
            return;
        }

        try {
            setIsSaving(true);
            hideFeedback();
            await aoSalvar(payload);
            // Sucesso é gerido globalmente pelo filamentQueries.js (Toast)
            aoFechar();
        } catch (error) {
            console.error("Erro ao salvar filamento:", error);
            // Erro também é gerido globalmente, mas mantemos o log
        } finally {
            setIsSaving(false);
        }
    }, [form, dadosIniciais, aoSalvar, isSaving, showSuccess, showError, hideFeedback, aoFechar]);

    const isPresetColor = CORES_MAIS_VENDIDAS.some(c => c.toLowerCase() === form.cor_hex.toLowerCase());

    // Validação em tempo real
    const payloadValidacao = useMemo(() => {
        const pesoTotalNum = Math.max(1, safeParse(form.peso_total));
        const precoNum = Math.max(0, safeParse(form.preco));

        let pesoAtualFinal = dadosIniciais
            ? Math.min(Number(form.peso_atual) || pesoTotalNum, pesoTotalNum)
            : pesoTotalNum;

        return {
            ...form,
            nome: form?.nome?.trim(),
            marca: form?.marca?.trim(),
            preco: precoNum,
            peso_total: pesoTotalNum,
            peso_atual: pesoAtualFinal,
            favorito: form?.favorito || false
        };
    }, [form, dadosIniciais]);

    const isValid = useMemo(() => validateInput(payloadValidacao, schemas.filament).valid, [payloadValidacao]);

    // Footer Content
    const footerContent = (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={hideFeedback} />

            {!isValid && isDirty && !isSaving && (
                <div className="flex items-center gap-2 text-rose-500 animate-shake mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Preencha os campos obrigatórios</span>
                </div>
            )}

            <div className="flex gap-4">
                <button disabled={isSaving} onClick={handleTentativaFechar} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all disabled:opacity-50">
                    Cancelar
                </button>
                <button
                    disabled={!isValid || isSaving}
                    onClick={handleSalvar}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98]
                        ${isValid && !isSaving ? "bg-zinc-100 text-zinc-950 hover:bg-white shadow-lg" : "bg-zinc-900/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {isSaving ? "Sincronizando..." : dadosIniciais?.id ? "Salvar Alterações" : "Adicionar ao Estoque"}
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={aberto}
            onClose={handleTentativaFechar}
            title={dadosIniciais?.id ? "Editar Filamento" : "Novo Filamento"}
            subtitle={dadosIniciais?.id ? "Ajuste os detalhes do material." : "Adicione um novo material ao seu estoque."}
            icon={Layers}
            footer={footerContent}
            isLoading={isSaving}
            maxWidth="max-w-4xl"
        >
            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* LEFT: PREVIEW (VIRTUAL SPOOL) */}
                <div className="w-full lg:w-1/3 flex flex-col items-center gap-6 sticky top-0">
                    <div className="relative group w-full aspect-square max-w-[220px] bg-zinc-900/50 rounded-3xl border border-white/5 flex items-center justify-center p-6">
                        {/* Glow Effect */}
                        <div
                            className="absolute inset-0 rounded-3xl opacity-20 blur-2xl transition-all duration-700"
                            style={{ backgroundColor: form.cor_hex }}
                        />

                        <div className="relative z-10">
                            <SpoolVectorView
                                color={form.cor_hex}
                                size={160}
                                percent={
                                    Math.min(100, (Number(form.peso_atual !== undefined ? form.peso_atual : form.peso_total) / Math.max(1, Number(form.peso_total))) * 100)
                                }
                            />
                        </div>
                    </div>

                    {/* Labels below the spool */}
                    <div className="flex flex-col items-center gap-2 -mt-2">
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 bg-zinc-900/80 rounded-full border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                                {form.material || "PLA"}
                            </div>
                            <div className="px-3 py-1 bg-zinc-900/80 rounded-full border border-white/10 text-[10px] font-mono text-zinc-400">
                                {form.peso_total}g
                            </div>
                        </div>

                        {/* Visual Percentage (Only if editing) */}
                        {dadosIniciais && (
                            <span className="text-[10px] font-bold text-zinc-600">
                                {Math.round((Number(form.peso_atual) / Math.max(1, Number(form.peso_total))) * 100)}% RESTANTE
                            </span>
                        )}
                    </div>

                    {/* Color Picker (Mini) */}
                    <div className="flex flex-wrap items-center justify-center gap-2 px-2">
                        {CORES_MAIS_VENDIDAS.map(c => (
                            <button key={c} onClick={() => updateForm('cor_hex', c)}
                                className={`w-6 h-6 rounded-full border border-zinc-800 transition-all hover:scale-110 ${c.toLowerCase() === form.cor_hex.toLowerCase() ? "ring-2 ring-white scale-110" : "opacity-50 hover:opacity-100"}`}
                                style={{ backgroundColor: c }}
                                title={c}
                            />
                        ))}
                        <div className="relative w-6 h-6 rounded-full border border-zinc-700 overflow-hidden group hover:scale-110 transition-transform">
                            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500 via-yellow-500 to-sky-500 opacity-50 group-hover:opacity-100" />
                            <input type="color" value={form.cor_hex} onChange={(e) => updateForm('cor_hex', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* RIGHT: FORM */}
                <div className="flex-1 w-full space-y-6">
                    {/* Seção 01: Identificação */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                            <Tag size={12} className="text-zinc-600" />
                            IDENTIFICAÇÃO
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <div className="flex justify-between px-1">
                                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Fabricante</label>
                                    <button onClick={() => setManualEntry(p => ({ ...p, marca: !p.marca }))} className="text-[9px] text-sky-500/50 hover:text-sky-400 font-bold uppercase tracking-tighter">
                                        {manualEntry.marca ? "Lista" : "Manual"}
                                    </button>
                                </div>
                                <UnifiedInput
                                    type={manualEntry.marca ? "text" : "select"}
                                    options={marcasOptions} value={form.marca}
                                    onChange={(v) => updateForm('marca', manualEntry.marca ? v.target.value : v)}
                                    placeholder="Selecione..."
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase px-1">Material</label>
                                <UnifiedInput
                                    type="select"
                                    options={tiposOptions} value={form.material}
                                    onChange={(v) => updateForm('material', v)}
                                    placeholder="Selecione..."
                                />
                            </div>
                        </div>

                        <UnifiedInput
                            label="Nome / Cor"
                            icon={PaintbrushVertical}
                            value={form.nome}
                            onChange={(e) => updateForm('nome', e.target.value)}
                            placeholder="Ex: Azul Metálico"
                        />
                    </div>

                    <div className="h-px bg-white/5" />

                    {/* Seção 02: Detalhes Técnicos */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                            <DollarSign size={12} className="text-zinc-600" />
                            DADOS DE ESTOQUE
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <UnifiedInput
                                label="Custo Total (R$)"
                                icon={DollarSign}
                                suffix="BRL"
                                value={form.preco}
                                onChange={(e) => updateForm('preco', e.target.value)}
                            />
                            <UnifiedInput
                                label="Peso Original (g)"
                                icon={Layers}
                                suffix="g"
                                value={form.peso_total}
                                onChange={(e) => {
                                    const newVal = e.target.value;
                                    setForm(prev => ({
                                        ...prev,
                                        peso_total: newVal,
                                        peso_atual: !dadosIniciais ? newVal : prev.peso_atual
                                    }));
                                }}
                            />
                            <UnifiedInput
                                label="Peso Restante (g)"
                                icon={Layers}
                                suffix="g"
                                value={form.peso_atual !== undefined ? form.peso_atual : form.peso_total}
                                onChange={(e) => updateForm('peso_atual', e.target.value)}
                                className="border-blue-500/30"
                                placeholder={form.peso_total}
                            />
                        </div>
                        {/* Data de Abertura (Hidden to save space) */}
                        {/* <UnifiedInput
                            label="Data de Abertura"
                            type="date"
                            icon={Calendar}
                            value={form.data_abertura}
                            onChange={(e) => updateForm('data_abertura', e.target.value)}
                        /> */}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
