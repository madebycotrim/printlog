import { useState, useMemo, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Carregamento } from "@/compartilhado/componentes/Carregamento";
import {
  Download, 
  Crown,
  RotateCcw, 
  History as HistoryIcon, 
  Settings 
} from "lucide-react";
import { toast } from "react-hot-toast";
import { usarAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { usarDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { usarArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { usarArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { usarArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { usarGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/usarGerenciadorImpressoras";
import { usarGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/usarGerenciadorMateriais";
import { usarGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/usarGerenciadorInsumos";
import { usarPedidos } from "@/funcionalidades/producao/projetos/hooks/usarPedidos";
import { usarGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/usarGerenciadorClientes";
import { Dialogo } from "@/compartilhado/componentes/Dialogo";
import { FormularioMaterial } from "@/funcionalidades/producao/materiais/componentes/FormularioMaterial";
import { ModalGerenciamentoInsumo } from "@/funcionalidades/producao/insumos/componentes/ModalGerenciamentoInsumo";
import { formatarMoedaFinancas, formatarPorcentagem, extrairValorNumerico } from "@/compartilhado/utilitarios/formatadores";

// Hook e Componentes Refatorados
import { usarCalculadora } from "./hooks/usarCalculadora";
import { CardMateriais } from "./componentes/CardMateriais";
import { CardProducao } from "./componentes/CardProducao";
import { CardOperacional } from "./componentes/CardOperacional";
import { CardInsumos } from "./componentes/CardInsumos";
import { CardLogistica } from "./componentes/CardLogistica";
import { PainelResultados } from "./componentes/PainelResultados";
import { ModalHistorico } from "./componentes/ModalHistorico";
import { useNavigate, useSearchParams } from "react-router-dom";

// Novos Componentes Extraídos
import { CardIdentificacaoProjeto } from "./componentes/CardIdentificacaoProjeto";
import { CardEquipamento } from "./componentes/CardEquipamento";
import { CardPerdas } from "./componentes/CardPerdas";
import { CardCustosFixos } from "./componentes/CardCustosFixos";
import { ModalConfiguracoes } from "./componentes/ModalConfiguracoes";
import { ModalConfiguracaoFiscal } from "./componentes/ModalConfiguracaoFiscal";
import { ModalCanaisVenda } from "./componentes/ModalCanaisVenda";
import { ModalArmazemMateriais } from "./componentes/ModalArmazemMateriais";
import { ModalArmazemInsumos } from "./componentes/ModalArmazemInsumos";

export function PaginaCalculadora() {
  const { usuario } = usarAutenticacao();
  const navegar = useNavigate();
  const eProOuSuperior = useMemo(() => {
    const plano = ((usuario as any)?.plano || '').toUpperCase();
    const role = ((usuario as any)?.role || (usuario as any)?.cargo || '').toUpperCase();
    return ['PRO', 'FUNDADOR', 'MAKER_FUNDADOR', 'ADMIN'].includes(plano) ||
      ['PRO', 'FUNDADOR', 'MAKER_FUNDADOR', 'ADMIN'].includes(role) ||
      plano.includes('FUNDADOR') || role.includes('FUNDADOR');
  }, [usuario]);

  const config = usarArmazemConfiguracoes();
  const { estado: estadoClientes, acoes: acoesClientes } = usarGerenciadorClientes();
  const { estado } = usarGerenciadorImpressoras();
  const { impressorasFiltradas: impressoras = [] } = estado;
  const { materiais } = usarArmazemMateriais();
  const { insumos: insumosEstoque, adicionarOuAtualizarInsumo, abrirEditar: abrirCriarInsumo, modalCricaoAberto: modalInsumoAberto, fecharEditar: fecharInsumoAberto, insumoEditando } = usarArmazemInsumos();
  const { estado: estadoMateriais, acoes: acoesMateriais } = usarGerenciadorMateriais();
  const { acoes: acoesInsumos } = usarGerenciadorInsumos();

  // Hook Central de Inteligência
  const hook = usarCalculadora();
  const [searchParams] = useSearchParams();
  const idEdicao = searchParams.get("id");
  const { pedidos, criarPedido, atualizarPedido } = usarPedidos();

  // Estados de UI locais
  const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
  const [modalInsumosAberto, setModalInsumosAberto] = useState(false);
  const [modalCanaisAberto, setModalCanaisAberto] = useState(false);
  const [nomeProjeto, setNomeProjeto] = useState('');
  const [descricaoProjeto, setDescricaoProjeto] = useState('');
  const [clienteProjetoId, setClienteProjetoId] = useState('');
  const [buscaClienteSeletor, setBuscaClienteSeletor] = useState('');
  const [abertoSeletorCliente, setAbertoSeletorCliente] = useState(false);
  const [abertoSeletorImpressora, setAbertoSeletorImpressora] = useState(false);
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  const [modalConfigFiscalAberto, setModalConfigFiscalAberto] = useState(false);
  const [anosVidaUtil, setAnosVidaUtil] = useState<5 | 3 | 2>(() => {
    const salvo = localStorage.getItem("printlog_anos_vida_util");
    return salvo ? Number(salvo) as 5 | 3 | 2 : 5;
  });

  useEffect(() => {
    localStorage.setItem("printlog_anos_vida_util", String(anosVidaUtil));
  }, [anosVidaUtil]);
  const [indiceCanalSendoEditado, setIndiceCanalSendoEditado] = useState<number | null>(null);
  const [nomeCanalTemporario, setNomeCanalTemporario] = useState('');
  const [indiceFiscalSendoEditado, setIndiceFiscalSendoEditado] = useState<number | null>(null);
  const [nomeFiscalTemporario, setNomeFiscalTemporario] = useState('');
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [modalPdfAberto, setModalPdfAberto] = useState(false);

  const [mostrarPerdas, setMostrarPerdas] = useState(false);
  const [mostrarCustosFixos, setMostrarCustosFixos] = useState(false);
  const [abaResultado, setAbaResultado] = useState<'orcamento' | 'metricas'>('orcamento');

  // Resetar a calculadora ao sair da página (Sidebar, Navegação, etc)
  useEffect(() => {
    return () => {
      hook.limpar(true);
    };
  }, [hook.limpar]);

  const carregandoDados = estado.carregando || estadoMateriais.carregando;

  const [buscaMaterial, setBuscaMaterial] = useState("");
  const [buscaMaterialArmazem, setBuscaMaterialArmazem] = useState("");
  const [filtroTipoMaterial, setFiltroTipoMaterial] = useState<'TODOS' | 'FDM' | 'SLA'>('TODOS');
  const [buscaInsumo, setBuscaInsumo] = useState("");

  const materiaisFiltrados = useMemo(() => {
    let lista = materiais.filter(m => !m.arquivado);

    // Filtro por Tipo
    if (filtroTipoMaterial !== 'TODOS') {
      lista = lista.filter(m => m.tipo === filtroTipoMaterial);
    }

    if (!buscaMaterialArmazem) return lista;
    const termo = buscaMaterialArmazem.toLowerCase();
    return lista.filter(m =>
      m.nome.toLowerCase().includes(termo) ||
      m.fabricante?.toLowerCase().includes(termo) ||
      m.tipoMaterial?.toLowerCase().includes(termo)
    );
  }, [materiais, buscaMaterialArmazem, filtroTipoMaterial]);

  const insumosFiltrados = useMemo(() => {
    if (!buscaInsumo) return insumosEstoque;
    const termo = buscaInsumo.toLowerCase();
    return insumosEstoque.filter(i =>
      i.nome.toLowerCase().includes(termo) ||
      i.categoria?.toLowerCase().includes(termo)
    );
  }, [insumosEstoque, buscaInsumo]);

  const impressoraSelecionada = useMemo(() =>
    impressoras.find(i => i.id === hook.impressoraSelecionadaId),
    [impressoras, hook.impressoraSelecionadaId]
  );

  const alternarMaterial = useCallback((id: string) => {
    const jaSelecionado = hook.materiaisSelecionados.find(m => m.id === id);
    if (jaSelecionado) {
      hook.setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
    } else {
      const matOriginal = materiais.find(m => m.id === id);
      if (matOriginal) {
        hook.setMateriaisSelecionados(prev => [...prev, {
          id: matOriginal.id,
          nome: matOriginal.nome,
          cor: matOriginal.cor,
          tipo: matOriginal.tipo,
          tipoMaterial: matOriginal.tipoMaterial || '',
          quantidade: 0,
          precoKgCentavos: Math.round((matOriginal.precoCentavos / matOriginal.pesoGramas) * 1000)
        }]);
      }
    }
  }, [hook.materiaisSelecionados, materiais, hook.setMateriaisSelecionados]);

  const atualizarQtdMaterial = useCallback((id: string, qtd: number) => {
    hook.setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, quantidade: qtd } : m));
  }, [hook.setMateriaisSelecionados]);

  const atualizarPrecoMaterial = useCallback((id: string, precoKg: number) => {
    hook.setMateriaisSelecionados(prev => prev.map(m => m.id === id ? { ...m, precoKgCentavos: Math.round(precoKg * 100) } : m));
  }, [hook.setMateriaisSelecionados]);

  const removerMaterial = useCallback((id: string) => {
    hook.setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
  }, [hook.setMateriaisSelecionados]);

  // Lógica para carregar projeto existente (Edição)
  useEffect(() => {
    if (idEdicao && pedidos.length > 0) {
      const p = pedidos.find((item: any) => item.id === idEdicao);
      if (p) {
        setNomeProjeto(p.descricao || "");
        setDescricaoProjeto(p.observacoes || "");
        setClienteProjetoId(p.idCliente || "");
        
        // Carregar cliente no seletor
        const cli = (estadoClientes.clientes || []).find(c => c.id === p.idCliente);
        if (cli) setBuscaClienteSeletor(cli.nome);

        // Carregamento de Tempo (Prioriza split horas/minutos se existir)
        const cfg = p.configuracoes || {};
        const horas = cfg.tempoHoras ?? Math.floor((p.tempoMinutos ?? 0) / 60);
        const minutos = cfg.tempoMinutos ?? ((p.tempoMinutos ?? 0) % 60);
        hook.setTempo(horas * 60 + minutos);
        hook.setImpressoraSelecionadaId(p.idImpressora || "");
        
        // Carregar Materiais
        if (p.materiais && p.materiais.length > 0) {
          const matsPreenchidos = p.materiais.map((m: any) => {
            const original = materiais.find(mat => mat.id === m.idMaterial);
            return {
              id: m.idMaterial,
              nome: m.nome,
              quantidade: m.quantidadeGasta,
              precoKgCentavos: original ? Math.round((original.precoCentavos / original.pesoGramas) * 1000) : 0,
              cor: original?.cor || "#ffffff",
              tipo: original?.tipo || "FDM",
              tipoMaterial: original?.tipoMaterial || ""
            };
          });
          hook.setMateriaisSelecionados(matsPreenchidos);
        }

        // Carregar Insumos
        if (p.insumosSecundarios && p.insumosSecundarios.length > 0) {
          const insPreenchidos = p.insumosSecundarios.map((i: any) => ({
            id: i.idInsumo,
            nome: i.nome,
            quantidade: i.quantidade,
            custoCentavos: i.custoUnitarioCentavos
          }));
          hook.setInsumosSelecionados(insPreenchidos);
        }

        // Carregar Pós-Processamento
        if (p.posProcesso && p.posProcesso.length > 0) {
          hook.setItensPosProcesso(p.posProcesso);
        }

        // --- RESTAURAR TODAS AS VARIÁVEIS TÉCNICAS (v10.0) ---
        if (p.configuracoes) {
          const cfg = p.configuracoes;
          if (cfg.potencia !== undefined) hook.setPotencia(cfg.potencia);
          if (cfg.precoKwh !== undefined) hook.setPrecoKwh(cfg.precoKwh);
          if (cfg.maoDeObra !== undefined) hook.setMaoDeObra(cfg.maoDeObra);
          if (cfg.depreciacaoHora !== undefined) hook.setDepreciacaoHora(cfg.depreciacaoHora);
          if (cfg.margem !== undefined) hook.setMargem(cfg.margem);
          if (cfg.quantidade !== undefined) hook.setQuantidade(cfg.quantidade);
          if (cfg.modoEntrada !== undefined) hook.setModoEntrada(cfg.modoEntrada);
          if (cfg.tempoSetup !== undefined) hook.setTempoSetup(cfg.tempoSetup);
          if (cfg.taxaFalha !== undefined) hook.setTaxaFalha(cfg.taxaFalha);
          if (cfg.materialPerdido !== undefined) hook.setMaterialPerdido(cfg.materialPerdido);
          if (cfg.tempoPerdido !== undefined) hook.setTempoPerdido(cfg.tempoPerdido);
          if (cfg.frete !== undefined) hook.setFrete(cfg.frete);
          if (cfg.insumosFixos !== undefined) hook.setInsumosFixos(cfg.insumosFixos);
          
          // Toggles de Cobrança
          if (cfg.cobrarDesgaste !== undefined) hook.setCobrarDesgaste(cfg.cobrarDesgaste);
          if (cfg.cobrarMaoDeObra !== undefined) hook.setCobrarMaoDeObra(cfg.cobrarMaoDeObra);
          if (cfg.cobrarEnergia !== undefined) hook.setCobrarEnergia(cfg.cobrarEnergia);
          if (cfg.cobrarImpostos !== undefined) hook.setCobrarImpostos(cfg.cobrarImpostos);
          if (cfg.cobrarInsumosFixos !== undefined) hook.setCobrarInsumosFixos(cfg.cobrarInsumosFixos);
          if (cfg.cobrarLogistica !== undefined) hook.setCobrarLogistica(cfg.cobrarLogistica);
          
          // Perfis e Fiscal
          if (cfg.perfilAtivo !== undefined) hook.setPerfilAtivo(cfg.perfilAtivo);
          if (cfg.tipoOperacao !== undefined) hook.setTipoOperacao(cfg.tipoOperacao);
          if (cfg.impostos !== undefined) hook.setImpostos(cfg.impostos);
          if (cfg.icms !== undefined) hook.setIcms(cfg.icms);
          if (cfg.iss !== undefined) hook.setIss(cfg.iss);
        }
      }
    }
  }, [idEdicao, pedidos, materiais, estadoClientes.clientes]);

  const confirmarSalvarProjeto = async () => {
    if (!clienteProjetoId) {
      toast.error("Selecione um cliente para vincular ao projeto.");
      return;
    }

    try {
      // Trava de segurança: garante que valores desabilitados sejam zero absoluto
      const precoFinal = hook.calculo.precoSugerido;
      console.log("[Calculadora] Salvando projeto com valor (centavos):", precoFinal);

      const dadosBase = {
        idCliente: clienteProjetoId,
        descricao: nomeProjeto || "Orçamento sem nome",
        valorCentavos: precoFinal,
        material: hook.materiaisSelecionados.length > 0 ? hook.materiaisSelecionados.map((m: any) => m.nome).join(", ") : "Material Padrão",
        pesoGramas: hook.materiaisSelecionados.reduce((acc: number, m: any) => acc + m.quantidade, 0),
        tempoMinutos: Math.round(hook.tempo),
        idImpressora: hook.impressoraSelecionadaId,
        prazoEntrega: hook.estimativaPrazo.data,
        observacoes: descricaoProjeto?.includes("Gerado via calculadora") 
          ? descricaoProjeto 
          : descricaoProjeto 
            ? `${descricaoProjeto}\n\nGerado via calculadora em ${new Date().toLocaleDateString('pt-BR')}.` 
            : `Gerado via calculadora em ${new Date().toLocaleDateString('pt-BR')}.`,
        materiais: hook.materiaisSelecionados.map((m: any) => ({
          idMaterial: m.id,
          nome: m.nome,
          quantidadeGasta: m.quantidade
        })),
        insumosSecundarios: hook.insumosSelecionados.map((i: any) => ({
          idInsumo: i.id,
          nome: i.nome,
          quantidade: i.quantidade,
          custoUnitarioCentavos: i.custoCentavos
        })),
        posProcesso: hook.itensPosProcesso.map((p: any) => ({
          id: p.id,
          nome: p.nome,
          valor: p.valor
        })),
        configuracoes: {
          potencia: hook.potencia,
          precoKwh: hook.precoKwh,
          maoDeObra: hook.maoDeObra,
          depreciacaoHora: hook.depreciacaoHora,
          margem: hook.margem,
          quantidade: hook.quantidade,
          modoEntrada: hook.modoEntrada,
          tempoSetup: hook.tempoSetup,
          taxaFalha: hook.taxaFalha,
          materialPerdido: hook.materialPerdido,
          tempoPerdido: hook.tempoPerdido,
          frete: hook.frete,
          insumosFixos: hook.insumosFixos,
          tempoHoras: Math.floor(hook.tempo / 60),
          tempoMinutos: hook.tempo % 60,
          cobrarDesgaste: hook.cobrarDesgaste,
          cobrarMaoDeObra: hook.cobrarMaoDeObra,
          cobrarEnergia: hook.cobrarEnergia,
          cobrarImpostos: hook.cobrarImpostos,
          cobrarInsumosFixos: hook.cobrarInsumosFixos,
          cobrarLogistica: hook.cobrarLogistica,
          perfilAtivo: hook.perfilAtivo,
          tipoOperacao: hook.tipoOperacao,
          impostos: hook.impostos,
          icms: hook.icms,
          iss: hook.iss
        }
      };

      if (idEdicao) {
        await atualizarPedido({ ...dadosBase, id: idEdicao });
        toast.success("Projeto atualizado com sucesso!");
      } else {
        await criarPedido(dadosBase);
        toast.success("Orçamento salvo com sucesso!");
      }

      // Gerar link do WhatsApp se houver telefone
      const cliente = (estadoClientes.clientes || []).find((c: any) => c.id === clienteProjetoId);
      if (cliente?.telefone) {
        const mensagem = encodeURIComponent(
          `*ORÇAMENTO DE IMPRESSÃO 3D*\n\n` +
          `Olá ${cliente.nome.split(' ')[0]},\n` +
          `Segue o orçamento para: *${nomeProjeto}*\n\n` +
          `*Detalhes:* ${descricaoProjeto || 'Impressão personalizada'}\n` +
          `*Prazo est.:* ${hook.estimativaPrazo.data ? new Date(hook.estimativaPrazo.data).toLocaleDateString('pt-BR') : 'A combinar'}\n` +
          `*Valor:* R$ ${(hook.calculo.precoSugerido / 100).toFixed(2).replace('.', ',')}\n\n` +
          `_Gerado por PrintLog v2_`
        );
        
        const urlWhats = `https://wa.me/55${cliente.telefone.replace(/\D/g, '')}?text=${mensagem}`;
        
        toast((t) => (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold text-zinc-300">Deseja enviar para o WhatsApp do cliente?</span>
            <div className="flex gap-2">
              <a 
                href={urlWhats} 
                target="_blank" 
                rel="noreferrer"
                onClick={() => toast.dismiss(t.id)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all text-center flex-1"
              >
                Enviar Agora
              </a>
              <button 
                onClick={() => toast.dismiss(t.id)}
                className="bg-zinc-800 hover:bg-zinc-700 text-zinc-400 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Depois
              </button>
            </div>
          </div>
        ), { duration: 6000, position: 'bottom-right' });
      }

      // Resetar Formulário
      hook.limpar();
      setNomeProjeto("");
      setDescricaoProjeto("");
      setClienteProjetoId("");
      setBuscaClienteSeletor("");
      
      // Redirecionar para a fila de projetos
      navegar("/projetos");
    } catch (erro) {
      console.warn("Erro ao salvar projeto:", erro);
      hook.salvarSnapshot(nomeProjeto || "Orçamento via Calculadora");
      hook.limpar();
      setNomeProjeto("");
      setDescricaoProjeto("");
      setClienteProjetoId("");
      setBuscaClienteSeletor("");
    }
  };

  // Sincronizar potência e depreciação ao carregar ou mudar impressora
  useEffect(() => {
    if (impressoraSelecionada?.potenciaWatts) {
      hook.setPotencia(impressoraSelecionada.potenciaWatts);
    }

    // Sincroniza a depreciação (desgaste)
    if (impressoraSelecionada?.valorCompraCentavos) {
      // Cálculo automático inteligente baseado nos anos de vida útil selecionados
      const depreciacaoAnual = (impressoraSelecionada.valorCompraCentavos / 100) / anosVidaUtil;
      const depreciacaoMensal = depreciacaoAnual / 12;
      const taxaHoraReal = depreciacaoMensal / 240;
      hook.setDepreciacaoHora(Number(taxaHoraReal.toFixed(2)));
    } else if (impressoraSelecionada?.taxaHoraCentavos) {
      hook.setDepreciacaoHora(impressoraSelecionada.taxaHoraCentavos / 100);
    } else if (config?.horaMaquina) {
      hook.setDepreciacaoHora(extrairValorNumerico(config.horaMaquina));
    } else {
      hook.setDepreciacaoHora(0);
    }
  }, [impressoraSelecionada, config?.horaMaquina, anosVidaUtil, hook.setPotencia, hook.setDepreciacaoHora]);

  const alternarInsumo = useCallback((insumo: any) => {
    const existe = hook.insumosSelecionados.find(i => i.id === insumo.id);
    if (existe) hook.setInsumosSelecionados(prev => prev.filter(i => i.id !== insumo.id));
    else hook.setInsumosSelecionados(prev => [...prev, { 
      id: insumo.id, 
      nome: insumo.nome, 
      quantidade: 1, 
      custoCentavos: Math.round(insumo.custoMedioUnidade || 0),
      porLote: true 
    }]);
  }, [hook.insumosSelecionados, hook.setInsumosSelecionados]);

  const atualizarQtdInsumo = useCallback((id: string, qtd: number) => {
    hook.setInsumosSelecionados(prev => prev.map(i => i.id === id ? { ...i, quantidade: qtd } : i));
  }, [hook.setInsumosSelecionados]);

  const removerInsumo = useCallback((id: string) => {
    hook.setInsumosSelecionados(prev => prev.filter(i => i.id !== id));
  }, [hook.setInsumosSelecionados]);

  const alternarPorLoteInsumo = useCallback((id: string) => {
    hook.setInsumosSelecionados(prev => prev.map(i => i.id === id ? { ...i, porLote: !i.porLote } : i));
  }, [hook.setInsumosSelecionados]);

  const aoSelecionarImpressora = useCallback((id: string) => {
    hook.setImpressoraSelecionadaId(id);
    const imp = impressoras.find(i => i.id === id);
    if (imp?.potenciaWatts) hook.setPotencia(imp.potenciaWatts);
    if (imp?.taxaHoraCentavos) {
      const taxa = imp.taxaHoraCentavos / 100;
      hook.setDepreciacaoHora(taxa);
      config.definirHoraMaquina(formatarMoedaFinancas(taxa, 2));
    }
  }, [impressoras, hook.setImpressoraSelecionadaId, hook.setPotencia, hook.setDepreciacaoHora, config]);

  const abrirModalArmazem = useCallback(() => setModalArmazemAberto(true), []);
  const abrirCriarMaterial = useCallback(() => acoesMateriais.abrirEditar(null as any), [acoesMateriais]);
  const abrirModalInsumos = useCallback(() => setModalInsumosAberto(true), []);
  const abrirModalNovoInsumo = useCallback(() => abrirCriarInsumo(), [abrirCriarInsumo]);
  const abrirModalCanais = useCallback(() => setModalCanaisAberto(true), []);
  const dadosCabecalho = useMemo(() => ({
    titulo: idEdicao ? "Atualizar Inteligência" : "Precificação Inteligente",
    subtitulo: idEdicao ? `Editando: ${nomeProjeto}` : "Engenharia de custos e rentabilidade",
    ocultarBusca: true,
    elementoAcao: (
      <div className="flex items-center gap-1 p-1 bg-card/10 border border-borda-sutil rounded-2xl backdrop-blur-md">
        <button 
          onClick={() => hook.limpar()}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-card/20 transition-all"
          title="Limpar Calculadora"
        >
          <RotateCcw size={18} />
        </button>
        <button 
          onClick={() => setModalHistoricoAberto(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-card/20 transition-all"
          title="Ver Histórico"
        >
          <HistoryIcon size={18} />
        </button>
        <button 
          onClick={() => setModalConfigAberto(true)}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-card/20 transition-all"
          title="Configurações da Máquina"
        >
          <Settings size={18} />
        </button>
      </div>
    )
  }), [idEdicao, nomeProjeto, hook.limpar]);

  usarDefinirCabecalho(dadosCabecalho);

  return (
    <AnimatePresence mode="wait">
      {carregandoDados ? (
        <motion.div
          key="carregando"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-[#0c0c0e]"
        >
          <Carregamento tipo="ponto" mensagem="Sincronizando inteligência de custos..." />
        </motion.div>
      ) : (
        <motion.div
          key="conteudo"
          initial={{ opacity: 0, scale: 0.99 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="absolute inset-0 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-hidden px-6 md:px-12"
        >
          <div className="xl:col-span-8 space-y-6 h-full overflow-y-auto pt-8 pb-20 scrollbar-hide">

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-8 h-full">
                <CardIdentificacaoProjeto
                  buscaCliente={buscaClienteSeletor}
                  setBuscaCliente={setBuscaClienteSeletor}
                  abertoSeletorCliente={abertoSeletorCliente}
                  setAbertoSeletorCliente={setAbertoSeletorCliente}
                  clientes={estadoClientes.clientes || []}
                  clienteId={clienteProjetoId}
                  setClienteId={setClienteProjetoId}
                  criandoNovoCliente={criandoNovoCliente}
                  aoCriarNovoCliente={async (nome) => {
                    setCriandoNovoCliente(true);
                    try {
                      const novo = await acoesClientes.salvarCliente({ nome });
                      if (novo && novo.id) {
                        setClienteProjetoId(novo.id);
                        setBuscaClienteSeletor(novo.nome);
                      }
                    } catch (e) {
                      toast.error("Erro ao criar contato.");
                    } finally {
                      setCriandoNovoCliente(false);
                      setAbertoSeletorCliente(false);
                    }
                  }}
                  nomeProjeto={nomeProjeto}
                  setNomeProjeto={setNomeProjeto}
                  descricaoProjeto={descricaoProjeto}
                  setDescricaoProjeto={setDescricaoProjeto}
                  modoEntrada={hook.modoEntrada}
                  setModoEntrada={hook.setModoEntrada}
                  quantidade={hook.quantidade}
                />
              </div>
              <div className="lg:col-span-4 h-full">
                <CardEquipamento
                  impressoras={impressoras}
                  impressoraSelecionadaId={hook.impressoraSelecionadaId}
                  aoSelecionar={hook.setImpressoraSelecionadaId}
                  abertoSeletor={abertoSeletorImpressora}
                  setAbertoSeletor={setAbertoSeletorImpressora}
                />
              </div>
            </div>

            <CardMateriais
              materiais={materiais.filter(m => !m.arquivado && m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()))}
              selecionados={hook.materiaisSelecionados}
              alertas={hook.alertasEstoque}
              busca={buscaMaterial}
              setBusca={setBuscaMaterial}
              alternar={alternarMaterial}
              atualizarQtd={atualizarQtdMaterial}
              atualizarPreco={atualizarPrecoMaterial}
              remover={removerMaterial}
              abrirArmazem={abrirModalArmazem}
              abrirCriar={abrirCriarMaterial}
              alternarFavorito={acoesMateriais.alternarFavorito}
            />

            <CardPerdas
              mostrar={mostrarPerdas}
              setMostrar={setMostrarPerdas}
              materialPerdido={hook.materialPerdido}
              setMaterialPerdido={hook.setMaterialPerdido}
              tempoPerdido={hook.tempoPerdido}
              setTempoPerdido={hook.setTempoPerdido}
            />

            <CardInsumos
              insumos={insumosFiltrados}
              selecionados={hook.insumosSelecionados}
              alertas={hook.alertasInsumos}
              busca={buscaInsumo} setBusca={setBuscaInsumo}
              alternar={alternarInsumo}
              atualizarQtd={atualizarQtdInsumo}
              remover={removerInsumo}
              alternarPorLote={alternarPorLoteInsumo}
              abrirGerenciar={abrirModalInsumos}
              abrirNovo={abrirModalNovoInsumo}
              modoEntrada={hook.modoEntrada}
              alternarFavorito={acoesInsumos.alternarFavorito}
            />

            <CardCustosFixos
              mostrar={mostrarCustosFixos}
              setMostrar={setMostrarCustosFixos}
              insumosFixos={hook.insumosFixos}
              setInsumosFixos={hook.setInsumosFixos}
              cobrarInsumosFixos={hook.cobrarInsumosFixos}
              setCobrarInsumosFixos={hook.setCobrarInsumosFixos}
            />

            <CardProducao
              quantidade={hook.quantidade} setQuantidade={hook.setQuantidade}
              tempo={hook.tempo} setTempo={hook.setTempo}
              modoEntrada={hook.modoEntrada}
              potencia={hook.potencia} setPotencia={hook.setPotencia}
              precoKwh={hook.precoKwh} setPrecoKwh={(v) => { hook.setPrecoKwh(v); config.definirCustoEnergia(formatarMoedaFinancas(v, 2)); }}
              custoEnergia={hook.calculo.custoEnergia / 100}
              cobrarEnergia={hook.cobrarEnergia} setCobrarEnergia={hook.setCobrarEnergia}
              posProcesso={hook.itensPosProcesso} setPosProcesso={hook.setItensPosProcesso}
              impressoras={impressoras}
              idImpressoraSelecionada={hook.impressoraSelecionadaId}
              aoSelecionarImpressora={aoSelecionarImpressora}
              aoDetectarTarifa={hook.detectarTarifa}
            />

            <CardOperacional
              maoDeObra={hook.maoDeObra} setMaoDeObra={(v) => { hook.setMaoDeObra(v); config.definirHoraOperador(formatarMoedaFinancas(v, 2)); }}
              margem={hook.margem} setMargem={(v) => { hook.setMargem(v); config.definirMargemLucro(formatarPorcentagem(String(v))); }}
              depreciacao={hook.depreciacaoHora}
              cobrarDesgaste={hook.cobrarDesgaste} setCobrarDesgaste={hook.setCobrarDesgaste}
              cobrarMaoDeObra={hook.cobrarMaoDeObra} setCobrarMaoDeObra={hook.setCobrarMaoDeObra}
              anosVidaUtil={anosVidaUtil} setAnosVidaUtil={setAnosVidaUtil}
              tempo={hook.tempo}
              quantidade={hook.quantidade}
              tempoSetup={hook.tempoSetup} 
              setTempoSetup={hook.setTempoSetup}
            />

            <CardLogistica
              perfis={hook.perfisMarketplace} perfilAtivo={hook.perfilAtivo} setPerfilAtivo={hook.setPerfilAtivo}
              taxaEcommerce={hook.taxaEcommerce} setTaxaEcommerce={hook.setTaxaEcommerce}
              taxaFixa={hook.taxaFixa} setTaxaFixa={hook.setTaxaFixa}
              frete={hook.frete} setFrete={hook.setFrete}
              abrirPerfis={abrirModalCanais}
              cobrarLogistica={hook.cobrarLogistica}
              setCobrarLogistica={hook.setCobrarLogistica}
            />

            {/* 
            <CardFiscal
              perfisFiscais={hook.perfisFiscais}
              tipoOperacao={hook.tipoOperacao} setTipoOperacao={hook.setTipoOperacao}
              impostos={hook.impostos} setImpostos={hook.setImpostos}
              icms={hook.icms} setIcms={hook.setIcms}
              iss={hook.iss} setIss={hook.setIss}
              cobrarImpostos={hook.cobrarImpostos} setCobrarImpostos={hook.setCobrarImpostos}
              abrirConfigFiscal={abrirModalFiscal}
            /> 
            */}
          </div>

          <div className="xl:col-span-4 h-full xl:sticky xl:top-0 flex flex-col justify-center items-center py-8 overflow-y-auto scrollbar-hide">
            <PainelResultados
              calculo={hook.calculo}
              dadosPizza={hook.dadosGraficoPizza}
              aba={abaResultado} setAba={setAbaResultado}
              salvarProjeto={confirmarSalvarProjeto}
              gerarPdf={() => {
                const clienteFinal = buscaClienteSeletor.trim() || "Consumidor Final";
                if (!eProOuSuperior) {
                  hook.gerarPdf("", "", clienteFinal, nomeProjeto, idEdicao || undefined);
                } else if (config.nomeEstudio.trim() !== "") {
                  hook.gerarPdf(config.nomeEstudio, config.sloganEstudio, clienteFinal, nomeProjeto, idEdicao || undefined);
                } else {
                  setModalPdfAberto(true);
                }
              }}
              carregandoPdf={false}
              materiais={hook.materiaisSelecionados}
              insumos={hook.insumosSelecionados}
              posProcesso={hook.itensPosProcesso}
              quantidade={hook.quantidade}
              insumosFixos={hook.insumosFixos}
              tempo={hook.tempo}
              modoEntrada={hook.modoEntrada}
              frete={hook.frete}
              taxaFixa={hook.taxaFixa}
            />
          </div>

          {/* Modais Refatorados */}
          <ModalConfiguracoes
            aberto={modalConfigAberto}
            aoFechar={() => setModalConfigAberto(false)}
            eProOuSuperior={eProOuSuperior}
            config={config}
            hook={hook}
            aoSalvar={async () => {
              config.definirCustoEnergia(config.custoEnergia && config.custoEnergia.trim() !== "" ? formatarMoedaFinancas(hook.precoKwh, 2) : "R$ 0,00");
              config.definirHoraOperador(config.horaOperador && config.horaOperador.trim() !== "" ? formatarMoedaFinancas(hook.maoDeObra, 2) : "R$ 0,00");
              config.definirHoraMaquina(config.horaMaquina && config.horaMaquina.trim() !== "" ? formatarMoedaFinancas(hook.depreciacaoHora, 3) : "R$ 0,000");
              config.definirMargemLucro(config.margemLucro && config.margemLucro.trim() !== "" ? formatarPorcentagem(String(hook.margem)) : "0,00%");
              if (usuario?.uid) {
                await config.salvarNoD1(usuario.uid);
                setModalConfigAberto(false);
                toast.success("Motores de custeio sincronizados!");
              }
            }}
          />

          <ModalConfiguracaoFiscal
            aberto={modalConfigFiscalAberto}
            aoFechar={() => setModalConfigFiscalAberto(false)}
            hook={hook}
            indiceSendoEditado={indiceFiscalSendoEditado}
            setIndiceSendoEditado={setIndiceFiscalSendoEditado}
            nomeTemporario={nomeFiscalTemporario}
            setNomeTemporario={setNomeFiscalTemporario}
          />

          <ModalCanaisVenda
            aberto={modalCanaisAberto}
            aoFechar={() => setModalCanaisAberto(false)}
            hook={hook}
            indiceSendoEditado={indiceCanalSendoEditado}
            setIndiceSendoEditado={setIndiceCanalSendoEditado}
            nomeTemporario={nomeCanalTemporario}
            setNomeTemporario={setNomeCanalTemporario}
          />

          <ModalArmazemMateriais
            aberto={modalArmazemAberto}
            aoFechar={() => setModalArmazemAberto(false)}
            busca={buscaMaterialArmazem}
            setBusca={setBuscaMaterialArmazem}
            filtroTipo={filtroTipoMaterial}
            setFiltroTipo={setFiltroTipoMaterial}
            materiaisFiltrados={materiaisFiltrados}
            selecionados={hook.materiaisSelecionados}
            aoAlternar={alternarMaterial}
            aoCriarNovo={abrirCriarMaterial}
            aoAlternarFavorito={acoesMateriais.alternarFavorito}
          />

          <ModalArmazemInsumos
            aberto={modalInsumosAberto}
            aoFechar={() => setModalInsumosAberto(false)}
            busca={buscaInsumo}
            setBusca={setBuscaInsumo}
            insumosFiltrados={insumosFiltrados}
            selecionados={hook.insumosSelecionados}
            aoAlternar={alternarInsumo}
            aoCriarNovo={abrirModalNovoInsumo}
            aoAlternarFavorito={acoesInsumos.alternarFavorito}
          />

          <FormularioMaterial aberto={estadoMateriais.modalAberto} aoSalvar={acoesMateriais.salvarMaterial} aoCancelar={acoesMateriais.fecharEditar} />

          <ModalGerenciamentoInsumo 
            aberto={modalInsumoAberto} 
            aoFechar={fecharInsumoAberto} 
            insumo={insumoEditando} 
            abaInicial="config"
            aoSalvar={async (dados) => {
              const id = dados.id || crypto.randomUUID();
              const payload = { 
                ...dados, 
                id, 
                dataCriacao: dados.dataCriacao || new Date(), 
                dataAtualizacao: new Date(), 
                historico: dados.historico || [] 
              };
              await adicionarOuAtualizarInsumo(payload as any);
              fecharInsumoAberto();
            }}
            aoBaixar={() => {}}
            aoRepor={() => {}}
          />

          <ModalHistorico aberto={modalHistoricoAberto} aoFechar={() => setModalHistoricoAberto(false)} historico={hook.historico} aoSalvar={hook.salvarSnapshot} aoCarregar={(v) => { hook.carregarSnapshot(v); setModalHistoricoAberto(false); }} aoRemover={hook.removerSnapshot} />

          <Dialogo
            aberto={modalPdfAberto}
            aoFechar={() => setModalPdfAberto(false)}
            larguraMax="max-w-md"
            esconderCabecalho={true}
          >
            <div className="p-8 flex flex-col gap-6 relative bg-card border border-borda-sutil shadow-2xl rounded-2xl overflow-hidden">
              {/* Fundo com efeito Glow */}
              <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-sky-500/10 to-transparent blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col gap-6">
                <div className="flex items-center gap-2.5 text-sky-400 mb-2">
                  <Crown size={18} className="fill-sky-400/20" />
                  <span className="text-xs font-black uppercase tracking-[0.25em]">Personalizar Orçamento PDF</span>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-sky-400/80">Nome do Estúdio</label>
                  <input
                    type="text"
                    placeholder="Ex: PrintPro Lab"
                    value={config.nomeEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(e.target.value, config.sloganEstudio)}
                    className="w-full h-14 px-4 rounded-xl bg-zinc-900/50 border border-white/5 focus:border-sky-500/40 outline-none font-black text-xs text-white transition-all shadow-inner placeholder:text-zinc-700"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-sky-400/80">Slogan / Frase de Rodapé</label>
                  <input
                    type="text"
                    placeholder="Ex: Impressão 3D de alta precisão"
                    value={config.sloganEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, e.target.value)}
                    className="w-full h-14 px-4 rounded-xl bg-zinc-900/50 border border-white/5 focus:border-sky-500/40 outline-none font-black text-xs text-white transition-all shadow-inner placeholder:text-zinc-700"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800/50 flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] font-black uppercase text-sky-400/60 border-b border-dashed border-zinc-800/50 pb-2 mb-1 tracking-wider">
                    Pré-Visualização do Documento
                  </span>
                  <span className="text-sm font-black text-white">
                    {config.nomeEstudio || "Seu Estúdio"}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-400/80 italic">
                    {config.sloganEstudio || "Seu slogan aqui"}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => {
                      hook.gerarPdf(config.nomeEstudio, config.sloganEstudio, buscaClienteSeletor, nomeProjeto, idEdicao || undefined);
                      setModalPdfAberto(false);
                    }}
                    className="w-full h-14 font-black uppercase tracking-[0.15em] text-xs rounded-2xl flex items-center justify-center gap-2 bg-sky-500 text-white hover:bg-sky-600 transition-all active:scale-95 shadow-[0_10px_20px_-5px_rgba(14,165,233,0.3)]"
                  >
                    <Download size={14} />
                    <span>Gerar Orçamento</span>
                  </button>

                  <div className="flex justify-between items-center mt-3 border-t border-zinc-800/30 pt-3 text-[8px] font-black text-zinc-600 uppercase tracking-[0.2em] select-none">
                    <span>PRINTLOG OS V2.0</span>
                    <span>© 2026</span>
                  </div>
                </div>
              </div>
            </div>
          </Dialogo>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
