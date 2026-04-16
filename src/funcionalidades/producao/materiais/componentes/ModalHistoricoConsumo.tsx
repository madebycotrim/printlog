import { useState, useEffect, useMemo } from "react";
import { History, Package, Clock, Box, DollarSign } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { Material, RegistroUso } from "@/funcionalidades/producao/materiais/tipos";

interface ModalHistoricoConsumoProps {
  aberto: boolean;
  aoFechar: () => void;
  material: Material | null;
}

export function ModalHistoricoConsumo({ aberto, aoFechar, material }: ModalHistoricoConsumoProps) {
  const [registros, definirRegistros] = useState<RegistroUso[]>([]);
  const [busca, definirBusca] = useState("");

  useEffect(() => {
    if (aberto && material) {
      definirRegistros(material.historicoUso || []);
    } else {
      definirRegistros([]);
      definirBusca("");
    }
  }, [aberto, material]);

  const registrosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();
    if (!termo) return registros;
    return registros.filter((reg) => reg.nomePeca.toLowerCase().includes(termo));
  }, [registros, busca]);

  if (!material) return null;

  const unidade = material.tipo === "SLA" ? "ml" : "g";
  const custoPorUnidade = material.precoCentavos / 100 / (material.pesoGramas || 1);
  const totalGastoHistorico = registros.reduce((acc, curr) => acc + curr.quantidadeGastaGramas, 0);
  const custoTotalHistorico = totalGastoHistorico * custoPorUnidade;

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Histórico de Consumo"
      iconeTitulo={History}
      corDestaque="indigo"
      termoBusca={busca}
      aoMudarBusca={definirBusca}
      placeholderBusca="BUSCAR PELO NOME DA PEÇA..."
      temResultados={registrosFiltrados.length > 0}
      totalResultados={registrosFiltrados.length}
      iconeVazio={Box}
      mensagemVazio="Nenhum registro de uso encontrado para os filtros aplicados."
      infoRodape="* Registros sincronizados automaticamente com o histórico de fatiamento."
    >
      <div className="space-y-10">
        {/* ═══════ CABEÇALHO DO MATERIAL ═══════ */}
        <div className="p-8 rounded-3xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] dark:opacity-[0.07] pointer-events-none">
            <Package size={120} strokeWidth={1} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-6 relative z-10">
            <div
              className="w-16 h-16 rounded-2xl border border-black/10 dark:border-white/10 flex-shrink-0 shadow-xl shadow-black/5 flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: material.cor }}
            >
              <div className="w-full h-full bg-gradient-to-br from-white/20 to-transparent" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate tracking-tight uppercase mb-1">
                {material.nome}
              </h3>
              <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 truncate tracking-wide uppercase">
                {material.fabricante} • {material.tipoMaterial}
              </p>
            </div>
            <div className="text-right flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-1">
                Custo Calculado
              </span>
              <div className="bg-white dark:bg-black/40 px-3 py-1 rounded-lg border border-gray-200 dark:border-white/10 shadow-sm">
                <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                  R$ {custoPorUnidade.toFixed(3).replace(".", ",")}
                  <small className="text-[10px] text-gray-400 dark:text-zinc-600 ml-1">/{unidade.toUpperCase()}</small>
                </span>
              </div>
            </div>
          </div>

          {/* ═══ DASHBOARD DE MÉTRICAS ═══ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 relative z-10">
            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-gray-300 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Package size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-0.5">
                  Consumo Registrado
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  {totalGastoHistorico}
                  <small className="text-xs text-gray-400 dark:text-zinc-600 font-bold uppercase ml-1">
                    {unidade.toUpperCase()}
                  </small>
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-black/40 border border-gray-200 dark:border-white/5 p-5 rounded-2xl flex items-center gap-4 shadow-sm group hover:border-gray-300 dark:hover:border-white/20 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <DollarSign size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.2em] block mb-0.5">
                  Custo Atribuído
                </span>
                <span className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  R$ {custoTotalHistorico.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ═══════ LISTA DE REGISTROS (TIMELINE) ═══════ */}
        <div className="space-y-8">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[11px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-[0.3em] flex items-center gap-3">
              <History size={14} strokeWidth={3} />
              LINHA DO TEMPO DE CONSUMO
            </h4>
          </div>

          <div className="space-y-6">
            {registrosFiltrados.map((registro) => {
              const custoDaPeca = registro.quantidadeGastaGramas * custoPorUnidade;
              return (
                <div key={registro.id} className="relative pl-10 group">
                  {/* Conector Visual */}
                  <div className="absolute left-[11px] top-8 bottom-0 w-[2px] bg-gray-100 dark:bg-white/5 group-last:hidden" />

                  {/* Marcador de Status */}
                  <div
                    className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white dark:border-[#18181b] flex items-center justify-center transition-all duration-300 z-10
                                            shadow-[0_0_15px_rgba(0,0,0,0.1)] group-hover:scale-110
                                            ${
                                              registro.status === "SUCESSO"
                                                ? "bg-emerald-500 shadow-emerald-500/20"
                                                : registro.status === "FALHA"
                                                  ? "bg-rose-500 shadow-rose-500/20"
                                                  : "bg-gray-400 shadow-gray-400/20"
                                            }`}
                  >
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>

                  <div className="bg-white dark:bg-black/20 border border-gray-200 dark:border-white/5 rounded-2xl p-6 transition-all group-hover:bg-gray-50 dark:group-hover:bg-white/5 group-hover:-translate-y-1 shadow-sm hover:shadow-md">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="space-y-3 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h5 className="text-sm font-black text-gray-900 dark:text-white tracking-tight uppercase">
                            {registro.nomePeca}
                          </h5>
                          {registro.status === "FALHA" && (
                            <span className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400">
                              Falhou
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-gray-400 dark:text-zinc-500">
                          <div className="flex items-center gap-1.5">
                            <History size={12} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">{registro.data}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Box size={12} strokeWidth={2.5} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                              {registro.quantidadeGastaGramas}
                              {unidade}
                            </span>
                          </div>
                          {registro.tempoImpressaoMinutos && (
                            <div className="flex items-center gap-1.5">
                              <Clock size={12} strokeWidth={2.5} />
                              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-900 dark:text-white">
                                {registro.tempoImpressaoMinutos} MIN
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex flex-col items-end">
                        <div className="bg-gray-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-gray-200 dark:border-white/5">
                          <span className="text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest block mb-0.5">
                            CUSTO MATERIAL
                          </span>
                          <span className="text-sm font-black text-gray-900 dark:text-white tracking-tight">
                            R$ {custoDaPeca.toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ModalListagemPremium>
  );
}
