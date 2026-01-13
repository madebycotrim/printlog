import { useEffect } from "react";
import { formatCurrency } from "../../../../utils/numbers";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import { Box as BoxIcon, Truck, Wrench, Plus, Tag, Trash2, Package } from "lucide-react";
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

  const mappedSupplies = supplies.map(s => ({ value: s.id, label: s.name }));
  const supplyOptions = [{ items: [{ value: "", label: "..." }].concat(mappedSupplies) }];

  // Soma todos os extras para mostrar o total no topo do card
  const totalExtrasSoma = extrasSeguros.reduce((acumulado, item) => {
    const valorNumerico = parseFloat(item?.valor) || 0;
    return acumulado + valorNumerico;
  }, 0);

  // Adiciona uma nova linha de custo na lista
  const adicionarExtra = () => {
    setCustosExtras([...extrasSeguros, { nome: "", valor: "" }]);
  };

  // Remove um item da lista pelo índice dele
  const removerExtra = (index) => {
    const novaLista = extrasSeguros.filter((_, i) => i !== index);
    setCustosExtras(novaLista);
  };

  // Atualiza o nome ou o valor de um custo extra específico
  const atualizarExtra = (index, campo, valor) => {
    const novaListaExtras = extrasSeguros.map((item, i) => {
      if (i === index) {
        // Se for o nome, a gente deixa tudo em maiúsculo pra manter o padrão
        if (campo === "nome") {
          return { ...item, [campo]: valor.toUpperCase() };
        }
        return { ...item, [campo]: valor };
      }
      return item;
    });
    setCustosExtras(novaListaExtras);
  };

  const selecionarInsumo = (index, supplyId) => {
    const supply = supplies.find(s => String(s.id) === String(supplyId));
    if (supply) {
      const novaLista = extrasSeguros.map((item, i) => {
        if (i === index) {
          return {
            ...item,
            nome: supply.name.toUpperCase(),
            valor: String(supply.price)
          };
        }
        return item;
      });
      setCustosExtras(novaLista);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. CAMPOS PADRÃO: LOGÍSTICA BÁSICA */}
      <div className="grid grid-cols-2 gap-4">
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
        {/* Cabeçalho com Contador e Total */}
        <div className="flex items-center justify-between px-1 border-b border-zinc-800/50 pb-2">
          <div className="flex items-center gap-2">
            <Wrench size={12} className="text-zinc-500" />
            <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">
              Custos Adicionais
            </span>
            <span className="text-[7px] bg-zinc-900/50 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-800/50/50 font-bold font-mono">
              {String(extrasSeguros.length).padStart(2, '0')} ITENS
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

        {/* LISTA DE ITENS COM ROLAGEM INTERNA */}
        <div className="space-y-2 max-h-[234px] overflow-y-auto pr-1 custom-scrollbar overflow-x-hidden">
          {extrasSeguros.map((item, index) => (
            <div key={`extra-${index}`} className="flex items-end gap-2 group animate-in slide-in-from-right-2 duration-300 mb-1">

              {/* DESCRIÇÃO DO GASTO */}
              <div className="min-w-0 flex-[2] flex gap-2">

                {/* SELECT DE INSUMOS */}
                {supplies.length > 0 && (
                  <div className="w-[40px] shrink-0">
                    <UnifiedInput
                      type="select"
                      icon={Package}
                      options={supplyOptions}
                      value={""} // Always reset after selection
                      onChange={(val) => selecionarInsumo(index, val)}
                    />
                  </div>
                )}

                <UnifiedInput
                  placeholder="EX: TINTA, COLA, LIXA..."
                  type="text"
                  icon={Tag}
                  value={item.nome || ""}
                  onChange={(e) => atualizarExtra(index, "nome", e.target.value)}
                />
              </div>

              {/* VALOR DO ITEM */}
              <div className="w-[85px] shrink-0">
                <UnifiedInput
                  placeholder="0.00"
                  type="number"
                  suffix="R$"
                  value={item.valor || ""}
                  onChange={(e) => atualizarExtra(index, "valor", e.target.value)}
                  onWheel={(e) => e.target.blur()}
                />
              </div>

              {/* BOTÃO PRA REMOVER */}
              <button
                type="button"
                onClick={() => removerExtra(index)}
                className="mb-[1px] flex h-11 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-950/30 border border-zinc-800/50 text-zinc-600 transition-all hover:border-rose-500/30 hover:bg-rose-500/10 hover:text-rose-500 shadow-sm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* AVISO DE LISTA VAZIA */}
          {extrasSeguros.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-zinc-900 rounded-2xl animate-in fade-in zoom-in-95">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
                Nenhum custo extra por enquanto
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
