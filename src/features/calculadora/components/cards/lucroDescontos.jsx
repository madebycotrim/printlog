import React, { useState, useEffect } from "react";
import {
  DollarSign, Landmark, ShieldAlert, Tag,
  TrendingUp, HelpCircle
} from "lucide-react";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import { useCalculatorStore } from "../../../../stores/calculatorStore";

export default function Precificacao() {
  const { dadosFormulario, atualizarCampo } = useCalculatorStore();

  // Extraindo do Store
  const { margemLucro, imposto, taxaFalha } = dadosFormulario.config;
  const { desconto, taxaMarketplace } = dadosFormulario.vendas;

  // Setters
  const setMargemLucro = (v) => atualizarCampo('config', 'margemLucro', v);
  const setImposto = (v) => atualizarCampo('config', 'imposto', v);
  const setTaxaFalha = (v) => atualizarCampo('config', 'taxaFalha', v);
  const setDesconto = (v) => atualizarCampo('vendas', 'desconto', v);

  const [markupLocal, setMarkupLocal] = useState("1.00");
  // ESTADO PARA A DICA (TOOLTIP)
  const [exibirDica, setExibirDica] = useState(false);

  // 1. SINCRONIZAÇÃO: Margem (%) -> Markup (x)
  // Baseado no Método do Divisor: Markup = 1 / (1 - Margem)
  useEffect(() => {
    const margemNumerica = parseFloat(margemLucro) || 0;
    if (isNaN(margemNumerica) || margemNumerica < 0) {
      setMarkupLocal("1.00");
    } else if (margemNumerica >= 100) {
      setMarkupLocal("INVÁLIDO");
    } else if (margemNumerica === 0) {
      setMarkupLocal("1.00");
    } else {
      const divisor = 1 - (margemNumerica / 100);
      if (divisor <= 0.01) {
        setMarkupLocal("INVÁLIDO");
      } else {
        const calculoMarkup = (1 / divisor).toFixed(2);
        setMarkupLocal(isFinite(parseFloat(calculoMarkup)) ? calculoMarkup : "INVÁLIDO");
      }
    }
  }, [margemLucro]);

  // 2. LÓGICA BIDIRECIONAL: Markup (x) -> Margem (%)
  const lidarMudancaMarkup = (e) => {
    const valor = e.target.value;
    setMarkupLocal(valor);

    const multiplicador = parseFloat(valor);
    if (!isNaN(multiplicador) && isFinite(multiplicador) && multiplicador >= 1) {
      // Margem = (1 - 1 / Markup) * 100
      const margemEquivalente = ((1 - 1 / multiplicador) * 100).toFixed(1);
      const margemNum = parseFloat(margemEquivalente);
      if (isFinite(margemNum) && margemNum >= 0 && margemNum < 100) {
        setMargemLucro(margemEquivalente);
      } else {
        setMargemLucro("0");
      }
    } else if (valor === "" || isNaN(multiplicador) || multiplicador < 1) {
      setMargemLucro("0");
    }
  };

  /* 
  // 3. ANÁLISE DE RISCO E VIABILIDADE - REMOVIDO PARA LÓGICA DE MARKUP LIVRE
  // A lógica antiga limitava o lucro a 100%, o que não se aplica mais.
  */

  return (
    <div className="flex flex-col animate-in fade-in duration-500 space-y-6">

      {/* 1. SEÇÃO DE ESTRATÉGIA (MARGEM & MARKUP) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Definição de Lucro</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UnifiedInput
            label="Lucro Desejado"
            icon={DollarSign}
            suffix="%"
            isLucro={true}
            type="number"
            placeholder="0"
            value={margemLucro}
            onChange={(e) => {
              const val = e.target.value;
              const vn = parseFloat(val);
              if (val === "" || (isNaN(vn) && val !== "")) {
                if (val === "" || val === ".") setMargemLucro(val);
              } else if (!isNaN(vn) && vn <= 100) {
                setMargemLucro(val);
              } else if (vn > 100) {
                setMargemLucro("100");
              }
            }}
          />
          <UnifiedInput
            label="Markup (Ref)"
            icon={TrendingUp}
            suffix="x"
            type="number"
            placeholder="1.00"
            value={markupLocal}
            onChange={lidarMudancaMarkup}
          />
        </div>
      </div>

      {/* DIVIDER */}
      <div className="w-full h-px bg-zinc-800/50" />

      {/* 2. CUSTOS E TAXAS */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <ShieldAlert size={14} className="text-amber-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Custos & Taxas</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UnifiedInput
            label="Imposto (DAS)"
            icon={Landmark}
            suffix="%"
            type="number"
            placeholder="0"
            value={imposto}
            onChange={(e) => setImposto(e.target.value)}
          />
          <UnifiedInput
            label="Reserva Técnica"
            icon={ShieldAlert}
            suffix="%"
            type="number"
            placeholder="0"
            value={taxaFalha}
            onChange={(e) => setTaxaFalha(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UnifiedInput
            label="Taxa de Venda"
            icon={Tag}
            suffix="%"
            type="number"
            placeholder="0"
            value={taxaMarketplace}
            onChange={(e) => atualizarCampo('vendas', 'taxaMarketplace', e.target.value)}
          />
          <UnifiedInput
            label="Desconto Padrão"
            icon={Tag}
            suffix="%"
            type="number"
            placeholder="0"
            value={desconto}
            onChange={(e) => setDesconto(e.target.value)}
          />
        </div>
      </div>

    </div>
  );
}
