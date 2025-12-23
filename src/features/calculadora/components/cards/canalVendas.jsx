// src/features/calculadora/components/cards/canalVendas.jsx

import React, { useMemo } from "react";
import { Percent, DollarSign, Info } from "lucide-react";
import SearchSelect from "../../../../components/SearchSelect";

/* ---------- LABEL PADRONIZADO ---------- */
const Label = ({ children }) => (
  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block ml-1">
    {children}
  </label>
);

/* ---------- COMPONENTE PRINCIPAL ---------- */
export default function CanalDeVenda({
  canalVenda,
  setCanalVenda,
  taxaMarketplace,
  setTaxaMarketplace,
  taxaMarketplaceFixa, // Alterado de custoFixo para bater com o calculator.js
  setTaxaMarketplaceFixa,
}) {
  
  // Presets atualizados com taxas reais de mercado
  const presets = {
    loja: { label: "Venda Direta / Site Próprio", taxa: 0, fixo: 0 },
    shopee_padrao: { label: "Shopee Padrão (14% + R$4)", taxa: 14, fixo: 4 },
    shopee_frete: { label: "Shopee c/ Frete Grátis (20% + R$4)", taxa: 20, fixo: 4 },
    ml_classico: { label: "Mercado Livre Clássico (~13% + R$6)", taxa: 13, fixo: 6 },
    ml_premium: { label: "Mercado Livre Premium (~18% + R$6)", taxa: 18, fixo: 6 },
    custom: { label: "Personalizado / Outros", taxa: 0, fixo: 0 },
  };

  const options = useMemo(() => [
    {
      group: "Shopee",
      items: [
        { value: "shopee_padrao", label: presets.shopee_padrao.label },
        { value: "shopee_frete", label: presets.shopee_frete.label },
      ],
    },
    {
      group: "Mercado Livre",
      items: [
        { value: "ml_classico", label: presets.ml_classico.label },
        { value: "ml_premium", label: presets.ml_premium.label },
      ],
    },
    {
      group: "Direto",
      items: [
        { value: "loja", label: presets.loja.label },
        { value: "custom", label: presets.custom.label },
      ],
    },
  ], []);

  const handleChange = (value) => {
    setCanalVenda(value);
    if (presets[value]) {
      setTaxaMarketplace(presets[value].taxa);
      setTaxaMarketplaceFixa(presets[value].fixo);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      
      {/* SELETOR DE CANAL (ESTILO BUSCA DATABASE) */}
      <div>
        <Label>Marketplace_Node</Label>
        <SearchSelect
          value={canalVenda}
          onChange={handleChange}
          options={options}
          renderValue={(item) => item.label}
          renderOption={(item) => item.label}
        />
      </div>

      {/* INPUTS DE TAXA */}
      <div className="grid grid-cols-2 gap-4">
        
        {/* COMISSÃO PERCENTUAL */}
        <div className="space-y-1.5">
          <Label>Mkt_Fee (%)</Label>
          <div className="relative group">
            <Percent
              size={12}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors"
            />
            <input
              type="number"
              value={taxaMarketplace}
              onChange={(e) => setTaxaMarketplace(e.target.value)}
              placeholder="0"
              className="
                no-spinner w-full h-11 rounded-xl pl-10 pr-3
                bg-zinc-950 border border-zinc-800/60
                text-zinc-300 text-xs font-mono font-bold
                outline-none transition-all
                hover:border-zinc-700
                focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/10
              "
            />
          </div>
        </div>

        {/* TAXA FIXA (O "VILÃO" DAS VENDAS PEQUENAS) */}
        <div className="space-y-1.5">
          <Label>Fixed_Fee (R$)</Label>
          <div className="relative group">
            <DollarSign
              size={12}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-sky-500 transition-colors"
            />
            <input
              type="number"
              value={taxaMarketplaceFixa}
              onChange={(e) => setTaxaMarketplaceFixa(e.target.value)}
              placeholder="0.00"
              className="
                no-spinner w-full h-11 rounded-xl pl-10 pr-3
                bg-zinc-950 border border-zinc-800/60
                text-zinc-300 text-xs font-mono font-bold
                outline-none transition-all
                hover:border-zinc-700
                focus:border-sky-500/40 focus:ring-1 focus:ring-sky-500/10
              "
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 opacity-20 hover:opacity-100 transition-opacity cursor-help">
                <Info size={12} className="text-zinc-400" />
            </div>
          </div>
        </div>

      </div>

      {/* FEEDBACK SUTIL */}
      {taxaMarketplaceFixa > 0 && (
          <div className="px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-lg flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-amber-500 animate-pulse" />
              <span className="text-[8px] font-black text-amber-500/80 uppercase tracking-widest leading-none">
                  Atenção: Taxa fixa de {presets[canalVenda]?.fixo || taxaMarketplaceFixa}R$ aplicada por unidade vendida.
              </span>
          </div>
      )}
    </div>
  );
}