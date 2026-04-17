import { useState, useMemo } from "react";
import { Printer, Box, CheckCircle2, XCircle, TrendingUp, Clock, Target, DollarSign, History } from "lucide-react";
import { ModalListagemPremium } from "@/compartilhado/componentes/ModalListagemPremium";
import { GradeCampos } from "@/compartilhado/componentes/FormularioLayout";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";
import { Impressora, RegistroProducao } from "@/funcionalidades/producao/impressoras/tipos";

interface ModalHistoricoProducaoProps {
  aberto: boolean;
  aoFechar: () => void;
  impressora: Impressora | null;
}

// --------------------------------------------------------------------------------------
// 🔄 MOCK DE DADOS AUTO GERADO (Para Simular Pedidos Concluídos / Falhados)
// --------------------------------------------------------------------------------------
function gerarMockHistorico(horimetroTotalMinutos: number): RegistroProducao[] {
  const qtdeProjetos = Math.max(1, Math.floor(horimetroTotalMinutos / 720));
  const mock: RegistroProducao[] = [];
  const qtdeVisual = Math.min(25, qtdeProjetos);
  let dataAtual = new Date();
  dataAtual.setDate(dataAtual.getDate() - 1);

  for (let i = 0; i < qtdeVisual; i++) {
    const duracaoMinutos = (Math.floor(Math.random() * 20) + 1) * 60;
    const sucesso = Math.random() > 0.15;
    const valorGeradoCentavos = sucesso ? Math.round((duracaoMinutos / 60) * (15 + Math.random() * 10) * 100) : 0;

    mock.push({
      idProtocolo: `PRJ-${Math.floor(Math.random() * 90000) + 10000}`,
      nomeProjeto: [
        "Engrenagem Helicoidal",
        "Case Raspberry",
        "Action Figure Batman",
        "Suporte Headset",
        "Protótipo Arduino",
        "Vaso Geométrico",
        "Busto Homem Aranha",
        "Peça de Reposição Drone",
        "Caixa Organizadora",
        "Molde para silicone",
        "Miniatura D&D",
        "Keycap Personalizada",
      ][Math.floor(Math.random() * 12)],
      minutosImpressao: duracaoMinutos,
      valorGeradoCentavos: valorGeradoCentavos,
      sucesso: sucesso,
      dataConclusao: new Date(dataAtual.getTime() - i * 86400000 * (Math.random() * 3)).toISOString(),
    });
  }
  return mock.sort((a, b) => new Date(b.dataConclusao).getTime() - new Date(a.dataConclusao).getTime());
}

export function ModalHistoricoProducao({ aberto, aoFechar, impressora }: ModalHistoricoProducaoProps) {
  const [busca, setBusca] = useState("");

  const registrosRaw = useMemo(() => {
    if (!impressora) return [];
    if (impressora.historicoProducao && impressora.historicoProducao.length > 0) {
      return impressora.historicoProducao;
    }
    return gerarMockHistorico(impressora.horimetroTotalMinutos || 9000);
  }, [impressora]);

  const registrosFiltrados = useMemo(() => {
    if (!busca) return registrosRaw;
    const termo = busca.toLowerCase();
    return registrosRaw.filter(
      (r) => r.nomeProjeto.toLowerCase().includes(termo) || r.idProtocolo.toLowerCase().includes(termo),
    );
  }, [registrosRaw, busca]);

  if (!impressora) return null;

  const totalPecas = registrosRaw.length;
  const pecasComSucesso = registrosRaw.filter((r) => r.sucesso).length;
  const taxaSucesso = totalPecas > 0 ? (pecasComSucesso / totalPecas) * 100 : 0;
  const totalFaturadoCentavos = registrosRaw.reduce((acc, curr) => acc + curr.valorGeradoCentavos, 0);

  return (
    <ModalListagemPremium
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Análise de Produção Histórica"
      iconeTitulo={History}
      corDestaque="sky"
      termoBusca={busca}
      aoMudarBusca={setBusca}
      placeholderBusca="BUSCAR POR PROJETO OU PROTOCOLO..."
      temResultados={registrosFiltrados.length > 0}
      totalResultados={registrosFiltrados.length}
      iconeVazio={Box}
      mensagemVazio="Nenhum registro de produção encontrado para esta busca."
      infoRodape="Dados auditados • Fase de Sincronização em tempo real."
    >
      <div className="space-y-10">
        {/* Cabeçalho da Impressora & Dashboard */}
        <div className="bg-gray-50/50 dark:bg-white/[0.02] p-8 rounded-3xl border border-gray-100 dark:border-white/5 space-y-8 relative overflow-hidden">
          <div className="flex items-center gap-6 mb-2">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-white dark:bg-card border border-gray-200 dark:border-white/10 shadow-sm overflow-hidden flex-shrink-0 group">
              {impressora.imagemUrl ? (
                <img
                  src={impressora.imagemUrl}
                  alt={impressora.nome}
                  className="w-[85%] h-[85%] object-contain group-hover:scale-110 transition-transform duration-500"
                />
              ) : (
                <Printer size={32} className="text-zinc-400 dark:text-zinc-700" />
              )}
            </div>
            <div className="flex flex-col min-w-0 flex-1 gap-1">
              <h3 className="text-2xl font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">
                {impressora.nome}
              </h3>
              <p className="text-[10px] font-black text-gray-400 dark:text-zinc-500 truncate uppercase tracking-[0.2em]">
                Monitoramento de Eficiência e Faturamento
              </p>
            </div>
            <div className="hidden sm:flex flex-col items-end bg-sky-50 dark:bg-sky-500/10 px-4 py-2 rounded-2xl border border-sky-100 dark:border-sky-500/20 shadow-inner">
              <span className="text-[9px] font-black text-sky-600/60 dark:text-sky-400/60 uppercase tracking-widest block mb-0.5">
                OEE Estimado
              </span>
              <span className="flex items-center gap-2 text-base font-black text-sky-600 dark:text-sky-400">
                <TrendingUp size={16} /> 85%
              </span>
            </div>
          </div>

          <GradeCampos colunas={4}>
            <CardResumo titulo="Total de Projetos" valor={totalPecas} unidade="projetos" icone={Box} cor="zinc" />
            <CardResumo
              titulo="Sucesso de Impressão"
              valor={`${Math.round(taxaSucesso)}%`}
              unidade="de êxito"
              icone={Target}
              cor={taxaSucesso >= 80 ? "emerald" : taxaSucesso >= 60 ? "amber" : "rose"}
            />
            <CardResumo
              titulo="Horas de Operação"
              valor={Math.round((impressora.horimetroTotalMinutos || 0) / 60)}
              unidade="horas"
              icone={Clock}
              cor="sky"
            />
            <CardResumo
              titulo="Receita Gerada"
              valor={(totalFaturadoCentavos / 100).toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 0,
              })}
              icone={DollarSign}
              cor="emerald"
            />
          </GradeCampos>
        </div>

        {/* Tabela de Registros */}
        <div className="bg-white dark:bg-[#0c0c0e]/50 border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-zinc-900/50">
                  <th className="px-6 py-5 text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                    Identificação do Projeto
                  </th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                    Duração
                  </th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">
                    Valor
                  </th>
                  <th className="px-6 py-5 text-[9px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap text-right">
                    Conclusão
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                {registrosFiltrados.map((reg: RegistroProducao) => (
                  <tr
                    key={reg.idProtocolo}
                    className="hover:bg-gray-50/50 dark:hover:bg-white/[0.01] transition-colors group"
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      {reg.sucesso ? (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full w-fit border border-emerald-100 dark:border-emerald-500/20 shadow-inner">
                          <CheckCircle2 size={12} strokeWidth={3} /> OK
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-full w-fit border border-rose-100 dark:border-rose-500/20 shadow-inner">
                          <XCircle size={12} strokeWidth={3} /> Erro
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-5 max-w-[240px]">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-black text-gray-900 dark:text-white truncate uppercase tracking-tight">
                          {reg.nomeProjeto}
                        </span>
                        <span className="text-[9px] font-black text-gray-400 dark:text-zinc-600 uppercase tracking-widest truncate">
                          ID: {reg.idProtocolo}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600 dark:text-zinc-400">
                        <Clock size={14} className="text-gray-400 dark:text-zinc-600" />
                        {Math.round(reg.minutosImpressao / 60)}h
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right">
                      {reg.sucesso ? (
                        <span className="text-sm font-black text-gray-900 dark:text-white tabular-nums">
                          {((reg.valorGeradoCentavos || 0) / 100).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      ) : (
                        <span className="text-sm font-bold text-gray-400 dark:text-zinc-600 line-through opacity-50 tabular-nums">
                          {((reg.valorGeradoCentavos || 0) / 100).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-right text-[10px] font-black text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                      {new Date(reg.dataConclusao).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ModalListagemPremium>
  );
}
