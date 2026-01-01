// src/features/calculadora/components/Precificacao.jsx
import React, { useMemo, useState, useEffect } from "react";
import { 
  DollarSign, Landmark, ShieldAlert, Tag, 
  TrendingUp, HelpCircle, AlertTriangle, Activity 
} from "lucide-react";
import { UnifiedInput } from "../../../../components/UnifiedInput";

export default function Precificacao({
  margemLucro, setMargemLucro,
  imposto, setImposto,
  taxaFalha, setTaxaFalha,
  desconto, setDesconto,
  taxaMarketplace = 0,
  lucroRealItem = 0,
  tempoTotalHoras = 0
}) {
  const [markupLocal, setMarkupLocal] = useState("1.00");
  // ESTADO PARA O TOOLTIP (DICA)
  const [exibirDica, setExibirDica] = useState(false);

  // 1. SINCRONIZAÇÃO: Margem (%) -> Markup (x)
  // Baseado no Método do Divisor: Markup = 1 / (1 - Margem)
  useEffect(() => {
    const margemNumerica = parseFloat(margemLucro) || 0;
    if (margemNumerica >= 100) {
      setMarkupLocal("INVÁLIDO");
    } else if (margemNumerica <= 0) {
      setMarkupLocal("1.00");
    } else {
      const calculoMarkup = (1 / (1 - margemNumerica / 100)).toFixed(2);
      setMarkupLocal(calculoMarkup);
    }
  }, [margemLucro]);

  // 2. LÓGICA BIDIRECIONAL: Markup (x) -> Margem (%)
  const lidarMudancaMarkup = (e) => {
    const valor = e.target.value;
    setMarkupLocal(valor);
    
    const multiplicador = parseFloat(valor);
    if (!isNaN(multiplicador) && multiplicador >= 1) {
      // Margem = (1 - 1 / Markup) * 100
      const margemEquivalente = ((1 - 1 / multiplicador) * 100).toFixed(1);
      setMargemLucro(margemEquivalente);
    } else if (valor === "" || multiplicador < 1) {
      setMargemLucro("0");
    }
  };

  // 3. ANÁLISE DE RISCO E VIABILIDADE
  const cargaTotalEncargos = useMemo(() => {
    return (Number(margemLucro) || 0) + (Number(imposto) || 0) + (Number(taxaMarketplace) || 0);
  }, [margemLucro, imposto, taxaMarketplace]);

  const ehCritico = cargaTotalEncargos >= 90;
  const ehPerigoso = cargaTotalEncargos >= 70 && cargaTotalEncargos < 90;

  const statusPrecificacao = useMemo(() => {
    if (ehCritico) return { color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20", label: "MATEMATICAMENTE INVIÁVEL" };
    if (ehPerigoso) return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20", label: "MARGEM AGRESSIVA / RISCO" };
    return { color: "text-sky-400", bg: "bg-zinc-900/50", border: "border-zinc-800", label: "ESTRUTURA DE TAXAS SAUDÁVEL" };
  }, [ehCritico, ehPerigoso]);

  // 4. PERFORMANCE FINANCEIRA
  const lucroPorHora = useMemo(() => {
    const horas = parseFloat(tempoTotalHoras) || 0;
    return horas > 0 ? lucroRealItem / horas : 0;
  }, [lucroRealItem, tempoTotalHoras]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">
      
      {/* CABEÇALHO ESTRATÉGICO */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <TrendingUp size={14} className="text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Estratégia de Ganho</span>
        </div>
        
        {/* DICA COM ESTADO REACT */}
        <div className="relative flex items-center h-fit">
          <HelpCircle 
            size={14} 
            className={`transition-colors cursor-help ${exibirDica ? 'text-sky-400' : 'text-zinc-600'}`}
            onMouseEnter={() => setExibirDica(true)}
            onMouseLeave={() => setExibirDica(false)}
          />
          
          {exibirDica && (
            <div className="absolute right-0 top-6 w-56 p-3 bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl 
                          animate-in fade-in zoom-in-95 duration-200 z-[100] origin-top-right pointer-events-none">
              <p className="text-[8px] text-zinc-400 leading-relaxed uppercase font-bold">
                <span className="text-sky-400 font-black">Método do Divisor:</span> O lucro é calculado sobre o preço final. 
                <br/><br/>
                Ex: Margem de 50% significa que metade do valor pago pelo cliente fica com você.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ENTRADAS PRINCIPAIS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="relative">
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
              // Impede que a margem seja igual ou superior a 100% (divisor zero ou negativo)
              if (parseFloat(val) < 100 || val === "") setMargemLucro(val);
            }}
          />
          <span className="absolute -bottom-3 left-1 text-[7px] font-black text-zinc-600 uppercase tracking-tighter">Margem Real</span>
        </div>

        <div className="relative">
          <UnifiedInput
            label="Markup Ref."
            icon={TrendingUp}
            suffix="x"
            type="number"
            placeholder="1.00"
            value={markupLocal}
            onChange={lidarMudancaMarkup}
          />
          <span className="absolute -bottom-3 left-1 text-[7px] font-black text-zinc-600 uppercase tracking-tighter">Multiplicador</span>
        </div>
      </div>

      {/* SEGUNDA LINHA */}
      <div className="grid grid-cols-2 gap-4 mt-2">
        <UnifiedInput
          label="Impostos"
          icon={Landmark}
          suffix="%"
          type="number"
          placeholder="0"
          value={imposto}
          onChange={(e) => setImposto(e.target.value)}
        />
        <UnifiedInput
          label="Teto Desconto"
          icon={Tag}
          suffix="%"
          type="number"
          placeholder="0"
          value={desconto}
          onChange={(e) => setDesconto(e.target.value)}
          subtitle="Segurança"
        />
      </div>

      {/* TERCEIRA LINHA */}
      <UnifiedInput
        label="Reserva para Falhas"
        icon={ShieldAlert}
        suffix="%"
        type="number"
        placeholder="0"
        value={taxaFalha}
        onChange={(e) => setTaxaFalha(e.target.value)}
        subtitle="Seguro de Impressão"
      />

      {/* PAINEL DE SAÚDE FINANCEIRA */}
      <div className={`p-3 rounded-2xl border transition-all duration-500 ${statusPrecificacao.bg} ${statusPrecificacao.border}`}>
        <div className="flex flex-col gap-2.5">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-1.5">
              <Activity size={10} className={statusPrecificacao.color} />
              <span className={`text-[8px] font-black uppercase tracking-tighter ${statusPrecificacao.color}`}>
                {statusPrecificacao.label}
              </span>
            </div>
            <span className={`text-[10px] font-mono font-bold ${ehCritico ? 'text-rose-500' : 'text-zinc-400'}`}>
              {cargaTotalEncargos.toFixed(1)}%
            </span>
          </div>

          <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden p-[1px]">
            <div 
              style={{ width: `${Math.min(cargaTotalEncargos, 100)}%` }} 
              className={`h-full transition-all duration-700 rounded-full ${
                cargaTotalEncargos >= 90 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]' : 
                cargaTotalEncargos >= 70 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </div>

          {!ehCritico && lucroRealItem > 0 && (
            <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-0.5">
              <div className="flex flex-col">
                <span className="text-[7px] font-black text-zinc-500 uppercase leading-none">Ganho por Hora</span>
                <span className="text-[6px] text-zinc-600 uppercase font-bold tracking-tighter italic">Efetividade</span>
              </div>
              <span className={`text-[11px] font-mono font-bold ${lucroPorHora < 5 ? 'text-amber-500' : 'text-emerald-500'}`}>
                R$ {lucroPorHora.toFixed(2)}/h
              </span>
            </div>
          )}

          {ehCritico && (
            <div className="flex items-center gap-2 text-rose-500 mt-1">
              <AlertTriangle size={12} className="animate-pulse" />
              <span className="text-[7px] font-black uppercase leading-tight">Margens impossíveis detectadas.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}