import React, { useMemo } from "react";
import { Clock, Timer, Wrench, Zap } from "lucide-react";
import { UnifiedInput } from "../../../../components/UnifiedInput";
import { useCalculatorStore } from "../../../../stores/calculatorStore";
import { formatCurrency } from "../../../../utils/numbers";

export default function Tempo() {
  const { dadosFormulario, atualizarCampo } = useCalculatorStore();
  const { impressaoHoras, impressaoMinutos, trabalhoHoras, trabalhoMinutos } = dadosFormulario.tempo;
  const { custoKwh, consumoKw, custoHoraMaquina, valorHoraHumana } = dadosFormulario.config;

  const setTempoImpressaoHoras = (v) => atualizarCampo('tempo', 'impressaoHoras', v);
  const setTempoImpressaoMinutos = (v) => atualizarCampo('tempo', 'impressaoMinutos', v);
  const setTempoTrabalhoHoras = (v) => atualizarCampo('tempo', 'trabalhoHoras', v);
  const setTempoTrabalhoMinutos = (v) => atualizarCampo('tempo', 'trabalhoMinutos', v);

  /**
   * CÁLCULO DE HORAS DECIMAIS
   */
  const totalHorasImpressaoCalculado = useMemo(() => {
    const horas = Number(impressaoHoras || 0);
    const minutos = Number(impressaoMinutos || 0);
    const total = horas + (minutos / 60);
    return isFinite(total) ? total : 0;
  }, [impressaoHoras, impressaoMinutos]);

  const custoEnergiaEstimado = useMemo(() => {
    const kw = Number(consumoKw || 0) / 1000; // watts to kw
    const price = Number(custoKwh || 0);
    return totalHorasImpressaoCalculado * kw * price;
  }, [totalHorasImpressaoCalculado, consumoKw, custoKwh]);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-500">

      {/* 1. ROW: TIME INPUTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* TEMPO DE MÁQUINA */}
        <div className="space-y-1.5">
          <UnifiedInput
            label="Tempo de Impressão"
            icon={Timer}
            type="time"
            hoursValue={impressaoHoras ?? ""}
            onHoursChange={setTempoImpressaoHoras}
            minutesValue={impressaoMinutos ?? ""}
            onMinutesChange={setTempoImpressaoMinutos}
          />
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Custo Hora</span>
            <span className="text-xs font-mono text-zinc-400">R$ {Number(custoHoraMaquina || 0).toFixed(2)}</span>
          </div>
        </div>

        {/* TEMPO HUMANO */}
        <div className="space-y-1.5">
          <UnifiedInput
            label="Acabamento"
            icon={Wrench}
            type="time"
            hoursValue={trabalhoHoras ?? ""}
            onHoursChange={setTempoTrabalhoHoras}
            minutesValue={trabalhoMinutos ?? ""}
            onMinutesChange={setTempoTrabalhoMinutos}
          />
          <div className="flex justify-between items-center px-1">
            <span className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest">Sua Hora</span>
            <span className="text-xs font-mono text-zinc-400">R$ {Number(valorHoraHumana || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 2. ROW: ENERGY & ALERTS */}
      <div className="flex flex-col gap-2">
        {/* ENERGY BADGE - Minimalist */}
        {totalHorasImpressaoCalculado > 0 && (
          <div className="flex items-center gap-2 px-1 opacity-75">
            <Zap size={12} className="text-yellow-500" />
            <span className="text-[10px] text-zinc-500 font-medium">
              Estimativa de Energia: <span className="text-yellow-500 font-bold font-mono ml-1">{formatCurrency(custoEnergiaEstimado)}</span>
            </span>
          </div>
        )}

        {/* WARNING */}
        {totalHorasImpressaoCalculado > 12 && (
          <div className="flex items-start gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-500">
            <Clock size={14} className="mt-0.5 shrink-0" />
            <span className="text-[10px] leading-tight font-medium">
              Impressão muito longa ({Number(totalHorasImpressaoCalculado).toFixed(1)}h). Verifique o carretel.
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
