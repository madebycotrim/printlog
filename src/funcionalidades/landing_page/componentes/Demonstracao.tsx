import { useEffect, useRef, useState } from "react";
import {
  Settings,
  LayoutDashboard,
  Package,
  Printer,
  DollarSign,
  FileText,
  Plus,
  AlertTriangle,
  Box,
  SprayCan,
} from "lucide-react";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes/Icones3D";

export function Demonstracao() {
  const refSecao = useRef<HTMLElement>(null);
  const [visivel, definirVisivel] = useState(false);
  const [abaAtiva] = useState("painel");

  useEffect(() => {
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (entrada.isIntersecting) definirVisivel(true);
      },
      { threshold: 0.15 },
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
            <span className="text-[10px] font-bold uppercase tracking-widest">Tudo em um só lugar</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-[0.9] mb-6">
            O Cérebro da sua
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">
              Operação de Impressão.
            </span>
          </h2>
          <p className="text-zinc-500 text-lg max-w-xl mx-auto">
            Monitore custos em tempo real, gerencie estoques e controle sua frota de impressoras. Tudo em um único
            lugar.
          </p>
        </div>

        {/* ── Interface Principal do Painel ── */}
        <div
          className={`relative transition-all duration-1000 delay-200 ${visivel ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-1 scale-95"}`}
          style={{ perspective: "2000px" }}
        >
          {/* A "Janela" */}
          <div className="relative mx-auto max-w-6xl bg-[#09090b]/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/5 group/janela">
            {/* Barra de Título */}
            <div className="h-10 bg-[#09090b] border-b border-white/5 flex items-center px-4 justify-between select-none">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]/50" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]/50" />
                <div className="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]/50" />
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
                <img src="/logo-branca.png" alt="PrintLog" className="w-4 h-4 object-contain opacity-50" />
                printlog.com.br
              </div>
              <div className="w-14" /> {/* Espaçador */}
            </div>

            {/* Conteúdo do App */}
            <div className="flex h-[640px] overflow-hidden">
              {/* Barra Lateral */}
              <div className="w-[72px] bg-[#0c0c0e] border-r border-white/5 flex flex-col items-center py-6 gap-6 z-20">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <img src="/logo-branca.png" alt="PrintLog" className="w-6 h-6 object-contain opacity-80" />
                </div>
                <div className="flex-1 flex flex-col gap-4 w-full px-3">
                  {["painel", "estoque", "impressoras", "financeiro", "configuracoes"].map((icone) => (
                    <button
                      key={icone}
                      // onClick={() => definirAbaAtiva(icone)} // Desativado a pedido do usuário
                      className={`w-full aspect-square rounded-xl flex items-center justify-center transition-all duration-300 group/icone relative ${abaAtiva === icone ? "bg-white/10 text-sky-400" : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5 cursor-default"}`}
                    >
                      <IconeBarraLateral tipo={icone} ativo={abaAtiva === icone} />
                      {abaAtiva === icone && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-3 bg-sky-400 rounded-r-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />
                      )}
                    </button>
                  ))}
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden mt-auto">
                  <img
                    src="https://ui-avatars.com/api/?name=Maker+Pro&background=random&color=fff"
                    alt="Usuário"
                    className="w-full h-full opacity-80"
                  />
                </div>
              </div>

              {/* Área Principal */}
              <div className="flex-1 bg-[#09090b] flex flex-col relative overflow-hidden">
                {/* Grade de Fundo REMOVIDA */}

                {/* Navegação Superior */}
                <div className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-[#09090b]/50 backdrop-blur-sm z-10">
                  <div>
                    <h3 className="text-white font-bold text-lg">Visão Geral</h3>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                      Quarta-feira, 18 de Fevereiro
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button className="h-8 px-3 rounded-md bg-[#18181b] border border-white/10 text-xs font-medium text-zinc-400 hover:text-white transition-colors">
                      Exportar
                    </button>
                    <button className="h-8 px-3 rounded-md bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20 transition-all">
                      + Novo Projeto
                    </button>
                  </div>
                </div>

                {/* Grade de Conteúdo */}
                <div className="flex-1 p-8 overflow-y-auto barra-rolagem-personalizada">
                  <div className="grid grid-cols-12 gap-6 ">
                    {/* ── WIDGET: Orçamentos Recentes (Col 1-8) ── */}
                    <div className="col-span-12 lg:col-span-8 bg-[#0c0c0e] border border-white/5 rounded-xl p-0 overflow-hidden flex flex-col">
                      <div className="p-5 border-b border-white/5 flex justify-between items-center">
                        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">
                          Orçamentos Recentes
                        </h4>
                        <button className="text-[10px] text-sky-400 font-bold hover:underline">VER TODOS</button>
                      </div>

                      {/* Lista de Projetos */}
                      <div className="flex-1 overflow-y-auto">
                        {[
                          {
                            id: "1",
                            nome: "Peças de Reposição Drone",
                            cliente: "TechLab Solutions",
                            data: "Hoje, 14:30",
                            valor: "R$ 450,00",
                            status: "Aprovado",
                          },
                          {
                            id: "2",
                            nome: "Protótipo Suporte V3",
                            cliente: "Engenharia Silva",
                            data: "Ontem, 09:15",
                            valor: "R$ 125,50",
                            status: "Pendente",
                          },
                          {
                            id: "3",
                            nome: "Action Figure 15cm",
                            cliente: "Roberto Mendes",
                            data: "16 Fev, 18:20",
                            valor: "R$ 89,90",
                            status: "Rascunho",
                          },
                        ].map((trabalho) => (
                          <div
                            key={trabalho.id}
                            className="flex items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors group/linha"
                          >
                            <div className="w-10 h-10 rounded bg-[#18181b] flex items-center justify-center border border-white/5 mr-4 text-zinc-500 group-hover/linha:text-sky-500 group-hover/linha:border-sky-500/20 transition-all">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0 mr-4">
                              <div className="text-sm font-bold text-white truncate">{trabalho.nome}</div>
                              <div className="text-[10px] text-zinc-500 flex items-center gap-2">
                                <span>{trabalho.cliente}</span> • <span>{trabalho.data}</span>
                              </div>
                            </div>

                            <div className="text-right mr-6">
                              <div className="text-sm font-bold text-white">{trabalho.valor}</div>
                              <div className="text-[10px] text-zinc-500">Valor Final</div>
                            </div>

                            <div>
                              {trabalho.status === "Aprovado" && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-500">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Aprovado
                                </span>
                              )}
                              {trabalho.status === "Pendente" && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] font-bold text-amber-500">
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pendente
                                </span>
                              )}
                              {trabalho.status === "Rascunho" && (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-500/10 border border-zinc-500/20 text-[10px] font-bold text-zinc-500">
                                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Rascunho
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── WIDGET: Receita (Col 9-12) ── */}
                    <div className="col-span-12 lg:col-span-4 bg-[#0c0c0e] border border-white/5 rounded-xl p-5 flex flex-col justify-between">
                      <div>
                        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest mb-1">
                          Faturamento (Mês)
                        </h4>
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-3xl font-black text-white tracking-tight">R$ 12.450</span>
                          <span className="text-xs font-bold text-emerald-400 mb-1.5">▲ 18%</span>
                        </div>
                      </div>

                      {/* Gráfico de Área Apenas com CSS */}
                      <div className="h-28 w-full flex items-end gap-1 relative pl-2 border-l border-white/5 border-b pb-2">
                        {/* Linhas de Grade */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          <div className="h-px bg-white/5 w-full" />
                          <div className="h-px bg-white/5 w-full" />
                          <div className="h-px bg-white/5 w-full" />
                        </div>

                        {[30, 45, 40, 60, 55, 70, 65, 80, 75, 95].map((h, i) => (
                          <div key={i} className="flex-1 group/barra relative h-full flex items-end">
                            <div
                              className="w-full bg-indigo-500/20 border-t border-indigo-500/50 rounded-t-sm transition-all duration-1000 ease-out hover:bg-indigo-500 relative"
                              style={{ height: visivel ? `${h}%` : "0%" }}
                            >
                              {/* Tooltip */}
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 opacity-0 group-hover/barra:opacity-100 transition-opacity bg-zinc-800 text-white text-[9px] font-bold px-1.5 py-0.5 rounded border border-white/10 whitespace-nowrap z-10 pointer-events-none">
                                R$ {h * 150}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── WIDGET: Quadro de Avisos (Col 1-4) ── */}
                    <div
                      className={`col-span-12 lg:col-span-4 bg-gradient-to-br from-[#0c0c0e] to-[#121214] border border-white/5 rounded-xl p-5 flex flex-col transition-all duration-700 ease-out ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                      style={{ transitionDelay: "300ms" }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Quadro de Avisos</h4>
                        <button className="w-5 h-5 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-3 flex-1 overflow-y-auto">
                        {/* Aviso 1: Manutenção */}
                        <div className="flex gap-3 p-3 rounded-lg bg-pink-500/5 border border-pink-500/10 group/aviso hover:bg-pink-500/10 transition-colors cursor-pointer">
                          <div className="min-w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20 mt-0.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-pink-400" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white mb-0.5 group-hover/aviso:text-pink-400 transition-colors">
                              Manutenção Necessária
                            </div>
                            <div className="text-[10px] text-zinc-400 leading-relaxed">
                              A impressora <span className="text-zinc-300 font-medium">Ender 3 V2</span> atingiu 500h de
                              uso contínuo.
                            </div>
                            <button className="mt-2 text-[9px] font-bold text-pink-400 uppercase tracking-wider hover:underline">
                              Agendar
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ── WIDGET: Insumos (Col 5-8) ── */}
                    <div
                      className={`col-span-12 lg:col-span-4 bg-[#0c0c0e] border border-white/5 rounded-xl p-5 h-64 md:h-auto transition-all duration-700 ease-out ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                      style={{ transitionDelay: "400ms" }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Insumos (Geral)</h4>
                        <button className="text-[10px] text-sky-400 font-bold hover:underline">REPOR</button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#121214] border border-white/5">
                          <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded text-zinc-400">
                            <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded text-zinc-400">
                              <Box className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">Caixa de Envio P</div>
                            <div className="w-full h-1 bg-zinc-800 rounded-full mt-1">
                              <div className="h-full bg-emerald-500 w-[75%] rounded-full" />
                            </div>
                          </div>
                          <div className="text-xs font-mono text-zinc-400">75%</div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#121214] border border-white/5">
                          <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded text-zinc-400">
                            <div className="w-10 h-10 flex items-center justify-center bg-zinc-800 rounded text-zinc-400">
                              <SprayCan className="w-5 h-5" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">Cola Spray 3M</div>
                            <div className="w-full h-1 bg-zinc-800 rounded-full mt-1">
                              <div className="h-full bg-red-500 w-[15%] rounded-full animate-pulse" />
                            </div>
                          </div>
                          <div className="text-xs font-mono text-red-400 font-bold">15%</div>
                        </div>
                      </div>
                    </div>

                    {/* ── WIDGET: Materiais (Col 9-12) ── */}
                    <div
                      className={`col-span-12 lg:col-span-4 bg-[#0c0c0e] border border-white/5 rounded-xl p-5 h-64 md:h-auto transition-all duration-700 ease-out ${visivel ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
                      style={{ transitionDelay: "500ms" }}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="text-zinc-400 text-xs font-bold uppercase tracking-widest">Materiais (MP)</h4>
                        <button className="text-[10px] text-sky-400 font-bold hover:underline">VER TODOS</button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#121214] border border-white/5">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <Carretel cor="#0ea5e9" porcentagem={25} tamanho={36} id="widget-fdm-1" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">PLA Silk Azul</div>
                            <div className="w-full h-1 bg-zinc-800 rounded-full mt-1">
                              <div className="h-full bg-sky-500 w-[25%] rounded-full" />
                            </div>
                          </div>
                          <div className="text-xs font-mono text-zinc-400">250g</div>
                        </div>
                        <div className="flex items-center gap-3 p-2 rounded-lg bg-[#121214] border border-white/5">
                          <div className="w-10 h-10 flex items-center justify-center">
                            <GarrafaResina cor="#f97316" porcentagem={10} tamanho={32} id="widget-sla-1" />
                          </div>
                          <div className="flex-1">
                            <div className="text-xs font-bold text-white">Resina Standard</div>
                            <div className="w-full h-1 bg-zinc-800 rounded-full mt-1">
                              <div className="h-full bg-orange-500 w-[10%] rounded-full animate-pulse" />
                            </div>
                          </div>
                          <div className="text-xs font-mono text-orange-400 font-bold">100ml</div>
                        </div>
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
@keyframes progresso {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
}
                .barra-rolagem-personalizada::-webkit-scrollbar { width: 4px; }
                .barra-rolagem-personalizada::-webkit-scrollbar-track { background: transparent; }
                .barra-rolagem-personalizada::-webkit-scrollbar-thumb { background: #27272a; border-radius: 4px; }
                .barra-rolagem-personalizada::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
`}</style>
    </section>
  );
}

function IconeBarraLateral({ tipo, ativo }: { tipo: string; ativo?: boolean }) {
  if (tipo === "configuracoes") {
    return (
      <Settings
        className={`w-5 h-5 transition-all duration-300 ${ativo ? "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "text-current"}`}
      />
    );
  }

  const IconesLucide: any = {
    painel: LayoutDashboard,
    estoque: Package,
    impressoras: Printer,
    financeiro: DollarSign,
  };

  const IconeComponente = IconesLucide[tipo];

  if (!IconeComponente) return null;

  return (
    <IconeComponente
      className={`w-5 h-5 transition-all duration-300 ${ativo ? "text-sky-400 drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" : "text-current"}`}
    />
  );
}
