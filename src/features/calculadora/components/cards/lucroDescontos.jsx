import React, { useState, useEffect } from "react";
import {
  Landmark, ShieldAlert, Tag,
  TrendingUp, RefreshCcw
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

    <div className="flex flex-col gap-6 animate-in fade-in duration-500">

      {/* 1. SEÇÃO DE LUCRO (Highlight) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded bg-emerald-500/10 text-emerald-500">
              <TrendingUp size={14} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-300">Lucro Desejado</span>
          </div>
          <span className="text-[9px] text-zinc-500 font-medium">Defina quanto quer ganhar</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <UnifiedInput
            label="Margem (%)"
            icon={TrendingUp}
            isLucro={true}
            suffix="%"
            align="right"
            placeholder="0"
            type="number"
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
            label="Markup (x)"
            icon={RefreshCcw}
            suffix="x"
            align="right"
            placeholder="1.00"
            type="number"
            value={markupLocal}
            onChange={lidarMudancaMarkup}
          />
        </div>
      </div>

      {/* 2. SEÇÃO DE CUSTOS & TAXAS (Secondary) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1 opacity-75">
          <ShieldAlert size={14} className="text-zinc-600" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Taxas & Segurança</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <UnifiedInput
            label="Imposto (DAS)"
            icon={Landmark}
            suffix="%"
            align="right"
            placeholder="0"
            type="number"
            value={imposto}
            onChange={(e) => setImposto(e.target.value)}
          />
          <UnifiedInput
            label="Margem de Erro"
            icon={ShieldAlert}
            suffix="%"
            align="right"
            placeholder="0"
            type="number"
            value={taxaFalha}
            onChange={(e) => setTaxaFalha(e.target.value)}
          />
        </div>

        {/* LINHA EXTRA: Marketplaces */}
        <div className="grid grid-cols-2 gap-4 pt-1">
          <UnifiedInput
            label="Taxa de Venda"
            icon={Tag}
            suffix="%"
            align="right"
            placeholder="0"
            type="number"
            value={taxaMarketplace}
            onChange={(e) => atualizarCampo('vendas', 'taxaMarketplace', e.target.value)}
          />
          <UnifiedInput
            label="Desconto"
            icon={Tag}
            suffix="%"
            align="right"
            placeholder="0"
            type="number"
            value={desconto}
            onChange={(e) => setDesconto(e.target.value)}
          />
        </div>
      </div>

    </div>
  );
}
