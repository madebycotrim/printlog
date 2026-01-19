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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

      {/* 1. TEMPO DE MÁQUINA (Duração da Impressão) */}
      <div className="space-y-1">
        <UnifiedInput
          label="Tempo de Impressão"
          icon={Clock}
          type="time"
          hoursValue={impressaoHoras ?? ""}
          onHoursChange={setTempoImpressaoHoras}
          minutesValue={impressaoMinutos ?? ""}
          onMinutesChange={setTempoImpressaoMinutos}
        />
        <div className="px-1 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <span>Taxa Máquina</span>
          <span className="text-zinc-400">R$ {Number(custoHoraMaquina || 0).toFixed(2)}/h</span>
        </div>
      </div>

      {/* 2. TEMPO HUMANO (Trabalho Manual / Pós-processamento) */}
      <div className="space-y-1">
        <UnifiedInput
          label="Trabalho Manual"
          icon={Wrench}
          type="time"
          hoursValue={trabalhoHoras ?? ""}
          onHoursChange={setTempoTrabalhoHoras}
          minutesValue={trabalhoMinutos ?? ""}
          onMinutesChange={setTempoTrabalhoMinutos}
        />
        <div className="px-1 flex justify-between items-center text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
          <span>Mão de Obra</span>
          <span className="text-zinc-400">R$ {Number(valorHoraHumana || 0).toFixed(2)}/h</span>
        </div>
      </div>

      {/* INFO ENERGIA */}
      {totalHorasImpressaoCalculado > 0 && (
        <div className="col-span-1 sm:col-span-2 flex items-center justify-between px-3 py-2 rounded-lg bg-yellow-500/5 border border-yellow-500/10">
          <div className="flex items-center gap-2">
            <Zap size={12} className="text-yellow-500" />
            <span className="text-[10px] font-black text-yellow-600/80 uppercase tracking-widest">
              Consumo de Energia
            </span>
          </div>
          <span className="text-[10px] font-mono font-bold text-yellow-500">
            {formatCurrency(custoEnergiaEstimado)}
          </span>
        </div>
      )}

      {/* AVISO DE CARGA HORÁRIA (Alerta de Segurança) */}
      {totalHorasImpressaoCalculado > 12 && (
        <div className="col-span-1 sm:col-span-2 mt-1 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
          <Timer size={12} className="text-amber-500" />
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">
            <strong className="text-amber-500">Atenção:</strong> Impressão bem longa! Verifique se você tem filamento suficiente no estoque.
          </span>
        </div>
      )}
    </div>
  );
}
