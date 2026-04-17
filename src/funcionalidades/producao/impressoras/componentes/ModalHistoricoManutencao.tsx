import { useState, useEffect, useMemo } from "react";
import { History, Wrench, Clock, DollarSign, PenTool } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Impressora, RegistroManutencao } from "@/funcionalidades/producao/impressoras/tipos";
import { GradeCampos } from "@/compartilhado/componentes/FormularioLayout";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";

interface ModalHistoricoManutencaoProps {
  aberto: boolean;
  aoFechar: () => void;
  impressora: Impressora | null;
}

export function ModalHistoricoManutencao({ aberto, aoFechar, impressora }: ModalHistoricoManutencaoProps) {
  const [registros, definirRegistros] = useState<RegistroManutencao[]>([]);
  const [busca, definirBusca] = useState("");

  useEffect(() => {
    if (aberto && impressora) {
      definirRegistros(impressora.historicoManutencao || []);
    } else {
      definirRegistros([]);
      definirBusca("");
    }
  }, [aberto, impressora]);

  const registrosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return registros;

    return registros.filter(
      (reg) =>
        reg.descricao.toLowerCase().includes(termo) ||
        reg.responsavel?.toLowerCase().includes(termo) ||
        reg.pecasTrocadas?.toLowerCase().includes(termo),
    );
  }, [registros, busca]);

  if (!impressora) return null;

  const horasUsadas = impressora.horimetroTotalMinutos ? impressora.horimetroTotalMinutos / 60 : 0;
  const intervaloHoras = (impressora.intervaloRevisaoMinutos || 18000) / 60;
  const porcentagemRevisao = Math.min(100, ((horasUsadas % intervaloHoras) / intervaloHoras) * 100);
  const horasRestantes = Math.max(0, intervaloHoras - (horasUsadas % intervaloHoras));

  const totalGastoManutencaoReais = registros.reduce((acc, curr) => acc + (curr.custoCentavos / 100 || 0), 0);

  const corPorTipo = (tipo: string) => {
    switch (tipo) {
      case "Preventiva":
        return "bg-sky-500 text-sky-50";
      case "Corretiva":
        return "bg-red-500 text-red-50";
      case "Melhoria":
        return "bg-emerald-500 text-emerald-50";
      default:
        return "bg-gray-400 text-white";
    }
  };

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Histórico de Manutenções"
      iconeTitulo={History}
      corDestaque="sky"
      termoBusca={busca}
      aoMudarBusca={definirBusca}
      placeholderBusca="BUSCAR POR DESCRIÇÃO, PEÇA OU RESPONSÁVEL..."
      temResultados={registrosFiltrados.length > 0}
      totalResultados={registrosFiltrados.length}
      iconeVazio={PenTool}
      mensagemVazio="Nenhum registro de manutenção encontrado para esta busca."
      infoRodape={`* Próxima revisão estimada em ${horasRestantes.toFixed(0)}h de operação.`}
    >
      <div className="space-y-10">
        {/* Cabeçalho da Impressora & Dashboard */}
        <div className="bg-gray-50/50 dark:bg-white/[0.02] p-8 rounded-3xl border border-gray-100 dark:border-white/5 space-y-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-card border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex-shrink-0 group">
              {impressora.imagemUrl ? (
                <img
                  src={impressora.imagemUrl}
                  alt={impressora.nome}
                  className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <Wrench size={32} className="text-zinc-400 dark:text-zinc-700" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1 gap-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">
                {impressora.nome}
              </h3>
              <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 truncate uppercase tracking-[0.2em]">
                {impressora.marca || impressora.tecnologia} • {impressora.modeloBase}
              </p>
            </div>
          </div>

          <GradeCampos colunas={2}>
            <CardResumo
              titulo="Horímetro Total"
              valor={horasUsadas.toFixed(1)}
              unidade="h"
              icone={Clock}
              cor="amber"
              textoAcao={`${porcentagemRevisao.toFixed(0)}% do ciclo`}
            />

            <CardResumo
              titulo="Custo Total"
              valor={totalGastoManutencaoReais.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
              icone={DollarSign}
              cor="rose"
            />
          </GradeCampos>
        </div>

        {/* Linha do Tempo */}
        <div className="space-y-6 flex flex-col pt-2">
          {registrosFiltrados
            .slice()
            .reverse()
            .map((registro, indice) => (
              <div
                key={registro.id || indice}
                className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-[-24px] before:w-[2px] before:bg-gray-100 dark:before:bg-white/5 last:before:hidden group"
              >
                <div
                  className={`absolute left-0 top-1 w-6 h-6 rounded-full border-4 border-white dark:border-[#18181b] flex items-center justify-center shadow-sm z-10 transition-transform group-hover:scale-125 ${corPorTipo(registro.tipo)}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>

                <div className="bg-white dark:bg-card border border-gray-100 dark:border-white/5 rounded-2xl p-5 shadow-sm transition-all group-hover:border-sky-500/30 dark:group-hover:border-sky-400/20 group-hover:shadow-md">
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="space-y-4 min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <h5 className="text-base font-black text-gray-900 dark:text-white uppercase tracking-tight leading-tight">
                            {registro.descricao}
                          </h5>
                          <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block">
                            {new Date(registro.data).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <span
                          className={`text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest shadow-sm ${
                            registro.tipo === "Corretiva"
                              ? "bg-rose-500 text-white"
                              : registro.tipo === "Preventiva"
                                ? "bg-sky-500 text-white"
                                : "bg-emerald-500 text-white"
                          }`}
                        >
                          {registro.tipo}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-2">
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                            Marcador
                          </span>
                          <span className="text-xs font-bold text-gray-700 dark:text-zinc-300">
                            {registro.horasMaquinaNoMomentoMinutos
                              ? `${(registro.horasMaquinaNoMomentoMinutos / 60).toFixed(1)}h`
                              : "—"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                            Responsável
                          </span>
                          <span className="text-xs font-bold text-gray-700 dark:text-zinc-300 truncate">
                            {registro.responsavel || "—"}
                          </span>
                        </div>
                        <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
                          <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
                            Investimento
                          </span>
                          <span className="text-xs font-black text-gray-900 dark:text-white">
                            {((registro.custoCentavos || 0) / 100).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })}
                          </span>
                        </div>
                      </div>

                      {registro.pecasTrocadas && (
                        <div className="mt-4 p-3 bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-white/5 flex items-start gap-3">
                          <PenTool size={14} className="text-gray-400 dark:text-zinc-600 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-[0.2em] block mb-1">
                              Itens Trocados/Reparados
                            </span>
                            <p className="text-xs font-medium text-gray-600 dark:text-zinc-400 leading-relaxed italic">
                              "{registro.pecasTrocadas}"
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </ModalListagemPremium>
  );
}
