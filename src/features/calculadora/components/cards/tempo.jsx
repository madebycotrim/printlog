// src/features/calculadora/components/cards/Tempo.jsx
import React, { useMemo } from "react";
import { Clock, Timer, Wrench } from "lucide-react";
import { UnifiedInput } from "../../../../components/UnifiedInput";

export default function Tempo({
  tempoImpressaoHoras, setTempoImpressaoHoras,
  tempoImpressaoMinutos, setTempoImpressaoMinutos,
  tempoTrabalhoHoras, setTempoTrabalhoHoras,
  tempoTrabalhoMinutos, setTempoTrabalhoMinutos
}) {
  
  /**
   * CÁLCULO DE HORAS DECIMAIS
   * Converte o tempo (Horas e Minutos) em um valor decimal único.
   * Ex: 1h 30m -> 1.5h
   * Este valor é crucial para os cálculos de custo de energia e depreciação de máquina.
   */
  const totalHorasImpressaoCalculado = useMemo(() => {
    const horas = Number(tempoImpressaoHoras || 0);
    const minutos = Number(tempoImpressaoMinutos || 0);
    const total = horas + (minutos / 60);
    return isFinite(total) ? total : 0;
  }, [tempoImpressaoHoras, tempoImpressaoMinutos]);

  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">

      {/* 1. TEMPO DE MÁQUINA (Duração da Impressão) */}
      <UnifiedInput
        label="Duração da Impressão"
        icon={Clock}
        type="time"
        hoursValue={tempoImpressaoHoras || ""}
        onHoursChange={setTempoImpressaoHoras}
        minutesValue={tempoImpressaoMinutos || ""}
        onMinutesChange={setTempoImpressaoMinutos}
      />

      {/* 2. TEMPO HUMANO (Trabalho Manual / Pós-processamento) */}
      <UnifiedInput
        label="Trabalho Manual"
        icon={Wrench}
        type="time"
        hoursValue={tempoTrabalhoHoras || ""}
        onHoursChange={setTempoTrabalhoHoras}
        minutesValue={tempoTrabalhoMinutos || ""}
        onMinutesChange={setTempoTrabalhoMinutos}
      />

      {/* AVISO DE CARGA HORÁRIA (Alerta de Segurança) */}
      {totalHorasImpressaoCalculado > 12 && (
        <div className="col-span-2 mt-1 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3 animate-in zoom-in-95">
          <Timer size={12} className="text-amber-500" />
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest leading-tight">
            <strong className="text-amber-500">Atenção:</strong> Impressão de longa duração. Garanta que há filamento suficiente no estoque.
          </span>
        </div>
      )}
    </div>
  );
}