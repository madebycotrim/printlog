import {
  Activity,
  Box,
  CreditCard,
  Package,
  Printer,
  Zap,
  TrendingUp,
  Clock,
  LayoutDashboard,
  Wrench,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { Crown, Sparkles } from "lucide-react";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemImpressoras } from "@/funcionalidades/producao/impressoras/estado/armazemImpressoras";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { ALERTA_ESTOQUE_FILAMENTO_GRAMAS } from "@/compartilhado/constantes/constantesNegocio";

// Componentes Separados
import { AtalhoItem } from "./componentes/AtalhoItem";
import { GraficoConsumo } from "./componentes/GraficoConsumo";
import { StatusTempoReal } from "./componentes/StatusTempoReal";
import { AgendaManutencao } from "./componentes/AgendaManutencao";
import { RelatorioInventario } from "./componentes/RelatorioInventario";
import { RelatorioPerformanceOperacional } from "./componentes/RelatorioPerformanceOperacional";
import { CardResumo } from "@/compartilhado/componentes/CardResumo";
import { StatusPedido } from "@/compartilhado/tipos/modelos";

export function PaginaInicial() {
  const { usuario } = usarAutenticacao();
  const { pedidos } = usarPedidos();
  const navegar = useNavigate();

  // 🏪 ACESSO AO ESTADO
  const materiais = usarArmazemMateriais((s) => s.materiais);
  const impressoras = usarArmazemImpressoras((s) => s.impressoras);
  const insumos = usarArmazemInsumos((s) => s.insumos);

  // 🧮 CÁLCULOS DE KPI
  const totaisPecas = insumos.reduce((acc, i) => acc + i.quantidadeAtual, 0);
  const maquinasAtivas = impressoras.filter((i) => !i.dataAposentadoria).length;
  const alertaMateriais = materiais.filter((m) => m.pesoRestanteGramas < ALERTA_ESTOQUE_FILAMENTO_GRAMAS).length;
  const pedidosAtivos = pedidos.filter(
    (p) => p.status !== StatusPedido.CONCLUIDO && p.status !== StatusPedido.ARQUIVADO,
  ).length;

  // 👑 LÓGICA DE UPGRADE PRO GRATUITO
  const plano = usarArmazemConfiguracoes((s) => s.plano);
  const definirPlano = usarArmazemConfiguracoes((s) => s.definirPlano);
  const salvarConfiguracoes = usarArmazemConfiguracoes((s) => s.salvarNoD1);
  const [carregandoUpgrade, definirCarregandoUpgrade] = useState(false);

  const realizarUpgradeGratis = async () => {
    if (!usuario?.uid) return;
    definirCarregandoUpgrade(true);
    try {
      definirPlano("PRO");
      await salvarConfiguracoes(usuario.uid);
      toast.success("Parabéns! Agora você é um MAKER FUNDADOR PRO ✨");
    } catch (erro) {
      toast.error("Não foi possível ativar seu plano PRO agora.");
    } finally {
      definirCarregandoUpgrade(false);
    }
  };

  usarDefinirCabecalho({
    titulo: `Olá, ${usuario?.nome?.split(" ")[0] || "Maker"}! 👋`,
    subtitulo: "Seu centro de comando PrintLog está pronto para operar.",
    placeholderBusca: "PESQUISAR EM TODA A PLATAFORMA...",
  });

  const conteinerAnimacao = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="space-y-12 pb-10">
      {/* 👑 BANNER DE OFERTA PRO (Apenas para FREE) */}
      {plano === "FREE" && (
        <motion.div
           initial={{ opacity: 0, y: -20 }}
           animate={{ opacity: 1, y: 0 }}
           className="relative p-8 rounded-[2rem] bg-gradient-to-br from-sky-600 via-blue-600 to-indigo-700 overflow-hidden shadow-2xl shadow-sky-500/20 group"
        >
          {/* Elementos Decorativos */}
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Crown size={180} strokeWidth={1} />
          </div>
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 blur-[60px] rounded-full" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-4 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-white/20">
                  Oferta de Lançamento
                </span>
                <Sparkles size={14} className="text-sky-200 animate-pulse" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase leading-tight">
                Seja um Maker Fundador <br />
                <span className="text-sky-200">100% Grátis para Sempre.</span>
              </h3>
              <p className="text-sky-50/70 text-sm font-medium max-w-xl">
                Libere a Inteligência Artificial, Branding de Estúdio e suporte prioritário. 
                Sem cartões, sem pegadinhas. Uma vaga de fundador é sua!
              </p>
            </div>

            <button
               onClick={realizarUpgradeGratis}
               disabled={carregandoUpgrade}
               className="px-10 py-5 bg-white text-zinc-950 font-black uppercase text-xs tracking-[0.2em] rounded-2xl shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-3 shrink-0"
            >
              {carregandoUpgrade ? "Ativando..." : "Garantir minha vaga PRO"}
              <Crown size={16} className="text-sky-500" />
            </button>
          </div>
        </motion.div>
      )}

      {/* 🚀 ATALHOS RÁPIDOS E AÇÕES PRIORITÁRIAS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Zap size={18} className="text-amber-500 fill-amber-500" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
            Acesso Prioritário
          </h2>
        </div>

        <motion.div
          variants={conteinerAnimacao}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AtalhoItem
            titulo="Inciar Produção"
            subtitulo="Novos fatiamentos"
            icone={Zap}
            cor="bg-amber-500"
            link="/projetos"
          />
          <AtalhoItem
            titulo="Repor Filamentos"
            subtitulo="Entrada de estoque"
            icone={Package}
            cor="bg-emerald-500"
            link="/materiais"
          />
          <AtalhoItem
            titulo="Check-up Técnico"
            subtitulo="Gestão de máquinas"
            icone={Activity}
            cor="bg-sky-500"
            link="/impressoras"
          />
          <AtalhoItem
            titulo="Gestão Financeira"
            subtitulo="Relatórios de DRE"
            icone={CreditCard}
            cor="bg-indigo-500"
            link="/financeiro"
          />
        </motion.div>
      </section>

      {/* 📊 INDICADORES DE DESEMPENHO (KPIs) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <TrendingUp size={18} className="text-indigo-500" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
            Performance & Métricas
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <CardResumo 
            titulo="Produção Ativa" 
            valor={pedidosAtivos} 
            unidade="pedidos" 
            icone={Clock} 
            cor="sky" 
            aoClicar={() => navegar("/projetos")}
            textoAcao="Ver Fila"
          />
          <CardResumo
            titulo="Capacidade Operacional"
            valor={maquinasAtivas}
            unidade="máquinas"
            icone={Printer}
            cor="emerald"
            aoClicar={() => navegar("/impressoras")}
            textoAcao="Gerenciar"
          />
          <CardResumo
            titulo="Filamentos em Alerta"
            valor={alertaMateriais}
            unidade="crítico"
            icone={Box}
            cor="rose"
            aoClicar={() => navegar("/materiais")}
            textoAcao="Verificar"
          />
          <CardResumo 
            titulo="Total de Insumos" 
            valor={totaisPecas} 
            unidade="unidades" 
            icone={Package} 
            cor="indigo" 
            aoClicar={() => navegar("/materiais")}
            textoAcao="Estoque"
          />
        </div>
      </section>



      {/* 📈 VISTA OPERACIONAL (GRÁFICOS E STATUS) */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutDashboard size={18} className="text-gray-400" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
            Vista Operacional
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 min-h-[400px]">
            <GraficoConsumo />
          </div>
          <div>
            <StatusTempoReal />
          </div>
        </div>
      </section>

      {/* 🛠️ MANUTENÇÃO E OPERAÇÕES CRÍTICAS */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <Wrench size={18} className="text-rose-500" />
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-400 dark:text-zinc-500">
            Saúde & Manutenção do Parque
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <AgendaManutencao impressoras={impressoras} />
          </div>

          <RelatorioPerformanceOperacional impressoras={impressoras} pedidos={pedidos} />

          <div className="lg:col-span-1">
            <RelatorioInventario materiais={materiais} insumos={insumos} />
          </div>
        </div>
      </section>
    </div>
  );
}
