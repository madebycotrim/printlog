import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  AlertTriangle, 
  ShoppingCart, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { Material } from "../tipos";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

interface Props {
  materiais: Material[];
  pedidos: Pedido[];
  aoRepor: (material: Material) => void;
}

interface ItemAnalisePreditiva {
  material: Material;
  estoqueTotalGramas: number;
  demandaFilaGramas: number;
  pedidosNaFilaCount: number;
  saldoProjetadoGramas: number;
  consumoMedioDiarioGramas: number;
  diasRestantes: number;
  statusRisco: "critico" | "alerta" | "saudavel";
  carreteisSugeridos: number;
  mensagem: string;
}

export function CardPrevisaoEstoqueIA({ materiais, pedidos, aoRepor }: Props) {
  const [expandido, setExpandido] = useState(false);

  // Pedidos ativos em fila
  const pedidosPendentes = useMemo(() => {
    return pedidos.filter(p => 
      p.status === StatusPedido.A_FAZER || 
      p.status === StatusPedido.EM_PRODUCAO || 
      p.status === StatusPedido.ACABAMENTO || 
      p.status === StatusPedido.ATRASADO
    );
  }, [pedidos]);

  // Cálculo da Análise Preditiva
  const analises: ItemAnalisePreditiva[] = useMemo(() => {
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);

    return materiais.map(material => {
      const estoqueTotal = material.pesoRestanteGramas + (material.estoque * material.pesoGramas);

      // 1. Demanda dos pedidos pendentes para este material
      let demandaFila = 0;
      let pedidosCount = 0;

      pedidosPendentes.forEach(pedido => {
        let usouNestePedido = 0;
        if (pedido.materiais && pedido.materiais.length > 0) {
          pedido.materiais.forEach(pm => {
            if (pm.idMaterial === material.id) {
              usouNestePedido += pm.quantidadeGasta || 0;
            }
          });
        } else if (pedido.material && pedido.pesoGramas) {
          const nomeMat = material.nome.toLowerCase();
          const nomePed = pedido.material.toLowerCase();
          if (nomeMat.includes(nomePed) || nomePed.includes(nomeMat)) {
            usouNestePedido += pedido.pesoGramas;
          }
        }

        if (usouNestePedido > 0) {
          demandaFila += usouNestePedido;
          pedidosCount++;
        }
      });

      // 2. Histórico de consumo dos últimos 30 dias
      const historico = Array.isArray(material.historicoUso) ? material.historicoUso : [];
      const consumoRecente = historico.reduce((acc, h) => {
        const timestamp = Number(h.id);
        const dataH = isNaN(timestamp) ? new Date() : new Date(timestamp);
        if (dataH >= trintaDiasAtras) {
          return acc + (h.quantidadeGastaGramas || 0);
        }
        return acc;
      }, 0);

      const consumoDiario = consumoRecente > 0 ? (consumoRecente / 30) : 0;
      const saldoProjetado = estoqueTotal - demandaFila;

      let statusRisco: "critico" | "alerta" | "saudavel" = "saudavel";
      let diasRestantes = Infinity;
      let carreteisSugeridos = 1;
      let mensagem = "Estoque saudável e dimensionado para a produção atual.";

      if (saldoProjetado < 0) {
        statusRisco = "critico";
        diasRestantes = 0;
        const deficit = Math.abs(saldoProjetado);
        carreteisSugeridos = Math.max(1, Math.ceil(deficit / material.pesoGramas));
        mensagem = `Déficit iminente! Faltam ${deficit}g para atender ${pedidosCount} pedido(s) em fila.`;
      } else {
        if (consumoDiario > 0) {
          diasRestantes = Math.floor(saldoProjetado / consumoDiario);
          if (diasRestantes <= 7) {
            statusRisco = "alerta";
            mensagem = `Estoque projetado para esgotar em ~${diasRestantes} dia(s) no ritmo atual.`;
            carreteisSugeridos = Math.max(1, Math.ceil((consumoDiario * 30) / material.pesoGramas));
          } else {
            mensagem = `Autonomia estimada de ~${diasRestantes} dias após atender os pedidos atuais.`;
          }
        } else if (demandaFila > 0 && saldoProjetado < 200) {
          statusRisco = "alerta";
          mensagem = `Restarão apenas ${saldoProjetado}g após os pedidos da fila serem concluídos.`;
        }
      }

      return {
        material,
        estoqueTotalGramas: estoqueTotal,
        demandaFilaGramas: demandaFila,
        pedidosNaFilaCount: pedidosCount,
        saldoProjetadoGramas: saldoProjetado,
        consumoMedioDiarioGramas: Math.round(consumoDiario * 10) / 10,
        diasRestantes,
        statusRisco,
        carreteisSugeridos,
        mensagem
      };
    }).sort((a, b) => {
      const prioridade = { critico: 0, alerta: 1, saudavel: 2 };
      return prioridade[a.statusRisco] - prioridade[b.statusRisco];
    });
  }, [materiais, pedidosPendentes]);

  const criticos = analises.filter(a => a.statusRisco === "critico");
  const alertas = analises.filter(a => a.statusRisco === "alerta");
  const temAtencao = criticos.length > 0 || alertas.length > 0;

  if (materiais.length === 0) return null;

  return (
    <div className={`rounded-2xl border transition-all relative overflow-hidden ${
      criticos.length > 0
        ? "bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border-rose-500/30 shadow-lg shadow-rose-500/5"
        : alertas.length > 0
        ? "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-amber-500/30 shadow-lg shadow-amber-500/5"
        : "bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border-indigo-500/20"
    }`}>
      <div className="p-5 flex flex-col gap-4">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-3.5">
            <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 ${
              criticos.length > 0
                ? "bg-rose-500/20 text-rose-600 dark:text-rose-400"
                : alertas.length > 0
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
            }`}>
              {criticos.length > 0 ? (
                <AlertTriangle size={22} className="animate-bounce" />
              ) : (
                <Sparkles size={22} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-zinc-800 dark:text-zinc-100">
                  Gestão Preditiva de Estoque & Compras IA
                </h3>
                <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider ${
                  criticos.length > 0
                    ? "bg-rose-500 text-white"
                    : alertas.length > 0
                    ? "bg-amber-500 text-white"
                    : "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                }`}>
                  {criticos.length > 0 
                    ? `${criticos.length} Ruptura(s) Iminente(s)` 
                    : alertas.length > 0 
                    ? `${alertas.length} Material(is) em Alerta` 
                    : "Estoque Otimizado"}
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                {criticos.length > 0 ? (
                  <>
                    Atenção: Você tem pedidos na fila que <strong>ultrapassam o estoque disponível</strong> de{" "}
                    <strong className="text-rose-600 dark:text-rose-400">{criticos.map(c => c.material.nome).join(", ")}</strong>.
                    Antecipe a reposição para não paralisar as máquinas.
                  </>
                ) : alertas.length > 0 ? (
                  <>
                    Com base no consumo médio dos últimos 30 dias e na fila ativa, alguns materiais atingirão nível crítico em breve.
                  </>
                ) : (
                  <>
                    Todos os materiais possuem estoque suficiente para atender a fila de pedidos atual e a taxa de consumo projetada.
                  </>
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpandido(!expandido)}
            className="self-start md:self-center px-3 py-1.5 rounded-xl bg-white/60 dark:bg-zinc-800/60 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 text-[10px] font-black uppercase tracking-wider border border-borda-sutil flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shrink-0"
          >
            <span>{expandido ? "Ocultar Detalhes" : "Ver Detalhes & Sugestões"}</span>
            {expandido ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
          </button>
        </div>

        {/* Lista Expandida de Materiais com Risco e Sugestões */}
        <AnimatePresence>
          {(expandido || temAtencao) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-2 border-t border-zinc-200/60 dark:border-white/5"
            >
              {analises.slice(0, expandido ? analises.length : 3).map((item) => (
                <div
                  key={item.material.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                    item.statusRisco === "critico"
                      ? "bg-rose-500/10 dark:bg-rose-500/15 border-rose-500/40"
                      : item.statusRisco === "alerta"
                      ? "bg-amber-500/10 dark:bg-amber-500/15 border-amber-500/40"
                      : "bg-white/70 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span 
                          className="w-3 h-3 rounded-full border shrink-0"
                          style={{ backgroundColor: (item.material as any).corHex || "#6366f1" }}
                        />
                        <span className="text-xs font-black text-zinc-800 dark:text-zinc-100 truncate">
                          {item.material.nome}
                        </span>
                      </div>

                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full shrink-0 ${
                        item.statusRisco === "critico"
                          ? "bg-rose-500 text-white"
                          : item.statusRisco === "alerta"
                          ? "bg-amber-500 text-white"
                          : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      }`}>
                        {item.statusRisco === "critico" ? "Ruptura" : item.statusRisco === "alerta" ? "Alerta" : "OK"}
                      </span>
                    </div>

                    {/* Métricas rápidas */}
                    <div className="grid grid-cols-2 gap-2 mt-2.5 pt-2 border-t border-zinc-200/60 dark:border-white/5 text-[9.5px]">
                      <div>
                        <span className="text-zinc-400 block uppercase font-bold text-[8px]">Disponível</span>
                        <span className="font-black text-zinc-700 dark:text-zinc-300">
                          {item.estoqueTotalGramas}g
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-400 block uppercase font-bold text-[8px]">Fila Ativa</span>
                        <span className={`font-black ${item.demandaFilaGramas > item.estoqueTotalGramas ? "text-rose-500" : "text-zinc-700 dark:text-zinc-300"}`}>
                          {item.demandaFilaGramas > 0 ? `${item.demandaFilaGramas}g (${item.pedidosNaFilaCount} ped)` : "0g"}
                        </span>
                      </div>
                    </div>

                    <p className="text-[9px] text-zinc-500 dark:text-zinc-400 mt-2 leading-tight font-medium">
                      {item.mensagem}
                    </p>
                  </div>

                  {/* Ação de Reposição Inteligente */}
                  <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5 flex items-center justify-between">
                    <span className="text-[8.5px] font-bold text-zinc-400">
                      Sugestão: <strong className="text-zinc-700 dark:text-zinc-200">+{item.carreteisSugeridos} un</strong>
                    </span>

                    <button
                      type="button"
                      onClick={() => aoRepor(item.material)}
                      className="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-600 active:scale-95 text-white text-[9px] font-black uppercase tracking-wider flex items-center gap-1 transition-all cursor-pointer shadow-sm shadow-sky-500/20"
                    >
                      <ShoppingCart size={11} />
                      <span>Repor</span>
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
