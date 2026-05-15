import { useEffect, useRef, useState } from "react";
import {
  Settings,
  LayoutDashboard,
  Package,
  Printer,
  DollarSign,
  FileText,
  Clock,
  Percent,
  Activity,
  TrendingUp,
  CreditCard,
  Timer,
  Weight,
  Users,
  Target,
  BarChart3,
  ChevronRight,
  Box,
  SprayCan,
  Wrench,
  AlertTriangle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes";

export function Demonstracao() {
  const refSecao = useRef<HTMLElement>(null);
  const [visivel, definirVisivel] = useState(false);

  useEffect(() => {
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) definirVisivel(true);
      },
      { threshold: 0.1 },
    );
    if (refSecao.current) observador.observe(refSecao.current);
    return () => observador.disconnect();
  }, []);

  return (
    <section id="centro-comando" ref={refSecao} className="py-32 relative overflow-hidden bg-[#050505]">
      {/* ── Efeitos de Fundo ── */}
      <div className="absolute inset-0 bg-[#050505]" />
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />

      {/* Brilhos Ambientais */}
      <div className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />
      <div className="absolute bottom-1/4 right-1/4 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none mix-blend-screen" />

      <div className="container mx-auto px-6 relative z-10">
        {/* ── Cabeçalho ── */}
        <div
          className={`text-center max-w-4xl mx-auto mb-20 transition-all duration-1000 ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-sky-500/10 bg-sky-500/5 text-sky-400 mb-6 backdrop-blur-md">
            <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Demonstração do Sistema</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-6">
            O Cérebro da sua
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              Operação de Impressão.
            </span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto font-medium">
            Abandone as planilhas. Gerencie custos, prazos e hardware em uma interface industrial de alta densidade.
          </p>
        </div>

        {/* ── Interface Principal do Painel ── */}
        <div
          className={`relative transition-all duration-1000 delay-200 ${visivel ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-1 scale-95"}`}
          style={{ perspective: "2000px" }}
        >
          {/* A "Janela" */}
          <div className="relative mx-auto max-w-[1400px] bg-[#09090b] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden ring-1 ring-white/5 group/janela">
            {/* Barra de Título (MacOS Style) */}
            <div className="h-12 bg-[#0c0c0e] border-b border-white/5 flex items-center px-6 justify-between select-none">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-800 border border-white/5" />
                <div className="w-3 h-3 rounded-full bg-zinc-800 border border-white/5" />
                <div className="w-3 h-3 rounded-full bg-zinc-800 border border-white/5" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                <img src="/logo-branca.png" alt="Favicon" className="w-3.5 h-3.5 object-contain opacity-50" />
                printlog.com.br
              </div>
              <div className="w-14" />
            </div>

            {/* Conteúdo do Dashboard Real (Simulado) */}
            <div className="flex h-[800px] overflow-hidden">
              {/* Barra Lateral Realista */}
              <div className="w-[80px] bg-[#0c0c0e] border-r border-white/5 flex flex-col items-center py-8 gap-8">
                <div className="w-10 h-10 flex items-center justify-center mb-4 relative group">
                  <div className="absolute -inset-1 bg-sky-500/20 rounded-full blur opacity-50" />
                  <img src="/logo-branca.png" alt="PrintLog" className="relative w-8 h-8 object-contain" />
                </div>
                <div className="flex-1 flex flex-col gap-5">
                  {[LayoutDashboard, FileText, Printer, Package, DollarSign, Users, Settings].map((Icone, i) => (
                    <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${i === 0 ? "bg-white/5 text-sky-400 shadow-sm border border-white/5" : "text-zinc-600 hover:text-zinc-400"}`}>
                      <Icone size={20} strokeWidth={2.5} />
                    </div>
                  ))}
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden ring-2 ring-white/5">
                  <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhhMb-388CYaSI9TYqhC4NDiTUEgJaIvwjnQ&s" alt="User" />
                </div>
              </div>

              {/* Área do Conteúdo */}
              <div className="flex-1 overflow-y-auto bg-[#09090b] p-8 space-y-8 barra-rolagem-personalizada">
                {/* Header do Painel */}
                <div className="flex justify-between items-end mb-4">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Olá, Maker! 👋</h3>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-widest">Painel de Operações • Outubro 2026</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="h-10 px-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Sistemas Online
                    </div>
                  </div>
                </div>

                {/* 12 KPIs Grid */}
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-4">
                    <CardDemo titulo="Produção Ativa" valor="14" icone={Clock} cor="sky" />
                    <CardDemo titulo="Taxa Sucesso" valor="98.2%" icone={Percent} cor="emerald" />
                    <CardDemo titulo="Alertas Estoque" valor="3" icone={Package} cor="rose" />
                    <CardDemo titulo="Patrimônio" valor="R$ 4.250" icone={Activity} cor="amber" />
                    <CardDemo titulo="Faturado Mês" valor="R$ 12.840" icone={DollarSign} cor="emerald" />
                    <CardDemo titulo="Lucro Líquido" valor="R$ 7.120" icone={TrendingUp} cor="emerald" destaque />
                  </div>
                  <div className="grid grid-cols-6 gap-4">
                    <CardDemo titulo="Ticket Médio" valor="R$ 145" icone={CreditCard} cor="indigo" mini />
                    <CardDemo titulo="Horas de Voo" valor="1.420h" icone={Timer} cor="violet" mini />
                    <CardDemo titulo="Consumo Total" valor="84kg" icone={Weight} cor="cyan" mini />
                    <CardDemo titulo="Clientes" valor="142" icone={Users} cor="fuchsia" mini />
                    <CardDemo titulo="Potencial" valor="R$ 22.400" icone={Target} cor="blue" mini />
                    <CardDemo titulo="ROI" valor="320%" icone={BarChart3} cor="emerald" mini />
                  </div>
                </div>

                {/* Linha Central: Orçamentos e Monitor */}
                <div className="grid grid-cols-12 gap-6">
                  {/* Orçamentos */}
                  <div className="col-span-8 bg-[#0c0c0e] border border-white/5 rounded-[2rem] overflow-hidden flex flex-col shadow-xl relative group transition-all">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01] relative z-10">
                      <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Fila de Orçamentos</h4>
                      <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Ver Todos</span>
                    </div>
                    <div className="p-2 relative z-10">
                      {[
                        { id: 1, nome: "Protótipo Drone V4", cliente: "Tech Aerospace", valor: "R$ 1.450", status: "Aprovado" },
                        { id: 2, nome: "Case Gaming Custom", cliente: "Lucas Pereira", valor: "R$ 420", status: "Pendente" },
                        { id: 3, nome: "Peças Industriais", cliente: "Metalúrgica JR", valor: "R$ 2.890", status: "Produção" },
                        { id: 4, nome: "Action Figure 30cm", cliente: "Ana Silva", valor: "R$ 180", status: "Rascunho" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center p-5 border-b border-white/[0.02] last:border-0 hover:bg-white/[0.03] transition-all rounded-2xl group/item">
                          <div className="w-10 h-10 rounded-xl bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-500 group-hover/item:text-sky-500 transition-colors mr-4">
                            <FileText size={18} />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-black text-white">{item.nome}</div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{item.cliente}</div>
                          </div>
                          <div className="text-right mr-6">
                            <div className="text-sm font-black text-white">{item.valor}</div>
                            <div className="text-[9px] text-zinc-500 uppercase font-black">Final</div>
                          </div>
                          <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${item.status === 'Aprovado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : item.status === 'Produção' ? 'bg-sky-500/10 text-sky-500 border-sky-500/20' : 'bg-zinc-800 text-zinc-500 border-white/5'}`}>
                            {item.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Monitor Live */}
                  <div className="col-span-4 bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden flex flex-col">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                    <div className="flex items-center justify-between mb-8 relative z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Monitor Live</h4>
                      </div>
                      <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Farm</span>
                    </div>
                    <div className="space-y-8 flex-1 relative z-10">
                      {[
                        { nome: "Viper Core 01", progresso: 85, status: "Imprimindo" },
                        { nome: "Atlas Mega 02", progresso: 42, status: "Imprimindo" },
                        { nome: "Viper Core 03", progresso: 0, status: "Livre" },
                      ].map((maq, idx) => (
                        <div key={idx} className="space-y-3">
                          <div className="flex justify-between items-end">
                            <div className="text-[11px] font-black text-white uppercase tracking-tight">{maq.nome}</div>
                            <div className={`text-[9px] font-black uppercase tracking-widest ${maq.status === 'Livre' ? 'text-zinc-500' : 'text-sky-400'}`}>{maq.status}</div>
                          </div>
                          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${maq.progresso}%` }}
                              className={`h-full rounded-full ${maq.status === 'Livre' ? 'bg-zinc-800' : 'bg-gradient-to-r from-sky-600 to-indigo-600 shadow-[0_0_10px_rgba(56,189,248,0.3)]'}`} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="mt-8 flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-[10px] font-black text-white uppercase tracking-widest relative z-10 hover:bg-white/[0.04] transition-all">
                      Painel Completo
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                {/* Linha Inferior: Insumos, Materiais e Avisos */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Insumos */}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8 relative z-10">Insumos Críticos</h4>
                    <div className="space-y-4 relative z-10">
                      <ItemEstoque icone={Box} nome="Caixa de Envio G" progresso={15} cor="rose" />
                      <ItemEstoque icone={SprayCan} nome="Adesivo de Mesa" progresso={45} cor="sky" />
                    </div>
                  </div>
                  {/* Materiais */}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8 relative z-10">Fios e Resinas</h4>
                    <div className="flex gap-6 relative z-10">
                      <div className="flex flex-col items-center gap-2">
                        <Carretel cor="#0ea5e9" porcentagem={25} tamanho={40} id="demo-mat-1" />
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">25%</span>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <GarrafaResina cor="#f97316" porcentagem={15} tamanho={36} id="demo-mat-2" />
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest animate-pulse">15%</span>
                      </div>
                    </div>
                  </div>
                  {/* Avisos */}
                  <div className="bg-[#0c0c0e] border border-white/5 rounded-[2rem] p-8 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-8 relative z-10">Quadro de Avisos</h4>
                    <div className="flex gap-4 p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                        <Wrench size={18} />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-white uppercase tracking-tight mb-1">Manutenção Preditiva</div>
                        <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Atlas Mega 02 precisa de lubrificação em 2h de uso.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Reflexo / Chão */}
          <div className="absolute -bottom-20 inset-x-20 h-[100px] bg-sky-500/20 blur-[80px] opacity-30 pointer-events-none transform scale-y-50" />
        </div>
      </div>

      <style>{`
        .barra-rolagem-personalizada::-webkit-scrollbar { width: 4px; }
        .barra-rolagem-personalizada::-webkit-scrollbar-track { background: transparent; }
        .barra-rolagem-personalizada::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
        .barra-rolagem-personalizada::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>
    </section>
  );
}

function CardDemo({ titulo, valor, icone: Icone, cor = "sky", destaque = false, mini = false }: any) {
  const esquemasCores: any = {
    sky: "text-sky-500 bg-sky-500/10 border-sky-500/20",
    emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
    rose: "text-rose-500 bg-rose-500/10 border-rose-500/20",
    amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
    indigo: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
    violet: "text-violet-500 bg-violet-500/10 border-violet-500/20",
    cyan: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
    fuchsia: "text-fuchsia-500 bg-fuchsia-500/10 border-fuchsia-500/20",
    blue: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  };

  const estilo = esquemasCores[cor] || esquemasCores.sky;

  return (
    <div className={`bg-[#0c0c0e] border border-white/5 ${mini ? 'p-4 rounded-2xl' : 'p-5 rounded-3xl'} relative overflow-hidden group transition-all hover:bg-white/[0.02]`}>
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`, backgroundSize: '16px 16px' }} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${estilo}`}>
          <Icone size={16} strokeWidth={2.5} />
        </div>
        {destaque && (
          <div className="px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-[7px] font-black text-emerald-500 uppercase border border-emerald-500/20 tracking-widest">REAL</div>
        )}
      </div>
      <div className="flex flex-col relative z-10">
        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1 truncate">{titulo}</span>
        <span className={`${mini ? 'text-sm' : 'text-xl'} font-black tracking-tighter ${estilo.split(' ')[0]}`}>{valor}</span>
      </div>
    </div>
  );
}

function ItemEstoque({ icone: Icone, nome, progresso, cor }: any) {
  const cores: any = {
    rose: "bg-rose-500",
    sky: "bg-sky-500",
    emerald: "bg-emerald-500"
  };
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/5">
      <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
        <Icone size={18} />
      </div>
      <div className="flex-1">
        <div className="text-[10px] font-black text-white uppercase tracking-tight mb-1">{nome}</div>
        <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
          <div className={`h-full ${cores[cor]} rounded-full`} style={{ width: `${progresso}%` }} />
        </div>
      </div>
      <div className={`text-[10px] font-black ${cor === 'rose' ? 'text-rose-500' : 'text-zinc-500'}`}>{progresso}%</div>
    </div>
  );
}
