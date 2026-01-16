import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PaintbrushVertical, DollarSign, Layers, Activity, Plus, Terminal, AlertCircle, Loader2 } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import SpoolSideView from "./Carretel";
import FormFeedback from "../../../components/FormFeedback";
import { useFormFeedback } from "../../../hooks/useFormFeedback";
import { validateInput, schemas } from "../../../utils/validation";
import SideBySideModal from "../../../components/ui/SideBySideModal";
import { parseNumber } from "../../../utils/numbers";

// Limpeza avançada de valores numéricos
const safeParse = parseNumber;

const INITIAL_STATE = {
    marca: "",
    nome: "",
    material: "",
    cor_hex: "#3b82f6",
    preco: "",
    peso_total: "1000"
};

const CORES_MAIS_VENDIDAS = [
    "#000000", "#ffffff", "#9ca3af", "#6b7280", "#ef4444",
    "#ef44e1ff", "#3b82f6", "#22c55e", "#f97316", "#eab308", "#78350f"
];

const CONFIG = {
    marca: { label: "Quem é o fabricante?", type: "select", placeholder: "Selecione o fabricante..." },
    material: { label: "Qual o material do filamento?", type: "select", placeholder: "Selecione o tipo de polímero..." },
    nome: { label: "Qual a cor do filamento?", icon: PaintbrushVertical, placeholder: "Ex: Azul Metálico", type: "text" },
    preco: { label: "Quanto custou o carretel?", icon: DollarSign, suffix: "BRL", placeholder: "0,00", type: "text" },
    peso_total: { label: "Qual o peso total do carretel?", icon: Layers, suffix: "gramas", placeholder: "1000", type: "text" }
};

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
                    peso_atual: dadosIniciais.peso_atual
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

    const custoG = useMemo(() => {
        const p = safeParse(form.preco);
        const w = Math.max(1, safeParse(form.peso_total));
        return (p / w).toLocaleString('pt-BR', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
    }, [form.preco, form.peso_total]);

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
            showError(check.errors[0]); // Mostra o primeiro erro encontrado
            return;
        }

        try {
            setIsSaving(true);
            hideFeedback();
            await aoSalvar(payload);
            showSuccess(dadosIniciais ? 'Material atualizado com sucesso!' : 'Material adicionado com sucesso!');
            // Fecha o modal após 1 segundo para mostrar o feedback
            setTimeout(() => {
                aoFechar();
            }, 1000);
        } catch (error) {
            console.error("Erro ao salvar filamento:", error);
            showError('Erro ao salvar material. Tente novamente.');
        } finally {
            setIsSaving(false);
        }
    }, [form, dadosIniciais, aoSalvar, isSaving, showSuccess, showError, hideFeedback, aoFechar]);

    const isPresetColor = CORES_MAIS_VENDIDAS.some(c => c.toLowerCase() === form.cor_hex.toLowerCase());

    // Preparação dos dados para validação em tempo real
    const payloadValidacao = useMemo(() => {
        const pesoTotalNum = Math.max(1, safeParse(form.peso_total));
        const precoNum = Math.max(0, safeParse(form.preco));

        // Evita erro se form estiver vazio (não deve acontecer com INITIAL_STATE, mas previne crash)
        if (!form) return {};

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

    const validationResult = useMemo(() => validateInput(payloadValidacao, schemas.filament), [payloadValidacao]);
    const isValid = validationResult.valid;

    // Sidebar Content
    const sidebarContent = (
        <div className="flex flex-col items-center w-full space-y-10 relative z-10 h-full justify-between">
            <div className="w-full">
                <div className="flex items-center gap-3 justify-center text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-10">
                    <div className="h-px w-4 bg-zinc-900/50" />
                    <span>Prévia</span>
                    <div className="h-px w-4 bg-zinc-900/50" />
                </div>

                <div className="relative group p-10 rounded-[2.5rem] bg-zinc-950/50 border border-zinc-800 shadow-inner flex items-center justify-center backdrop-blur-sm mx-auto w-fit mb-10">
                    <div className="relative scale-110">
                        <SpoolSideView color={form.cor_hex} percent={100} size={110} />
                    </div>
                </div>

                <div className="text-center space-y-3 w-full">
                    <h3 className="text-xl font-bold text-zinc-100 tracking-tight truncate px-2 leading-tight">
                        {form.nome || "Novo Material"}
                    </h3>
                    <span className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest bg-zinc-800/50 px-3 py-1 rounded-full border border-zinc-800/50 inline-block">
                        {form.marca || "---"} • {form.material || "---"}
                    </span>
                </div>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 relative z-10 w-full">
                <div className="flex items-center gap-2 mb-2">
                    <Activity size={12} className="text-emerald-500/50" />
                    <span className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-wider">Custo por grama</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-bold text-zinc-100 tracking-tighter">R$ {custoG}</span>
                </div>
            </div>
        </div>
    );

    // Footer Content
    const footerContent = (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback
                type={feedback.type}
                message={feedback.message}
                show={feedback.show}
                onClose={hideFeedback}
            />

            {!isValid && isDirty && !isSaving && (
                <div className="flex items-center gap-2 text-rose-500 animate-shake mb-2">
                    <AlertCircle size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-tighter">Preencha os campos obrigatórios</span>
                </div>
            )}

            <div className="flex gap-4">
                <button disabled={isSaving} onClick={handleTentativaFechar} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={!isValid || isSaving}
                    onClick={handleSalvar}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${isValid && !isSaving ? "bg-rose-500 text-white hover:bg-rose-400 active:scale-95 hover:shadow-xl shadow-lg shadow-rose-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {isSaving ? "Sincronizando..." : dadosIniciais ? "Salvar Alterações" : "Adicionar ao Estoque"}
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={handleTentativaFechar}
            sidebar={sidebarContent}
            title={dadosIniciais ? "Editar Filamento" : "Cadastrar Filamento"}
            subtitle={dadosIniciais ? "Ajuste os detalhes técnicos do seu material" : "Configure as especificações técnicas do seu novo material"}
            footer={footerContent}
            isSaving={isSaving}
        >
            <div className="space-y-8">
                {/* Seção 01 */}
                <section className="space-y-5">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[01] Identificação</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                        <div className="space-y-1.5">
                            <div className="flex justify-between items-center px-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">{CONFIG.marca.label}</label>
                                <button onClick={() => setManualEntry(p => ({ marca: !p.marca }))} className="text-[9px] text-rose-500/70 hover:text-rose-400 transition-colors font-bold uppercase tracking-tighter">
                                    {manualEntry.marca ? "[ Lista ]" : "[ Manual ]"}
                                </button>
                            </div>
                            <UnifiedInput
                                {...CONFIG.marca} label=""
                                type={manualEntry.marca ? "text" : "select"}
                                options={marcasOptions} value={form.marca}
                                onChange={(v) => updateForm('marca', manualEntry.marca ? v.target.value : v)}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">{CONFIG.material.label}</label>
                            <UnifiedInput
                                {...CONFIG.material} label=""
                                options={tiposOptions} value={form.material}
                                onChange={(v) => updateForm('material', v)}
                            />
                        </div>
                    </div>
                </section>

                {/* Seção 02 */}
                <section className="space-y-5">
                    <div className="flex items-center gap-4">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">[02] Cor</h4>
                        <div className="h-px bg-zinc-800/50 flex-1" />
                    </div>
                    <div className="p-6 bg-zinc-950/40/20 border border-zinc-800/50 rounded-2xl space-y-5">
                        <div className="flex flex-wrap gap-3">
                            {CORES_MAIS_VENDIDAS.map(c => (
                                <button key={c} onClick={() => updateForm('cor_hex', c)}
                                    className={`w-7 h-7 rounded-lg border transition-all duration-300 ${c.toLowerCase() === form.cor_hex.toLowerCase() ? "border-zinc-100 ring-4 ring-zinc-100/10 scale-110" : "border-zinc-800 opacity-40 hover:opacity-100"}`}
                                    style={{ backgroundColor: c }}
                                />
                            ))}
                            <div className="relative w-7 h-7">
                                <div className={`w-full h-full rounded-lg border flex items-center justify-center ${!isPresetColor ? "border-zinc-100 scale-110" : "border-zinc-800/50 opacity-40"}`}
                                    style={{ background: !isPresetColor ? form.cor_hex : 'conic-gradient(#f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)' }}>
                                    <Plus size={12} className="text-zinc-100 mix-blend-difference" />
                                </div>
                                <input type="color" value={form.cor_hex} onChange={(e) => updateForm('cor_hex', e.target.value)} className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1">{CONFIG.nome.label}</label>
                            <UnifiedInput {...CONFIG.nome} label="" value={form.nome} onChange={(e) => updateForm('nome', e.target.value)} />
                        </div>
                    </div>
                </section>

                {/* Seção 03 e 04 */}
                <section className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">[03] Financeiro</h4>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1 block">{CONFIG.preco.label}</label>
                        <UnifiedInput {...CONFIG.preco} label="" value={form.preco} onChange={(e) => updateForm('preco', e.target.value)} />
                    </div>
                    <div className="space-y-1.5">
                        <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">[04] Métricas</h4>
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide px-1 block">{CONFIG.peso_total.label}</label>
                        <UnifiedInput {...CONFIG.peso_total} label="" value={form.peso_total} onChange={(e) => updateForm('peso_total', e.target.value)} />
                    </div>
                </section>
            </div>
        </SideBySideModal>
    );
}
