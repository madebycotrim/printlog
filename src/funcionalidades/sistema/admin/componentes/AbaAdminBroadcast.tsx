import { useState } from "react";
import { 
  Radio, 
  Megaphone, 
  Send, 
  Power, 
  Eye, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  Monitor, 
  Smartphone, 
  X, 
  RotateCcw,
  Zap,
  ShieldCheck
} from "lucide-react";

export type TipoAviso = "INFO" | "ALERTA" | "SUCESSO" | "MANUTENCAO";

interface PropriedadesAbaBroadcast {
  avisoMensagem: string;
  setAvisoMensagem: (val: string) => void;
  avisoTipo: TipoAviso;
  setAvisoTipo: (val: TipoAviso) => void;
  avisoLinkRotulo: string;
  setAvisoLinkRotulo: (val: string) => void;
  avisoLinkUrl: string;
  setAvisoLinkUrl: (val: string) => void;
  avisoAtivo: boolean;
  salvandoAviso: boolean;
  salvarAvisoGlobal: (forcarAtivo?: boolean) => Promise<void>;
  buscarAvisoGlobal: () => Promise<void>;
}

interface PresetAviso {
  id: string;
  titulo: string;
  descricao: string;
  tipo: TipoAviso;
  mensagem: string;
  linkRotulo: string;
  linkUrl: string;
  icone: any;
}

const PRESETS_NOTIFICACAO: PresetAviso[] = [
  {
    id: "lancamento",
    titulo: "Nova Calculadora Maker",
    descricao: "Divulgar atualização e novas fórmulas",
    tipo: "SUCESSO",
    mensagem: "🚀 Nova Calculadora Maker 2.0 liberada! Simule custos com energia e desgaste precisos.",
    linkRotulo: "Experimentar Agora",
    linkUrl: "/calculadora",
    icone: Sparkles
  },
  {
    id: "manutencao",
    titulo: "Manutenção Preventiva",
    descricao: "Avisar sobre janela técnica noturna",
    tipo: "ALERTA",
    mensagem: "⚠️ Manutenção preventiva programada para hoje às 23h. Duração estimada: 15 minutos.",
    linkRotulo: "Status do Sistema",
    linkUrl: "/central-maker",
    icone: AlertTriangle
  },
  {
    id: "fundador",
    titulo: "Clube Fundador (Vagas)",
    descricao: "Incentivar upgrade para plano vitalício",
    tipo: "INFO",
    mensagem: "👑 Restam poucas vagas no Clube Fundador Vitalício com suporte prioritário e sem mensalidades!",
    linkRotulo: "Garantir Vaga",
    linkUrl: "/configuracoes",
    icone: Zap
  },
  {
    id: "dica_tarifas",
    titulo: "Dica: Tarifas de Energia",
    descricao: "Lembrar usuários de atualizar kWh",
    tipo: "MANUTENCAO",
    mensagem: "💡 Dica Maker: Atualize o valor do kWh da sua região em Configurações para orçamentos sem prejuízo.",
    linkRotulo: "Ajustar Tarifas",
    linkUrl: "/configuracoes",
    icone: Wrench
  },
];

const ROTAS_SUGERIDAS = [
  { rotulo: "Calculadora", rota: "/calculadora" },
  { rotulo: "Parque de Máquinas", rota: "/impressoras" },
  { rotulo: "Estoque de Materiais", rota: "/materiais" },
  { rotulo: "Pedidos & Kanban", rota: "/pedidos" },
  { rotulo: "Configurações", rota: "/configuracoes" },
  { rotulo: "Central Maker & FAQ", rota: "/central-maker" },
];

export function AbaAdminBroadcast({
  avisoMensagem,
  setAvisoMensagem,
  avisoTipo,
  setAvisoTipo,
  avisoLinkRotulo,
  setAvisoLinkRotulo,
  avisoLinkUrl,
  setAvisoLinkUrl,
  avisoAtivo,
  salvandoAviso,
  salvarAvisoGlobal,
}: PropriedadesAbaBroadcast) {
  const [modoDispositivo, setModoDispositivo] = useState<"desktop" | "mobile">("desktop");

  const aplicarPreset = (p: PresetAviso) => {
    setAvisoTipo(p.tipo);
    setAvisoMensagem(p.mensagem);
    setAvisoLinkRotulo(p.linkRotulo);
    setAvisoLinkUrl(p.linkUrl);
  };

  const limparCampos = () => {
    setAvisoMensagem("");
    setAvisoLinkRotulo("");
    setAvisoLinkUrl("");
    setAvisoTipo("INFO");
  };

  // Cores e estilos do banner por tipo
  const estilosPorTipo = {
    INFO: {
      borda: "border-cyan-500/30",
      bg: "bg-gradient-to-r from-cyan-950/70 via-cyan-900/40 to-cyan-950/70",
      texto: "text-cyan-100",
      badge: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      link: "text-cyan-300 hover:text-white bg-cyan-500/20 hover:bg-cyan-500/30 border-cyan-500/40",
      icone: Megaphone,
      nome: "Informativo / Novidade",
      corBadgePill: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
    },
    ALERTA: {
      borda: "border-amber-500/30",
      bg: "bg-gradient-to-r from-amber-950/70 via-amber-900/40 to-amber-950/70",
      texto: "text-amber-100",
      badge: "bg-amber-500/15 text-amber-400 border-amber-500/30",
      link: "text-amber-300 hover:text-white bg-amber-500/20 hover:bg-amber-500/30 border-amber-500/40",
      icone: AlertTriangle,
      nome: "Alerta / Manutenção",
      corBadgePill: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    },
    SUCESSO: {
      borda: "border-emerald-500/30",
      bg: "bg-gradient-to-r from-emerald-950/70 via-emerald-900/40 to-emerald-950/70",
      texto: "text-emerald-100",
      badge: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
      link: "text-emerald-300 hover:text-white bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40",
      icone: Sparkles,
      nome: "Lançamento / Sucesso",
      corBadgePill: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    },
    MANUTENCAO: {
      borda: "border-indigo-500/30",
      bg: "bg-gradient-to-r from-indigo-950/70 via-indigo-900/40 to-indigo-950/70",
      texto: "text-indigo-100",
      badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
      link: "text-indigo-300 hover:text-white bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-500/40",
      icone: Wrench,
      nome: "Técnico / Atualização",
      corBadgePill: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
    },
  };

  const estiloAtual = estilosPorTipo[avisoTipo] || estilosPorTipo.INFO;
  const IconeAtual = estiloAtual.icone;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* 📡 MASTER STATUS BANNER */}
      <div className={`p-6 rounded-3xl border transition-all relative overflow-hidden ${
        avisoAtivo 
          ? "bg-gradient-to-r from-emerald-950/30 via-emerald-900/15 to-transparent border-emerald-500/30 shadow-lg shadow-emerald-950/20" 
          : "bg-card border-borda-sutil"
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border transition-all ${
              avisoAtivo 
                ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30 ring-8 ring-emerald-500/10" 
                : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
            }`}>
              <Radio size={28} className={avisoAtivo ? "animate-pulse" : ""} />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-black uppercase tracking-tight text-primary">
                  Estúdio de Transmissão Global (Broadcast)
                </h2>
                {avisoAtivo ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-widest bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    AO VIVO NO APP
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black tracking-widest bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    TRANSMISSÃO DESATIVADA
                  </span>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
                Mensagens configuradas aqui aparecem instantaneamente como um banner flutuante no topo de todas as páginas para 100% dos usuários ativos na plataforma.
              </p>
            </div>
          </div>

          {/* Ações Rápidas do Master Switch */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {avisoAtivo ? (
              <button
                type="button"
                disabled={salvandoAviso}
                onClick={() => salvarAvisoGlobal(false)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-rose-500 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-sm"
              >
                <Power size={14} />
                Desativar Agora
              </button>
            ) : (
              <button
                type="button"
                disabled={salvandoAviso || !avisoMensagem.trim()}
                onClick={() => salvarAvisoGlobal(true)}
                className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                <Send size={14} />
                Publicar no Topo do App
              </button>
            )}
          </div>
        </div>

        {/* Efeito sutil de aura no fundo */}
        {avisoAtivo && (
          <div className="absolute -right-20 -top-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        )}
      </div>

      {/* ⚡ PRESETS INTELIGENTES COM 1 CLIQUE */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-500" />
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Modelos Rápidos (1-Click Presets)
            </h3>
          </div>
          <span className="text-[11px] text-zinc-500">Clique para carregar parâmetros prontos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS_NOTIFICACAO.map((p) => {
            const IconePreset = p.icone;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => aplicarPreset(p)}
                className="group p-3.5 rounded-2xl bg-card hover:bg-muted/60 border border-borda-sutil hover:border-sky-500/40 transition-all text-left flex flex-col justify-between gap-3 active:scale-[0.98] cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <IconePreset size={16} />
                  </div>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${
                    p.tipo === "SUCESSO" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    p.tipo === "ALERTA" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                    p.tipo === "MANUTENCAO" ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20" :
                    "bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
                  }`}>
                    {p.tipo}
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-black text-primary group-hover:text-sky-500 transition-colors">
                    {p.titulo}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                    {p.descricao}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 🛠️ GRID PRINCIPAL: EDITOR (ESQUERDA) + SIMULADOR AO VIVO (DIREITA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUNA ESQUERDA: EDITOR E FORMULÁRIO */}
        <div className="lg:col-span-7 space-y-5 p-6 rounded-3xl bg-card border border-borda-sutil shadow-sm">
          
          <div className="flex items-center justify-between border-b border-borda-sutil pb-4">
            <div className="flex items-center gap-2">
              <Megaphone size={18} className="text-primaria" />
              <h3 className="text-sm font-black uppercase tracking-tight text-primary">
                Configurações do Anúncio
              </h3>
            </div>

            <button
              type="button"
              onClick={limparCampos}
              className="text-[11px] text-muted-foreground hover:text-rose-500 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw size={12} />
              Limpar Campos
            </button>
          </div>

          {/* 1. SELETOR VISUAL DE TIPO / INTENÇÃO */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground flex items-center justify-between">
              <span>Intenção Visual & Estilo</span>
              <span className="text-[10px] font-normal text-zinc-500">Define ícone e paleta de cores</span>
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(estilosPorTipo) as TipoAviso[]).map((tipoKey) => {
                const conf = estilosPorTipo[tipoKey];
                const IconeItem = conf.icone;
                const selecionado = avisoTipo === tipoKey;

                return (
                  <button
                    key={tipoKey}
                    type="button"
                    onClick={() => setAvisoTipo(tipoKey)}
                    className={`p-3 rounded-xl border text-left transition-all flex flex-col gap-2 cursor-pointer ${
                      selecionado 
                        ? `${conf.borda} bg-muted/70 ring-2 ring-sky-500/20 shadow-sm` 
                        : "border-borda-sutil bg-muted/20 hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${conf.badge}`}>
                        <IconeItem size={15} />
                      </div>
                      {selecionado && <CheckCircle2 size={14} className="text-sky-500" />}
                    </div>

                    <div>
                      <span className="text-[11px] font-black text-primary block leading-tight">
                        {tipoKey}
                      </span>
                      <span className="text-[9px] text-muted-foreground line-clamp-1">
                        {conf.nome}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. TEXTO DA MENSAGEM */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground">
                Texto do Comunicado *
              </label>
              <span className={`text-[10px] font-mono ${
                avisoMensagem.length > 140 ? "text-amber-500 font-bold" : "text-zinc-500"
              }`}>
                {avisoMensagem.length}/140 caracteres recomendados
              </span>
            </div>

            <textarea
              rows={3}
              value={avisoMensagem}
              onChange={(e) => setAvisoMensagem(e.target.value)}
              placeholder='Ex: "Nova calculadora de resina 3D já disponível no painel! Clique para simular seus custos."'
              className="w-full px-4 py-3 text-xs rounded-2xl bg-muted/30 border border-borda-sutil text-primary placeholder:text-muted-foreground focus:outline-none focus:border-sky-500 transition-all resize-none"
            />
          </div>

          {/* 3. BOTÃO DE AÇÃO (CALL TO ACTION) & LINK */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
            <div className="sm:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block">
                Rótulo do Link (Opcional)
              </label>
              <input
                type="text"
                value={avisoLinkRotulo}
                onChange={(e) => setAvisoLinkRotulo(e.target.value)}
                placeholder='Ex: "Saiba mais", "Acessar"'
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/30 border border-borda-sutil text-primary placeholder:text-muted-foreground focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>

            <div className="sm:col-span-7 space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground block">
                Destino do Link (Rota Interna ou Externa)
              </label>
              <input
                type="text"
                value={avisoLinkUrl}
                onChange={(e) => setAvisoLinkUrl(e.target.value)}
                placeholder='Ex: "/calculadora" ou "https://..."'
                className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-muted/30 border border-borda-sutil text-primary placeholder:text-muted-foreground focus:outline-none focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Atalhos rápidos de rotas internas */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
              Atalhos de Destino Rápidos:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ROTAS_SUGERIDAS.map((r) => (
                <button
                  key={r.rota}
                  type="button"
                  onClick={() => {
                    setAvisoLinkUrl(r.rota);
                    if (!avisoLinkRotulo) setAvisoLinkRotulo("Conferir");
                  }}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-muted hover:bg-muted/80 text-muted-foreground hover:text-primary border border-borda-sutil transition-colors cursor-pointer"
                >
                  {r.rotulo} <span className="text-zinc-500 font-mono text-[9px]">{r.rota}</span>
                </button>
              ))}
            </div>
          </div>

          {/* BOTÕES DE GRAVAÇÃO */}
          <div className="pt-4 border-t border-borda-sutil flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span>Sincronização imediata na Edge via Cloudflare D1</span>
            </div>

            <div className="flex items-center gap-2">
              {avisoAtivo ? (
                <>
                  <button
                    type="button"
                    disabled={salvandoAviso}
                    onClick={() => salvarAvisoGlobal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 border border-rose-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    Desativar
                  </button>

                  <button
                    type="button"
                    disabled={salvandoAviso || !avisoMensagem.trim()}
                    onClick={() => salvarAvisoGlobal(true)}
                    className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white bg-primaria hover:bg-primaria/90 shadow-md transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                  >
                    <Send size={13} />
                    {salvandoAviso ? "Atualizando..." : "Salvar Alterações"}
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={salvandoAviso || !avisoMensagem.trim()}
                  onClick={() => salvarAvisoGlobal(true)}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-black text-white bg-primaria hover:bg-primaria/90 shadow-md shadow-primaria/20 transition-all disabled:opacity-50 cursor-pointer active:scale-95"
                >
                  <Send size={14} />
                  {salvandoAviso ? "Publicando..." : "Publicar no Topo do App"}
                </button>
              )}
            </div>
          </div>

        </div>

        {/* COLUNA DIREITA: SIMULADOR AO VIVO (INTERACTIVE DEVICE PREVIEW) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-5 rounded-3xl bg-card border border-borda-sutil shadow-sm space-y-4">
            
            {/* Cabeçalho do Simulador */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-sky-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-primary">
                  Simulador em Tempo Real
                </h3>
              </div>

              {/* Alternador Desktop / Mobile */}
              <div className="flex items-center p-0.5 rounded-xl bg-muted border border-borda-sutil">
                <button
                  type="button"
                  onClick={() => setModoDispositivo("desktop")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modoDispositivo === "desktop"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  title="Simular em Computador / Telas Grandes"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setModoDispositivo("mobile")}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    modoDispositivo === "mobile"
                      ? "bg-card text-primary shadow-sm"
                      : "text-muted-foreground hover:text-primary"
                  }`}
                  title="Simular em Smartphone"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>

            {/* MOCKUP DO DISPOSITIVO */}
            <div className="rounded-2xl border border-borda-sutil bg-zinc-950 p-3 shadow-inner overflow-hidden">
              
              {/* Barra de Janela / Navegador Virtual */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[10px] text-zinc-500 font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70 inline-block" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70 inline-block" />
                </div>
                <span className="truncate max-w-[160px]">app.printlog.com.br</span>
                <span className="text-[9px] uppercase tracking-widest text-zinc-600">
                  {modoDispositivo === "desktop" ? "1920×1080" : "390×844"}
                </span>
              </div>

              {/* CONTAINER SIMULADO DO BANNER NO TOPO */}
              <div className={`transition-all duration-300 mx-auto ${
                modoDispositivo === "mobile" ? "max-w-[310px]" : "w-full"
              }`}>
                {avisoMensagem.trim() ? (
                  <div className={`p-3 rounded-xl border ${estiloAtual.borda} ${estiloAtual.bg} ${estiloAtual.texto} shadow-lg transition-all animate-in fade-in`}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${estiloAtual.badge}`}>
                          <IconeAtual size={13} />
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-semibold leading-tight truncate ${estiloAtual.texto}`}>
                            {avisoMensagem}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {avisoLinkRotulo && (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border transition-all ${estiloAtual.link}`}>
                            {avisoLinkRotulo} →
                          </span>
                        )}
                        <button
                          type="button"
                          className="w-5 h-5 rounded-md flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10"
                          title="Botão de dispensar pelo usuário"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-600 space-y-1">
                    <Megaphone size={20} className="mx-auto text-zinc-700" />
                    <p className="text-xs font-bold">Nenhum aviso configurado</p>
                    <p className="text-[10px]">Digite uma mensagem ou clique em um dos Modelos Rápidos acima.</p>
                  </div>
                )}

                {/* SIMULAÇÃO DE CORPO DO APP LOGADO */}
                <div className="mt-3 p-4 rounded-xl bg-zinc-900/60 border border-white/5 space-y-3 opacity-60">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="h-3 w-20 rounded bg-white/10" />
                    <div className="h-3 w-8 rounded bg-white/10" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="h-10 rounded-lg bg-white/5" />
                    <div className="h-10 rounded-lg bg-white/5" />
                    <div className="h-10 rounded-lg bg-white/5" />
                  </div>
                  <div className="h-16 rounded-lg bg-white/5" />
                </div>
              </div>

            </div>

            {/* TELEMETRIA & DIAGNÓSTICO DO BROADCAST */}
            <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="p-3 rounded-2xl bg-muted/40 border border-borda-sutil">
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Público Ativo</span>
                <span className="font-bold text-primary">100% dos Makers</span>
              </div>
              <div className="p-3 rounded-2xl bg-muted/40 border border-borda-sutil">
                <span className="text-[10px] text-zinc-500 uppercase font-black tracking-wider block">Latência Global</span>
                <span className="font-bold text-emerald-500">~25ms (Edge D1)</span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
