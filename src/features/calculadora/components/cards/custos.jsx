// src/features/calculadora/components/CustosLogisticos.jsx
import React from "react";
import { Box, Truck, Plus, Wrench, Tag, Trash2 } from "lucide-react";
import { UnifiedInput } from "../../../../components/UnifiedInput";

export default function CustosLogisticos({
  custoEmbalagem,
  setCustoEmbalagem,
  custoFrete,
  setCustoFrete,
  custosExtras = [],
  setCustosExtras
}) {

  // Garante que a lista de extras seja sempre um array válido
  const extrasSeguros = Array.isArray(custosExtras) ? custosExtras : [];

  // Cálculo da soma dos extras para exibição reativa no cabeçalho
  const totalExtrasSoma = extrasSeguros.reduce((acumulado, item) => {
    const valorNumerico = parseFloat(item?.valor) || 0;
    return acumulado + valorNumerico;
  }, 0);

  // Adiciona um novo item vazio à lista
  const adicionarExtra = () => {
    setCustosExtras([...extrasSeguros, { nome: "", valor: "" }]);
  };

  // Remove um item específico pelo índice
  const removerExtra = (index) => {
    const novaLista = extrasSeguros.filter((_, i) => i !== index);
    setCustosExtras(novaLista);
  };

  // Atualiza os campos de nome ou valor de um item específico
  const atualizarExtra = (index, campo, valor) => {
    const novaListaExtras = extrasSeguros.map((item, i) => {
      if (i === index) {
        // Se for o campo nome, padroniza para maiúsculas
        if (campo === "nome") {
          return { ...item, [campo]: valor.toUpperCase() };
        }
        return { ...item, [campo]: valor };
      }
      return item;
    });
    setCustosExtras(novaListaExtras);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* 1. INPUTS FIXOS: LOGÍSTICA BÁSICA */}
      <div className="grid grid-cols-2 gap-4">
        <UnifiedInput
          label="Embalagem"
          icon={Box}
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

      {/* 2. SEÇÃO DE CUSTOS ADICIONAIS (EXTRAS) */}
      <div className="space-y-3">
        {/* Header com Contador e Somatório */}
        <div className="flex items-center justify-between px-1 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Wrench size={12} className="text-zinc-500" />
            <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">
              Custos Adicionais
            </span>
            <span className="text-[7px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-white/5 font-bold font-mono">
              {String(extrasSeguros.length).padStart(2, '0')} ITENS
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-bold text-sky-400">
                R$ {totalExtrasSoma.toFixed(2)}
              </span>
              <span className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter">Soma Extras</span>
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

        {/* LISTA DINÂMICA COM SCROLL INTERNO */}
        <div className="space-y-2 max-h-[234px] overflow-y-auto pr-1 custom-scrollbar overflow-x-hidden">
          {extrasSeguros.map((item, index) => (
            <div key={`extra-${index}`} className="flex items-end gap-2 group animate-in slide-in-from-right-2 duration-300 mb-1">

              {/* DESCRIÇÃO DO CUSTO */}
              <div className="flex-[2] min-w-0">
                <UnifiedInput
                  placeholder="EX: TINTA, LIXA..."
                  type="text"
                  icon={Tag}
                  value={item.nome || ""}
                  onChange={(e) => atualizarExtra(index, "nome", e.target.value)}
                />
              </div>

              {/* VALOR UNITÁRIO */}
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

              {/* BOTÃO REMOVER */}
              <button
                type="button"
                onClick={() => removerExtra(index)}
                className="h-11 w-10 shrink-0 flex items-center justify-center rounded-xl border border-zinc-800/60 text-zinc-700 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all shadow-sm"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {/* ESTADO VAZIO */}
          {extrasSeguros.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-zinc-900 rounded-2xl animate-in fade-in zoom-in-95">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
                Nenhum custo extra pendente
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}