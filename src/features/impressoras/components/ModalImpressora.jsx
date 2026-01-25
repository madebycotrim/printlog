import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Zap, Timer, DollarSign, Tag, Terminal, Cpu, Activity, Loader2, AlertCircle, Printer } from "lucide-react";
import { UnifiedInput } from "../../../components/UnifiedInput";
import { useFormFeedback } from "../../../hooks/useFormFeedback";
import FormFeedback from "../../../components/FormFeedback";
import Modal from "../../../components/ui/Modal";
import { usePrinterModels } from "../logic/printerQueries";
import { schemas, validateInput } from "../../../utils/validation";
import { parseNumber as safeParse } from "../../../utils/numbers";

export default function PrinterModal({ aberto, aoFechar, aoSalvar, dadosIniciais, isSaving }) {
    const { data: printerModels = [] } = usePrinterModels();

    const [formulario, setFormulario] = useState({
        id: null, nome: "", marca: "", modelo: "", potencia: "", preco: "",
        status: "idle", horas_totais: "0", ultima_manutencao_hora: 0,
        intervalo_manutencao: "300", historico: []
    });

    const [entradaManual, setEntradaManual] = useState({ marca: false, modelo: false });
    const [isDirty, setIsDirty] = useState(false);

    // Feedback Hook
    const { feedback, showSuccess, showError, hide: hideFeedback } = useFormFeedback();

    useEffect(() => {
        if (aberto) {
            setIsDirty(false);
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
                    historico: dadosIniciais.historico || []
                });
            } else {
                setFormulario({
                    id: null, nome: "", marca: "", modelo: "", potencia: "", preco: "",
                    status: "idle", horas_totais: "0", ultima_manutencao_hora: 0,
                    intervalo_manutencao: "300", historico: []
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
    };

    const tratarMudancaModelo = (valor, item) => {
        const dadosTecnicos = item?.data;
        updateForm({
            modelo: valor,
            potencia: dadosTecnicos?.consumoKw ? (dadosTecnicos.consumoKw * 1000).toFixed(0) : formulario.potencia,
            nome: formulario.nome || `${formulario.marca} ${valor} `
        });
    };

    const handleTentativaFechar = useCallback(() => {
        if (isSaving) return;
        if (isDirty) {
            if (window.confirm("Você tem alterações não salvas. Deseja realmente sair?")) {
                aoFechar();
            }
        } else {
            aoFechar();
        }
    }, [isDirty, isSaving, aoFechar]);

    const handleSalvarInterno = async () => {
        if (isSaving) return;
        try {
            const payload = {
                ...formulario,
                potencia: safeParse(formulario.potencia),
                preco: safeParse(formulario.preco),
                horas_totais: safeParse(formulario.horas_totais),
                intervalo_manutencao: safeParse(formulario.intervalo_manutencao)
            };

            const check = validateInput(payload, schemas.printer);
            if (!check.valid) {
                showError(check.errors[0]);
                return;
            }

            hideFeedback();
            await aoSalvar(payload);
            showSuccess(dadosIniciais ? "Impressora atualizada!" : "Impressora cadastrada!");
            setTimeout(() => {
                aoFechar();
            }, 1000);

        } catch (error) {
            console.error("Erro ao salvar impressora:", error);
            showError("Erro ao salvar impressora.");
        }
    };

    // Validação
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
            historico: formulario.historico || []
        };
    }, [formulario]);

    const isValid = useMemo(() => validateInput(payloadValidacao, schemas.printer).valid, [payloadValidacao]);

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
                    onClick={handleSalvarInterno}
                    className={`flex-[2] py-3 px-6 rounded-xl text-[11px] font-bold uppercase flex items-center justify-center gap-3 transition-all duration-300 transform active:scale-[0.98]
                        ${isValid && !isSaving ? "bg-zinc-100 text-zinc-950 hover:bg-white shadow-lg" : "bg-zinc-900/40 text-zinc-600 cursor-not-allowed"}`}
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Terminal size={16} />}
                    {isSaving ? "Sincronizando..." : dadosIniciais ? "Salvar Alterações" : "Adicionar Máquina"}
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={aberto}
            onClose={handleTentativaFechar}
            title={dadosIniciais ? "Editar Impressora" : "Nova Impressora"}
            subtitle={dadosIniciais ? "Gerencie os detalhes técnicos do seu equipamento." : "Adicione uma nova impressora à sua frota."}
            icon={Printer}
            footer={footerContent}
            isLoading={isSaving}
            maxWidth="max-w-2xl"
        >
            <div className="space-y-8">
                {/* Seção 01 */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                        <Tag size={12} className="text-zinc-600" />
                        IDENTIFICAÇÃO DE HARDWARE
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex justify-between px-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Fabricante</label>
                                <button onClick={() => setEntradaManual(p => ({ ...p, marca: !p.marca }))} className="text-[9px] text-sky-500/50 hover:text-sky-400 font-bold uppercase tracking-tighter">
                                    {entradaManual.marca ? "Lista" : "Manual"}
                                </button>
                            </div>
                            <UnifiedInput
                                type={entradaManual.marca ? "text" : "select"}
                                options={opcoesMarca} value={formulario.marca}
                                onChange={val => updateForm({ marca: entradaManual.marca ? val.target.value : val, modelo: "" })}
                                placeholder="Selecione..."
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between px-1">
                                <label className="text-[10px] font-bold text-zinc-500 uppercase">Modelo</label>
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
        </Modal>
    );
}
