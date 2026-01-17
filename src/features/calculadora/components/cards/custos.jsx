import { useEffect, useMemo } from "react";
import { formatCurrency } from "../../../../utils/numbers";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import { Box as BoxIcon, Truck, Wrench, Plus, Tag, Trash2, List } from "lucide-react";
import { useSupplyStore } from "../../../insumos/logic/supplies";

export default function CustosLogisticos({
  custoEmbalagem,
  setCustoEmbalagem,
  custoFrete,
  setCustoFrete,
  custosExtras = [],
  setCustosExtras
}) {
  const { supplies, fetchSupplies } = useSupplyStore();

  useEffect(() => {
    fetchSupplies();
  }, [fetchSupplies]);

  // Garante que a lista de extras seja sempre um array válido para o código
  const extrasSeguros = Array.isArray(custosExtras) ? custosExtras : [];

  // Prepara as opções do Select
  const opcoesSelecao = useMemo(() => {
    const manualOption = { value: 'custom', label: 'Item Personalizado...', color: 'transparent' };
    const supplyOptions = supplies.map(s => ({
      value: s.id,
      label: s.name,
      // Opcional: Adicionar cor ou outro metadado se necessário
    }));
    return [{ group: "Opções", items: [manualOption, ...supplyOptions] }];
  }, [supplies]);

  // Soma todos os extras para mostrar o total no topo do card
  const totalExtrasSoma = extrasSeguros.reduce((acumulado, item) => {
    const valorNumerico = parseFloat(item?.valor) || 0;
    return acumulado + valorNumerico;
  }, 0);

  // Adiciona uma nova linha de custo na lista
  const adicionarExtra = () => {
    // Por padrão começa com Select vazio
    setCustosExtras([...extrasSeguros, { nome: "", valor: "", qtd: 1, supplyId: "" }]);
  };

  // Remove um item da lista pelo índice dele
  const removerExtra = (index) => {
    const novaLista = extrasSeguros.filter((_, i) => i !== index);
    setCustosExtras(novaLista);
  };

  // Atualiza campo genérico
  const atualizarItem = (index, campo, valor) => {
    const novaLista = extrasSeguros.map((item, i) => {
      if (i === index) {
        if (campo === "nome") return { ...item, nome: valor.toUpperCase() };
        return { ...item, [campo]: valor };
      }
      return item;
    });
    setCustosExtras(novaLista);
  };

  // Lógica de Seleção do Insumo
  const selecionarInsumo = (index, valorSelecionado) => {
    const novaLista = [...extrasSeguros];
    const itemAtual = novaLista[index];

    if (valorSelecionado === 'custom') {
      // Muda para modo manual
      novaLista[index] = {
        ...itemAtual,
        supplyId: 'custom',
        nome: "", // Limpa o nome para o usuário digitar
        unitPrice: 0,
        valor: "0.00"
      };
    } else {
      // Selecionou um insumo do estoque
      const supply = supplies.find(s => String(s.id) === String(valorSelecionado));
      if (supply) {
        novaLista[index] = {
          ...itemAtual,
          supplyId: supply.id,
          nome: supply.name.toUpperCase(),
          unitPrice: supply.price,
          valor: (parseFloat(itemAtual.qtd || 1) * supply.price).toFixed(2)
        };
      }
    }
    setCustosExtras(novaLista);
  };

  // Voltar para o modo lista (resetar para seleção)
  const voltarParaLista = (index) => {
    const novaLista = [...extrasSeguros];
    novaLista[index].supplyId = ""; // Reinicia a seleção para mostrar o Select
    // Opcional: Limpar dados se quiser resetar totalmente?
    // novaLista[index].nome = ""; 
    // novaLista[index].unitPrice = 0;
    // Vamos manter os dados por enquanto ou não? 
    // Se voltar para lista, melhor limpar para não parecer que selecionou algo.
    novaLista[index].nome = "";
    novaLista[index].unitPrice = 0;
    novaLista[index].valor = "";

    setCustosExtras(novaLista);
  };


  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. CAMPOS PADRÃO: LOGÍSTICA BÁSICA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <UnifiedInput
          label="Embalagem"
          icon={BoxIcon}
          suffix="R$"
          type="number"
          placeholder="0.00"
          value={custoEmbalagem || ""}
          onChange={(e) => setCustoEmbalagem(e.target.value)}
          onWheel={(e) => e.target.blur()}
        />
        <UnifiedInput
          label="Frete"
          icon={Truck}
          suffix="R$"
          type="number"
          placeholder="0.00"
          value={custoFrete || ""}
          onChange={(e) => setCustoFrete(e.target.value)}
          onWheel={(e) => e.target.blur()}
        />
      </div>

      {/* 2. SEÇÃO DE GASTOS EXTRAS */}
      <div className="space-y-3">
        {/* Cabeçalho SEM CONTADOR */}
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
              onClick={adicionarExtra}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 hover:bg-sky-500 hover:text-white transition-all active:scale-90"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* LISTA DE ITENS */}
        <div className="space-y-2 max-h-[234px] overflow-y-auto pr-1 custom-scrollbar overflow-x-hidden">
          {extrasSeguros.map((item, index) => {
            const isManualMode = item.supplyId === 'custom' || (!item.supplyId && Boolean(item.nome));
            const showTextInput = item.supplyId === 'custom' || (!item.supplyId && Boolean(item.nome)); // Redundant but clear

            // Calculate z-index for dropdown stacking context (higher at top)
            const zIndex = (extrasSeguros.length - index) * 10;

            return (
              <div
                key={`extra-${index}`}
                style={{ zIndex }}
                className="flex items-end gap-2 group animate-in slide-in-from-right-2 duration-300 mb-2 relative"
              >

                {/* BOTÃO VOLTAR PARA SELECT (SÓ NO MODO MANUAL) 
                    Optei por deixá-lo fora do fluxo principal de 3 colunas ou integrado?
                    Para ficar IGUAL ao rack, não deveria ter esse botão extra quebrando o layout.
                    Vou tentar integrá-lo ou deixá-lo sutil. 
                    No Rack não tem esse botão. Mas aqui é necessário UX.
                    Vou colocar antes do input principal, mas tentar manter alinhado.
                */}
                {showTextInput && (
                  <button
                    onClick={() => voltarParaLista(index)}
                    className="h-11 w-8 shrink-0 rounded-xl bg-zinc-950/30 border border-zinc-800/50 flex items-center justify-center text-zinc-500 hover:text-sky-400 hover:border-sky-500/30 transition-all mb-[1px]"
                    title="Voltar para seleção"
                  >
                    <List size={14} />
                  </button>
                )}

                {/* COLUNA 1: NOME / SELECT */}
                <div className="flex-1 min-w-0 relative">
                  {showTextInput ? (
                    <UnifiedInput
                      placeholder="NOME DO ITEM..."
                      type="text"
                      icon={Tag}
                      value={item.nome || ""}
                      onChange={(e) => atualizarItem(index, "nome", e.target.value)}
                    />
                  ) : (
                    <UnifiedInput
                      placeholder="SELECIONE..."
                      type="select"
                      icon={BoxIcon}
                      options={opcoesSelecao}
                      value={item.supplyId || ""}
                      onChange={(val) => selecionarInsumo(index, val)}
                    />
                  )}
                </div>

                {/* COLUNA 2: QUANTIDADE (Igual ao Peso no Rack -> 82px) */}
                <div className="w-[82px] shrink-0 relative">
                  <UnifiedInput
                    placeholder="0"
                    type="number"
                    suffix="UN"
                    value={item.qtd || 1}
                    onChange={(e) => {
                      const novaQtd = parseFloat(e.target.value) || 0;
                      const novaLista = [...extrasSeguros];
                      novaLista[index] = {
                        ...novaLista[index],
                        qtd: novaQtd,
                        valor: (novaQtd * (parseFloat(novaLista[index].unitPrice) || 0)).toFixed(2)
                      };
                      setCustosExtras(novaLista);
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>

                {/* COLUNA 3: VALOR UNITÁRIO (Igual ao Preço no Rack -> 82px) */}
                <div className="w-[82px] shrink-0 relative">
                  <UnifiedInput
                    placeholder="0.00"
                    type="number"
                    suffix="R$"
                    value={item.unitPrice || (item.valor && item.qtd ? (item.valor / item.qtd).toFixed(2) : 0)}
                    onChange={(e) => {
                      const novoUnitario = parseFloat(e.target.value) || 0;
                      const novaLista = [...extrasSeguros];
                      const qtd = parseFloat(novaLista[index].qtd) || 1;
                      novaLista[index] = {
                        ...novaLista[index],
                        unitPrice: novoUnitario,
                        valor: (qtd * novoUnitario).toFixed(2)
                      };
                      setCustosExtras(novaLista);
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>

                {/* REMOVER (Estilo exato do Rack) */}
                <button
                  type="button"
                  onClick={() => removerExtra(index)}
                  className="h-11 w-10 shrink-0 flex items-center justify-center rounded-xl bg-zinc-950/30 border border-zinc-800/50 text-zinc-600 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/10 transition-all mb-[1px] shadow-sm"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}

          {extrasSeguros.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-zinc-900 rounded-2xl animate-in fade-in zoom-in-95">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
                Nenhum custo extra
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
    </div>
  );
}
