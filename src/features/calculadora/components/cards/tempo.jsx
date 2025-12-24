import React from "react";
import { Clock, Timer, Wrench } from "lucide-react";
import { UnifiedInput } from "../../../../components/formInputs";

export default function Tempo({
  tempoImpressaoHoras, setTempoImpressaoHoras,
  tempoImpressaoMinutos, setTempoImpressaoMinutos,
  tempoTrabalhoHoras, setTempoTrabalhoHoras,
  tempoTrabalhoMinutos, setTempoTrabalhoMinutos
}) {
  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-500">

      {/* GRUPO DE IMPRESSÃO */}
      <UnifiedInput
        label="Duração da Impressão"
        icon={Clock}
        type="time"
        hoursValue={tempoImpressaoHoras}
        onHoursChange={setTempoImpressaoHoras}
        minutesValue={tempoImpressaoMinutos}
        onMinutesChange={setTempoImpressaoMinutos}
      />

      {/* GRUPO DE TRABALHO MANUAL */}
      <UnifiedInput
        label="Trabalho Manual"
        icon={Wrench}
        type="time"
        hoursValue={tempoTrabalhoHoras}
        onHoursChange={setTempoTrabalhoHoras}
        minutesValue={tempoTrabalhoMinutos}
        onMinutesChange={setTempoTrabalhoMinutos}
      />

      {/* AVISO DE CARGA HORÁRIA (Mantido original) */}
      {Number(tempoImpressaoHoras) > 12 && (
        <div className="col-span-2 mt-1 px-3 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
          <Timer size={12} className="text-amber-500" />
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider leading-tight">
            <strong className="text-amber-500 text-[10px]">Atenção:</strong> Impressão longa. Verifique a primeira camada.
          </span>
        </div>
      )}
    </div>
  );
}