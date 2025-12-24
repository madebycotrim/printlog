import React, { useMemo } from "react";
import { Percent, Landmark } from "lucide-react";
import SearchSelect from "../../../../components/SearchSelect";
import { UnifiedInput } from "../../../../components/formInputs"; // Componente visual centralizado

// DEFINIÇÕES TÉCNICAS DOS INPUTS
const CONFIG = {
  comissao: { 
    label: "Comissão do Site", 
    icon: Percent, 
    suffix: "%", 
    placeholder: "0", 
    type: "number" 
  },
  taxaFixa: { 
    label: "Taxa Fixa", 
    icon: Landmark, 
    suffix: "R$", 
    placeholder: "0.00", 
    type: "number" 
  }
};

const PRESETS = {
  loja: { label: "Venda Direta (Sem Taxas)", taxa: 0, fixo: 0 },
  shopee_padrao: { label: "Shopee Padrão (14% + R$4)", taxa: 14, fixo: 4 },
  shopee_frete: { label: "Shopee c/ Frete Grátis (20% + R$4)", taxa: 20, fixo: 4 },
  ml_classico: { label: "Mercado Livre Clássico (~13% + R$6)", taxa: 13, fixo: 6 },
  ml_premium: { label: "Mercado Livre Premium (~18% + R$6)", taxa: 18, fixo: 6 },
  custom: { label: "Taxa Manual / Outros", taxa: 0, fixo: 0 },
};

export default function CanalDeVenda({
  canalVenda, setCanalVenda,
  taxaMarketplace, setTaxaMarketplace,
  taxaMarketplaceFixa, setTaxaMarketplaceFixa,
}) {
  
  const options = useMemo(() => [
    { group: "Shopee", items: [
      { value: "shopee_padrao", label: PRESETS.shopee_padrao.label },
      { value: "shopee_frete", label: PRESETS.shopee_frete.label }
    ]},
    { group: "Mercado Livre", items: [
      { value: "ml_classico", label: PRESETS.ml_classico.label },
      { value: "ml_premium", label: PRESETS.ml_premium.label }
    ]},
    { group: "Direto", items: [
      { value: "loja", label: PRESETS.loja.label },
      { value: "custom", label: PRESETS.custom.label }
    ]},
  ], []);

  const handleChange = (value) => {
    setCanalVenda(value);
    if (PRESETS[value]) {
      setTaxaMarketplace(PRESETS[value].taxa);
      setTaxaMarketplaceFixa(PRESETS[value].fixo);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500">
      
      {/* SELETOR DE CANAL (SearchSelect é um componente à parte) */}
      <div>
        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2 block ml-1">
          Onde você vai vender?
        </label>
        <SearchSelect
          value={canalVenda}
          onChange={handleChange}
          options={options}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* USANDO O INPUT UNIFICADO COM AS CORES PADRÃO */}
        <UnifiedInput 
          {...CONFIG.comissao}
          value={taxaMarketplace}
          onChange={(e) => setTaxaMarketplace(e.target.value)}
          onFocus={(e) => e.target.select()}
        />

        <UnifiedInput 
          {...CONFIG.taxaFixa}
          value={taxaMarketplaceFixa}
          onChange={(e) => setTaxaMarketplaceFixa(e.target.value)}
          onFocus={(e) => e.target.select()}
        />
      </div>

      {/* FEEDBACK DE TAXA ATIVA */}
      {Number(taxaMarketplaceFixa) > 0 && (
        <div className="px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-tight">
            <strong className="text-amber-500/80">Aviso:</strong> Taxa de R$ {taxaMarketplaceFixa} descontada por unidade vendida.
          </span>
        </div>
      )}
    </div>
  );
}