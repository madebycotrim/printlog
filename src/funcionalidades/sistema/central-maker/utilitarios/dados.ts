import { Settings, Factory, AlertTriangle, Thermometer, PenTool, Store, Zap, Flame, Wrench } from "lucide-react";

export interface InterfaceTopico {
  id: string;
  titulo: string;
  conteudo: string;
  nivel: string;
  atualizado: string;
  categoria?: string;
  cor?: string;
  validadoEngenharia?: boolean;
}

export interface InterfaceCategoria {
  id: string;
  titulo: string;
  subtitulo: string;
  icone: any;
  corPaleta: string;
  cor: string;
  fundo: string;
  topicos: InterfaceTopico[];
}

export interface InterfaceFAQ {
  pergunta: string;
  resposta: string;
}

export const WIKI_EXTENDIDA: InterfaceCategoria[] = [
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
        conteudo: "O segredo está na resistência do papel. O bico deve 'beliscar' o papel sem travar. Para sensores como BLTouch/CRTouch, calibre o Z-Offset com precisão de 0.01mm. Mesa mal nivelada é a causa de 90% das falhas de adesão.",
        nivel: "Essencial",
        atualizado: "REV 2026.04",
        validadoEngenharia: true,
      },
      {
        id: "set2",
        titulo: "Calibração de E-Steps",
        conteudo: "Sincronize o motor da extrusora com o fluxo real. Se você pede 100mm e a máquina puxa 95mm, suas peças serão frágeis. Calibrar os passos do motor garante que a extrusão seja volumétricamente exata.",
        nivel: "Técnico",
        atualizado: "REV 2026.04",
        validadoEngenharia: true,
      },
      {
        id: "set3",
        titulo: "Torre de Temperatura e PID",
        conteudo: "Não confie no rótulo do filamento. Imprima uma torre de temperatura para cada marca nova. Sintonize o PID (M303) para evitar oscilações na mesa e no bico que causam texturas indesejadas.",
        nivel: "Avançado",
        atualizado: "REV 2026.04",
        validadoEngenharia: true,
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
        conteudo: "Agrupe várias peças da mesma cor no mesmo fatiamento. Menos trocas de rolo significam menos chances de erro e economia de tempo de aquecimento da mesa.",
        nivel: "Iniciante",
        atualizado: "REV 2026.04",
      },
      {
        id: "pr2",
        titulo: "Cuidado com Peças Longas",
        conteudo: "Impressões de +12h são críticas. Se possível, divida o modelo em partes com pinos de encaixe. É melhor colar partes do que perder 20 horas de trabalho em uma interrupção.",
        nivel: "Segurança",
        atualizado: "REV 2026.04",
      },
      {
        id: "pr3",
        titulo: "Manutenção Preventiva",
        conteudo: "Limpe os trilhos e lubrifique os eixos a cada 100 horas. Um parafuso solto por vibração ou correia frouxa pode arruinar uma produção inteira de quilos de filamento.",
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
        conteudo: "Se a extrusora estala ou não sai plástico, seu bico está sujo. Use o 'Cold Pull' (Puxada a Frio) a 90°C para remover carbonização interna. Nunca use agulhas com o bico frio!",
        nivel: "Crítico",
        atualizado: "REV 2026.04",
      },
      {
        id: "e2",
        titulo: "Peça Soltando (Warping)",
        conteudo: "Cantos levantando? Mesa suja. Lave com detergente neutro e água para remover gordura. Verifique correntes de ar frio e use abas (Brim) se o material for PETG ou ABS.",
        nivel: "Frequente",
        atualizado: "REV 2026.04",
      },
      {
        id: "e3",
        titulo: "Layer Shift (Degraus)",
        conteudo: "Se a peça deu um 'pulo' lateral, verifique se os cabos não prenderam no chassi ou se a aceleração nos motores está muito alta provocando perda de passos.",
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
        conteudo: "PETG e TPU são higroscópicos. A umidade causa bolhas e peças quebradiças. Use dry-boxes ou desidratadores. PLA deforma no sol (carro), reserve-o para decoração.",
        nivel: "Essencial",
        atualizado: "REV 2026.04",
      },
      {
        id: "mat2",
        titulo: "PLA vs PETG vs ABS",
        conteudo: "PLA para estética e facilidade. PETG para resistência química e externa. ABS para resistência térmica e acabamento (requer enclausuramento e ventilação controlada).",
        nivel: "Iniciante",
        atualizado: "REV 2026.04",
      },
      {
        id: "mat3",
        titulo: "TPU: Estratégia Flexível",
        conteudo: "Para imprimir 'borracha', reduza a velocidade para 20mm/s e desligue a retração. O filamento flexível dobra dentro do extrusor se for pressionado rapidamente.",
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
        conteudo: "Desenhe inclinações de até 45° para evitar suportes. Isso economiza material, tempo e melhora o acabamento superficial da peça final.",
        nivel: "Design",
        atualizado: "REV 2026.04",
      },
      {
        id: "des2",
        titulo: "Tolerância de Encaixes",
        conteudo: "Para encaixes mecânicos, deixe uma folga de 0.2mm entre as peças. Se desenhar o tamanho exato no CAD, a expansão térmica do plástico impedirá o encaixe.",
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
        conteudo: "Não cobre só o material. Preço = (Luz + Filamento + Depreciação) + Sua Hora Técnica + Margem de Erro. Se não cobrar sua hora, você está pagando para trabalhar.",
        nivel: "Financeiro",
        atualizado: "REV 2026.04",
      },
      {
        id: "m2",
        titulo: "Licenciamento e Direitos",
        conteudo: "Vender Mario ou Marvel em marketplaces é arriscado (banimento). Foque em utilitários ou use licenças comerciais de criadores oficiais (Tribes/Patreon).",
        nivel: "Jurídico",
        atualizado: "REV 2026.04",
      },
      {
        id: "m3",
        titulo: "Foto que Vende",
        conteudo: "Não poste fotos da peça na impressora suja. Use um mini-estúdio ou fundo neutro. O cliente compra a peça pelo visual antes de entender a qualidade técnica.",
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
        conteudo: "O Klipper processa os movimentos externamente em um Pi, permitindo dobrar a velocidade sem perder detalhes finos. Vital para farms de alta produtividade.",
        nivel: "Veterano",
        atualizado: "REV 2026.04",
        validadoEngenharia: true,
      },
      {
        id: "t2",
        titulo: "Input Shaper e Pressure Advance",
        conteudo: "Compense as vibrações mecânicas da impressora para eliminar o 'Ghosting'. Ajuste a pressão no bico para ter quinas sharp e extrusão uniforme em altas velocidades.",
        nivel: "Avançado",
        atualizado: "REV 2026.04",
        validadoEngenharia: true,
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
        conteudo: "ABS, ASA e Resinas soltam vapores nocivos (estireno). Nunca imprima no quarto ou locais sem exaustão. Use filtros de carvão ativado e máscaras adequadas.",
        nivel: "Segurança",
        atualizado: "REV 2026.04",
      },
      {
        id: "s2",
        titulo: "Risco Elétrico e Incêndio",
        conteudo: "Verifique conectores de alta corrente (Mesa/Placa). Instale sensores de fumaça acima das máquinas. Segurança operacional vem antes do lucro imediato.",
        nivel: "Crítico",
        atualizado: "REV 2026.04",
        validadoEngenharia: true,
      },
    ],
  },
  {
    id: "09",
    titulo: "Plano de Manutenção",
    subtitulo: "Longevidade da Máquina",
    icone: Wrench,
    corPaleta: "indigo",
    cor: "text-indigo-500",
    fundo: "bg-indigo-500/10",
    topicos: [
      {
        id: "mnt1",
        titulo: "Rotina por Impressão",
        conteudo: "Limpeza da mesa com álcool isopropílico para garantir a aderência. Inspeção visual rápida em busca de restos de plástico no bico ou fiação solta antes de iniciar um novo trabalho.",
        nivel: "Diário",
        atualizado: "REV 2026.05",
      },
      {
        id: "mnt2",
        titulo: "Revisão de 50-100 Horas",
        conteudo: "Aperte correias e parafusos para evitar vibrações e desalinhamentos de camada. Refaça o nivelamento da mesa (mesmo com sensor) para garantir a perfeição da primeira camada.",
        nivel: "Intermediário",
        atualizado: "REV 2026.05",
      },
      {
        id: "mnt3",
        titulo: "Manutenção de 100-200 Horas",
        conteudo: "Lubrifique trilhos e guias com óleo leve ou graxa PTFE. Realize a limpeza 'Cold Pull' no bico para remover carbonizações e limpe a poeira das ventoinhas para evitar Heat Creep.",
        nivel: "Profundo",
        atualizado: "REV 2026.05",
      },
      {
        id: "mnt4",
        titulo: "Cuidados de Longo Prazo",
        conteudo: "Troque o bico a cada 3-6 meses ou se notar queda na qualidade. Verifique se o tubo de PTFE está queimado ou degradado na ponta e substitua se necessário.",
        nivel: "Sazonal",
        atualizado: "REV 2026.05",
      },
    ],
  },
];

export const FAQS: InterfaceFAQ[] = [
  {
    pergunta: "Eu preciso instalar algum programa no meu computador para usar?",
    resposta: "Não! O PrintLog é 100% em nuvem (Web-based). Você acessa direto do seu navegador, seja no Windows, Mac, Linux ou até mesmo no tablet, sem precisar baixar ou atualizar nada. Seus dados ficam salvos em tempo real.",
  },
  {
    pergunta: "Posso acessar e enviar orçamentos pelo meu celular?",
    resposta: "Com certeza. Toda a plataforma foi desenhada de forma responsiva. Você pode estar longe do estúdio e ainda sim calcular preços, cadastrar clientes e disparar orçamentos perfeitos pela tela do celular.",
  },
  {
    pergunta: "Posso gerenciar o estoque de mais de uma impressora 3D?",
    resposta: "Sim! Você pode cadastrar quantas impressoras quiser. Cada máquina terá seu próprio perfil de depreciação, vida útil e consumo elétrico, permitindo que você precifique uma peça na sua Ender 3 e outra na sua Bambu Lab com precisão absoluta.",
  },
  {
    pergunta: "Como exatamente o sistema calcula o custo de energia elétrica?",
    resposta: "Nós utilizamos o valor do kW/h da sua fatura de luz (que você cadastra nas Configurações) cruzado com a potência média de consumo de cada impressora da sua frota e o tempo exato de fatiamento da peça. O cálculo é minucioso e automático.",
  },
  {
    pergunta: "Como garantir que a precificação cobre todos os custos invisíveis?",
    resposta: "O PrintLog calcula automaticamente material, depreciação de componentes (bicos, correias, rodas dentadas), consumo elétrico por hora e custo de mão de obra. Ative a 'Taxa de Risco' nas configurações para adicionar uma margem percentual que cobre refugos, reimpressões e falhas inesperadas.",
  },
  {
    pergunta: "O sistema gera relatórios de lucratividade por pedido e período?",
    resposta: "Sim. O módulo financeiro mostra margem bruta e líquida por pedido, cliente, material e período. Dashboards com ticket médio, custo por hora de impressão e ROI por máquina. Exporte para Excel ou integre via API com seu sistema contábil.",
  },
  {
    pergunta: "Como o PrintLog protege meus dados perante a LGPD?",
    resposta: "Operamos sob a arquitetura 'Privacy by Design'. Todos os dados de clientes e orçamentos são protegidos por camadas de segurança e seguem rigorosamente a Lei Geral de Proteção de Dados (LGPD). Suas informações são sigilosas e nunca são comercializadas ou compartilhadas com terceiros.",
  },
  {
    pergunta: "Como posso exportar ou salvar um backup dos meus dados?",
    resposta: "Em conformidade com o direito à portabilidade (Art. 18 da LGPD), você pode baixar seus dados a qualquer instante. Acesse 'Configurações > Segurança e Privacidade' e clique em 'Exportar Dados' para receber todo o seu histórico de clientes, materiais e faturamentos em formato aberto.",
  },
  {
    pergunta: "Como faço para excluir minha conta e apagar meus registros?",
    resposta: "Garantimos o seu 'Direito ao Esquecimento'. Na seção de Segurança das configurações, você encontra a opção de exclusão definitiva. Essa ação expurga de forma irreversível todas as suas informações pessoais, orçamentos e cadastros dos nossos servidores principais, sem retenção indevida.",
  },
];
