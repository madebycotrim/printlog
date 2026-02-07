import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Zap, Timer, DollarSign, Tag, Terminal, Cpu, Activity, Loader2, AlertCircle, Printer, Beaker, Cylinder } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { useFormFeedback } from "../../../hooks/useFormFeedback";
import FormFeedback from "../../../components/FormFeedback";
import SideBySideModal from "../../../components/ui/SideBySideModal";
import { usePrinterModels } from "../logic/consultasImpressora";
import { schemas, validateInput } from "../../../utils/validation";
import { parseNumber as safeParse } from "../../../utils/numbers";

export default function PrinterModal({ aberto, aoFechar, aoSalvar, dadosIniciais, isSaving }) {
    const { data: printerModels = [] } = usePrinterModels();

    const [formulario, setFormulario] = useState({
        id: null, nome: "", marca: "", modelo: "", potencia: "", preco: "",
        status: "idle", horas_totais: "0", ultima_manutencao_hora: 0,
        intervalo_manutencao: "300", historico: [], versao: 1, imagem: "", tipo: "FDM"
    });

    const [entradaManual, setEntradaManual] = useState({ marca: false, modelo: false });
    const [isDirty, setIsDirty] = useState(false);
    const [mostrarErros, setMostrarErros] = useState(false);

    // Feedback Hook
    const { feedback, showSuccess, showError, hide: hideFeedback } = useFormFeedback();

    useEffect(() => {
        if (aberto) {
            setIsDirty(false);
            setMostrarErros(false);
            hideFeedback();

            if (dadosIniciais) {
                setFormulario({
                    id: dadosIniciais.id || null,
                    nome: dadosIniciais.nome || "",
                    marca: dadosIniciais.marca || "",
                    modelo: dadosIniciais.modelo || "",
                    potencia: String(dadosIniciais.potencia ?? ""),
                    preco: String(dadosIniciais.preco ?? ""),
                    status: dadosIniciais.status || "idle",
                    horas_totais: String(dadosIniciais.horas_totais ?? "0"),
                    ultima_manutencao_hora: dadosIniciais.ultima_manutencao_hora ?? 0,
                    intervalo_manutencao: String(dadosIniciais.intervalo_manutencao ?? "300"),
                    historico: dadosIniciais.historico || [],
                    historico: dadosIniciais.historico || [],
                    versao: dadosIniciais.versao,
                    imagem: dadosIniciais.imagem || "",
                    tipo: dadosIniciais.tipo || "FDM"
                });
            } else {
                setFormulario({
                    id: null, nome: "", marca: "", modelo: "", potencia: "", preco: "",
                    status: "idle", horas_totais: "0", ultima_manutencao_hora: 0,
                    intervalo_manutencao: "300", historico: [], versao: 1, imagem: "", tipo: "FDM"
                });
                setEntradaManual({ marca: false, modelo: false });
            }
        }
    }, [aberto, dadosIniciais, hideFeedback]);

    const opcoesMarca = useMemo(() => {
        const marcasUnicas = [...new Set(printerModels.map(p => p.brand))].sort();
        return [{ group: "Fabricantes", items: marcasUnicas.map(b => ({ value: b, label: b })) }];
    }, [printerModels]);

    const opcoesModelo = useMemo(() => {
        if (!formulario.marca) return [];
        const modelosFiltrados = printerModels.filter(p => p.brand === formulario.marca);
        return [{
            group: `Modelos da ${formulario.marca} `,
            items: modelosFiltrados.map(m => ({ value: m.model, label: m.model, data: m }))
        }];
    }, [printerModels, formulario.marca]);

    const updateForm = (updates) => {
        setFormulario(prev => ({ ...prev, ...updates }));
        setIsDirty(true);
        if (mostrarErros) setMostrarErros(false);
    };

    const tratarMudancaModelo = (valor, item) => {
        const dadosTecnicos = item?.data;

        // Agora usa APENAS a imagem do JSON (printers.json) ou mantÃ©m a atual
        const imagemSource = dadosTecnicos?.img;

        updateForm({
            modelo: valor,
            potencia: dadosTecnicos?.consumoKw ? (dadosTecnicos.consumoKw * 1000).toFixed(0) : formulario.potencia,
            nome: formulario.nome || `${formulario.marca} ${valor} `,
            imagem: imagemSource || formulario.imagem
        });
    };

    const handleTentativaFechar = useCallback(() => {
        if (isSaving) return;
        setMostrarErros(false);
        aoFechar();
    }, [isSaving, aoFechar]);

    // Validação MOVED UP
    const payloadValidacao = useMemo(() => {
        return {
            ...formulario,
            nome: formulario.nome?.trim(),
            marca: formulario.marca?.trim(),
            modelo: formulario.modelo?.trim(),
            potencia: safeParse(formulario.potencia),
            preco: safeParse(formulario.preco),
            horas_totais: safeParse(formulario.horas_totais),
            intervalo_manutencao: safeParse(formulario.intervalo_manutencao),
            historico: formulario.historico || [],
            imagem: formulario.imagem
        };
    }, [formulario]);

    const isValid = useMemo(() => validateInput(payloadValidacao, schemas.printer).valid, [payloadValidacao]);

    const handleSalvarInterno = async () => {
        if (isSaving) return;
        try {
            // Re-use val or re-derive? Safer to re-derive for submit to ensure clean data
            const payload = {
                ...formulario,
                potencia: safeParse(formulario.potencia),
                preco: safeParse(formulario.preco),
                horas_totais: safeParse(formulario.horas_totais),
                intervalo_manutencao: safeParse(formulario.intervalo_manutencao)
            };

            const check = validateInput(payload, schemas.printer);
            if (!check.valid) {
                setMostrarErros(true);
                // Shake Logic
                const shakeElement = document.querySelector('.animate-shake');
                if (shakeElement) {
                    shakeElement.classList.remove('animate-shake');
                    void shakeElement.offsetWidth;
                    shakeElement.classList.add('animate-shake');
                }
                return;
            }

            hideFeedback();
            await aoSalvar(payload);

            aoFechar();

        } catch (error) {
            console.error("Erro ao salvar impressora:", error);
            showError("Erro ao salvar impressora.");
        }
    };

    // Footer Content uses isValid, so it must be after isValid definition
    const footerContent = ({ onClose }) => (
        <div className="flex flex-col gap-4 w-full">
            <FormFeedback {...feedback} onClose={hideFeedback} />



            <div className="flex gap-4">
                <button disabled={isSaving} onClick={onClose} className="flex-1 py-3 px-4 rounded-xl border border-zinc-800/50 bg-zinc-900/50 text-[11px] font-bold uppercase text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all disabled:opacity-50">
                    Cancelar
                </button>
                <button
                    disabled={isSaving}
                    onClick={handleSalvarInterno}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98]
                        ${!isSaving ? "bg-zinc-100 text-zinc-950 hover:bg-white shadow-lg" : "bg-zinc-900/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {isSaving ? "Salvando..." : dadosIniciais ? "Salvar Alterações" : "Adicionar Máquina"}
                </button>
            </div>
        </div>
    );

    const isSLA = formulario.tipo === 'SLA';

    return (
        <SideBySideModal
            isOpen={aberto}
            onClose={handleTentativaFechar}
            sidebar={null}
            header={{
                title: dadosIniciais ? "Editar Impressora" : "Nova Impressora",
                subtitle: dadosIniciais ? "Gerencie os detalhes técnicos do seu equipamento." : "Adicione uma nova impressora à sua frota."
            }}
            footer={footerContent}
            isSaving={isSaving}
            isDirty={isDirty}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-8">
                {/* Seção 01 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                        <Tag size={12} className="text-zinc-600" />
                        IDENTIFICAÇÃO DE HARDWARE
                    </div>

                    {/* Printer Type Toggle */}
                    <div className="grid grid-cols-2 gap-3 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50 mb-4">
                        <button
                            type="button"
                            onClick={() => updateForm({ tipo: 'FDM' })}
                            className={`flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${(!formulario.tipo || formulario.tipo === 'FDM') ? 'bg-zinc-800 text-sky-400 shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Cylinder size={14} /> FDM (FILAMENTO)
                        </button>
                        <button
                            type="button"
                            onClick={() => updateForm({ tipo: 'SLA' })}
                            className={`flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${(formulario.tipo === 'SLA') ? 'bg-zinc-800 text-purple-400 shadow-sm border border-zinc-700' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Beaker size={14} /> SLA (Resina)
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between px-1">
                                <label className={`text-[10px] font-bold uppercase ${mostrarErros && !formulario.marca ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}>
                                    Fabricante {mostrarErros && !formulario.marca && "*"}
                                </label>
                                <button onClick={() => setEntradaManual(p => ({ ...p, marca: !p.marca }))} className="text-[9px] text-sky-500/50 hover:text-sky-400 font-bold uppercase tracking-tighter">
                                    {entradaManual.marca ? "Lista" : "Manual"}
                                </button>
                            </div>
                            <UnifiedInput
                                type={entradaManual.marca ? "text" : "select"}
                                options={opcoesMarca} value={formulario.marca}
                                onChange={val => updateForm({ marca: entradaManual.marca ? val.target.value : val, modelo: "" })}
                                placeholder="Selecione..."
                                error={mostrarErros && !formulario.marca}
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between px-1">
                                <label className={`text-[10px] font-bold uppercase ${mostrarErros && !formulario.modelo ? "text-rose-500 animate-pulse" : "text-zinc-500"}`}>
                                    Modelo {mostrarErros && !formulario.modelo && "*"}
                                </label>
                                <button onClick={() => setEntradaManual(p => ({ ...p, modelo: !p.modelo }))} className="text-[9px] text-sky-500/50 hover:text-sky-400 font-bold uppercase tracking-tighter">
                                    {entradaManual.modelo ? "Lista" : "Manual"}
                                </button>
                            </div>
                            <UnifiedInput
                                type={entradaManual.modelo ? "text" : "select"}
                                options={opcoesModelo}
                                disabled={!formulario.marca && !entradaManual.modelo}
                                value={formulario.modelo}
                                onChange={(val, item) => entradaManual.modelo ? updateForm({ modelo: val.target.value }) : tratarMudancaModelo(val, item)}
                                placeholder="Selecione..."
                                error={mostrarErros && !formulario.modelo}
                            />
                        </div>
                    </div>

                    <UnifiedInput
                        label="Apelido da Máquina"
                        icon={Terminal}
                        value={formulario.nome}
                        placeholder="Ex: Ender 3 V2 - Laboratório"
                        onChange={e => updateForm({ nome: e.target.value })}
                    />

                    {/* (Image System Removed from UI - Auto-handling only) */}
                </div>

                <div className="h-px bg-white/5" />

                {/* Seção 02: Detalhes Técnicos */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                        <Cpu size={12} className="text-zinc-600" />
                        ESPECIFICAÇÕES TÉCNICAS
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <UnifiedInput
                            label="Potência (Watts)"
                            icon={Zap}
                            suffix="W"
                            value={formulario.potencia}
                            onChange={e => updateForm({ potencia: e.target.value })}
                        />
                        <UnifiedInput
                            label="Valor de Compra"
                            icon={DollarSign}
                            suffix="BRL"
                            value={formulario.preco}
                            onChange={e => updateForm({ preco: e.target.value })}
                        />
                    </div>
                </div>

                <div className="h-px bg-white/5" />

                {/* Seção 03: Manutenção */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                        <Activity size={12} className="text-zinc-600" />
                        MANUTENÇÃO PREVENTIVA
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <UnifiedInput
                            label="Horímetro Total"
                            icon={Timer}
                            suffix="h"
                            value={formulario.horas_totais}
                            onChange={e => updateForm({ horas_totais: e.target.value })}
                            tip="Tempo total de impressão acumulado"
                        />
                        <UnifiedInput
                            label="Intervalo de Revisão"
                            icon={Activity}
                            suffix="h"
                            value={formulario.intervalo_manutencao}
                            onChange={e => updateForm({ intervalo_manutencao: e.target.value })}
                            tip="Alertar manutenção a cada X horas"
                        />
                    </div>
                </div>

            </div>
        </SideBySideModal>
    );
}

