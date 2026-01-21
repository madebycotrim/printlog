import { useState, useEffect } from "react";
import { formatCurrency } from "../../../../utils/numbers";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import { Truck, Wrench, Plus, Archive, X, Search, Package } from "lucide-react";
import { useSupplyStore } from "../../../insumos/logic/supplies";
import ModalSelecaoInsumo from "../../../insumos/components/ModalSelecaoInsumo";
import { useCalculatorStore } from "../../../../stores/calculatorStore";

/* ---------- COMPONENTE: LINHA EXTRA (SUB-COMPONENTE) ---------- */
const LinhaExtra = ({ item, index, total, aoAtualizar, aoRemover }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const zIndex = (total - index) * 10;

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
            className="group flex items-center bg-zinc-900/20 hover:bg-zinc-900/40 border border-zinc-800/40 hover:border-zinc-700/60 rounded-lg transition-all relative h-10 animate-in slide-in-from-right-2 duration-300"
        >
            {/* 1. NOME (Com busca integrada) */}
            <UnifiedInput
                variant="ghost"
                placeholder="ITEM..."
                type="text"
                value={item.nome || ""}
                onChange={(e) => {
                    const updates = { nome: e.target.value.toUpperCase() };
                    if (item.supplyId !== 'custom') updates.supplyId = 'custom';
                    aoAtualizar(index, updates);
                }}
                className="h-full text-xs font-medium"
            />

            {/* 2. QTD */}
            <div className="w-16 shrink-0 h-full border-l border-zinc-800/30">
                <UnifiedInput
                    variant="ghost"
                    placeholder="0"
                    type="number"
                    align="center"
                    value={item.qtd}
                    onChange={(e) => {
                        const novaQtd = parseFloat(e.target.value) || 0;
                        const unitPrice = parseFloat(item.unitPrice) || 0;
                        aoAtualizar(index, {
                            qtd: e.target.value,
                            valor: (novaQtd * unitPrice).toFixed(2)
                        });
                    }}
                    className="h-full text-xs"
                />
            </div>

            {/* 3. PREÇO UNIT */}
            <div className="w-20 shrink-0 h-full border-l border-zinc-800/30">
                <UnifiedInput
                    variant="ghost"
                    placeholder="0.00"
                    type="number"
                    align="right"
                    suffix="R$"
                    value={item.unitPrice !== undefined && item.unitPrice !== "" ? item.unitPrice : (item.qtd && item.valor ? (item.valor / item.qtd).toFixed(2) : "")}
                    onChange={(e) => {
                        const novoUnitario = parseFloat(e.target.value) || 0;
                        const qtd = parseFloat(item.qtd) || 0;
                        aoAtualizar(index, {
                            unitPrice: e.target.value,
                            valor: (qtd * novoUnitario).toFixed(2)
                        });
                    }}
                    className="h-full text-xs"
                />
            </div>

            {/* DELETE BUTTON */}
            <button
                type="button"
                onClick={() => aoRemover(index)}
                className="w-8 shrink-0 h-full flex items-center justify-center text-zinc-700 hover:text-rose-500 hover:bg-rose-500/10 transition-colors rounded-r-lg"
                title="Remover"
            >
                <X size={12} strokeWidth={2.5} />
            </button>

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

    const { fetchSupplies } = useSupplyStore();
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
        setCustosExtras([...extrasSeguros, { nome: "", valor: "", qtd: "", unitPrice: "", supplyId: "" }]);
    };

    const removerExtra = (index) => {
        const novaLista = extrasSeguros.filter((_, i) => i !== index);
        setCustosExtras(novaLista);
    };

    const atualizarItem = (index, campoOuDados, valorOpcional) => {
        const novaLista = extrasSeguros.map((item, i) => {
            if (i === index) {
                if (typeof campoOuDados === 'object') {
                    return { ...item, ...campoOuDados };
                }
                return { ...item, [campoOuDados]: valorOpcional };
            }
            return item;
        });
        setCustosExtras(novaLista);
    };

    return (
        <div className="flex flex-col gap-4 h-full animate-in fade-in duration-500">

            {/* 1. CAMPOS PADRÃO (Fixed Height) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 shrink-0">
                {/* EMBALAGEM COM SELEÇÃO */}
                {/* EMBALAGEM COM SELEÇÃO */}
                <div>
                    <div className="flex justify-between items-center mb-1.5 px-1">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                            Embalagem
                        </label>
                        <button
                            onClick={() => setIsModalEmbalagemOpen(true)}
                            className="text-zinc-600 hover:text-sky-400 transition-colors"
                            title="Buscar Embalagem"
                        >
                            <Search size={12} strokeWidth={2.5} />
                        </button>
                    </div>
                    <UnifiedInput
                        icon={Package}
                        suffix="R$"
                        type="number"
                        align="right"
                        placeholder="0.00"
                        value={custoEmbalagem || ""}
                        onChange={(e) => setCustoEmbalagem(e.target.value)}
                        onWheel={(e) => e.target.blur()}
                    />
                    {/* Modal for Embalagem */}
                    <ModalSelecaoInsumo
                        isOpen={isModalEmbalagemOpen}
                        onClose={() => setIsModalEmbalagemOpen(false)}
                        onConfirm={aoSelecionarEmbalagem}
                    />
                </div>

                <UnifiedInput
                    label="Frete"
                    icon={Truck}
                    suffix="R$"
                    type="number"
                    align="right"
                    placeholder="0.00"
                    value={custoFrete || ""}
                    onChange={(e) => setCustoFrete(e.target.value)}
                    onWheel={(e) => e.target.blur()}
                />
            </div>

            {/* 2. SEÇÃO DE GASTOS EXTRAS (Flex Grow) */}
            <div className="flex-1 flex flex-col gap-2 min-h-0">
                {/* HEADLINE + ACTIONS */}
                <div className="flex items-center justify-between px-1 shrink-0">
                    <div className="flex items-center gap-2">
                        <Wrench size={14} className="text-zinc-600" />
                        <span className="text-[10px] font-black tracking-widest text-zinc-400 uppercase">
                            Outros Custos
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* TOTAL DISPLAY */}
                        <div className="flex flex-col items-end mr-2">
                            <span className="text-[10px] font-mono font-bold text-sky-400">
                                {formatCurrency(totalExtrasSoma)}
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
                                <Archive size={12} />
                            </button>

                            <button
                                type="button"
                                onClick={adicionarExtra}
                                title="Adicionar Manual"
                                className="w-6 h-6 flex items-center justify-center rounded-md bg-zinc-800 text-zinc-400 hover:bg-sky-500 hover:text-white transition-all"
                            >
                                <Plus size={12} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* LISTA DE ITENS */}
                <div className="flex-1 flex flex-col relative space-y-1.5">
                    {extrasSeguros.length > 0 ? (
                        extrasSeguros.map((item, index) => (
                            <LinhaExtra
                                key={`extra-${index}`}
                                item={item}
                                index={index}
                                total={extrasSeguros.length}
                                aoAtualizar={atualizarItem}
                                aoRemover={removerExtra}
                            />
                        ))
                    ) : (
                        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-zinc-900 rounded-2xl animate-in fade-in zoom-in-95 p-0 min-h-[80px]">
                            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
                                Nenhum item adicionado
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
