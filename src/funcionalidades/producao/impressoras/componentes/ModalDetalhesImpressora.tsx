import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { SecaoFormulario, GradeCampos } from "@/compartilhado/componentes/FormularioLayout";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { StatusImpressora } from "@/compartilhado/tipos/modelos";
import { Printer, Zap, DollarSign, Wrench, Clock, Edit2, Box, X, Activity } from "lucide-react";
import { useState, useEffect } from "react";

interface ModalDetalhesImpressoraProps {
  impressora: Impressora | null;
  aberto: boolean;
  aoFechar: () => void;
  aoSalvarObservacoes?: (id: string, observacoes: string) => void;
}

export function ModalDetalhesImpressora({
  impressora,
  aberto,
  aoFechar,
  aoSalvarObservacoes,
}: ModalDetalhesImpressoraProps) {
  const [editandoObs, setEditandoObs] = useState(false);
  const [obsTexto, setObsTexto] = useState("");

  // Sincronizar estado local quando abrir modal
  useEffect(() => {
    if (impressora) {
      setObsTexto(impressora.observacoes || "");
      setEditandoObs(false);
    }
  }, [impressora, aberto]);

  if (!impressora) return null;

  const isOperacional =
    impressora.status === StatusImpressora.LIVRE || impressora.status === StatusImpressora.IMPRIMINDO;
  const isManutencao = impressora.status === StatusImpressora.MANUTENCAO;

  const statusCor = isOperacional
    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    : isManutencao
      ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
      : "text-zinc-500 bg-zinc-500/10 border-zinc-500/20";

  const barraCor = isOperacional ? "#10b981" : isManutencao ? "#f59e0b" : "#3f3f46";

  const subtitulo = [impressora.marca, impressora.modeloBase].filter(Boolean).join(" • ") || impressora.tecnologia;

  const horasUsadas = (impressora.horimetroTotalMinutos || 0) / 60;
  const intervaloHoras = (impressora.intervaloRevisaoMinutos || 18000) / 60; // Default 300h
  const porcentagemRevisao = Math.min(100, ((horasUsadas % intervaloHoras) / intervaloHoras) * 100);
  const horasRestantes = Math.max(0, intervaloHoras - (horasUsadas % intervaloHoras));

  // Lógica do ROI (Retorno sobre Investimento) em Centavos
  const valorCompraCentavos = impressora.valorCompraCentavos || 0;
  const taxaHoraCentavos = impressora.taxaHoraCentavos ?? 1500; // 15,00 fallback
  const valorGeradoCentavos = horasUsadas * taxaHoraCentavos;

  const porcentagemRoi = valorCompraCentavos > 0 ? Math.min(100, (valorGeradoCentavos / valorCompraCentavos) * 100) : 0;

  const lidarSalvarObs = () => {
    if (aoSalvarObservacoes && impressora) {
      aoSalvarObservacoes(impressora.id, obsTexto);
    }
    setEditandoObs(false);
  };

  return (
    <Dialogo aberto={aberto} aoFechar={aoFechar} larguraMax="max-w-3xl" esconderCabecalho>
      <div className="flex flex-col relative overflow-hidden bg-white dark:bg-[#18181b]">
        {/* Background Decorativo */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-sky-500/10 dark:from-sky-500/5 to-transparent pointer-events-none" />

        <div
          className="absolute top-0 right-0 w-64 h-64 opacity-[0.03] dark:opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="p-6 md:p-10 space-y-8 relative z-10">
          {/* CABEÇALHO DE IDENTIFICAÇÃO */}
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8 pb-8 border-b border-gray-100 dark:border-white/5">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-500" />
              <div className="relative w-32 h-32 rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-xl bg-white dark:bg-card border border-gray-200 dark:border-white/5 p-2">
                {impressora.imagemUrl ? (
                  <img
                    src={impressora.imagemUrl}
                    alt={impressora.nome}
                    className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
                  />
                ) : (
                  <Printer size={48} strokeWidth={1} className="text-gray-300 dark:text-zinc-700" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-[0.2em]">
                  {subtitulo}
                </p>
                <button
                  onClick={aoFechar}
                  className="hidden md:flex p-2 rounded-xl bg-gray-100/50 dark:bg-white/5 text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-all active:scale-90 border border-transparent hover:border-gray-200 dark:hover:border-white/10"
                  aria-label="Fechar"
                >
                  <X size={18} strokeWidth={3} />
                </button>
              </div>

              <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-4 lowercase first-letter:uppercase">
                {impressora.nome}
              </h2>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                <span
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${statusCor}`}
                >
                  {impressora.status}
                </span>
                <span className="px-3 py-1.5 rounded-lg text-[10px] font-black text-gray-500 dark:text-zinc-400 uppercase tracking-widest bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 shadow-sm">
                  {impressora.tecnologia}
                </span>
              </div>
            </div>
          </div>

          {/* DASHBOARD DE MÉTRICAS */}
          <GradeCampos colunas={2}>
            {/* CARD: MANUTENÇÃO */}
            <div className="rounded-2xl p-6 bg-gray-50 dark:bg-[#0e0e11] border border-gray-200 dark:border-white/5 flex flex-col justify-between shadow-inner relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                <Clock size={80} strokeWidth={1} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-6 text-gray-400 dark:text-zinc-500">
                  <Clock size={16} strokeWidth={2.5} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Ciclo de Revisão</span>
                </div>

                <div className="flex items-end justify-between mb-4">
                  <span className="text-3xl font-black text-gray-900 dark:text-white tabular-nums leading-none">
                    {horasUsadas.toLocaleString("pt-BR")}h
                  </span>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">
                      {Math.round(horasRestantes)}h Restantes
                    </span>
                  </div>
                </div>
              </div>

              <div className="relative z-10">
                <div className="h-2.5 w-full bg-gray-200 dark:bg-card rounded-full overflow-hidden mb-2 shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(0,0,0,0.1)]"
                    style={{ width: `${porcentagemRevisao}%`, background: barraCor }}
                  />
                </div>
                <p className="text-[10px] font-black text-gray-400 dark:text-zinc-600 flex justify-between uppercase tracking-widest">
                  <span>Base: {intervaloHoras}h</span>
                  <span>{Math.round(porcentagemRevisao)}%</span>
                </p>
              </div>
            </div>

            {/* CARD: RENTABILIDADE (ROI) */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-white to-gray-50 dark:from-card dark:to-[#0e0e11] border border-gray-200 dark:border-white/5 shadow-sm flex flex-col justify-between group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] dark:opacity-[0.05] group-hover:scale-125 transition-transform duration-700">
                <DollarSign size={80} strokeWidth={1} />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-500">
                    <DollarSign size={16} strokeWidth={2.5} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Rentabilidade (ROI)</span>
                  </div>
                  {valorCompraCentavos > 0 && (
                    <span className="text-[9px] font-black text-white bg-emerald-500 px-2 py-0.5 rounded-full shadow-lg shadow-emerald-500/20 uppercase tracking-widest">
                      {Math.round(porcentagemRoi)}%
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 leading-none">
                      Total Gerado
                    </p>
                    <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">
                      R$ {(valorGeradoCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5 leading-none">
                      Investimento
                    </p>
                    <p className="text-sm font-black text-gray-400 dark:text-zinc-400 tabular-nums leading-none">
                      R${" "}
                      {valorCompraCentavos > 0
                        ? (valorCompraCentavos / 100).toLocaleString("pt-BR", { minimumFractionDigits: 2 })
                        : "0,00"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="relative z-10 pt-2">
                <div className="h-2 w-full bg-gray-200 dark:bg-[#0e0e11] rounded-full overflow-hidden shadow-inner">
                  <div
                    className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                    style={{ width: `${porcentagemRoi}%` }}
                  />
                </div>
              </div>
            </div>
          </GradeCampos>

          {/* GRID DE INFORMAÇÕES SECUNDÁRIAS */}
          <GradeCampos colunas={4}>
            <InfoCard
              icone={Zap}
              rotulo="Potência"
              valor={impressora.potenciaWatts ? `${impressora.potenciaWatts}W` : "—"}
            />
            <InfoCard icone={Box} rotulo="Impressões" valor={impressora.historicoProducao?.length.toString() || "0"} />
            <InfoCard
              icone={Wrench}
              rotulo="Energia"
              valor={impressora.consumoKw ? `${impressora.consumoKw} kW/h` : "—"}
            />
            <InfoCard icone={Activity} rotulo="Eficiência" valor="—" />
          </GradeCampos>

          {/* SEÇÃO DE ANOTAÇÕES */}
          <SecaoFormulario
            titulo="Observações Técnicas"
            acaoCabecalho={
              !editandoObs ? (
                <button
                  onClick={() => setEditandoObs(true)}
                  className="text-[9px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-widest flex items-center gap-2 hover:bg-sky-50 dark:hover:bg-sky-500/10 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-sky-200 dark:hover:border-sky-500/30"
                >
                  <Edit2 size={12} strokeWidth={3} /> Editar Registro
                </button>
              ) : undefined
            }
          >
            <div className="pt-2">
              {editandoObs ? (
                <div className="space-y-4">
                  <textarea
                    value={obsTexto}
                    onChange={(e) => setObsTexto(e.target.value)}
                    className="w-full text-sm bg-white dark:bg-[#09090b] border border-gray-200 dark:border-white/10 rounded-xl p-4 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-600 focus:outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10 shadow-inner resize-none min-h-[120px] transition-all"
                    placeholder="Detalhes sobre manutenção, bicos preferidos, quirks da máquina..."
                    autoFocus
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => {
                        setEditandoObs(false);
                        setObsTexto(impressora.observacoes || "");
                      }}
                      className="px-4 py-2 text-[10px] font-black text-gray-500 uppercase tracking-widest hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                      Descartar
                    </button>
                    <button
                      onClick={lidarSalvarObs}
                      style={{ backgroundColor: "var(--cor-primaria)" }}
                      className="px-6 py-2 text-[10px] font-black text-white uppercase tracking-widest rounded-lg shadow-lg shadow-sky-500/20 hover:brightness-110 active:scale-95 transition-all"
                    >
                      Salvar Definitivo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-[#09090b] rounded-xl p-4 border border-gray-100 dark:border-white/5 shadow-inner min-h-[80px] flex items-start">
                  <div className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap font-medium">
                    {impressora.observacoes || (
                      <span className="text-gray-400 dark:text-zinc-600 italic flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-gray-200 dark:bg-card animate-pulse" />
                        Nenhum registro técnico encontrado para esta unidade.
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </SecaoFormulario>
        </div>
      </div>
    </Dialogo>
  );
}

function InfoCard({ icone: Icone, rotulo, valor }: { icone: React.ElementType; rotulo: string; valor: string }) {
  return (
    <div className="rounded-2xl p-4 bg-gray-50 dark:bg-[#0e0e11] border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
      <div className="absolute -right-2 -bottom-2 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500 pointer-events-none">
        <Icone size={48} />
      </div>
      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500">
          <Icone size={14} strokeWidth={2.5} />
          <span className="text-[9px] font-black uppercase tracking-[0.15em]">{rotulo}</span>
        </div>
        <span className="text-lg font-black text-gray-900 dark:text-white tabular-nums">{valor}</span>
      </div>
    </div>
  );
}
