import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { apiConfiguracoes } from "../servicos/apiConfiguracoes";
import { PlanoUsuario } from "@/compartilhado/tipos/modelos";

/**
 * Interface para as configurações operacionais do estúdio.
 * Valores armazenados como string formatada para a UI — processados como
 * centavos pelas utilidades de cálculo.
 * Finalidade: Configuração de custo operacional | Base Legal: Contrato (Art. 7º, V — LGPD)
 */
interface ArmazemConfiguracoes {
  custoEnergia: number; // Centavos
  horaMaquina: number;  // Centavos
  horaOperador: number; // Centavos
  margemLucro: number;  // Pontos base (ex: 15000 = 150.00%)
  nomeEstudio: string;
  sloganEstudio: string;
  logoEstudio: string;
  plano: PlanoUsuario;
  cicloPagamento?: string;
  vencimentoPlano?: string | null;
  calculadoraMeta?: any;
  carregando: boolean;

  // Ações
  definirCalculadoraMeta: (meta: any) => void;
  carregarDoD1: (usuarioId: string) => Promise<void>;
  definirCustoEnergia: (valor: number) => void;
  definirHoraMaquina: (valor: number) => void;
  definirHoraOperador: (valor: number) => void;
  definirMargemLucro: (valor: number) => void;
  definirIdentidadeEstudio: (nome: string, slogan: string, logo: string) => void;
  definirPlano: (plano: PlanoUsuario) => void;
  salvarNoD1: (usuarioId: string) => Promise<void>;

  /** Reseta as configurações para os padrões de fábrica */
  resetarParaPadrao: () => void;
}

export const VALORES_PADRAO = {
  custoEnergia: 0,
  horaMaquina: 0,
  horaOperador: 0,
  margemLucro: 0,
  nomeEstudio: "",
  sloganEstudio: "",
  logoEstudio: "",
  plano: "FREE" as PlanoUsuario,
  cicloPagamento: "MENSAL",
  vencimentoPlano: null,
  calculadoraMeta: null,
};

/**
 * Armazém de Configurações Operacionais.
 * Os dados são persistidos no Cloudflare D1 e carregados na inicialização.
 * Não usa mais localStorage — funciona entre dispositivos e browsers.
 */
export const useArmazemConfiguracoes = create<ArmazemConfiguracoes>()(
  subscribeWithSelector((set, get) => ({
  ...VALORES_PADRAO,
  carregando: false,

  /**
   * Busca as configurações salvas no D1 para o usuário.
   * Chamado uma vez após o login, no contexto de autenticação.
   */
  carregarDoD1: async (usuarioId: string) => {
    set({ carregando: true });
    try {
      const dados = await apiConfiguracoes.buscar(usuarioId);
      
      // Função auxiliar para garantir que o valor seja numérico (suporta migração de strings legadas)
      const paraNumero = (v: any): number => {
        if (typeof v === 'number') return v;
        if (typeof v === 'string') {
           // Se for string formatada (ex: "R$ 0,95"), extrai e converte para centavos
           const num = parseFloat(v.replace(/[^\d,.-]/g, '').replace(',', '.'));
           return isNaN(num) ? 0 : Math.round(num * 100);
        }
        return 0;
      };

      set({
        custoEnergia: paraNumero(dados.custoEnergia),
        horaMaquina: paraNumero(dados.horaMaquina),
        horaOperador: paraNumero(dados.horaOperador),
        margemLucro: paraNumero(dados.margemLucro),
        nomeEstudio: dados.nomeEstudio || "",
        sloganEstudio: dados.sloganEstudio || "",
        logoEstudio: dados.logoEstudio || "",
        plano: dados.plano || "FREE",
        cicloPagamento: dados.cicloPagamento || "MENSAL",
        vencimentoPlano: dados.vencimentoPlano,
        calculadoraMeta: dados.calculadoraMeta,
      });
    } catch (erro) {
      // Se falhar, mantém os valores padrão silenciosamente
      console.warn("[configuracoes] Falha ao carregar do D1, usando valores padrão.", erro);
    } finally {
      set({ carregando: false });
    }
  },

  definirCustoEnergia: (valor) => set({ custoEnergia: valor }),
  definirHoraMaquina: (valor) => set({ horaMaquina: valor }),
  definirHoraOperador: (valor) => set({ horaOperador: valor }),
  definirMargemLucro: (valor) => set({ margemLucro: valor }),
  definirIdentidadeEstudio: (nome, slogan, logo) => set({ nomeEstudio: nome, sloganEstudio: slogan, logoEstudio: logo }),
  definirPlano: (plano: PlanoUsuario) => set({ plano }),
  definirCalculadoraMeta: (meta: any) => set({ calculadoraMeta: meta }),

  /**
   * Persiste o estado atual das configurações no D1.
   * Chamado quando o usuário clica em "Salvar" na página de Configurações.
   */
  salvarNoD1: async (usuarioId: string) => {
    const { custoEnergia, horaMaquina, horaOperador, margemLucro, nomeEstudio, sloganEstudio, logoEstudio, plano, calculadoraMeta } = get();
    await apiConfiguracoes.salvar({ custoEnergia, horaMaquina, horaOperador, margemLucro, nomeEstudio, sloganEstudio, logoEstudio, plano, calculadoraMeta }, usuarioId);
  },

  resetarParaPadrao: () => set(VALORES_PADRAO),
})));
