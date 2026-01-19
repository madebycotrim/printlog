import React, { useState, useEffect } from "react";
import { Store, Percent, DollarSign, ShoppingBag, Globe, Info } from "lucide-react";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import { useCalculatorStore } from "../../../../stores/calculatorStore";

// 1. Configurações de Taxas Médias (Presets)
const PRESETS_MARKETPLACE = {
  ml_premium: { label: "MERCADO LIVRE (PREMIUM)", pct: "19", fixo: "6.00" },
  ml_classico: { label: "MERCADO LIVRE (CLÁSSICO)", pct: "14", fixo: "6.00" },
  shopee_sem_frete: { label: "SHOPEE (SEM FRETE)", pct: "15", fixo: "4.00" },
  shopee_com_frete: { label: "SHOPEE (COM FRETE)", pct: "20", fixo: "4.00" },
  amazon: { label: "AMAZON", pct: "10", fixo: "4.00" },
  tiktok: { label: "TIKTOK SHOPS", pct: "5", fixo: "0.00" },
};

export default function CardCanal() {
  const { dadosFormulario, atualizarCampo } = useCalculatorStore();
  const { canal: canalVenda, taxaMarketplace, taxaMarketplaceFixa } = dadosFormulario.vendas;

  const setCanalVenda = (v) => atualizarCampo('vendas', 'canal', v);
  const setTaxaMarketplace = (v) => atualizarCampo('vendas', 'taxaMarketplace', v);
  const setTaxaMarketplaceFixa = (v) => atualizarCampo('vendas', 'taxaMarketplaceFixa', v);

  const [presetSelecionado, setPresetSelecionado] = useState("manual");

  // 2. SINCRONIZAÇÃO AUTOMÁTICA: Identifica o preset com base nos valores atuais
  useEffect(() => {
    const chaveEncontrada = Object.keys(PRESETS_MARKETPLACE).find(chave =>
      String(PRESETS_MARKETPLACE[chave].pct) === String(taxaMarketplace) &&
      String(PRESETS_MARKETPLACE[chave].fixo) === String(taxaMarketplaceFixa)
    );

    if (chaveEncontrada) {
      setPresetSelecionado(chaveEncontrada);
    } else {
      setPresetSelecionado("manual");
    }
  }, [taxaMarketplace, taxaMarketplaceFixa]);

  // 3. Mapeamento para o formato de GRUPOS da seleção
  const opcoesSelecao = [
    {
      group: "OPÇÃO MANUAL",
      items: [{ value: "manual", label: "TAXA PERSONALIZADA" }]
    },
    {
      group: "MARKETPLACES MAIS USADOS",
      items: Object.keys(PRESETS_MARKETPLACE).map(key => ({
        value: key,
        label: PRESETS_MARKETPLACE[key].label
      }))
    }
  ];

  const lidarMudancaPreset = (chave) => {
    setPresetSelecionado(chave);
    if (chave !== "manual") {
      setTaxaMarketplace(PRESETS_MARKETPLACE[chave].pct);
      setTaxaMarketplaceFixa(PRESETS_MARKETPLACE[chave].fixo);
    }
  };

  return (
    <div className="flex flex-col gap-5">

      {/* SELETOR DE MODO (CANAL) */}
      <div className="flex bg-zinc-950/40 border border-zinc-800 p-1 rounded-xl">
        <button
          type="button"
          onClick={() => setCanalVenda("loja")}
          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border outline-none focus:ring-0
          ${canalVenda === "loja" ? "bg-zinc-900/50 text-sky-400 border-zinc-800 shadow-lg" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
        >
          <Store size={10} /> Loja Própria
        </button>
        <button
          type="button"
          onClick={() => setCanalVenda("marketplace")}
          className={`flex-1 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border outline-none focus:ring-0
          ${canalVenda === "marketplace" ? "bg-zinc-900/50 text-sky-400 border-zinc-800 shadow-lg" : "border-transparent text-zinc-600 hover:text-zinc-400"}`}
        >
          <ShoppingBag size={10} /> Marketplace
        </button>
      </div>

      <div className="space-y-4">

        {/* SELETOR DE PLATAFORMA (Keep-Alive) */}
        <div className={canalVenda === 'marketplace' ? '' : 'hidden'}>
          <UnifiedInput
            label="Plataforma de Venda"
            icon={Globe}
            type="select"
            options={opcoesSelecao}
            value={presetSelecionado}
            onChange={(id) => lidarMudancaPreset(id)}
          />
        </div>

        {/* INFO LOJA PROPRIA (Keep-Alive) */}
        <div className={`flex items-center gap-2 px-1 text-zinc-500 ${canalVenda === 'marketplace' ? 'hidden' : ''}`}>
          <Info size={12} />
          <span className="text-[8px] font-black uppercase tracking-widest">Taxas de Operação (Cartão/Gateway)</span>
        </div>

        {/* CAMPOS DE TAXAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UnifiedInput
            label="Comissão do Canal"
            icon={Percent}
            suffix="%"
            type="number"
            placeholder="0"
            value={taxaMarketplace}
            onChange={(e) => setTaxaMarketplace(e.target.value)}
          />

          <UnifiedInput
            label="Taxa Fixa"
            icon={DollarSign}
            suffix="R$"
            type="number"
            placeholder="0.00"
            value={taxaMarketplaceFixa}
            onChange={(e) => setTaxaMarketplaceFixa(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
