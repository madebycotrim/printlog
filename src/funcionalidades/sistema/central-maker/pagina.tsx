import {
  MessageCircle,
  Search,
  X,
  Settings,
  Factory,
  AlertTriangle,
  Thermometer,
  Store,
  ChevronRight,
  PenTool,
  Zap,
  Flame,
} from "lucide-react";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useState, useMemo } from "react";
import { GridWiki } from "./componentes/GridWiki";
import { SecaoFAQ } from "./componentes/SecaoFAQ";
import { ModalSuporte } from "./componentes/ModalSuporte";
import { ModalDetalhesTopico } from "./componentes/ModalDetalhesTopico";
import { RodapeLGPD } from "./componentes/RodapeLGPD";
import { EstadoVazio } from "@/compartilhado/componentes/EstadoVazio";

interface InterfaceTopico {
  id: string;
  titulo: string;
  conteudo: string;
  nivel: string;
  atualizado: string;
  gcode?: string;
  categoria?: string;
  cor?: string;
}

interface InterfaceCategoria {
  id: string;
  titulo: string;
  subtitulo: string;
  icone: any;
  corPaleta: string;
  cor: string;
  fundo: string;
  topicos: InterfaceTopico[];
}

interface InterfaceFAQ {
  pergunta: string;
  resposta: string;
}

const WIKI_EXTENDIDA: InterfaceCategoria[] = [
  {
    id: "01",
    titulo: "Calibração de Precisão",
    subtitulo: "Hardware e Mecânica",
    icone: Settings,
    corPaleta: "sky",
    cor: "text-sky-500",
    fundo: "bg-sky-500/10",
    topicos: [
      {
        id: "set1",
        titulo: "Nivelamento da Mesa",
        conteudo:
          "O segredo está na resistência do papel. O bico deve 'beliscar' o papel sem travar. Para sensores como BLTouch/CRTouch, calibre o Z-Offset com precisão de 0.01mm. Mesa mal nivelada é a causa de 90% das falhas de adesão.",
        nivel: "Essencial",
        atualizado: "REV 2026.04",
        gcode: "G28 ; Home All\nG29 ; Auto Bed Leveling\nM500 ; Salvar na EEPROM",
      },
      {
        id: "set2",
        titulo: "Calibração de E-Steps",
        conteudo:
          "Sincronize o motor da extrusora com o fluxo real. Se você pede 100mm e a máquina puxa 95mm, suas peças serão frágeis. Calibrar os passos do motor garante que a extrusão seja volumétricamente exata.",
        nivel: "Técnico",
        atualizado: "REV 2026.04",
      },
      {
        id: "set3",
        titulo: "Torre de Temperatura e PID",
        conteudo:
          "Não confie no rótulo do filamento. Imprima uma torre de temperatura para cada marca nova. Sintonize o PID (M303) para evitar oscilações na mesa e no bico que causam texturas indesejadas.",
        nivel: "Avançado",
        atualizado: "REV 2026.04",
        gcode: "M303 E0 S210 C10 ; Autotune PID",
      },
    ],
  },
  {
    id: "02",
    titulo: "Fluxo de Produção",
    subtitulo: "Eficiência e Oficina",
    icone: Factory,
    corPaleta: "zinc",
    cor: "text-zinc-500",
    fundo: "bg-zinc-500/10",
    topicos: [
      {
        id: "pr1",
        titulo: "Agrupar por Cores",
        conteudo:
          "Agrupe várias peças da mesma cor no mesmo fatiamento. Menos trocas de rolo significam menos chances de erro e economia de tempo de aquecimento da mesa.",
        nivel: "Iniciante",
        atualizado: "REV 2026.04",
      },
      {
        id: "pr2",
        titulo: "Cuidado com Peças Longas",
        conteudo:
          "Impressões de +12h são críticas. Se possível, divida o modelo em partes com pinos de encaixe. É melhor colar partes do que perder 20 horas de trabalho em uma interrupção.",
        nivel: "Segurança",
        atualizado: "REV 2026.04",
      },
      {
        id: "pr3",
        titulo: "Manutenção Preventiva",
        conteudo:
          "Limpe os trilhos e lubrifique os eixos a cada 100 horas. Um parafuso solto por vibração ou correia frouxa pode arruinar uma produção inteira de quilos de filamento.",
        nivel: "Essencial",
        atualizado: "REV 2026.04",
      },
    ],
  },
  {
    id: "03",
    titulo: "Resolução de Problemas",
    subtitulo: "Manutenção Corretiva",
    icone: AlertTriangle,
    corPaleta: "rose",
    cor: "text-rose-500",
    fundo: "bg-rose-500/10",
    topicos: [
      {
        id: "e1",
        titulo: "Bico Entupido (Clog)",
        conteudo:
          "Se a extrusora estala ou não sai plástico, seu bico está sujo. Use o 'Cold Pull' (Puxada a Frio) a 90°C para remover carbonização interna. Nunca use agulhas com o bico frio!",
        nivel: "Crítico",
        atualizado: "REV 2026.04",
        gcode: "M104 S220 ; Aquecer\nM109 S90 ; Aguardar resfriamento",
      },
      {
        id: "e2",
        titulo: "Peça Soltando (Warping)",
        conteudo:
          "Cantos levantando? Mesa suja. Lave com detergente neutro e água para remover gordura. Verifique correntes de ar frio e use abas (Brim) se o material for PETG ou ABS.",
        nivel: "Frequente",
        atualizado: "REV 2026.04",
      },
      {
        id: "e3",
        titulo: "Layer Shift (Degraus)",
        conteudo:
          "Se a peça deu um 'pulo' lateral, verifique se os cabos não prenderam no chassi ou se a aceleração nos motores está muito alta provocando perda de passos.",
        nivel: "Mecânica",
        atualizado: "REV 2026.04",
      },
    ],
  },
  {
    id: "04",
    titulo: "Segredos dos Materiais",
    subtitulo: "Química e Aplicação",
    icone: Thermometer,
    corPaleta: "amber",
    cor: "text-amber-500",
    fundo: "bg-amber-500/10",
    topicos: [
      {
        id: "mat1",
        titulo: "Gestão de Umidade",
        conteudo:
          "PETG e TPU são higroscópicos. A umidade causa bolhas e peças quebradiças. Use dry-boxes ou desidratadores. PLA deforma no sol (carro), reserve-o para decoração.",
        nivel: "Essencial",
        atualizado: "REV 2026.04",
      },
      {
        id: "mat2",
        titulo: "PLA vs PETG vs ABS",
        conteudo:
          "PLA para estética e facilidade. PETG para resistência química e externa. ABS para resistência térmica e acabamento (requer enclausuramento e ventilação controlada).",
        nivel: "Iniciante",
        atualizado: "REV 2026.04",
      },
      {
        id: "mat3",
        titulo: "TPU: Estratégia Flexível",
        conteudo:
          "Para imprimir 'borracha', reduza a velocidade para 20mm/s e desligue a retração. O filamento flexível dobra dentro do extrusor se for pressionado rapidamente.",
        nivel: "Intermediário",
        atualizado: "REV 2026.04",
      },
    ],
  },
  {
    id: "05",
    titulo: "Modelagem Maker",
    subtitulo: "Criação de Projetos",
    icone: PenTool,
    corPaleta: "purple",
    cor: "text-purple-500",
    fundo: "bg-purple-500/10",
    topicos: [
      {
        id: "des1",
        titulo: "Regra dos 45 Graus",
        conteudo:
          "Desenhe inclinações de até 45° para evitar suportes. Isso economiza material, tempo e melhora o acabamento superficial da peça final.",
        nivel: "Design",
        atualizado: "REV 2026.04",
      },
      {
        id: "des2",
        titulo: "Tolerância de Encaixes",
        conteudo:
          "Para encaixes mecânicos, deixe uma folga de 0.2mm entre as peças. Se desenhar o tamanho exato no CAD, a expansão térmica do plástico impedirá o encaixe.",
        nivel: "Técnico",
        atualizado: "REV 2026.04",
      },
    ],
  },
  {
    id: "06",
    titulo: "Vendas e Negócios",
    subtitulo: "Economia e Mercado",
    icone: Store,
    corPaleta: "emerald",
    cor: "text-emerald-500",
    fundo: "bg-emerald-500/10",
    topicos: [
      {
        id: "m1",
        titulo: "Cálculo de Preço Real",
        conteudo:
          "Não cobre só o material. Preço = (Luz + Filamento + Depreciação) + Sua Hora Técnica + Margem de Erro. Se não cobrar sua hora, você está pagando para trabalhar.",
        nivel: "Financeiro",
        atualizado: "REV 2026.04",
      },
      {
        id: "m2",
        titulo: "Licenciamento e Direitos",
        conteudo:
          "Vender Mario ou Marvel em marketplaces é arriscado (banimento). Foque em utilitários ou use licenças comerciais de criadores oficiais (Tribes/Patreon).",
        nivel: "Jurídico",
        atualizado: "REV 2026.04",
      },
      {
        id: "m3",
        titulo: "Foto que Vende",
        conteudo:
          "Não poste fotos da peça na impressora suja. Use um mini-estúdio ou fundo neutro. O cliente compra a peça pelo visual antes de entender a qualidade técnica.",
        nivel: "Vendas",
        atualizado: "REV 2026.04",
      },
    ],
  },
  {
    id: "07",
    titulo: "Alta Performance",
    subtitulo: "Tuning e Velocidade",
    icone: Zap,
    corPaleta: "orange",
    cor: "text-orange-500",
    fundo: "bg-orange-500/10",
    topicos: [
      {
        id: "t1",
        titulo: "Firmware Klipper",
        conteudo:
          "O Klipper processa os movimentos externamente em um Pi, permitindo dobrar a velocidade sem perder detalhes finos. Vital para farms de alta produtividade.",
        nivel: "Veterano",
        atualizado: "REV 2026.04",
      },
      {
        id: "t2",
        titulo: "Input Shaper e Pressure Advance",
        conteudo:
          "Compense as vibrações mecânicas da impressora para eliminar o 'Ghosting'. Ajuste a pressão no bico para ter quinas sharp e extrusão uniforme em altas velocidades.",
        nivel: "Avançado",
        atualizado: "REV 2026.04",
      },
    ],
  },
  {
    id: "08",
    titulo: "Segurança e Saúde",
    subtitulo: "Riscos da Oficina",
    icone: Flame,
    corPaleta: "rose",
    cor: "text-rose-600",
    fundo: "bg-rose-500/10",
    topicos: [
      {
        id: "s1",
        titulo: "Fumaça Tóxica (VOCs)",
        conteudo:
          "ABS, ASA e Resinas soltam vapores nocivos (estireno). Nunca imprima no quarto ou locais sem exaustão. Use filtros de carvão ativado e máscaras adequadas.",
        nivel: "Segurança",
        atualizado: "REV 2026.04",
      },
      {
        id: "s2",
        titulo: "Risco Elétrico e Incêndio",
        conteudo:
          "Verifique conectores de alta corrente (Mesa/Placa). Instale sensores de fumaça acima das máquinas. Segurança operacional vem antes do lucro imediato.",
        nivel: "Crítico",
        atualizado: "REV 2026.04",
        gcode: "M81 ; Shut down Power",
      },
    ],
  },
];

const FAQS: InterfaceFAQ[] = [
  {
    pergunta: "Como garantir que a precificação cobre custos invisíveis de impressão?",
    resposta:
      "O PrintLog considera não apenas o material, mas a depreciação de componentes (bicos, correias) e o consumo elétrico médio da sua máquina. Recomendamos adicionar uma 'Taxa de Risco' nas configurações para cobrir falhas inesperadas em peças de longa duração.",
  },
  {
    pergunta: "Como garantir que a precificação cobre todos os custos invisíveis?",
    resposta:
      "O PrintLog calcula automaticamente material, depreciação de componentes (bicos, correias, rodas dentadas), consumo elétrico por hora e custo de mão de obra. Ative a 'Taxa de Risco' nas configurações para adicionar uma margem percentual que cobre refugos, reimpressões e falhas inesperadas.",
  },
  {
    pergunta: "O sistema faz o abatimento de estoque automaticamente pelo fatiador?",
    resposta:
      "O fatiador fornece a estimativa de peso, mas para máxima fidelidade, o PrintLog exige a inserção manual do peso final (incluindo suportes). Isso garante que seu estoque de filamento seja real e fidedigno, evitando interrupções por falta de material no meio da produção.",
  },
  {
    pergunta: "O sistema gera relatórios de lucratividade por pedido e período?",
    resposta:
      "Sim. O módulo financeiro mostra margem bruta e líquida por pedido, cliente, material e período. Dashboards com ticket médio, custo por hora de impressão e ROI por máquina. Exporte para Excel ou integre via API com seu sistema contábil.",
  },
  {
    pergunta: "Como o PrintLog protege meus dados de faturamento e clientes?",
    resposta:
      "Operamos sob arquitetura 'Privacy by Design'. Todos os dados de clientes e orçamentos são criptografados e seguem rigorosamente a LGPD. Você tem autonomia total para exportar bases de dados ou solicitar o apagamento definitivo ('Direito ao Esquecimento') a qualquer momento.",
  },
];

export function PaginaAjuda() {
  const [busca, definirBusca] = useState("");
  const [abrirSuporte, definirAbrirSuporte] = useState(false);
  const [topicoSelecionado, definirTopicoSelecionado] = useState<InterfaceTopico | null>(null);

  const wikiFiltrada = useMemo(() => {
    const termo = busca.toLowerCase();
    return WIKI_EXTENDIDA.map((categoria) => ({
      ...categoria,
      topicos: categoria.topicos.filter(
        (t) => t.titulo.toLowerCase().includes(termo) || t.conteudo.toLowerCase().includes(termo),
      ),
    })).filter((c) => c.topicos.length > 0 || busca === "");
  }, [busca]);

  const faqsFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();
    return FAQS.filter((f) => f.pergunta.toLowerCase().includes(termo) || f.resposta.toLowerCase().includes(termo));
  }, [busca]);

  const todosTopicosEncontrados = useMemo(() => {
    if (!busca) return [];
    const termo = busca.toLowerCase();
    return WIKI_EXTENDIDA.flatMap((c) =>
      c.topicos
        .filter((t) => t.titulo.toLowerCase().includes(termo) || t.conteudo.toLowerCase().includes(termo))
        .map((t) => ({ ...t, categoria: c.titulo, cor: c.cor })),
    );
  }, [busca]);

  usarDefinirCabecalho({
    titulo: "Central Maker",
    subtitulo: "Hub de inteligência técnica e suporte estratégico",
    placeholderBusca: "PESQUISAR MANUAIS OU DÚVIDAS TÉCNICAS...",
    aoBuscar: (t) => definirBusca(t),
    acao: {
      texto: "Canais de Suporte",
      icone: MessageCircle,
      aoClicar: () => definirAbrirSuporte(true),
    },
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* VISUALIZAÇÃO DE RESULTADOS DE BUSCA */}
      {busca && (
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/[0.04] pb-6">
            <div className="flex items-center gap-3">
              <Search size={18} style={{ color: "var(--cor-primaria)" }} />
              <h2 className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">
                Resultados para: <span style={{ color: "var(--cor-primaria)" }}>"{busca}"</span>
              </h2>
            </div>
            <button
              onClick={() => definirBusca("")}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Limpar <X size={14} />
            </button>
          </div>

          {todosTopicosEncontrados.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {todosTopicosEncontrados.map((topico) => (
                <button
                  key={topico.id}
                  onClick={() => definirTopicoSelecionado(topico)}
                  className="flex items-center justify-between p-6 rounded-2xl bg-white dark:bg-card-fundo border border-gray-100 dark:border-white/[0.04] hover:bg-[var(--cor-primaria)]/5 transition-all group text-left shadow-sm hover:shadow-xl"
                  style={{ borderLeft: "4px solid var(--cor-primaria)" }}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-400`}
                      >
                        {topico.categoria}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-gray-800 dark:text-zinc-200 uppercase tracking-tight">
                      {topico.titulo}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-zinc-500 font-medium line-clamp-1">
                      {topico.conteudo}
                    </p>
                  </div>
                  <ChevronRight
                    size={18}
                    className="text-gray-300 group-hover:translate-x-1 transition-all"
                    style={{ color: "var(--cor-primaria)" }}
                  />
                </button>
              ))}
            </div>
          ) : (
            <EstadoVazio
              titulo="Nenhum resultado encontrado"
              descricao="Tente buscar por termos técnicos diferentes ou consulte as categorias abaixo."
              icone={Search}
            />
          )}
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL (OCULTO DURANTE BUSCA) */}
      {!busca && <GridWiki categorias={wikiFiltrada} aoSelecionarTopico={definirTopicoSelecionado} />}

      {/* FAQ SEMPRE DISPONÍVEL (FILTRADA) */}
      <SecaoFAQ faqs={faqsFiltradas} aoAbrirSuporte={() => definirAbrirSuporte(true)} />

      <RodapeLGPD />

      {/* MODAIS */}
      <ModalSuporte aberto={abrirSuporte} aoFechar={() => definirAbrirSuporte(false)} />

      <ModalDetalhesTopico topico={topicoSelecionado} aoFechar={() => definirTopicoSelecionado(null)} />
    </div>
  );
}
