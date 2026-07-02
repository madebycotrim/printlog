import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { useGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/useGerenciadorImpressoras";
import { useGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/useGerenciadorClientes";
import { BaseLegalLGPD } from "@/compartilhado/tipos/modelos";
import { useSearchParams } from "react-router-dom";
import { useStore } from "zustand";

// Zustand Store 
import { useArmazemCalculadora } from "./estado/armazemCalculadora";

// Componentes da Calculadora
import { CardIdentificacaoProjeto } from "./componentes/CardIdentificacaoProjeto";
import { CardEquipamento } from "./componentes/CardEquipamento";
import { CardMateriais } from "./componentes/CardMateriais";
import { CardPerdas } from "./componentes/CardPerdas";
import { CardInsumos } from "./componentes/CardInsumos";
import { CardCustosFixos } from "./componentes/CardCustosFixos";
import { CardProducao } from "./componentes/CardProducao";
import { CardModelagem } from "./componentes/CardModelagem";
import { CardOperacional } from "./componentes/CardOperacional";
import { CardLogistica } from "./componentes/CardLogistica";
import { PainelResultados } from "./componentes/PainelResultados";

export function PaginaCalculadoraV2() {
  const armazem = useArmazemCalculadora();
  const [searchParams] = useSearchParams();
  const idEdicao = searchParams.get("id") || searchParams.get("edicao");
  
  const { estado: estadoClientes, acoes: acoesClientes } = useGerenciadorClientes();
  const { estado: estadoImpressoras } = useGerenciadorImpressoras();
  const { materiais } = useArmazemMateriais();
  const { insumos: insumosEstoque } = useArmazemInsumos();

  // Estados locais da UI
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [descricaoProjeto, setDescricaoProjeto] = useState("");
  const [clienteProjetoId, setClienteProjetoId] = useState("");
  const [buscaClienteSeletor, setBuscaClienteSeletor] = useState("");
  const [abertoSeletorCliente, setAbertoSeletorCliente] = useState(false);
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  
  const [impressoraSelecionadaId, setImpressoraSelecionadaId] = useState("");
  const [abertoSeletorImpressora, setAbertoSeletorImpressora] = useState(false);
  
  const [buscaMaterial, setBuscaMaterial] = useState("");
  const [buscaInsumo, setBuscaInsumo] = useState("");
  
  const [mostrarPerdas, setMostrarPerdas] = useState(false);
  const [mostrarCustosFixos, setMostrarCustosFixos] = useState(false);
  const [abaResultado, setAbaResultado] = useState<'orcamento' | 'metricas'>('orcamento');

  // Inicialização de Títulos
  useDefinirCabecalho(useMemo(() => ({
    titulo: idEdicao ? "Editar Orçamento" : "Novo Orçamento",
    subtitulo: "Modo Profissional V2"
  }), [idEdicao]));

  // Handlers para Zustand
  const alternarMaterial = useCallback((id: string) => {
    const existe = armazem.materiaisSelecionados.some(m => m.id === id);
    if (existe) {
      armazem.removerMaterial(id);
    } else {
      const mat = materiais.find(m => m.id === id);
      if (mat) {
        armazem.adicionarMaterial({
          id: mat.id,
          instanceId: Math.random().toString(36).substring(2, 15),
          nome: mat.nome,
          cor: mat.cor,
          tipo: mat.tipo,
          tipoMaterial: mat.tipoMaterial || '',
          quantidade: 0,
          precoKgCentavos: Math.round((mat.precoCentavos / mat.pesoGramas) * 1000)
        });
      }
    }
  }, [armazem, materiais]);

  const atualizarQtdMaterial = useCallback((uid: string, qtd: number) => {
    armazem.atualizarMaterial(uid, { quantidade: qtd });
  }, [armazem]);

  const atualizarPrecoMaterial = useCallback((uid: string, precoKg: number) => {
    armazem.atualizarMaterial(uid, { precoKgCentavos: Math.round(precoKg * 100) });
  }, [armazem]);

  const atualizarTempoMaterial = useCallback((uid: string, horas: number, minutos: number, segundos: number = 0) => {
    armazem.atualizarMaterial(uid, { tempoHoras: horas, tempoMinutos: minutos, tempoSegundos: segundos });
    const newState = armazem.materiaisSelecionados.map(m => (m.instanceId || m.id) === uid ? { ...m, tempoHoras: horas, tempoMinutos: minutos, tempoSegundos: segundos } : m);
    const totalMinutos = newState.reduce((acc, m) => acc + (m.tempoHoras || 0) * 60 + (m.tempoMinutos || 0) + (m.tempoSegundos || 0) / 60, 0);
    armazem.setParametro('tempoMinutosMaquina', totalMinutos);
  }, [armazem]);

  const atualizarNomePecaMaterial = useCallback((uid: string, nome: string) => {
    armazem.atualizarMaterial(uid, { nomePeca: nome });
  }, [armazem]);

  const adicionarSubPeca = useCallback((idMaterial: string) => {
    const mat = materiais.find(m => m.id === idMaterial);
    if (mat) {
      armazem.adicionarMaterial({
        id: mat.id,
        instanceId: Math.random().toString(36).substring(2, 15),
        nome: mat.nome,
        cor: mat.cor,
        tipo: mat.tipo,
        tipoMaterial: mat.tipoMaterial || '',
        quantidade: 0,
        precoKgCentavos: Math.round((mat.precoCentavos / mat.pesoGramas) * 1000)
      });
    }
  }, [armazem, materiais]);

  // Hook Temporal do Zundo
  const undo = useStore(useArmazemCalculadora.temporal, (state) => state.undo);
  const redo = useStore(useArmazemCalculadora.temporal, (state) => state.redo);
  const pastStates = useStore(useArmazemCalculadora.temporal, (state) => state.pastStates);
  const futureStates = useStore(useArmazemCalculadora.temporal, (state) => state.futureStates);

  // Atalhos de teclado (Ctrl+Z / Ctrl+Y)
  useEffect(() => {
    const lidarComTeclado = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') { e.preventDefault(); undo(); }
        if (e.key === 'y' || (e.shiftKey && e.key === 'Z')) { e.preventDefault(); redo(); }
      }
    };
    window.addEventListener('keydown', lidarComTeclado);
    return () => window.removeEventListener('keydown', lidarComTeclado);
  }, [undo, redo]);

  return (
    <div className="absolute inset-0 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-y-auto xl:overflow-hidden px-4 sm:px-6 md:px-12 pb-24 xl:pb-0 bg-background pt-8">
      
      {/* PAINEL ESQUERDO: Lista Completa */}
      <div className="xl:col-span-8 relative space-y-6 h-auto xl:h-full overflow-y-visible xl:overflow-y-auto pb-10 xl:pb-20 scrollbar-hide">
        
        {/* Botões Histórico Temporal Flutuantes */}
        <div className="sticky top-0 right-0 z-50 flex justify-end mb-4 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1 bg-card border border-borda-sutil p-1 rounded-full shadow-lg backdrop-blur-md bg-opacity-90">
            <button 
              onClick={() => undo()} 
              disabled={pastStates.length === 0} 
              className="p-2 rounded-full text-zinc-500 hover:text-primary hover:bg-muted disabled:opacity-30 transition-all group relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
            </button>
            <div className="w-[1px] h-4 bg-borda-sutil"></div>
            <button 
              onClick={() => redo()} 
              disabled={futureStates.length === 0} 
              className="p-2 rounded-full text-zinc-500 hover:text-primary hover:bg-muted disabled:opacity-30 transition-all group relative"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          <div className="lg:col-span-8 h-full">
            <CardIdentificacaoProjeto
              buscaCliente={buscaClienteSeletor} setBuscaCliente={setBuscaClienteSeletor}
              abertoSeletorCliente={abertoSeletorCliente} setAbertoSeletorCliente={setAbertoSeletorCliente}
              clientes={estadoClientes.clientes || []} clienteId={clienteProjetoId} setClienteId={setClienteProjetoId}
              criandoNovoCliente={criandoNovoCliente}
              aoCriarNovoCliente={async (nome) => {
                setCriandoNovoCliente(true);
                try {
                  const novo = await acoesClientes.salvarCliente({ 
                    nome, tipo: "B2C", baseLegal: BaseLegalLGPD.EXECUCAO_CONTRATO, finalidadeColeta: "Orçamento", prazoRetencaoMeses: 60
                  } as any);
                  if (novo?.id) { setClienteProjetoId(novo.id); setBuscaClienteSeletor(nome); setAbertoSeletorCliente(false); }
                } finally { setCriandoNovoCliente(false); }
              }}
              nomeProjeto={nomeProjeto} setNomeProjeto={setNomeProjeto}
              descricaoProjeto={descricaoProjeto} setDescricaoProjeto={setDescricaoProjeto}
              modoEntrada={armazem.modoEntrada} setModoEntrada={(v) => armazem.setParametro('modoEntrada', v)}
              quantidade={armazem.quantidade}
            />
          </div>
          <div className="lg:col-span-4 h-full">
            <CardEquipamento
              impressoras={estadoImpressoras.impressoras}
              impressoraSelecionadaId={impressoraSelecionadaId}
              aoSelecionar={(id) => {
                setImpressoraSelecionadaId(id);
                const imp = estadoImpressoras.impressoras.find(i => i.id === id);
                if (imp) {
                  armazem.setParametrosLote({ potenciaWatts: imp.potenciaWatts || 0, depreciacaoHoraCentavos: imp.taxaHoraCentavos || 0 });
                }
              }}
              aoAplicarSugestaoFalha={() => {
                // Aplica 15% do peso total de todos os materiais
                const pesoTotal = armazem.materiaisSelecionados.reduce((soma, m) => soma + m.quantidade, 0);
                const perdaSugerida = Math.round(pesoTotal * 0.15);
                armazem.setParametro('materialPerdidoGramas', perdaSugerida);
                setMostrarPerdas(true); // Abre o card de perdas para mostrar
                toast.success("15% de perda adicionados ao cálculo!");
              }}
              abertoSeletor={abertoSeletorImpressora} setAbertoSeletor={setAbertoSeletorImpressora}
            />
          </div>
        </div>

        <CardMateriais
          materiais={materiais.filter(m => !m.arquivado && m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()))}
          selecionados={armazem.materiaisSelecionados} alertas={[]} 
          busca={buscaMaterial} setBusca={setBuscaMaterial}
          alternar={alternarMaterial} atualizarQtd={atualizarQtdMaterial}
          atualizarPreco={atualizarPrecoMaterial} atualizarTempo={atualizarTempoMaterial}
          atualizarNomePeca={atualizarNomePecaMaterial} remover={armazem.removerMaterial}
          abrirArmazem={() => {}} abrirCriar={() => {}} alternarFavorito={() => {}} 
          adicionarPeca={adicionarSubPeca}
        />

        <CardPerdas
          mostrar={mostrarPerdas} setMostrar={setMostrarPerdas}
          materialPerdido={armazem.materialPerdidoGramas} setMaterialPerdido={v => armazem.setParametro('materialPerdidoGramas', v)}
          tempoPerdido={armazem.tempoPerdidoMinutos} setTempoPerdido={v => armazem.setParametro('tempoPerdidoMinutos', v)}
        />

        <CardInsumos
          insumos={insumosEstoque} selecionados={armazem.insumosSelecionados}
          alertas={[]} busca={buscaInsumo} setBusca={setBuscaInsumo}
          alternar={() => {}} atualizarQtd={() => {}} remover={armazem.removerInsumo}
          alternarPorLote={() => {}} abrirGerenciar={() => {}} abrirNovo={() => {}}
          modoEntrada={armazem.modoEntrada} alternarFavorito={() => {}}
        />

        <CardCustosFixos
          mostrar={mostrarCustosFixos} setMostrar={setMostrarCustosFixos}
          insumosFixos={armazem.insumosFixosCentavos} setInsumosFixos={v => armazem.setParametro('insumosFixosCentavos', v)}
          cobrarInsumosFixos={armazem.cobrarInsumosFixos} setCobrarInsumosFixos={v => armazem.setParametro('cobrarInsumosFixos', v)}
        />

        <CardProducao
          quantidade={armazem.quantidade} setQuantidade={v => armazem.setParametro('quantidade', v)}
          pecasPorMesa={armazem.pecasPorMesa} setPecasPorMesa={v => armazem.setParametro('pecasPorMesa', v)}
          tempo={armazem.tempoMinutosMaquina} setTempo={v => armazem.setParametro('tempoMinutosMaquina', v)}
          modoEntrada={armazem.modoEntrada}
          potencia={armazem.potenciaWatts} setPotencia={v => armazem.setParametro('potenciaWatts', v)}
          precoKwh={armazem.precoKwhCentavos} setPrecoKwh={v => armazem.setParametro('precoKwhCentavos', v)}
          custoEnergia={armazem.resultado.custoEnergia / 100}
          cobrarEnergia={armazem.cobrarEnergia} setCobrarEnergia={v => armazem.setParametro('cobrarEnergia', v)}
          posProcesso={armazem.itensPosProcesso} setPosProcesso={() => {}} 
          impressoras={estadoImpressoras.impressoras}
          idImpressoraSelecionada={impressoraSelecionadaId}
        />

        <CardModelagem
          tempoModelagem={armazem.tempoModelagemMinutos} setTempoModelagem={v => armazem.setParametro('tempoModelagemMinutos', v)}
          valorHoraModelagem={armazem.valorHoraModelagemCentavos} setValorHoraModelagem={v => armazem.setParametro('valorHoraModelagemCentavos', v)}
        />

        <CardOperacional
          maoDeObra={armazem.maoDeObraHoraCentavos} setMaoDeObra={v => armazem.setParametro('maoDeObraHoraCentavos', v)}
          margem={armazem.margemLucroPercentual} setMargem={v => armazem.setParametro('margemLucroPercentual', v)}
          depreciacao={armazem.depreciacaoHoraCentavos}
          cobrarDesgaste={armazem.cobrarDesgaste} setCobrarDesgaste={v => armazem.setParametro('cobrarDesgaste', v)}
          cobrarMaoDeObra={armazem.cobrarMaoDeObra} setCobrarMaoDeObra={v => armazem.setParametro('cobrarMaoDeObra', v)}
          anosVidaUtil={5} setAnosVidaUtil={() => {}}
          tempo={armazem.tempoMinutosMaquina} quantidade={armazem.quantidade}
          tempoSetup={armazem.tempoSetupMinutos} setTempoSetup={v => armazem.setParametro('tempoSetupMinutos', v)}
          aplicarTemplate={() => {}}
        />

        <CardLogistica
          perfis={[]} perfilAtivo={""} setPerfilAtivo={() => {}}
          taxaEcommerce={armazem.taxaEcommercePercentual} setTaxaEcommerce={v => armazem.setParametro('taxaEcommercePercentual', v)}
          taxaFixa={armazem.taxaFixaVendaCentavos} setTaxaFixa={v => armazem.setParametro('taxaFixaVendaCentavos', v)}
          frete={armazem.freteCentavos} setFrete={v => armazem.setParametro('freteCentavos', v)}
          abrirPerfis={() => {}} cobrarLogistica={armazem.cobrarLogistica} setCobrarLogistica={v => armazem.setParametro('cobrarLogistica', v)}
        />
        
      </div>

      {/* PAINEL DIREITO: Fixo */}
      <div className="xl:col-span-4 xl:h-full flex flex-col justify-start items-center overflow-y-visible scrollbar-hide">
        <PainelResultados
          calculo={armazem.resultado}
          dadosPizza={[]} 
          aba={abaResultado} setAba={setAbaResultado}
          salvarProjeto={async () => { toast.success("Orçamento salvo na versão 2.0!"); }}
          gerarPdf={() => toast.success("Gerador de PDF será portado na v2.0 completa.")}
          gerarLinkMagico={() => {}} obterUrlLinkMagico={() => ""}
          carregandoPdf={false}
          materiais={armazem.materiaisSelecionados} insumos={armazem.insumosSelecionados}
          posProcesso={armazem.itensPosProcesso} quantidade={armazem.quantidade}
          insumosFixos={armazem.insumosFixosCentavos} tempo={armazem.tempoMinutosMaquina}
          modoEntrada={armazem.modoEntrada} frete={armazem.freteCentavos}
          taxaFixa={armazem.taxaFixaVendaCentavos} aoSugerirPrecoIA={async () => {}}
          descontoVolume={armazem.descontoVolumePercentual} setDescontoVolume={v => armazem.setParametro('descontoVolumePercentual', v)}
          precoAlvoCentavos={armazem.precoAlvoCentavos} setPrecoAlvoCentavos={v => armazem.setParametro('precoAlvoCentavos', v)}
          explicacaoIA=""
        />
      </div>

    </div>
  );
}
