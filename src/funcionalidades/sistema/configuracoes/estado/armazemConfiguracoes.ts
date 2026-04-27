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
  custoEnergia: string;
  horaMaquina: string;
  horaOperador: string;
  margemLucro: string;
  nomeEstudio: string;
  sloganEstudio: string;
  plano: PlanoUsuario;
  cicloPagamento?: string;
  vencimentoPlano?: string | null;
  carregando: boolean;

  // Ações
  carregarDoD1: (usuarioId: string) => Promise<void>;
  definirCustoEnergia: (valor: string) => void;
  definirHoraMaquina: (valor: string) => void;
  definirHoraOperador: (valor: string) => void;
  definirMargemLucro: (valor: string) => void;
  definirIdentidadeEstudio: (nome: string, slogan: string) => void;
  definirPlano: (plano: PlanoUsuario) => void;
  salvarNoD1: (usuarioId: string) => Promise<void>;

  /** Reseta as configurações para os padrões de fábrica */
  resetarParaPadrao: () => void;
}

export const VALORES_PADRAO = {
  custoEnergia: "R$ 0,95",
  horaMaquina: "R$ 5,00",
  horaOperador: "R$ 20,00",
  margemLucro: "150,00%",
  nomeEstudio: "",
  sloganEstudio: "",
  plano: "PRO" as PlanoUsuario,
  cicloPagamento: "MENSAL",
  vencimentoPlano: null,
};

/**
 * Armazém de Configurações Operacionais.
 * Os dados são persistidos no Cloudflare D1 e carregados na inicialização.
 * Não usa mais localStorage — funciona entre dispositivos e browsers.
 */
export const usarArmazemConfiguracoes = create<ArmazemConfiguracoes>()(
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
      set({
        custoEnergia: dados.custoEnergia,
        horaMaquina: dados.horaMaquina,
        horaOperador: dados.horaOperador,
        margemLucro: dados.margemLucro,
        nomeEstudio: dados.nomeEstudio || "",
        sloganEstudio: dados.sloganEstudio || "",
        plano: dados.plano || "PRO",
        cicloPagamento: dados.cicloPagamento || "MENSAL",
        vencimentoPlano: dados.vencimentoPlano || null,
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
  definirIdentidadeEstudio: (nome, slogan) => set({ nomeEstudio: nome, sloganEstudio: slogan }),
  definirPlano: (plano) => set({ plano }),

  /**
   * Persiste o estado atual das configurações no D1.
   * Chamado quando o usuário clica em "Salvar" na página de Configurações.
   */
  salvarNoD1: async (usuarioId: string) => {
    const { custoEnergia, horaMaquina, horaOperador, margemLucro, nomeEstudio, sloganEstudio, plano } = get();
    await apiConfiguracoes.salvar({ custoEnergia, horaMaquina, horaOperador, margemLucro, nomeEstudio, sloganEstudio, plano }, usuarioId);
  },

  resetarParaPadrao: () => set(VALORES_PADRAO),
})));
