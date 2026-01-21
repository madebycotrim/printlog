import React, { useState, useEffect } from "react";
import { Store, BadgePercent, Coins, ShoppingBag, Globe, Info, Settings2 } from "lucide-react";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import { useCalculatorStore } from "../../../../stores/calculatorStore";

import { useSettings } from "../../../sistema/logic/settingsQueries";
import { DEFAULT_PLATFORMS } from "../../logic/constants";

export default function CardCanal({ onOpenTaxas }) {
  const { dadosFormulario, atualizarCampo } = useCalculatorStore();
  const { canal: canalVenda, taxaMarketplace, taxaMarketplaceFixa } = dadosFormulario.vendas;

  const setCanalVenda = (v) => atualizarCampo('vendas', 'canal', v);
  const setTaxaMarketplace = (v) => atualizarCampo('vendas', 'taxaMarketplace', v);
  const setTaxaMarketplaceFixa = (v) => atualizarCampo('vendas', 'taxaMarketplaceFixa', v);

  const [presetSelecionado, setPresetSelecionado] = useState("manual");

  // Dados do Banco (Sync Real)
  const { data: settings } = useSettings();
  const plataformas = settings?.platforms || DEFAULT_PLATFORMS;

  // 2. SINCRONIZAÇÃO AUTOMÁTICA: Identifica o preset com base nos valores atuais
  useEffect(() => {
    const plataformaEncontrada = plataformas.find(p =>
      String(p.taxa) === String(taxaMarketplace) &&
      String(p.fixa) === String(taxaMarketplaceFixa)
    );

    if (plataformaEncontrada) {
      setPresetSelecionado(plataformaEncontrada.id);
    } else {
      setPresetSelecionado("manual");
    }
  }, [taxaMarketplace, taxaMarketplaceFixa, plataformas]);

  // 3. Mapeamento para o formato de GRUPOS da seleção
  const opcoesSelecao = [
    {
      group: "OPÇÃO MANUAL",
      items: [{ value: "manual", label: "TAXA PERSONALIZADA" }]
    },
    {
      group: "MINHAS PLATAFORMAS",
      items: plataformas.map(p => ({
        value: p.id,
        label: p.name
      }))
    }
  ];

  const lidarMudancaPreset = (chave) => {
    setPresetSelecionado(chave);
    if (chave !== "manual") {
      const p = plataformas.find(plat => plat.id === chave);
      if (p) {
        setTaxaMarketplace(p.taxa);
        setTaxaMarketplaceFixa(p.fixa);
      }
    }
  };

  return (

    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* 1. TOGGLE DE CANAL (Estilo Split) */}
      <div className="grid grid-cols-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
        <button
          onClick={() => setCanalVenda("loja")}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${canalVenda === "loja"
            ? "bg-zinc-800 text-sky-400 shadow-sm"
            : "text-zinc-600 hover:text-zinc-400"
            }`}
        >
          <Store size={12} /> Loja Própria
        </button>
        <button
          onClick={() => setCanalVenda("marketplace")}
          className={`flex items-center justify-center gap-2 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${canalVenda === "marketplace"
            ? "bg-zinc-800 text-sky-400 shadow-sm"
            : "text-zinc-600 hover:text-zinc-400"
            }`}
        >
          <ShoppingBag size={12} /> Marketplace
        </button>
      </div>

      {/* 2. CONTEÚDO DINÂMICO */}
      <div className="space-y-4">

        {/* SELETOR DE PRESETS (Apenas Marketplace) */}
        {canalVenda === 'marketplace' && (
          <div className="animate-in slide-in-from-top-2 duration-300">
            <div className="flex items-end gap-2">
              <div className="flex-1">
                <UnifiedInput
                  label="Plataforma"
                  icon={Globe}
                  type="select"
                  options={opcoesSelecao}
                  value={presetSelecionado}
                  onChange={(id) => lidarMudancaPreset(id)}
                />
              </div>
              <button
                onClick={onOpenTaxas}
                className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white transition-colors"
                title="Configurar Taxas"
              >
                <Settings2 size={16} />
              </button>
            </div>
          </div>
        )}

        {/* INFO PARA LOJA (Feedback Visual) */}
        {canalVenda === 'loja' && (
          <div className="p-3 rounded-lg bg-sky-500/5 border border-sky-500/10 flex items-center gap-3 animate-in fade-in">
            <Info size={14} className="text-sky-500" />
            <span className="text-[10px] text-zinc-400 font-medium leading-tight">
              Na <strong>Loja Própria</strong>, você geralmente só paga taxas de cartão (digamos, 4.99% + R$0,50). Configure abaixo se necessário.
            </span>
          </div>
        )}

        {/* CAMPOS DE TAXAS (Sempre visíveis mas contextualizados) */}
        <div className="grid grid-cols-2 gap-4">
          <UnifiedInput
            label={canalVenda === 'loja' ? "Taxa Cartão (%)" : "Comissão (%)"}
            icon={BadgePercent}
            suffix="%"
            align="right"
            placeholder="0"
            type="number"
            value={taxaMarketplace}
            onChange={(e) => setTaxaMarketplace(e.target.value)}
          />
          <UnifiedInput
            label={canalVenda === 'loja' ? "Custo Transação (R$)" : "Taxa Fixa (R$)"}
            icon={Coins}
            suffix="R$"
            align="right"
            placeholder="0.00"
            type="number"
            value={taxaMarketplaceFixa}
            onChange={(e) => setTaxaMarketplaceFixa(e.target.value)}
          />
        </div>

      </div>
    </div>
  );
}
