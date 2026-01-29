import React, { useState, useEffect, useCallback } from "react";
import { Terminal, Loader2 } from "lucide-react";
import SpoolVectorView from "./Carretel";
import FormFeedback from "../../../components/FormFeedback";
import { useFormFeedback } from "../../../hooks/useFormFeedback";
import { validateInput, schemas } from "../../../utils/validation";
import SideBySideModal from "../../../components/ui/SideBySideModal";
import { parseNumber } from "../../../utils/numbers";
import FilamentIdentificationForm from "./FilamentIdentificationForm";
import FilamentStockForm from "./FilamentStockForm";

// Limpeza avançada de valores numéricos
const safeParse = parseNumber;

const INITIAL_STATE = {
    marca: "",
    nome: "",
    material: "",
    cor_hex: "",
    diametro: "1.75",
    preco: "",
    peso_total: "1000",
    data_abertura: new Date().toISOString().split('T')[0]
};

export default function ModalFilamento({ aberto, aoFechar, aoSalvar, dadosIniciais = null }) {
    const [form, setForm] = useState(INITIAL_STATE);
    const [isDirty, setIsDirty] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showErrors, setShowErrors] = useState(false);
    const { feedback, showError, hide: hideFeedback } = useFormFeedback();

    useEffect(() => {
        if (aberto) {
            if (dadosIniciais) {
                setForm({
                    id: dadosIniciais.id || null,
                    marca: dadosIniciais.marca || "",
                    nome: dadosIniciais.nome || "",
                    material: dadosIniciais.material || "PLA",
                    cor_hex: dadosIniciais.cor_hex || "",
                    diametro: dadosIniciais.diametro || "1.75",
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
            setIsDirty(false);
            setIsSaving(false);
            setShowErrors(false);
        }
    }, [aberto, dadosIniciais]);

    const updateForm = (field, value) => {
        if (isSaving) return;
        setForm(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);
    };

    const handleSalvar = useCallback(async () => {
        if (isSaving) return;

        const pesoTotalNum = Math.max(1, safeParse(form.peso_total));
        const precoNum = Math.max(0, safeParse(form.preco));

        // Logic: If empty/undefined, assume New Spool (Full). If number (incl 0), use it.
        let pesoAtualFinal;
        if (form.peso_atual === "" || form.peso_atual === undefined || form.peso_atual === null) {
            pesoAtualFinal = pesoTotalNum;
        } else {
            pesoAtualFinal = Number(form.peso_atual);
        }
        // Clamp to ensure it doesn't exceed total or go below 0
        pesoAtualFinal = Math.min(Math.max(0, pesoAtualFinal), pesoTotalNum);

        const payload = {
            ...form,
            nome: form.nome.trim(),
            marca: form.marca.trim(),
            diametro: form.diametro,
            preco: precoNum,
            peso_total: pesoTotalNum,
            peso_atual: pesoAtualFinal,
            favorito: form.favorito || false
        };

        const check = validateInput(payload, schemas.filament);
        if (!check.valid) {
            setShowErrors(true);
            const shakeElement = document.querySelector('.animate-shake');
            if (shakeElement) {
                shakeElement.classList.remove('animate-shake');
                void shakeElement.offsetWidth;
                shakeElement.classList.add('animate-shake');
            }
            return;
        }

        try {
            setIsSaving(true);
            hideFeedback();
            await aoSalvar(payload);
            aoFechar();
        } catch (error) {
            console.error("Erro ao salvar filamento:", error);
            showError("Erro ao salvar. Verifique os dados.");
        } finally {
            setIsSaving(false);
        }
    }, [form, aoSalvar, isSaving, showError, hideFeedback, aoFechar]);

    // Spool Interaction (Drag to set weight)
    const spoolRef = React.useRef(null);
    const handleSpoolInteraction = (e) => {
        if (!spoolRef.current) return;
        const rect = spoolRef.current.getBoundingClientRect();
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        // Calculate percentage from bottom (100%) to top (0%) of the spool area
        const padding = 20;
        const height = rect.height - (padding * 2);
        const y = Math.max(0, Math.min(height, (clientY - rect.top - padding)));

        // Invert: Bottom is full (100%), Top is empty (0%)? Or typical slider?
        // Actually physically, top is full. Let's assume Top Y=0 is 100%, Bottom Y=Height is 0%.
        const percent = 1 - (y / height);

        const total = safeParse(form.peso_total);
        if (total > 0) {
            updateForm('peso_atual', Math.round(total * Math.max(0, Math.min(1, percent))));
        }
    };

    const [isDragging, setIsDragging] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Sidebar Content (Prévia) matches ModalCliente aesthetic
    const sidebarContent = (
        <div className="flex flex-col items-center w-full h-full relative z-10 justify-between py-8 px-6">

            {/* Top Info Section */}
            <div className="w-full text-center space-y-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] border border-zinc-800 rounded-full px-3 py-1 bg-zinc-900/50">
                        {form.marca || "Marca"}
                        <span className="mx-1 text-zinc-700">|</span>
                        {form.material || "Material"}
                    </span>
                </div>

                <h2 className="text-2xl font-black text-white tracking-tight leading-none break-words line-clamp-2 drop-shadow-lg">
                    {form.nome || "Novo Filamento"}
                </h2>
            </div>

            {/* Central Spool Visualization */}
            <div className="w-full flex-1 flex items-center justify-center select-none my-4">
                {/* Visual Container */}
                <div className="relative w-[220px] h-[220px]">

                    {/* HIT BOX - INTERACTION LAYER */}
                    <div
                        className="absolute inset-0 z-50 cursor-ns-resize rounded-full focus:ring-4 focus:ring-blue-500/50 focus:outline-none"
                        ref={spoolRef}
                        tabIndex={0}
                        role="slider"
                        aria-label="Ajustar peso restante"
                        aria-valuemin={0}
                        aria-valuemax={Number(form.peso_total) || 1000}
                        aria-valuenow={Number(form.peso_atual ?? form.peso_total)}
                        aria-valuetext={`${Math.round((Number(form.peso_atual ?? form.peso_total) / Math.max(1, Number(form.peso_total))) * 100)}% restante`}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseDown={() => setIsDragging(true)}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => { setIsDragging(false); setIsHovered(false); }}
                        onMouseMove={(e) => isDragging && handleSpoolInteraction(e)}
                        onClick={handleSpoolInteraction}
                        onKeyDown={(e) => {
                            const total = Number(form.peso_total) || 1000;
                            const current = Number(form.peso_atual ?? total);
                            const step = e.shiftKey ? 10 : 50; // shift for fine grain

                            if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                                e.preventDefault();
                                updateForm("peso_atual", Math.min(total, current + step));
                            } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                                e.preventDefault();
                                updateForm("peso_atual", Math.max(0, current - step));
                            } else if (e.key === "Home") {
                                e.preventDefault();
                                updateForm("peso_atual", total);
                            } else if (e.key === "End") {
                                e.preventDefault();
                                updateForm("peso_atual", 0);
                            }
                        }}
                        onTouchStart={() => setIsDragging(true)}
                        onTouchEnd={() => setIsDragging(false)}
                        onTouchMove={(e) => isDragging && handleSpoolInteraction(e)}
                        title="Arraste ou use setas do teclado para ajustar o peso"
                    />

                    {/* GLOW BACKGROUND */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 h-56 rounded-full opacity-15 blur-[60px] transition-all duration-700 pointer-events-none"
                        style={{ backgroundColor: form.cor_hex || "#333" }}
                    />

                    {/* MAIN SPOOL SVG */}
                    <div className={`transform transition-transform duration-500 ${isHovered ? "scale-105" : ""} active:scale-95 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-none`}>
                        <SpoolVectorView
                            color={form.cor_hex || "#202024"}
                            size={220}
                            percent={
                                Math.min(100, (Number(form.peso_atual !== undefined ? form.peso_atual : form.peso_total) / Math.max(1, Number(form.peso_total))) * 100)
                            }
                        />
                    </div>

                    {/* PERCENTAGE INDICATOR */}
                    <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 transform pointer-events-none z-40 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}>
                        <span className="text-3xl font-black text-white drop-shadow-lg tabular-nums tracking-tighter">
                            {Math.round((Number(form.peso_atual !== undefined ? form.peso_atual : form.peso_total) / Math.max(1, Number(form.peso_total))) * 100)}%
                        </span>
                    </div>

                    {/* DRAG HINT */}
                    <div className={`absolute right-[-40px] top-1/2 -translate-y-1/2 flex flex-col items-center gap-2 transition-opacity duration-500 pointer-events-none ${isHovered ? "opacity-40" : "opacity-0"}`}>
                        <div className="w-1 h-1 bg-white rounded-full" />
                        <div className="w-0.5 h-12 bg-gradient-to-b from-transparent via-white to-transparent" />
                        <div className="w-1 h-1 bg-white rounded-full" />
                    </div>
                </div>
            </div>

            {/* Bottom Tech Details */}
            <div className="w-full flex justify-center pb-2">
                <div className="flex items-center gap-3 bg-zinc-900/80 backdrop-blur border border-zinc-800 rounded-xl px-4 py-2 hover:bg-zinc-800/80 transition-colors shadow-lg">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Hex</span>
                    <div className="w-px h-3 bg-zinc-700" />
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded shadow-sm border border-zinc-600" style={{ backgroundColor: form.cor_hex || "#333" }} />
                        <span className="text-xs font-mono font-bold text-zinc-300 uppercase">{form.cor_hex || "#---"}</span>
                    </div>
                </div>
            </div>

        </div>
    );

    // Footer Content
    const footerContent = ({ onClose }) => (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={hideFeedback} />

            <div className="flex gap-4">
                <button disabled={isSaving} onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 transition-all disabled:opacity-20">
                    Cancelar
                </button>
                <button
                    disabled={isSaving}
                    onClick={handleSalvar}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 ${!isSaving ? "bg-[#3b82f6] text-white hover:bg-[#2563eb] active:scale-95 hover:shadow-xl shadow-lg shadow-blue-900/20" : "bg-zinc-950/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {isSaving ? "Salvando..." : dadosIniciais?.id ? "Salvar Alterações" : "Cadastrar Filamento"}
                </button>
            </div>
        </div>
    );

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={aoFechar}
            sidebar={sidebarContent}
            header={{
                title: dadosIniciais?.id ? "Editar Filamento" : "Novo Filamento",
                subtitle: dadosIniciais?.id ? "Atualize os dados do seu material." : "Adicione um novo item ao seu estoque."
            }}
            footer={footerContent}
            isSaving={isSaving}
            isDirty={isDirty}
        >
            <div className="space-y-8 relative">

                <FilamentIdentificationForm
                    form={form}
                    updateForm={updateForm}
                    showErrors={showErrors}
                />

                <FilamentStockForm
                    form={form}
                    updateForm={updateForm}
                    setForm={setForm}
                    showErrors={showErrors}
                    dadosIniciais={dadosIniciais}
                />
            </div>
        </SideBySideModal>
    );
}
