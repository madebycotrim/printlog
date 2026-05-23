import { 
  Clock, 
  Percent, 
  Activity, 
  DollarSign,
  Package,
  TrendingUp,
  Users,
  Timer,
  Weight,
  Target,
  BarChart3,
  CreditCard
} from "lucide-react";
import { motion } from "framer-motion";
import { Pedido } from "@/funcionalidades/producao/projetos/tipos";
import { Impressora } from "@/funcionalidades/producao/impressoras/tipos";
import { StatusPedido } from "@/compartilhado/tipos/modelos";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";
import { useNavigate } from "react-router-dom";

interface PropriedadesMetricasPainel {
  pedidos: Pedido[];
  impressoras: Impressora[];
  pedidosAtivos: number;
  metricasInventario: {
    itensEmAlerta: number;
    valorTotalEstoqueCentavos: number;
  };
}

export function MetricasPainel({ pedidos, impressoras, pedidosAtivos, metricasInventario }: PropriedadesMetricasPainel) {
  const navegar = useNavigate();
  const pedidosConcluidos = pedidos.filter(p => p.status === StatusPedido.CONCLUIDO);
  const totalFaturadoCentavos = pedidosConcluidos.reduce((acc, p) => acc + (p.valorCentavos || 0), 0);
  
  // 💰 FINANCEIRO AVANÇADO
  const lucroTotalCentavos = pedidosConcluidos.reduce((acc, p) => {
    const lucroReal = p.configuracoes?.lucroLiquidoCentavos;
    return acc + (lucroReal !== undefined ? lucroReal : ((p.valorCentavos || 0) * 0.6));
  }, 0);

  const ticketMedioCentavos = pedidosConcluidos.length > 0 ? totalFaturadoCentavos / pedidosConcluidos.length : 0;
  const potencialVendaCentavos = pedidos
    .filter(p => p.status !== StatusPedido.CONCLUIDO && p.status !== StatusPedido.ARQUIVADO)
    .reduce((acc, p) => acc + (p.valorCentavos || 0), 0);

  // ⚙️ OPERACIONAL AVANÇADO
  const totalTentativas = impressoras.reduce((acc, imp) => acc + (imp.historicoProducao?.length || 0), 0);
  const totalSucessos = impressoras.reduce((acc, imp) => acc + (imp.historicoProducao?.filter(h => h.sucesso).length || 0), 0);
  const taxaSucesso = totalTentativas > 0 ? (totalSucessos / totalTentativas) * 100 : (pedidosConcluidos.length / (pedidos.length || 1)) * 100;

  const totalMinutosImpressao = pedidos.reduce((acc, p) => acc + (p.tempoMinutos || 0), 0);
  const horasTotais = Math.floor(totalMinutosImpressao / 60);

  const consumoTotalGramas = pedidos.reduce((acc, p) => acc + (p.pesoGramas || 0), 0);
  const consumoTotalKg = (consumoTotalGramas / 1000).toFixed(1);

  // 👥 CRM E CRESCIMENTO
  const clientesUnicos = new Set(pedidos.map(p => p.nomeCliente).filter(Boolean)).size;
  
  // ROI Estimado (Custo médio de máquina vs Lucro)
  const custoEstimadoMaquinas = impressoras.length * 150000; // 1500 reais per machine base
  const roiEstimado = custoEstimadoMaquinas > 0 ? (lucroTotalCentavos / custoEstimadoMaquinas) * 100 : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {/* LINHA 1: OPERACIONAL E IMEDIATO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <CardMetrica variants={item} titulo="Produção Ativa" valor={pedidosAtivos} icone={Clock} cor="sky" aoClicar={() => navegar("/producao")} />
        <CardMetrica variants={item} titulo="Taxa Sucesso" valor={`${taxaSucesso.toFixed(0)}%`} icone={Percent} cor="emerald" aoClicar={() => navegar("/impressoras")} />
        <CardMetrica variants={item} titulo="Alertas Estoque" valor={metricasInventario.itensEmAlerta} icone={Package} cor="rose" aoClicar={() => navegar("/insumos")} />
        <CardMetrica variants={item} titulo="Patrimônio" valor={centavosParaReais(metricasInventario.valorTotalEstoqueCentavos)} icone={Activity} cor="amber" aoClicar={() => navegar("/materiais")} />
        <CardMetrica variants={item} titulo="Total Produzido" valor={centavosParaReais(totalFaturadoCentavos)} icone={DollarSign} cor="emerald" aoClicar={() => navegar("/financeiro")} />
        <CardMetrica variants={item} titulo="Lucro Líquido" valor={centavosParaReais(lucroTotalCentavos)} icone={TrendingUp} cor="emerald" destaque aoClicar={() => navegar("/financeiro")} />
      </div>

      {/* LINHA 2: ESTRATÉGICO E CRESCIMENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <CardMetrica variants={item} titulo="Ticket Médio" valor={centavosParaReais(ticketMedioCentavos)} icone={CreditCard} cor="indigo" mini aoClicar={() => navegar("/financeiro")} />
        <CardMetrica variants={item} titulo="Horas de Voo" valor={`${horasTotais}h`} icone={Timer} cor="violet" mini aoClicar={() => navegar("/impressoras")} />
        <CardMetrica variants={item} titulo="Consumo Total" valor={`${consumoTotalKg}kg`} icone={Weight} cor="cyan" mini aoClicar={() => navegar("/materiais")} />
        <CardMetrica variants={item} titulo="Base Clientes" valor={clientesUnicos} icone={Users} cor="fuchsia" mini aoClicar={() => navegar("/clientes")} />
        <CardMetrica variants={item} titulo="Potencial" valor={centavosParaReais(potencialVendaCentavos)} icone={Target} cor="blue" mini aoClicar={() => navegar("/producao")} />
        <CardMetrica variants={item} titulo="ROI Estimado" valor={`${roiEstimado.toFixed(0)}%`} icone={BarChart3} cor="emerald" mini aoClicar={() => navegar("/financeiro")} />
      </div>
    </motion.div>
  );
}

function CardMetrica({ variants, titulo, valor, icone: Icone, cor = "sky", destaque = false, mini = false, aoClicar }: any) {
  const esquemasCores: any = {
    sky: { texto: "text-sky-500", fundoIcone: "bg-sky-500/10", borda: "group-hover:border-sky-500/40", glow: "shadow-sky-500/5" },
    emerald: { texto: "text-emerald-500", fundoIcone: "bg-emerald-500/10", borda: "group-hover:border-emerald-500/40", glow: "shadow-emerald-500/5" },
    rose: { texto: "text-rose-500", fundoIcone: "bg-rose-500/10", borda: "group-hover:border-rose-500/40", glow: "shadow-rose-500/5" },
    amber: { texto: "text-amber-500", fundoIcone: "bg-amber-500/10", borda: "group-hover:border-amber-500/40", glow: "shadow-amber-500/5" },
    indigo: { texto: "text-indigo-500", fundoIcone: "bg-indigo-500/10", borda: "group-hover:border-indigo-500/40", glow: "shadow-indigo-500/5" },
    violet: { texto: "text-violet-500", fundoIcone: "bg-violet-500/10", borda: "group-hover:border-violet-500/40", glow: "shadow-violet-500/5" },
    cyan: { texto: "text-cyan-500", fundoIcone: "bg-cyan-500/10", borda: "group-hover:border-cyan-500/40", glow: "shadow-cyan-500/5" },
    fuchsia: { texto: "text-fuchsia-500", fundoIcone: "bg-fuchsia-500/10", borda: "group-hover:border-fuchsia-500/40", glow: "shadow-fuchsia-500/5" },
    blue: { texto: "text-blue-500", fundoIcone: "bg-blue-500/10", borda: "group-hover:border-blue-500/40", glow: "shadow-blue-500/5" },
  };

  const estilo = esquemasCores[cor] || esquemasCores.sky;

  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      onClick={aoClicar}
      className={`
        bg-card border transition-all duration-300 relative overflow-hidden cursor-pointer
        ${mini ? 'p-4 rounded-2xl' : 'p-6 rounded-[2rem]'}
        ${destaque 
          ? 'border-emerald-500/30 shadow-[0_20px_40px_-15px_rgba(16,185,129,0.15)] bg-emerald-500/[0.02]' 
          : `border-borda-sutil hover:bg-zinc-50 dark:hover:bg-white/[0.02] shadow-sm ${estilo.borda} ${estilo.glow}`
        }
        group
      `}
    >
      {/* Grid Pattern Background - Subtil */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" 
           style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />

      <div className="flex justify-between items-start relative z-10">
        <div className={`
          ${mini ? 'w-8 h-8 rounded-xl' : 'w-12 h-12 rounded-2xl'} 
          flex items-center justify-center shrink-0 
          ${estilo.fundoIcone} ${estilo.texto} 
          shadow-inner border border-white/5
        `}>
          <Icone size={mini ? 16 : 22} strokeWidth={destaque ? 3 : 2.5} />
        </div>
        {destaque && (
          <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-[8px] font-black text-emerald-500 uppercase tracking-widest border border-emerald-500/20">
            Destaque
          </div>
        )}
      </div>
      
      <div className="flex flex-col min-w-0 mt-4 relative z-10">
        <span className={`text-[10px] font-black text-zinc-500 dark:text-zinc-400 uppercase tracking-[0.2em] mb-1 truncate group-hover:text-zinc-700 dark:group-hover:text-zinc-200 transition-colors`}>
          {titulo}
        </span>
        <span className={`
          ${mini ? 'text-xl' : 'text-3xl'} 
          font-black tracking-tighter truncate tabular-nums 
          ${estilo.texto}
          filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]
        `}>
          {valor}
        </span>
      </div>

      {!mini && (
        <div className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-all duration-500 rotate-12 group-hover:rotate-0 group-hover:scale-110 ${estilo.texto}`}>
          <Icone size={80} strokeWidth={destaque ? 6 : 4} />
        </div>
      )}
    </motion.div>
  );
}




