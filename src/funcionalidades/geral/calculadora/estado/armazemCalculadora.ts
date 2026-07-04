import { create } from 'zustand';
// Removed persist to keep calculator in memory only
import { temporal } from 'zundo';
import { ParametrosCalculo, executarMotorCalculo } from '../utilitarios/motorCalculo';
import { MaterialSelecionado, InsumoSelecionado, ItemPosProcesso, CalculoResultado } from '../tipos';

export interface OrcamentoSnapshot {
  id: string;
  data: string;
  nome: string;
  descricao?: string;
  clienteId?: string;
  parametros: ParametrosCalculo;
  resultado: CalculoResultado;
}

const estadoInicialParametros: ParametrosCalculo = {
  materiaisSelecionados: [],
  insumosSelecionados: [],
  itensPosProcesso: [],
  tempoMinutosMaquina: 0,
  potenciaWatts: 0,
  precoKwhCentavos: 0,
  maoDeObraHoraCentavos: 0,
  depreciacaoHoraCentavos: 0,
  margemLucroPercentual: 10000, 
  cobrarEnergia: true,
  cobrarDesgaste: true,
  cobrarMaoDeObra: true,
  cobrarInsumosFixos: true,
  cobrarLogistica: true,
  modoEntrada: 'lote',
  quantidade: 1,
  pecasPorMesa: 1,
  tempoSetupMinutos: 0,
  materialPerdidoGramas: 0,
  tempoPerdidoMinutos: 0,
  insumosFixosCentavos: 0,
  freteCentavos: 0,
  taxaEcommercePercentual: 0,
  taxaFixaVendaCentavos: 0,
  tempoModelagemMinutos: 0,
  valorHoraModelagemCentavos: 8000, 
  descontoVolumePercentual: 0,
  precoAlvoCentavos: 0,
};

const estadoInicialResultado: CalculoResultado = {
  custoMaterial: 0,
  custoEnergia: 0,
  custoMaoDeObra: 0,
  custoDepreciacao: 0,
  custoPosProcesso: 0,
  custoInsumos: 0,
  taxaMarketplace: 0,
  taxaComissao: 0,
  taxaFixaVenda: 0,
  custoFrete: 0,
  precoSugerido: 0,
  precoSugeridoOriginal: 0,
  precoAlvo: 0,
  lucroLiquido: 0,
  custoTotalOperacional: 0,
  margemReal: 0,
  custoFalha: 0,
  custoModelagem: 0,
  valorDesconto: 0,
  percentualDesconto: 0,
  modoEntrada: 'lote'
};

export interface EstadoCalculadora extends ParametrosCalculo {
  resultado: CalculoResultado;
  setParametro: <K extends keyof ParametrosCalculo>(chave: K, valor: ParametrosCalculo[K]) => void;
  setParametrosLote: (params: Partial<ParametrosCalculo>) => void;
  atualizarCalculo: () => void;
  adicionarMaterial: (m: MaterialSelecionado) => void;
  removerMaterial: (id: string) => void;
  atualizarMaterial: (id: string, updates: Partial<MaterialSelecionado>) => void;
  adicionarInsumo: (i: InsumoSelecionado) => void;
  removerInsumo: (id: string) => void;
  adicionarPosProcesso: (p: ItemPosProcesso) => void;
  removerPosProcesso: (id: string) => void;
  limpar: () => void;
  historico: OrcamentoSnapshot[];
  salvarSnapshot: (nome: string, descricao?: string, clienteId?: string) => void;
  carregarSnapshot: (snapshot: OrcamentoSnapshot) => void;
  removerSnapshot: (id: string) => void;
  definirHistorico: (historico: OrcamentoSnapshot[]) => void;
  restaurarRascunho: (rascunho: Partial<ParametrosCalculo>) => void;
  obterParametros: () => ParametrosCalculo;
  jaFoiInicializado: boolean;
  inicializarComConfiguracoes: (cfg: { precoKwhCentavos: number, maoDeObraHoraCentavos: number, margemLucroPercentual: number }) => void;
}

export const useArmazemCalculadora = create<EstadoCalculadora>()(
  temporal(
      (set, get) => ({
      ...estadoInicialParametros,
      resultado: estadoInicialResultado,
      historico: [],
      jaFoiInicializado: false,

      inicializarComConfiguracoes: (cfg) => {
        if (!get().jaFoiInicializado) {
          set({
            precoKwhCentavos: cfg.precoKwhCentavos,
            maoDeObraHoraCentavos: cfg.maoDeObraHoraCentavos,
            margemLucroPercentual: cfg.margemLucroPercentual,
            jaFoiInicializado: true
          });
          get().atualizarCalculo();
        }
      },

      setParametro: (chave, valor) => {
        set({ [chave]: valor });
        get().atualizarCalculo();
      },

      setParametrosLote: (params) => {
        set({ ...params });
        get().atualizarCalculo();
      },

      atualizarCalculo: () => {
        const estadoAtual = get();
        // Extrai apenas as propriedades que pertencem aos Parâmetros
        const parametros: ParametrosCalculo = {
          materiaisSelecionados: estadoAtual.materiaisSelecionados,
          insumosSelecionados: estadoAtual.insumosSelecionados,
          itensPosProcesso: estadoAtual.itensPosProcesso,
          tempoMinutosMaquina: estadoAtual.tempoMinutosMaquina,
          potenciaWatts: estadoAtual.potenciaWatts,
          precoKwhCentavos: estadoAtual.precoKwhCentavos,
          maoDeObraHoraCentavos: estadoAtual.maoDeObraHoraCentavos,
          depreciacaoHoraCentavos: estadoAtual.depreciacaoHoraCentavos,
          margemLucroPercentual: estadoAtual.margemLucroPercentual,
          cobrarEnergia: estadoAtual.cobrarEnergia,
          cobrarDesgaste: estadoAtual.cobrarDesgaste,
          cobrarMaoDeObra: estadoAtual.cobrarMaoDeObra,
          cobrarInsumosFixos: estadoAtual.cobrarInsumosFixos,
          cobrarLogistica: estadoAtual.cobrarLogistica,
          modoEntrada: estadoAtual.modoEntrada,
          quantidade: estadoAtual.quantidade,
          pecasPorMesa: estadoAtual.pecasPorMesa,
          tempoSetupMinutos: estadoAtual.tempoSetupMinutos,
          materialPerdidoGramas: estadoAtual.materialPerdidoGramas,
          tempoPerdidoMinutos: estadoAtual.tempoPerdidoMinutos,
          insumosFixosCentavos: estadoAtual.insumosFixosCentavos,
          freteCentavos: estadoAtual.freteCentavos,
          taxaEcommercePercentual: estadoAtual.taxaEcommercePercentual,
          taxaFixaVendaCentavos: estadoAtual.taxaFixaVendaCentavos,
          tempoModelagemMinutos: estadoAtual.tempoModelagemMinutos,
          valorHoraModelagemCentavos: estadoAtual.valorHoraModelagemCentavos,
          descontoVolumePercentual: estadoAtual.descontoVolumePercentual,
          precoAlvoCentavos: estadoAtual.precoAlvoCentavos,
        };

        const novoResultado = executarMotorCalculo(parametros);
        set({ resultado: novoResultado });
      },

      adicionarMaterial: (m) => {
        set((state) => ({ materiaisSelecionados: [...state.materiaisSelecionados, m] }));
        get().atualizarCalculo();
      },
      
      removerMaterial: (id) => {
        set((state) => ({ materiaisSelecionados: state.materiaisSelecionados.filter(mat => (mat.instanceId || mat.id) !== id) }));
        get().atualizarCalculo();
      },
      
      atualizarMaterial: (uid, updates) => {
        set((state) => {
          const novosMateriais = state.materiaisSelecionados.map((m) =>
            m.instanceId === uid ? { ...m, ...updates } : m
          );

          // Soma automática dos tempos das sub-peças (se existirem)
          let somaMinutos = 0;
          let temTempoIndividual = false;
          novosMateriais.forEach(m => {
            const horas = m.tempoHoras || 0;
            const min = m.tempoMinutos || 0;
            if (horas > 0 || min > 0) {
              temTempoIndividual = true;
              somaMinutos += (horas * 60) + min;
            }
          });

          return { 
            materiaisSelecionados: novosMateriais,
            ...(temTempoIndividual ? { tempoMinutosMaquina: somaMinutos } : {}) 
          };
        });
        get().atualizarCalculo();
      },

      adicionarInsumo: (i) => {
        set((state) => ({ insumosSelecionados: [...state.insumosSelecionados, i] }));
        get().atualizarCalculo();
      },

      removerInsumo: (id) => {
        set((state) => ({ insumosSelecionados: state.insumosSelecionados.filter(ins => ins.id !== id) }));
        get().atualizarCalculo();
      },

      adicionarPosProcesso: (p) => {
        set((state) => ({ itensPosProcesso: [...state.itensPosProcesso, p] }));
        get().atualizarCalculo();
      },

      removerPosProcesso: (id) => {
        set((state) => ({ itensPosProcesso: state.itensPosProcesso.filter(item => item.id !== id) }));
        get().atualizarCalculo();
      },

      limpar: () => {
        set({
          ...estadoInicialParametros,
          resultado: estadoInicialResultado,
          jaFoiInicializado: false
        });
      },

      salvarSnapshot: (nome, descricao, clienteId) => {
        const estadoAtual = get();
        const parametros: ParametrosCalculo = {
          materiaisSelecionados: estadoAtual.materiaisSelecionados,
          insumosSelecionados: estadoAtual.insumosSelecionados,
          itensPosProcesso: estadoAtual.itensPosProcesso,
          tempoMinutosMaquina: estadoAtual.tempoMinutosMaquina,
          potenciaWatts: estadoAtual.potenciaWatts,
          precoKwhCentavos: estadoAtual.precoKwhCentavos,
          maoDeObraHoraCentavos: estadoAtual.maoDeObraHoraCentavos,
          depreciacaoHoraCentavos: estadoAtual.depreciacaoHoraCentavos,
          margemLucroPercentual: estadoAtual.margemLucroPercentual,
          cobrarEnergia: estadoAtual.cobrarEnergia,
          cobrarDesgaste: estadoAtual.cobrarDesgaste,
          cobrarMaoDeObra: estadoAtual.cobrarMaoDeObra,
          cobrarInsumosFixos: estadoAtual.cobrarInsumosFixos,
          cobrarLogistica: estadoAtual.cobrarLogistica,
          modoEntrada: estadoAtual.modoEntrada,
          quantidade: estadoAtual.quantidade,
          pecasPorMesa: estadoAtual.pecasPorMesa,
          tempoSetupMinutos: estadoAtual.tempoSetupMinutos,
          materialPerdidoGramas: estadoAtual.materialPerdidoGramas,
          tempoPerdidoMinutos: estadoAtual.tempoPerdidoMinutos,
          insumosFixosCentavos: estadoAtual.insumosFixosCentavos,
          freteCentavos: estadoAtual.freteCentavos,
          taxaEcommercePercentual: estadoAtual.taxaEcommercePercentual,
          taxaFixaVendaCentavos: estadoAtual.taxaFixaVendaCentavos,
          tempoModelagemMinutos: estadoAtual.tempoModelagemMinutos,
          valorHoraModelagemCentavos: estadoAtual.valorHoraModelagemCentavos,
          descontoVolumePercentual: estadoAtual.descontoVolumePercentual,
          precoAlvoCentavos: estadoAtual.precoAlvoCentavos,
        };

        const novoSnapshot: OrcamentoSnapshot = {
          id: crypto.randomUUID(),
          data: new Date().toISOString(),
          nome,
          descricao,
          clienteId,
          parametros,
          resultado: estadoAtual.resultado,
        };

        set((state) => ({ historico: [novoSnapshot, ...state.historico] }));
      },

      carregarSnapshot: (snapshot) => {
        set({
          ...snapshot.parametros,
          resultado: snapshot.resultado,
        });
        get().atualizarCalculo();
      },

      removerSnapshot: (id) => {
        set((state) => ({ historico: state.historico.filter(h => h.id !== id) }));
      },

      definirHistorico: (historico) => {
        set({ historico });
      },

      restaurarRascunho: (rascunho) => {
        set({ ...rascunho });
        get().atualizarCalculo();
      },

      obterParametros: () => {
        const estadoAtual = get();
        return {
          materiaisSelecionados: estadoAtual.materiaisSelecionados,
          insumosSelecionados: estadoAtual.insumosSelecionados,
          itensPosProcesso: estadoAtual.itensPosProcesso,
          tempoMinutosMaquina: estadoAtual.tempoMinutosMaquina,
          potenciaWatts: estadoAtual.potenciaWatts,
          precoKwhCentavos: estadoAtual.precoKwhCentavos,
          maoDeObraHoraCentavos: estadoAtual.maoDeObraHoraCentavos,
          depreciacaoHoraCentavos: estadoAtual.depreciacaoHoraCentavos,
          margemLucroPercentual: estadoAtual.margemLucroPercentual,
          cobrarEnergia: estadoAtual.cobrarEnergia,
          cobrarDesgaste: estadoAtual.cobrarDesgaste,
          cobrarMaoDeObra: estadoAtual.cobrarMaoDeObra,
          cobrarInsumosFixos: estadoAtual.cobrarInsumosFixos,
          cobrarLogistica: estadoAtual.cobrarLogistica,
          modoEntrada: estadoAtual.modoEntrada,
          quantidade: estadoAtual.quantidade,
          pecasPorMesa: estadoAtual.pecasPorMesa,
          tempoSetupMinutos: estadoAtual.tempoSetupMinutos,
          materialPerdidoGramas: estadoAtual.materialPerdidoGramas,
          tempoPerdidoMinutos: estadoAtual.tempoPerdidoMinutos,
          insumosFixosCentavos: estadoAtual.insumosFixosCentavos,
          freteCentavos: estadoAtual.freteCentavos,
          taxaEcommercePercentual: estadoAtual.taxaEcommercePercentual,
          taxaFixaVendaCentavos: estadoAtual.taxaFixaVendaCentavos,
          tempoModelagemMinutos: estadoAtual.tempoModelagemMinutos,
          valorHoraModelagemCentavos: estadoAtual.valorHoraModelagemCentavos,
          descontoVolumePercentual: estadoAtual.descontoVolumePercentual,
          precoAlvoCentavos: estadoAtual.precoAlvoCentavos,
        };
      },

    })
    // Removed persist middleware to avoid saving sensitive budget data to localStorage
  )
);
