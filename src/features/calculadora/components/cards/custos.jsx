import React from "react";
import { Box, Truck, Plus, X, Wrench, Tag, Trash2 } from "lucide-react";
import { UnifiedInput } from "../../../../components/formInputs";

export default function CustosLogisticos({
  custoEmbalagem, setCustoEmbalagem,
  custoFrete, setCustoFrete,
  custosExtras, setCustosExtras
}) {
  
  // Cálculo do total dos extras
  const totalExtras = custosExtras.reduce((acc, item) => acc + (Number(item.valor) || 0), 0);

  const addExtra = () => setCustosExtras([...custosExtras, { nome: "", valor: "" }]);
  
  const removeExtra = (index) => setCustosExtras(custosExtras.filter((_, i) => i !== index));

  const updateExtra = (index, campo, valor) => {
    const novaLista = [...custosExtras];
    novaLista[index][campo] = valor;
    setCustosExtras(novaLista);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* 1. INPUTS FIXOS (EMBALAGEM E FRETE) */}
      <div className="grid grid-cols-2 gap-4">
        <UnifiedInput
          label="Embalagem" 
          icon={Box} 
          suffix="R$"
          type="number"
          placeholder="0.00"
          value={custoEmbalagem}
          onChange={(e) => setCustoEmbalagem(e.target.value)}
        />
        <UnifiedInput
          label="Frete" 
          icon={Truck} 
          suffix="R$"
          type="number"
          placeholder="0.00"
          value={custoFrete}
          onChange={(e) => setCustoFrete(e.target.value)}
        />
      </div>

      {/* 2. SEÇÃO DE CUSTOS ADICIONAIS (EXTRAS) */}
      <div className="space-y-3">
        {/* Header Dinâmico */}
        <div className="flex items-center justify-between px-1 border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Wrench size={12} className="text-zinc-500" />
            <span className="text-[9px] font-black tracking-[0.2em] text-zinc-500 uppercase">
              Custos Adicionais
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-bold text-sky-400">
                R$ {totalExtras.toFixed(2)}
              </span>
              <span className="text-[7px] font-black text-zinc-700 uppercase tracking-tighter">Total Extras</span>
            </div>
            <button 
              type="button" 
              onClick={addExtra}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-500 hover:bg-sky-500 hover:text-white transition-all active:scale-90"
            >
              <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Lista de Itens Dinâmicos */}
        <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
          {custosExtras.map((item, index) => (
            <div key={index} className="flex items-end gap-2 group animate-in slide-in-from-right-2 duration-300">
              
              {/* Descrição do Extra */}
              <div className="flex-[2]">
                <UnifiedInput
                  placeholder="EX: TINTA, LIXA..."
                  type="text"
                  icon={Tag}
                  value={item.nome}
                  onChange={(e) => updateExtra(index, "nome", e.target.value.toUpperCase())}
                />
              </div>

              {/* Valor do Extra */}
              <div className="flex-1">
                <UnifiedInput
                  placeholder="0.00"
                  type="number"
                  suffix="R$"
                  value={item.valor}
                  onChange={(e) => updateExtra(index, "valor", e.target.value)}
                />
              </div>

              {/* Botão Remover - Alinhado com o input (h-11) */}
              <button
                type="button"
                onClick={() => removeExtra(index)}
                className="h-11 w-10 flex items-center justify-center rounded-xl border border-zinc-800/60 text-zinc-700 hover:text-rose-500 hover:border-rose-500/30 hover:bg-rose-500/5 transition-all"
                title="Remover custo"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}

          {custosExtras.length === 0 && (
            <div className="py-8 text-center border-2 border-dashed border-zinc-900 rounded-2xl">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-700">
                Nenhum custo extra adicionado
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
