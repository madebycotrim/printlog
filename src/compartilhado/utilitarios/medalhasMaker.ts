export type NivelMedalha = "bronze" | "prata" | "ouro" | "lendaria";
export type CategoriaMedalha = "impressao" | "materiais" | "negocio" | "estudio" | "especial";

export interface DefinicaoMedalha {
  id: string;
  titulo: string;
  descricao: string;
  categoria: CategoriaMedalha;
  nivel: NivelMedalha;
  iconeNome: string;
  corPrimaria: string; // classe Tailwind ou hex
  meta: number;
  unidade: string;
  calcular: (dados: DadosEstatisticasMaker) => {
    desbloqueada: boolean;
    progresso: number; // 0 a 100
    valorAtual: number;
  };
}

export interface MedalhaProcessada extends DefinicaoMedalha {
  desbloqueada: boolean;
  progresso: number;
  valorAtual: number;
}

export interface DadosEstatisticasMaker {
  totalMateriais: number;
  totalImpressoras: number;
  totalInsumos: number;
  totalClientes: number;
  totalOrcamentos: number;
  temEstudioConfigurado: boolean;
  temCustosConfigurados: boolean;
  diasAtivo?: number;
}

export const LISTA_MEDALHAS_MAKER: DefinicaoMedalha[] = [
  {
    id: "maker_pioneiro",
    titulo: "Maker Pioneiro",
    descricao: "Membro de honra e pioneiro na comunidade aberta do PrintLog.",
    categoria: "especial",
    nivel: "lendaria",
    iconeNome: "Sparkles",
    corPrimaria: "from-amber-400 to-amber-600",
    meta: 1,
    unidade: "comunidade",
    calcular: () => ({
      desbloqueada: true,
      progresso: 100,
      valorAtual: 1,
    }),
  },
  {
    id: "primeira_peca",
    titulo: "Primeira Peça",
    descricao: "Realizou o cálculo técnico do seu primeiro orçamento de impressão 3D.",
    categoria: "impressao",
    nivel: "bronze",
    iconeNome: "Printer",
    corPrimaria: "from-sky-500 to-blue-600",
    meta: 1,
    unidade: "orçamento",
    calcular: (d) => {
      const atual = d.totalOrcamentos;
      return {
        desbloqueada: atual >= 1,
        progresso: Math.min(100, Math.round((atual / 1) * 100)),
        valorAtual: atual,
      };
    },
  },
  {
    id: "alquimista_filamento",
    titulo: "Alquimista do PLA",
    descricao: "Cadastrou 3 ou mais filamentos ou resinas em seu inventário técnico.",
    categoria: "materiais",
    nivel: "bronze",
    iconeNome: "Layers",
    corPrimaria: "from-amber-500 to-orange-600",
    meta: 3,
    unidade: "materiais",
    calcular: (d) => {
      const atual = d.totalMateriais;
      return {
        desbloqueada: atual >= 3,
        progresso: Math.min(100, Math.round((atual / 3) * 100)),
        valorAtual: atual,
      };
    },
  },
  {
    id: "mestre_cores",
    titulo: "Mestre das Cores",
    descricao: "Acervo diversificado com 8 ou mais filamentos e cores cadastrados.",
    categoria: "materiais",
    nivel: "prata",
    iconeNome: "Palette",
    corPrimaria: "from-purple-500 to-pink-600",
    meta: 8,
    unidade: "materiais",
    calcular: (d) => {
      const atual = d.totalMateriais;
      return {
        desbloqueada: atual >= 8,
        progresso: Math.min(100, Math.round((atual / 8) * 100)),
        valorAtual: atual,
      };
    },
  },
  {
    id: "comandante_farm",
    titulo: "Comandante de Farm",
    descricao: "Escalando sua fazenda com 2 ou mais impressoras 3D configuradas.",
    categoria: "impressao",
    nivel: "prata",
    iconeNome: "Cpu",
    corPrimaria: "from-emerald-500 to-teal-600",
    meta: 2,
    unidade: "máquinas",
    calcular: (d) => {
      const atual = d.totalImpressoras;
      return {
        desbloqueada: atual >= 2,
        progresso: Math.min(100, Math.round((atual / 2) * 100)),
        valorAtual: atual,
      };
    },
  },
  {
    id: "imperio_industrial",
    titulo: "Império da Manufatura",
    descricao: "Operação profissional de ponta com 4 ou mais impressoras ativas.",
    categoria: "impressao",
    nivel: "ouro",
    iconeNome: "Flame",
    corPrimaria: "from-amber-500 to-red-600",
    meta: 4,
    unidade: "máquinas",
    calcular: (d) => {
      const atual = d.totalImpressoras;
      return {
        desbloqueada: atual >= 4,
        progresso: Math.min(100, Math.round((atual / 4) * 100)),
        valorAtual: atual,
      };
    },
  },
  {
    id: "almoxarifado_blindado",
    titulo: "Almoxarifado Técnico",
    descricao: "Controle refinado com 3 ou mais insumos secundários catalogados.",
    categoria: "materiais",
    nivel: "bronze",
    iconeNome: "Boxes",
    corPrimaria: "from-cyan-500 to-blue-600",
    meta: 3,
    unidade: "insumos",
    calcular: (d) => {
      const atual = d.totalInsumos;
      return {
        desbloqueada: atual >= 3,
        progresso: Math.min(100, Math.round((atual / 3) * 100)),
        valorAtual: atual,
      };
    },
  },
  {
    id: "primeiro_cliente",
    titulo: "Primeiro Cliente",
    descricao: "Cadastrou seu primeiro cliente e iniciou sua esteira comercial.",
    categoria: "negocio",
    nivel: "bronze",
    iconeNome: "UserCheck",
    corPrimaria: "from-emerald-500 to-green-600",
    meta: 1,
    unidade: "cliente",
    calcular: (d) => {
      const atual = d.totalClientes;
      return {
        desbloqueada: atual >= 1,
        progresso: Math.min(100, Math.round((atual / 1) * 100)),
        valorAtual: atual,
      };
    },
  },
  {
    id: "carteira_expansao",
    titulo: "Negócio Validado",
    descricao: "Carteira comercial consolidada com 5 ou mais clientes cadastrados.",
    categoria: "negocio",
    nivel: "prata",
    iconeNome: "Briefcase",
    corPrimaria: "from-indigo-500 to-purple-600",
    meta: 5,
    unidade: "clientes",
    calcular: (d) => {
      const atual = d.totalClientes;
      return {
        desbloqueada: atual >= 5,
        progresso: Math.min(100, Math.round((atual / 5) * 100)),
        valorAtual: atual,
      };
    },
  },
  {
    id: "identidade_estudio",
    titulo: "Marca Maker",
    descricao: "Personalizou o estúdio com nome próprio, slogan ou identidade visual.",
    categoria: "estudio",
    nivel: "bronze",
    iconeNome: "Award",
    corPrimaria: "from-rose-500 to-pink-600",
    meta: 1,
    unidade: "estúdio",
    calcular: (d) => ({
      desbloqueada: d.temEstudioConfigurado,
      progresso: d.temEstudioConfigurado ? 100 : 0,
      valorAtual: d.temEstudioConfigurado ? 1 : 0,
    }),
  },
  {
    id: "precisao_cirurgica",
    titulo: "Precisão Cirúrgica",
    descricao: "Calibrou a taxa de energia por kWh e custo hora-máquina do seu estúdio.",
    categoria: "estudio",
    nivel: "ouro",
    iconeNome: "Target",
    corPrimaria: "from-teal-500 to-emerald-600",
    meta: 1,
    unidade: "configuração",
    calcular: (d) => ({
      desbloqueada: d.temCustosConfigurados,
      progresso: d.temCustosConfigurados ? 100 : 0,
      valorAtual: d.temCustosConfigurados ? 1 : 0,
    }),
  },
  {
    id: "lenda_manufatura",
    titulo: "Lenda Maker",
    descricao: "Acumulou 6 ou mais medalhas de honra no ecossistema PrintLog.",
    categoria: "especial",
    nivel: "lendaria",
    iconeNome: "Trophy",
    corPrimaria: "from-yellow-400 via-amber-500 to-red-500",
    meta: 6,
    unidade: "medalhas",
    calcular: (d) => {
      // Conta quantas outras medalhas (sem contar a própria lenda) foram desbloqueadas
      let contagem = 0;
      for (const m of LISTA_MEDALHAS_MAKER) {
        if (m.id !== "lenda_manufatura" && m.calcular(d).desbloqueada) {
          contagem++;
        }
      }
      return {
        desbloqueada: contagem >= 6,
        progresso: Math.min(100, Math.round((contagem / 6) * 100)),
        valorAtual: contagem,
      };
    },
  },
];

export function calcularMedalhas(dados: DadosEstatisticasMaker): MedalhaProcessada[] {
  return LISTA_MEDALHAS_MAKER.map((def) => {
    const res = def.calcular(dados);
    return {
      ...def,
      desbloqueada: res.desbloqueada,
      progresso: res.progresso,
      valorAtual: res.valorAtual,
    };
  });
}

export function obterTituloNivelMaker(totalConquistadas: number): {
  titulo: string;
  classeCor: string;
} {
  if (totalConquistadas >= 10) return { titulo: "Lenda da Impressão 3D", classeCor: "text-amber-400" };
  if (totalConquistadas >= 7) return { titulo: "Mestre Maker", classeCor: "text-purple-400" };
  if (totalConquistadas >= 4) return { titulo: "Maker Especialista", classeCor: "text-sky-400" };
  if (totalConquistadas >= 2) return { titulo: "Maker Prático", classeCor: "text-emerald-400" };
  return { titulo: "Maker Iniciante", classeCor: "text-zinc-400" };
}
