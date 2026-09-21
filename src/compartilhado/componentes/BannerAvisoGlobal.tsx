import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Megaphone, AlertTriangle, CheckCircle2, Wrench, X, ArrowRight } from "lucide-react";
import { servicoBaseApi } from "@/compartilhado/servicos/servicoBaseApi";

export type TipoAviso = "INFO" | "ALERTA" | "SUCESSO" | "MANUTENCAO";

export interface DadosAvisoGlobal {
  ativo: boolean;
  mensagem: string;
  tipo: TipoAviso;
  linkRotulo?: string | null;
  linkUrl?: string | null;
  atualizadoEm?: string | null;
}

const ESTILOS_TIPO: Record<TipoAviso, {
  bg: string;
  borda: string;
  texto: string;
  badge: string;
  badgeTexto: string;
  icone: React.ElementType;
}> = {
  INFO: {
    bg: "bg-cyan-500/10 dark:bg-cyan-500/15",
    borda: "border-cyan-500/20",
    texto: "text-cyan-900 dark:text-cyan-100",
    badge: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
    badgeTexto: "Novidade",
    icone: Megaphone,
  },
  ALERTA: {
    bg: "bg-amber-500/10 dark:bg-amber-500/15",
    borda: "border-amber-500/25",
    texto: "text-amber-950 dark:text-amber-100",
    badge: "bg-amber-500/20 text-amber-700 dark:text-amber-300",
    badgeTexto: "Atenção",
    icone: AlertTriangle,
  },
  SUCESSO: {
    bg: "bg-emerald-500/10 dark:bg-emerald-500/15",
    borda: "border-emerald-500/20",
    texto: "text-emerald-950 dark:text-emerald-100",
    badge: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300",
    badgeTexto: "Lançamento",
    icone: CheckCircle2,
  },
  MANUTENCAO: {
    bg: "bg-indigo-500/10 dark:bg-indigo-500/15",
    borda: "border-indigo-500/20",
    texto: "text-indigo-950 dark:text-indigo-100",
    badge: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
    badgeTexto: "Manutenção",
    icone: Wrench,
  },
};

export function BannerAvisoGlobal() {
  const [aviso, setAviso] = useState<DadosAvisoGlobal | null>(null);
  const [dispensado, setDispensado] = useState(false);

  useEffect(() => {
    let ativo = true;

    async function carregarAviso() {
      try {
        const dados = await servicoBaseApi.get<DadosAvisoGlobal>("/api/aviso-global");
        if (!ativo) return;

        if (dados && dados.ativo && dados.mensagem) {
          // Verifica se o usuário já dispensou este aviso específico nesta sessão
          const chaveDispensado = `printlog_aviso_dispensado_${dados.atualizadoEm || dados.mensagem}`;
          const jaDispensou = sessionStorage.getItem(chaveDispensado) === "true";
          
          if (!jaDispensou) {
            setAviso(dados);
          }
        } else {
          setAviso(null);
        }
      } catch {
        // Silencioso se der erro na busca do banner
      }
    }

    carregarAviso();

    return () => {
      ativo = false;
    };
  }, []);

  if (!aviso || !aviso.ativo || dispensado) {
    return null;
  }

  const config = ESTILOS_TIPO[aviso.tipo] || ESTILOS_TIPO.INFO;
  const Icone = config.icone;

  const lidarComFechar = () => {
    setDispensado(true);
    const chaveDispensado = `printlog_aviso_dispensado_${aviso.atualizadoEm || aviso.mensagem}`;
    try {
      sessionStorage.setItem(chaveDispensado, "true");
    } catch {
      // Ignora erro de storage
    }
  };

  const renderizarLink = () => {
    if (!aviso.linkUrl || !aviso.linkRotulo) return null;

    const urlLimpa = aviso.linkUrl.trim();
    // Bloqueia protocolos executáveis ou esquemas perigosos
    if (
      urlLimpa.toLowerCase().startsWith("javascript:") ||
      urlLimpa.toLowerCase().startsWith("data:") ||
      urlLimpa.toLowerCase().startsWith("vbscript:") ||
      urlLimpa.startsWith("//")
    ) {
      return null;
    }

    const ehExterno = urlLimpa.startsWith("http://") || urlLimpa.startsWith("https://");

    if (ehExterno) {
      return (
        <a
          href={urlLimpa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-80 transition-opacity ml-1.5 shrink-0"
        >
          <span>{aviso.linkRotulo}</span>
          <ArrowRight size={12} />
        </a>
      );
    }

    // Apenas rotas relativas internas estritas
    if (urlLimpa.startsWith("/")) {
      return (
        <Link
          to={urlLimpa}
          className="inline-flex items-center gap-1 font-bold underline underline-offset-2 hover:opacity-80 transition-opacity ml-1.5 shrink-0"
        >
          <span>{aviso.linkRotulo}</span>
          <ArrowRight size={12} />
        </Link>
      );
    }

    return null;
  };

  return (
    <aside 
      aria-label="Aviso da plataforma"
      className={`relative z-40 w-full px-4 py-2 border-b backdrop-blur-md transition-all duration-300 ${config.bg} ${config.borda} ${config.texto}`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs">
        
        {/* Lado Esquerdo / Centro: Mensagem */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1 justify-center sm:justify-start">
          <div className="flex items-center gap-1.5 shrink-0">
            <Icone size={14} className="shrink-0 animate-pulse" />
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.badge}`}>
              {config.badgeTexto}
            </span>
          </div>

          <div className="truncate font-medium leading-tight">
            <span>{aviso.mensagem}</span>
            {renderizarLink()}
          </div>
        </div>

        {/* Botão Fechar */}
        <button
          onClick={lidarComFechar}
          aria-label="Fechar aviso"
          className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0 opacity-70 hover:opacity-100"
          title="Dispensar aviso"
        >
          <X size={14} />
        </button>

      </div>
    </aside>
  );
}
