import { useState, useEffect, useMemo } from "react";
import { formatCurrency, parseNumber } from "../../../../utils/numbers";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import { Box as BoxIcon, Truck, Wrench, Plus, Tag, Trash2, List, Archive, X, Search, Package, ChevronDown } from "lucide-react";
import { useSupplyStore } from "../../../insumos/logic/supplies";
import ModalSelecaoInsumo from "../../../insumos/components/ModalSelecaoInsumo";
import { useCalculatorStore } from "../../../../stores/calculatorStore";

/* ---------- COMPONENTE: LINHA EXTRA (SUB-COMPONENTE) ---------- */
const LinhaExtra = ({ item, index, total, aoAtualizar, aoRemover }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const zIndex = (total - index) * 10;

    // Identifica se é modo manual
    const isManual = item.supplyId === 'custom' || (!item.supplyId && Boolean(item.nome));

    // Confirmação do Modal
    const aoConfirmarSelecao = (itens) => {
        if (!itens || itens.length === 0) return;
        const selecionado = itens[0];

        if (selecionado.id === 'manual') {
            aoAtualizar(index, "supplyId", "custom");
            aoAtualizar(index, "nome", "ITEM MANUAL");
            aoAtualizar(index, "unitPrice", 0);
            aoAtualizar(index, "valor", "0.00");
        } else {
            aoAtualizar(index, "supplyId", selecionado.id);
            aoAtualizar(index, "nome", selecionado.name.toUpperCase());
            aoAtualizar(index, "unitPrice", selecionado.price);
            const qtd = parseFloat(item.qtd) || 1;
            aoAtualizar(index, "valor", (qtd * selecionado.price).toFixed(2));
        }
    };

    return (
        <div
            style={{ zIndex }}
            className="group flex items-center bg-zinc-900/10 hover:bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700 rounded-xl transition-all relative h-11 animate-in slide-in-from-right-2 duration-300"
        >
            {/* 1. NOME/SELECT (Trigger Modal) */}
            <div className="flex-1 min-w-0 h-full flex items-center relative pl-2">
                <div className="w-full h-full relative">
                    <UnifiedInput
                        variant="ghost"
                        placeholder="ITEM..."
                        type="text"
                        value={item.nome || ""}
                        onChange={(e) => {
                            aoAtualizar(index, "nome", e.target.value);
                            // Optionally switch to custom if user types?
                            if (item.supplyId !== 'custom') {
                                aoAtualizar(index, "supplyId", "custom");
                            }
                        }}
                        className="pr-8" // Space for search button
                    />
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-zinc-400 hover:text-emerald-500 hover:bg-zinc-800 rounded-md transition-all z-20"
                        title="Buscar no Estoque"
                        tabIndex={-1}
                    >
                        <Search size={14} />
                    </button>
                </div>
            </div>

            {/* DIVIDER */}
            <div className="w-px h-5 bg-zinc-800 mx-1" />

            {/* 2. QTD */}
            <div className="w-[70px] shrink-0 h-10">
                <UnifiedInput
                    variant="ghost"
                    placeholder="0"
                    type="number"
                    align="center"
                    value={item.qtd || 1}
                    onChange={(e) => {
                        const novaQtd = parseFloat(e.target.value) || 0;
                        const unitPrice = parseFloat(item.unitPrice) || 0;
                        aoAtualizar(index, "qtd", novaQtd);
                        aoAtualizar(index, "valor", (novaQtd * unitPrice).toFixed(2));
                    }}
                    onWheel={(e) => e.target.blur()}
                />
            </div>

            {/* DIVIDER */}
            <div className="w-px h-5 bg-zinc-800 mx-1" />

            {/* 3. PREÇO UNIT */}
            <div className="w-[75px] shrink-0 h-10">
                <UnifiedInput
                    variant="ghost"
                    placeholder="0.00"
                    type="number"
                    align="right"
                    suffix="R$"
                    value={item.unitPrice || (item.qtd && item.valor ? (item.valor / item.qtd).toFixed(2) : 0)}
                    onChange={(e) => {
                        const novoUnitario = parseFloat(e.target.value) || 0;
                        const qtd = parseFloat(item.qtd) || 1;
                        aoAtualizar(index, "unitPrice", novoUnitario);
                        aoAtualizar(index, "valor", (qtd * novoUnitario).toFixed(2));
                    }}
                    onWheel={(e) => e.target.blur()}
                />
            </div>

            {/* DELETE BUTTON */}
            <div className="w-6 shrink-0 h-full flex items-center justify-center mr-1">
                <button
                    type="button"
                    onClick={() => aoRemover(index)}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-red-500/10 text-zinc-700 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Remover"
                >
                    <X size={12} strokeWidth={2.5} />
                </button>
            </div>

            <ModalSelecaoInsumo
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={aoConfirmarSelecao}
            />
        </div>
    );
};

export default function CustosLogisticos() {
    const { dadosFormulario, atualizarCampo } = useCalculatorStore();
    const { embalagem: custoEmbalagem, frete: custoFrete, lista: custosExtras } = dadosFormulario.custosExtras;

    const setCustoEmbalagem = (v) => atualizarCampo('custosExtras', 'embalagem', v);
    const setCustoFrete = (v) => atualizarCampo('custosExtras', 'frete', v);
    const setCustosExtras = (v) => atualizarCampo('custosExtras', 'lista', v);

    const { supplies, fetchSupplies } = useSupplyStore();
    const [modalSelecaoAberto, setModalSelecaoAberto] = useState(false);
    const [isModalEmbalagemOpen, setIsModalEmbalagemOpen] = useState(false);

    useEffect(() => {
        fetchSupplies();
    }, [fetchSupplies]);

    const aoSelecionarEmbalagem = (itens) => {
        if (itens && itens.length > 0) {
            const item = itens[0];
            // If manual, maybe zero? Or keep manual workflow?
            // Assuming simplified: just pick price
            setCustoEmbalagem(item.id === 'manual' ? 0 : item.price || 0);
        }
    };

    const extrasSeguros = Array.isArray(custosExtras) ? custosExtras : [];

    const totalExtrasSoma = extrasSeguros.reduce((acumulado, item) => {
        const valorNumerico = parseFloat(item?.valor) || 0;
        return acumulado + valorNumerico;
    }, 0);

    const adicionarExtra = () => {
        setCustosExtras([...extrasSeguros, { nome: "", valor: "", qtd: 1, supplyId: "" }]);
    };

    const removerExtra = (index) => {
        const novaLista = extrasSeguros.filter((_, i) => i !== index);
        setCustosExtras(novaLista);
    };

    const atualizarItem = (index, campo, valor) => {
        const novaLista = extrasSeguros.map((item, i) => {
            if (i === index) {
                if (campo === "nome") return { ...item, nome: valor.toUpperCase() };
                if (campo === "qtd" || campo === "unitPrice" || campo === "valor") {
                    return { ...item, [campo]: valor };
                }
                return { ...item, [campo]: valor };
            }
            return item;
        });
        setCustosExtras(novaLista);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* 1. CAMPOS PADRÃO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* EMBALAGEM COM SELEÇÃO */}
                <div className="relative">
                    <UnifiedInput
                        label="Embalagem"
                        suffix="R$"
                        type="number"
                        align="right"
                        placeholder="0.00"
                        value={custoEmbalagem || ""}
                        onChange={(e) => setCustoEmbalagem(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                        className="pl-9" // Space for search button
                    />
                    <button
                        onClick={() => setIsModalEmbalagemOpen(true)}
                        className="absolute left-2 top-8 w-6 h-6 flex items-center justify-center text-zinc-500 hover:text-emerald-500 hover:bg-zinc-800 rounded-md transition-all"
                        title="Buscar Embalagem"
                    >
                        <Search size={14} />
                    </button>
                    {/* Modal for Embalagem */}
                    <ModalSelecaoInsumo
                        isOpen={isModalEmbalagemOpen}
                        onClose={() => setIsModalEmbalagemOpen(false)}
                        onConfirm={aoSelecionarEmbalagem}
                    />
                </div>

                <UnifiedInput
                    label="Frete"
                    suffix="R$"
                    type="number"
                    align="right"
                    placeholder="0.00"
                    value={custoFrete || ""}
                    onChange={(e) => setCustoFrete(e.target.value)}
                    onWheel={(e) => e.target.blur()}
                />
            </div>

            {/* 2. SEÇÃO DE GASTOS EXTRAS */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1 border-b border-zinc-800/50 pb-2">
                    <div className="flex items-center gap-2">
                        <Wrench size={12} className="text-zinc-500" />
                        <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">
                            Custos Adicionais
                        </span>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-mono font-bold text-sky-400">
                                {formatCurrency(totalExtrasSoma)}
                            </span>
                            <span className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter">Total de Extras</span>
                        </div>

                        <button
                            type="button"
                            onClick={() => setModalSelecaoAberto(true)}
                            title="Importar do Estoque"
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                        >
                            <Archive size={14} strokeWidth={2.5} />
                        </button>

                        <button
                            type="button"
                            onClick={adicionarExtra}
                            className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 hover:bg-sky-500 hover:text-white transition-all active:scale-90"
                        >
                            <Plus size={16} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* LISTA DE ITENS - SEAMLESS DESIGN (FULL WIDTH + SLIDE IN) */}
                <div className="space-y-2">
                    {extrasSeguros.map((item, index) => (
                        <LinhaExtra
                            key={`extra-${index}`}
                            item={item}
                            index={index}
                            total={extrasSeguros.length}
                            aoAtualizar={atualizarItem}
                            aoRemover={removerExtra}
                        />
                    ))}

                    {extrasSeguros.length === 0 && (
                        <div className="py-6 text-center border-2 border-dashed border-zinc-900 rounded-xl animate-in fade-in zoom-in-95">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
                                Lista Vazia
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
      `}} />

            <ModalSelecaoInsumo
                isOpen={modalSelecaoAberto}
                onClose={() => setModalSelecaoAberto(false)}
                onConfirm={(selectedItems) => {
                    const novosItens = selectedItems.map(item => ({
                        id: crypto.randomUUID(),
                        nome: item.name.toUpperCase(),
                        valor: (1 * Number(item.price)).toFixed(2),
                        qtd: 1,
                        supplyId: item.id,
                        unitPrice: Number(item.price)
                    }));
                    const listaSegura = Array.isArray(custosExtras) ? custosExtras : [];
                    setCustosExtras([...listaSegura, ...novosItens]);
                }}
            />
        </div>
    );
}
