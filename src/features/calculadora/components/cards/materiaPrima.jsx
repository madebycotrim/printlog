import React, { useEffect, useMemo, useState } from "react";
import { Plus, Package, DollarSign, Tag, Layers, Loader2, X, Search } from "lucide-react";
import { useFilaments } from "../../../filamentos/logic/filamentQueries";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import ModalSelecaoFilamento from "../../../filamentos/components/ModalSelecaoFilamento";
import { formatDecimal, parseNumber } from "../../../../utils/numbers";
import { useCalculatorStore } from "../../../../stores/calculatorStore";

/* ---------- COMPONENTE: LINHA DE FILAMENTO (MODO MULTI) ---------- */
const LinhaFilamento = ({ indice, total, dadosSlot, aoAtualizar, aoRemover, podeRemover }) => {
    const ordemVisual = (total - indice) * 10;
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Cálculo de Custo Real
    // Cálculo de Custo Real
    // custoReal removed (unused)

    // Handle Modal Confirmation
    const aoConfirmarSelecao = (itens) => {
        if (!itens || itens.length === 0) return;
        const item = itens[0];

        if (item.id === 'manual') {
            aoAtualizar(indice, { id: 'manual', name: 'Material Manual', priceKg: '0', weight: '0' });
        } else {
            aoAtualizar(indice, {
                id: item.id,
                name: item.nome,
                priceKg: item.preco_kg || '0',
                weight: '0' // Reset weight or keep? Usually reset.
            });
        }
    };

    // isManual removed (unused)

    return (
        <div
            style={{ zIndex: ordemVisual }}
            className="group flex items-center bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 rounded-lg transition-all relative h-10 animate-in slide-in-from-right-2 duration-300 mb-1.5"
        >

            {/* 1. NOME/SELECT (Trigger Modal) */}
            <div className="flex-1 min-w-0 h-full relative">
                <UnifiedInput
                    variant="ghost"
                    placeholder="MATERIAL..."
                    type="text"
                    value={dadosSlot.name || ""}
                    onChange={(e) => {
                        aoAtualizar(indice, { name: e.target.value });
                        if (dadosSlot.id !== 'manual') {
                            aoAtualizar(indice, { id: 'manual' });
                        }
                    }}
                    className="h-full text-[10px] font-bold"
                />
            </div>

            {/* 2. PESO (g) */}
            <div className="w-16 shrink-0 h-full border-l border-zinc-800/30">
                <UnifiedInput
                    variant="ghost"
                    placeholder="0"
                    type="text"
                    align="center"
                    suffix="g"
                    compact={true}
                    value={dadosSlot.weight || ""}
                    onChange={(e) => aoAtualizar(indice, { weight: e.target.value.replace(',', '.') })}
                    className="h-full text-[10px]"
                />
            </div>

            {/* 3. PREÇO (R$) */}
            <div className="w-20 shrink-0 h-full border-l border-zinc-800/30">
                <UnifiedInput
                    variant="ghost"
                    placeholder="0.00"
                    type="text"
                    align="right"
                    suffix="R$"
                    compact={true}
                    value={dadosSlot.priceKg || ""}
                    onChange={(e) => aoAtualizar(indice, { priceKg: e.target.value.replace(',', '.') })}
                    className="h-full text-[10px]"
                />
            </div>

            {/* DELETE BUTTON */}
            <button
                type="button"
                onClick={() => podeRemover && aoRemover(indice)}
                className="w-8 shrink-0 h-full flex items-center justify-center text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 transition-colors rounded-r-lg"
                title="Remover"
            >
                <X size={12} strokeWidth={2.5} />
            </button>

            <ModalSelecaoFilamento
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={aoConfirmarSelecao}
            />
        </div>
    );
};

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function MaterialModule() {
    const { dadosFormulario, atualizarCampo } = useCalculatorStore();
    const { custoRolo, pesoModelo, idFilamentoSelecionado, slots: materialSlots } = dadosFormulario.material;

    // Helpers para atualização
    const setCustoRolo = (v) => atualizarCampo('material', 'custoRolo', v);
    const setPesoModelo = (v) => atualizarCampo('material', 'pesoModelo', v);
    const setIdFilamentoSelecionado = (v) => atualizarCampo('material', 'idFilamentoSelecionado', v);
    const setMaterialSlots = (v) => atualizarCampo('material', 'slots', v);

    const [modo, setModo] = useState(idFilamentoSelecionado === "multi" ? "multi" : "single");
    const [modalSelecaoAberto, setModalSelecaoAberto] = useState(false);
    const [modalSingleAberto, setModalSingleAberto] = useState(false); // Novo estado para Single Mode
    const { data: filamentos = [], isLoading: carregando } = useFilaments();

    // Fetch automatico via React Query

    useEffect(() => {
        if (idFilamentoSelecionado === "multi") {
            setModo("multi");
        } else {
            setModo("single");
        }
    }, [idFilamentoSelecionado]);

    // Agrupa filamentos por tipo para o select
    const opcoesSelecao = useMemo(() => {
        const grupos = {};
        const lista = Array.isArray(filamentos) ? filamentos : [];

        lista.forEach((item) => {
            const tipoMaterial = (item.material || "Outros").toUpperCase();
            if (!grupos[tipoMaterial]) grupos[tipoMaterial] = [];

            grupos[tipoMaterial].push({
                value: String(item.id),
                label: item.nome,
                color: item.cor_hex // Passando a cor para usar no select personalizado
            });
        });

        return [
            { group: "ENTRADA MANUAL", items: [{ value: "manual", label: "Preço Manual", color: "transparent" }] },
            ...Object.keys(grupos).map(tipo => ({
                group: `ESTOQUE: ${tipo}`,
                items: grupos[tipo]
            }))
        ];
    }, [filamentos]);

    // Atualiza slot no modo multi
    const lidarAtualizacaoSlot = (indice, novosDados) => {
        const slotsAtuais = Array.isArray(materialSlots) ? materialSlots : [];
        const novosSlots = [...slotsAtuais];
        novosSlots[indice] = { ...novosSlots[indice], ...novosDados };

        if (novosDados.id && novosDados.id !== "manual") {
            const itemEstoque = filamentos.find(f => String(f.id) === String(novosDados.id));
            if (itemEstoque && Number(itemEstoque.peso_total) > 0) {
                const precoPorKg = ((Number(itemEstoque.preco) / Number(itemEstoque.peso_total)) * 1000).toFixed(2);
                novosSlots[indice].priceKg = String(precoPorKg);
            }
        }

        setMaterialSlots(novosSlots);
    };

    const pesoTotalSomado = useMemo(() => {
        if (modo === "single") return parseNumber(pesoModelo);
        const slotsSeguros = Array.isArray(materialSlots) ? materialSlots : [];
        return slotsSeguros.reduce((acc, s) => acc + parseNumber(s?.weight), 0);
    }, [materialSlots, pesoModelo, modo]);

    const alternarModo = (novoModo) => {
        setModo(novoModo);
        if (novoModo === "multi") {
            setIdFilamentoSelecionado("multi");
        } else {
            setIdFilamentoSelecionado("manual");
        }
    };

    // Handler para importação no modo Single
    const handleImportSingle = (selectedItems) => {
        if (!selectedItems || selectedItems.length === 0) return;
        const item = selectedItems[0];

        setIdFilamentoSelecionado(String(item.id));

        if (Number(item.peso_total) > 0) {
            const precoPorKg = ((Number(item.preco) / Number(item.peso_total)) * 1000).toFixed(2);
            setCustoRolo(String(precoPorKg));
        }
        setModalSingleAberto(false);
    };

    return (
        <div className="flex flex-col gap-5 h-full animate-in fade-in duration-500">
            {/* SELETOR DE MODO */}
            <div className="flex bg-zinc-950/40 border border-zinc-800 p-1 rounded-xl shrink-0">
                {["single", "multi"].map(m => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => alternarModo(m)}
                        className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border outline-none focus:ring-0
                        ${modo === m ? "bg-zinc-900/50 text-sky-400 border-zinc-800 shadow-lg" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
                    >
                        {m === "single" ? "Uma cor" : "Várias cores"}
                    </button>
                ))}
            </div>

            {/* SINGLE MODE */}
            <div className={`space-y-4 relative ${modo === 'single' ? '' : 'hidden'}`}>
                {/* MATERIAL UTILIZADO - HEADER MINIMALISTA */}
                <div>
                    <div className="flex justify-between items-center mb-1.5 px-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                            Material Utilizado
                        </label>
                        <button
                            onClick={() => setModalSingleAberto(true)}
                            className="text-zinc-600 hover:text-sky-400 transition-colors"
                            title="Buscar no Estoque"
                        >
                            <Search size={12} strokeWidth={2.5} />
                        </button>
                    </div>
                    <UnifiedInput
                        type="select"
                        icon={carregando ? Loader2 : Tag}
                        className={carregando ? "animate-spin" : ""}
                        options={opcoesSelecao}
                        value={String(idFilamentoSelecionado || "manual")}
                        onChange={(id) => {
                            setIdFilamentoSelecionado(id);
                            if (id !== 'manual') {
                                const item = filamentos.find(f => String(f.id) === String(id));
                                if (item && Number(item.peso_total) > 0) {
                                    const precoPorKg = ((Number(item.preco) / Number(item.peso_total)) * 1000).toFixed(2);
                                    setCustoRolo(String(precoPorKg));
                                }
                            }
                        }}
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
                    <UnifiedInput
                        label="Peso da Peça"
                        suffix="g"
                        align="right"
                        placeholder="0"
                        icon={Package}
                        type="text"
                        value={pesoModelo || ""}
                        onChange={(e) => setPesoModelo(e.target.value.replace(',', '.'))}
                    />
                    <UnifiedInput
                        label="Preço do Kg"
                        suffix="R$"
                        align="right"
                        placeholder="0.00"
                        icon={DollarSign}
                        type="text"
                        value={custoRolo || ""}
                        onChange={(e) => setCustoRolo(e.target.value.replace(',', '.'))}
                    />
                </div>
            </div>

            {/* MULTI MODE */}
            <div className={`flex-1 flex flex-col gap-2 relative z-10 ${modo === 'multi' ? '' : 'hidden'}`}>
                <div className="flex items-center justify-between px-1 shrink-0">
                    <div className="flex items-center gap-2">
                        <Layers size={14} className="text-zinc-600" />
                        <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">Lista de Materiais</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-mono font-bold text-sky-400">
                                {formatDecimal(pesoTotalSomado, 0)}g
                            </span>
                            <span className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter">Total</span>
                        </div>

                        <div className="flex gap-1">
                            <button
                                type="button"
                                onClick={() => setModalSelecaoAberto(true)}
                                title="Importar do Estoque"
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:bg-emerald-500 hover:text-white transition-all"
                            >
                                <Layers size={12} />
                            </button>

                            <button
                                type="button"
                                onClick={() => setMaterialSlots([...materialSlots, { id: 'manual', weight: '', priceKg: '' }])}
                                title="Adicionar Manualmente"
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:bg-sky-500 hover:text-white transition-all"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0 relative space-y-2">
                    {materialSlots.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-900 rounded-2xl animate-in fade-in zoom-in-95 p-0 min-h-[80px]">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
                                Nenhum item adicionado
                            </p>
                        </div>
                    ) : (
                        materialSlots.map((slot, idx) => (
                            <LinhaFilamento
                                key={`slot-${idx}`}
                                indice={idx}
                                total={materialSlots.length}
                                dadosSlot={slot}
                                opcoesSelecao={opcoesSelecao}
                                aoAtualizar={lidarAtualizacaoSlot}
                                aoRemover={(i) => setMaterialSlots(materialSlots.filter((_, x) => x !== i))}
                                podeRemover={true}
                            />
                        ))
                    )}
                </div>
            </div>
            <ModalSelecaoFilamento
                isOpen={modalSelecaoAberto}
                onClose={() => setModalSelecaoAberto(false)}
                onConfirm={(selectedItems) => {
                    const newSlots = selectedItems.map(item => {
                        const precoKg = Number(item.peso_total) > 0
                            ? ((Number(item.preco) / Number(item.peso_total)) * 1000).toFixed(2)
                            : "0.00";
                        return { id: item.id, weight: '', priceKg: String(precoKg) };
                    });
                    setMaterialSlots([...materialSlots, ...newSlots]);
                }}
            />

            {/* Modal para Single Mode */}
            <ModalSelecaoFilamento
                isOpen={modalSingleAberto}
                onClose={() => setModalSingleAberto(false)}
                onConfirm={handleImportSingle}
            />
        </div>
    );
}
