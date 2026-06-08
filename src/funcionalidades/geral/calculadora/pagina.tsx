import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Carregamento, Dica } from "@/compartilhado/componentes";
import {
  Download, 
  Crown,
  RotateCcw, 
  History as HistoryIcon, 
  Settings,
  CloudUpload,
  Save
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAutenticacao } from "@/funcionalidades/autenticacao/contextos/ContextoAutenticacao";
import { useDefinirCabecalho } from "@/compartilhado/contextos/ContextoCabecalho";
import { useArmazemConfiguracoes } from "@/funcionalidades/sistema/configuracoes/estado/armazemConfiguracoes";
import { useArmazemMateriais } from "@/funcionalidades/producao/materiais/estado/armazemMateriais";
import { useArmazemInsumos } from "@/funcionalidades/producao/insumos/estado/armazemInsumos";
import { useGerenciadorImpressoras } from "@/funcionalidades/producao/impressoras/hooks/useGerenciadorImpressoras";
import { useGerenciadorMateriais } from "@/funcionalidades/producao/materiais/hooks/useGerenciadorMateriais";
import { useGerenciadorInsumos } from "@/funcionalidades/producao/insumos/hooks/useGerenciadorInsumos";
import { usePedidos } from "@/funcionalidades/producao/projetos/hooks/usePedidos";
import { useGerenciadorClientes } from "@/funcionalidades/comercial/clientes/hooks/useGerenciadorClientes";
import { Dialogo } from "@/compartilhado/componentes";
import { FormularioMaterial } from "@/funcionalidades/producao/materiais/componentes/FormularioMaterial";
import { ModalGerenciamentoInsumo } from "@/funcionalidades/producao/insumos/componentes/ModalGerenciamentoInsumo";
import { codificarLinkMagico } from "@/compartilhado/utilitarios/link-magico";

// Hook e Componentes Refatorados
import { useCalculadora } from "./hooks/useCalculadora";
import { CardMateriais } from "./componentes/CardMateriais";
import { CardProducao } from "./componentes/CardProducao";
import { CardModelagem } from "./componentes/CardModelagem";
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
import { ModalCanaisVenda } from "./componentes/ModalCanaisVenda";
import { ModalUpgradePaywall } from "@/compartilhado/componentes/ui";
import { ModalArmazemMateriais } from "./componentes/ModalArmazemMateriais";
import { ModalArmazemInsumos } from "./componentes/ModalArmazemInsumos";
import { ModalEnviarEmailOrcamento } from "./componentes/ModalEnviarEmailOrcamento";

export function PaginaCalculadora() {
  const { usuario } = useAutenticacao();
  const navegar = useNavigate();
  const eProOuSuperior = useMemo(() => {
    const plano = ((usuario as any)?.plano || '').toUpperCase();
    const role = ((usuario as any)?.role || (usuario as any)?.cargo || '').toUpperCase();
    return ['PRO', 'FUNDADOR', 'MAKER_FUNDADOR', 'ADMIN'].includes(plano) ||
      ['PRO', 'FUNDADOR', 'MAKER_FUNDADOR', 'ADMIN'].includes(role) ||
      plano.includes('FUNDADOR') || role.includes('FUNDADOR');
  }, [usuario]);

  const config = useArmazemConfiguracoes();
  const { estado: estadoClientes, acoes: acoesClientes } = useGerenciadorClientes();
  const { estado } = useGerenciadorImpressoras();
  const { impressorasFiltradas: impressoras = [] } = estado;
  const { materiais } = useArmazemMateriais();
  const { insumos: insumosEstoque, adicionarOuAtualizarInsumo, abrirEditar: abrirCriarInsumo, modalCricaoAberto: modalInsumoAberto, fecharEditar: fecharInsumoAberto, insumoEditando } = useArmazemInsumos();
  const { estado: estadoMateriais, acoes: acoesMateriais } = useGerenciadorMateriais();
  const { acoes: acoesInsumos } = useGerenciadorInsumos();

  const [salvamentoAutomatico, setSalvamentoAutomatico] = useState<boolean>(() => {
    return localStorage.getItem("printlog_calculadora_salvamento_automatico") === "true";
  });

  // Hook Central de Inteligência
  const hook = useCalculadora(salvamentoAutomatico);
  const [searchParams] = useSearchParams();
  const idEdicao = searchParams.get("id") || searchParams.get("edicao");
  const { pedidos, criarPedido, atualizarPedido } = usePedidos();

  // Estados de UI locais
  const [modalArmazemAberto, setModalArmazemAberto] = useState(false);
  const [modalInsumosAberto, setModalInsumosAberto] = useState(false);
  const [modalCanaisAberto, setModalCanaisAberto] = useState(false);
  const [modalPdfAberto, setModalPdfAberto] = useState(false);
  const [modalEmailAberto, setModalEmailAberto] = useState(false);
  const [modalPaywallAberto, setModalPaywallAberto] = useState(false);
  const [recursoPaywall, setRecursoPaywall] = useState("Recurso VIP");
  const [nomeProjeto, setNomeProjeto] = useState(() => localStorage.getItem("printlog_calculadora_nome_projeto") || '');
  const [descricaoProjeto, setDescricaoProjeto] = useState(() => localStorage.getItem("printlog_calculadora_descricao_projeto") || '');
  const [clienteProjetoId, setClienteProjetoId] = useState(() => localStorage.getItem("printlog_calculadora_cliente_id") || '');
  const [buscaClienteSeletor, setBuscaClienteSeletor] = useState('');
  const [abertoSeletorCliente, setAbertoSeletorCliente] = useState(false);
  const [abertoSeletorImpressora, setAbertoSeletorImpressora] = useState(false);
  const [criandoNovoCliente, setCriandoNovoCliente] = useState(false);
  const [anosVidaUtil, setAnosVidaUtil] = useState<5 | 3 | 2>(() => {
    const salvo = localStorage.getItem("printlog_anos_vida_util");
    return salvo ? Number(salvo) as 5 | 3 | 2 : 5;
  });

  useEffect(() => {
    localStorage.setItem("printlog_anos_vida_util", String(anosVidaUtil));
  }, [anosVidaUtil]);
  const [indiceCanalSendoEditado, setIndiceCanalSendoEditado] = useState<number | null>(null);
  const [nomeCanalTemporario, setNomeCanalTemporario] = useState('');
  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);

  const [mostrarPerdas, setMostrarPerdas] = useState(false);
  const [mostrarCustosFixos, setMostrarCustosFixos] = useState(false);
  const [abaResultado, setAbaResultado] = useState<'orcamento' | 'metricas'>('orcamento');

  const salvamentoAutomaticoRef = useRef(salvamentoAutomatico);
  useEffect(() => {
    salvamentoAutomaticoRef.current = salvamentoAutomatico;
    localStorage.setItem("printlog_calculadora_salvamento_automatico", salvamentoAutomatico.toString());

    if (!salvamentoAutomatico) {
      // Limpa os dados gerais da identificação do projeto do localStorage
      localStorage.removeItem("printlog_calculadora_nome_projeto");
      localStorage.removeItem("printlog_calculadora_descricao_projeto");
      localStorage.removeItem("printlog_calculadora_cliente_id");

      // Limpa os dados do useCalculadora do localStorage
      localStorage.removeItem("printlog_materiais_selecionados");
      localStorage.removeItem("printlog_calculadora_tempo");
      localStorage.removeItem("printlog_tempo");
      localStorage.removeItem("printlog_potencia");
      localStorage.removeItem("printlog_preco_kwh");
      localStorage.removeItem("printlog_mao_de_obra");
      localStorage.removeItem("printlog_depreciacao_hora");
      localStorage.removeItem("printlog_margem");
      localStorage.removeItem("printlog_quantidade");
      localStorage.removeItem("printlog_pecas_por_mesa");
      localStorage.removeItem("printlog_tempo_setup");
      localStorage.removeItem("printlog_taxa_falha");
      localStorage.removeItem("printlog_material_perdido");
      localStorage.removeItem("printlog_tempo_perdido");
      localStorage.removeItem("printlog_frete");
      localStorage.removeItem("printlog_insumos_fixos");
      localStorage.removeItem("printlog_insumos_selecionados");
      localStorage.removeItem("printlog_itens_pos_processo");
      localStorage.removeItem("printlog_tempo_modelagem");
      localStorage.removeItem("printlog_valor_hora_modelagem");
      localStorage.removeItem("printlog_desconto_volume");
      localStorage.removeItem("printlog_preco_alvo");
      localStorage.removeItem("printlog_cobrar_desgaste");
      localStorage.removeItem("printlog_cobrar_mao_de_obra");
      localStorage.removeItem("printlog_cobrar_energia");
      localStorage.removeItem("printlog_cobrar_insumos_fixos");
      localStorage.removeItem("printlog_cobrar_logistica");
      localStorage.removeItem("printlog_perfil_ativo");
      localStorage.removeItem("printlog_explicacao_ia");
    }
  }, [salvamentoAutomatico]);

  useEffect(() => {
    if (salvamentoAutomatico) {
      localStorage.setItem("printlog_calculadora_nome_projeto", nomeProjeto);
      localStorage.setItem("printlog_calculadora_descricao_projeto", descricaoProjeto);
      localStorage.setItem("printlog_calculadora_cliente_id", clienteProjetoId);
    }
  }, [nomeProjeto, descricaoProjeto, clienteProjetoId, salvamentoAutomatico]);

  // Carrega dinamicamente os campos de texto salvos no localStorage ao ativar o salvamento automático
  useEffect(() => {
    if (salvamentoAutomatico) {
      setNomeProjeto(localStorage.getItem("printlog_calculadora_nome_projeto") || '');
      setDescricaoProjeto(localStorage.getItem("printlog_calculadora_descricao_projeto") || '');
      setClienteProjetoId(localStorage.getItem("printlog_calculadora_cliente_id") || '');
      
      const cliId = localStorage.getItem("printlog_calculadora_cliente_id");
      if (cliId) {
        const cli = (estadoClientes.clientes || []).find(c => c.id === cliId);
        if (cli) setBuscaClienteSeletor(cli.nome);
      }
    }
  }, [salvamentoAutomatico, estadoClientes.clientes]);

  // Resetar a calculadora ao sair da página (Sidebar, Navegação, etc) se não tiver salvamento automático
  useEffect(() => {
    return () => {
      if (!salvamentoAutomaticoRef.current) {
        hook.limpar(true);
        localStorage.removeItem("printlog_calculadora_nome_projeto");
        localStorage.removeItem("printlog_calculadora_descricao_projeto");
        localStorage.removeItem("printlog_calculadora_cliente_id");
      }
    };
  }, [hook.limpar]);

  // Reseta tudo: estados do hook + campos locais de identificação e equipamento
  const limparTudo = useCallback(() => {
    hook.limpar();
    setNomeProjeto('');
    setDescricaoProjeto('');
    setClienteProjetoId('');
    localStorage.removeItem("printlog_calculadora_nome_projeto");
    localStorage.removeItem("printlog_calculadora_descricao_projeto");
    localStorage.removeItem("printlog_calculadora_cliente_id");
    setClienteProjetoId('');
    setBuscaClienteSeletor('');
    hook.setImpressoraSelecionadaId('');
  }, [hook.limpar, hook.setImpressoraSelecionadaId]);


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
    const existe = hook.materiaisSelecionados.some(m => m.id === id);
    if (existe) {
      hook.setMateriaisSelecionados(prev => prev.filter(m => m.id !== id));
    } else {
      const matOriginal = materiais.find(m => m.id === id);
      if (matOriginal) {
        hook.setMateriaisSelecionados(prev => [...prev, {
          id: matOriginal.id,
          instanceId: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
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

  const atualizarQtdMaterial = useCallback((uid: string, qtd: number) => {
    hook.setMateriaisSelecionados(prev => prev.map(m => (m.instanceId || m.id) === uid ? { ...m, quantidade: qtd } : m));
  }, [hook.setMateriaisSelecionados]);

  const atualizarPrecoMaterial = useCallback((uid: string, precoKg: number) => {
    hook.setMateriaisSelecionados(prev => prev.map(m => (m.instanceId || m.id) === uid ? { ...m, precoKgCentavos: Math.round(precoKg * 100) } : m));
  }, [hook.setMateriaisSelecionados]);

  const atualizarTempoMaterial = useCallback((uid: string, horas: number, minutos: number, segundos: number = 0) => {
    hook.setMateriaisSelecionados(prev => {
      const newState = prev.map(m => (m.instanceId || m.id) === uid ? { ...m, tempoHoras: horas, tempoMinutos: minutos, tempoSegundos: segundos } : m);
      const totalMinutos = newState.reduce((acc, m) => acc + (m.tempoHoras || 0) * 60 + (m.tempoMinutos || 0) + (m.tempoSegundos || 0) / 60, 0);
      hook.setTempo(totalMinutos);
      return newState;
    });
  }, [hook.setMateriaisSelecionados, hook.setTempo]);

  const atualizarNomePecaMaterial = useCallback((uid: string, nome: string) => {
    hook.setMateriaisSelecionados(prev => prev.map(m => (m.instanceId || m.id) === uid ? { ...m, nomePeca: nome } : m));
  }, [hook.setMateriaisSelecionados]);

  const removerMaterial = useCallback((uid: string) => {
    hook.setMateriaisSelecionados(prev => {
      const newState = prev.filter(m => (m.instanceId || m.id) !== uid);
      const totalMinutos = newState.reduce((acc, m) => acc + (m.tempoHoras || 0) * 60 + (m.tempoMinutos || 0), 0);
      if (totalMinutos > 0) {
        hook.setTempo(totalMinutos);
      }
      return newState;
    });
  }, [hook.setMateriaisSelecionados, hook.setTempo]);

  const adicionarPecaMaterial = useCallback((idMaterial: string) => {
    hook.setMateriaisSelecionados(prev => {
      const matOriginal = materiais.find(m => m.id === idMaterial);
      if (matOriginal) {
        return [...prev, {
          id: matOriginal.id,
          instanceId: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
          nome: matOriginal.nome,
          cor: matOriginal.cor,
          tipo: matOriginal.tipo,
          tipoMaterial: matOriginal.tipoMaterial || '',
          quantidade: 0,
          tempoHoras: 0,
          tempoMinutos: 0,
          tempoSegundos: 0,
          precoKgCentavos: Math.round((matOriginal.precoCentavos / matOriginal.pesoGramas) * 1000)
        }];
      }
      return prev;
    });
  }, [hook.setMateriaisSelecionados, materiais]);

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
              instanceId: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
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
            if (cfg.taxaEcommerce !== undefined) hook.setTaxaEcommerce(cfg.taxaEcommerce);
            if (cfg.taxaFixa !== undefined) hook.setTaxaFixa(cfg.taxaFixa);
          
          // Toggles de Cobrança
          if (cfg.cobrarDesgaste !== undefined) hook.setCobrarDesgaste(cfg.cobrarDesgaste);
          if (cfg.cobrarMaoDeObra !== undefined) hook.setCobrarMaoDeObra(cfg.cobrarMaoDeObra);
          if (cfg.cobrarEnergia !== undefined) hook.setCobrarEnergia(cfg.cobrarEnergia);
          if (cfg.cobrarInsumosFixos !== undefined) hook.setCobrarInsumosFixos(cfg.cobrarInsumosFixos);
          if (cfg.cobrarLogistica !== undefined) hook.setCobrarLogistica(cfg.cobrarLogistica);
          
          // Perfis
          if (cfg.perfilAtivo !== undefined) hook.setPerfilAtivo(cfg.perfilAtivo);
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
          cobrarInsumosFixos: hook.cobrarInsumosFixos,
          cobrarLogistica: hook.cobrarLogistica,
          perfilAtivo: hook.perfilAtivo,
          lucroLiquidoCentavos: hook.calculo.lucroLiquido
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
      navegar("/producao");
    } catch (erro) {
      console.warn("Erro ao salvar projeto:", erro);
      hook.salvarSnapshot(nomeProjeto || "Orçamento via Calculadora", nomeProjeto, descricaoProjeto, clienteProjetoId);
      hook.limpar();
      setNomeProjeto("");
      setDescricaoProjeto("");
      setClienteProjetoId("");
      setBuscaClienteSeletor("");
    }
  };

  const obterUrlLinkMagico = () => {
    const qtdeMultiplicador = hook.modoEntrada === 'lote' ? 1 : (hook.quantidade || 1);
    
    const materiaisAgrupados = hook.materiaisSelecionados.reduce((acc, m) => {
      const chave = `${m.nome}-${m.tipoMaterial}`;
      const q = m.quantidade * qtdeMultiplicador;
      const p = (m.quantidade / 1000) * m.precoKgCentavos * qtdeMultiplicador;
      
      if (!acc[chave]) {
        acc[chave] = { n: m.nome, t: m.tipoMaterial, q: 0, p: 0 };
      }
      acc[chave].q += q;
      acc[chave].p += p;
      return acc;
    }, {} as Record<string, { n: string, t: string, q: number, p: number }>);

    const materiaisMagicos = Object.values(materiaisAgrupados).map(mat => ({
      n: mat.n,
      t: mat.t,
      q: Math.round(mat.q),
      p: Math.round(mat.p)
    }));

    const hash = codificarLinkMagico({
      pr: hook.calculo.precoSugerido,
      np: nomeProjeto || "Projeto 3D",
      t: hook.tempo,
      m: materiaisMagicos,
      e: config.nomeEstudio || "",
      s: config.sloganEstudio || "",
      l: config.logoEstudio || undefined,
      w: (usuario as any)?.telefone || "",
      id: idEdicao || undefined,
      cli: buscaClienteSeletor || undefined,
      obs: descricaoProjeto || undefined,
      cm: hook.calculo.custoDepreciacao + hook.calculo.custoEnergia,
      ce: hook.calculo.custoEnergia,
      cd: hook.calculo.custoDepreciacao,
      cmo: hook.calculo.custoMaoDeObra
    });
    return `${window.location.origin}/orcamento?q=${hash}`;
  };

  const gerarLinkMagico = () => {
    if (!eProOuSuperior) {
      setRecursoPaywall("Link Mágico Interativo");
      setModalPaywallAberto(true);
      return;
    }
    const url = obterUrlLinkMagico();
    const toastId = toast.loading("Gerando link mágico...");
    navigator.clipboard.writeText(url).then(() => {
      toast.dismiss(toastId);
      toast.success("Link Mágico copiado! Envie para seu cliente.");
    }).catch(() => {
      toast.dismiss(toastId);
      toast.error("Erro ao copiar o link mágico.");
    });
  };

  // Sincronizar potência e depreciação ao carregar ou mudar impressora
  useEffect(() => {
    if (impressoraSelecionada?.potenciaWatts) {
      hook.setPotencia(impressoraSelecionada.potenciaWatts);
    }

    // Sincroniza a depreciação (desgaste)
    if (impressoraSelecionada?.valorCompraCentavos) {
      // Cálculo automático inteligente baseado nos anos de vida útil selecionados
      const depreciacaoAnual = impressoraSelecionada.valorCompraCentavos / anosVidaUtil;
      const depreciacaoMensal = depreciacaoAnual / 12;
      const taxaHoraRealCentavos = Math.round(depreciacaoMensal / 240);
      hook.setDepreciacaoHora(taxaHoraRealCentavos);
    } else if (impressoraSelecionada?.taxaHoraCentavos) {
      hook.setDepreciacaoHora(impressoraSelecionada.taxaHoraCentavos);
    } else if (config?.horaMaquina) {
      hook.setDepreciacaoHora(config.horaMaquina);
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
      const taxa = imp.taxaHoraCentavos;
      hook.setDepreciacaoHora(taxa);
      config.definirHoraMaquina(taxa);
    }
  }, [impressoras, hook.setImpressoraSelecionadaId, hook.setPotencia, hook.setDepreciacaoHora, config]);

  const abrirModalArmazem = useCallback(() => setModalArmazemAberto(true), []);
  const abrirCriarMaterial = useCallback(() => acoesMateriais.abrirEditar(null as any), [acoesMateriais]);
  const abrirModalInsumos = useCallback(() => setModalInsumosAberto(true), []);
  const abrirModalNovoInsumo = useCallback(() => abrirCriarInsumo(), [abrirCriarInsumo]);
  const abrirModalCanais = useCallback(() => setModalCanaisAberto(true), []);

  const salvarRascunhoRef = useRef(() => {});
  salvarRascunhoRef.current = () => {
    const numeroUnico = Math.floor(1000 + Math.random() * 9000);
    hook.salvarSnapshot(nomeProjeto || `Rascunho - #${numeroUnico}`, nomeProjeto, descricaoProjeto, clienteProjetoId);
  };

  const limparRef = useRef(() => {});
  limparRef.current = limparTudo;

  const dadosCabecalho = useMemo(() => ({
    titulo: idEdicao ? "Atualizar Cálculo" : "Cálculo Inteligente",
    subtitulo: idEdicao ? `Editando: ${nomeProjeto}` : "Encontre o preço perfeito com precisão total.",
    ocultarBusca: true,
    elementoAcao: (
      <div className="flex items-center gap-1 p-1 bg-card/10 border border-borda-sutil rounded-2xl backdrop-blur-md">
        <Dica texto="Limpar Calculadora" posicao="baixo">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => limparRef.current()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-card/20 transition-all cursor-pointer"
          >
            <RotateCcw size={18} />
          </motion.button>
        </Dica>
        <Dica texto={salvamentoAutomatico ? "Desativar Salvamento" : "Ativar Salvamento"} posicao="baixo">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              const novoEstado = !salvamentoAutomatico;
              setSalvamentoAutomatico(novoEstado);
              if (novoEstado) {
                toast.success("Salvamento automático ativado! 💾");
              } else {
                toast.success("Salvamento automático desativado! ❌");
              }
            }}
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              salvamentoAutomatico 
                ? 'text-cyan-500 bg-cyan-500/10' 
                : 'text-zinc-400 hover:text-cyan-500 hover:bg-cyan-500/10'
            }`}
          >
            <Save size={18} />
          </motion.button>
        </Dica>
        <Dica texto="Salvar no Histórico (Rascunho)" posicao="baixo">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => salvarRascunhoRef.current()}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-sky-500 hover:bg-sky-500/10 transition-all cursor-pointer"
          >
            <CloudUpload size={18} />
          </motion.button>
        </Dica>
        <Dica texto="Ver Histórico" posicao="baixo">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalHistoricoAberto(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-card/20 transition-all cursor-pointer"
          >
            <HistoryIcon size={18} />
          </motion.button>
        </Dica>
        <Dica texto="Configurações da Máquina" posicao="baixo">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setModalConfigAberto(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-zinc-400 hover:text-primary hover:bg-card/20 transition-all cursor-pointer"
          >
            <Settings size={18} />
          </motion.button>
        </Dica>
      </div>
    )
  }), [idEdicao, nomeProjeto, salvamentoAutomatico]);

  useDefinirCabecalho(dadosCabecalho);

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
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.06,
                delayChildren: 0.1,
              }
            }
          }}
          className="absolute inset-0 grid grid-cols-1 xl:grid-cols-12 gap-8 overflow-y-auto xl:overflow-hidden px-4 sm:px-6 md:px-12 pb-24 xl:pb-0"
        >
          <motion.div className="xl:col-span-8 space-y-6 h-auto xl:h-full overflow-y-visible xl:overflow-y-auto pt-8 pb-10 xl:pb-20 scrollbar-hide">

            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 30, scale: 0.98 },
                visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
              }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
            >
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
                        setBuscaClienteSeletor(nome); // Usa o nome fornecido em vez do retorno da API
                        setAbertoSeletorCliente(false);
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
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } } }}>
              <CardMateriais
                materiais={materiais.filter(m => !m.arquivado && m.nome.toLowerCase().includes(buscaMaterial.toLowerCase()))}
                selecionados={hook.materiaisSelecionados}
                alertas={hook.alertasEstoque}
                busca={buscaMaterial}
                setBusca={setBuscaMaterial}
                alternar={alternarMaterial}
                atualizarQtd={atualizarQtdMaterial}
                atualizarPreco={atualizarPrecoMaterial}
                atualizarTempo={atualizarTempoMaterial}
                atualizarNomePeca={atualizarNomePecaMaterial}
                remover={removerMaterial}
                abrirArmazem={abrirModalArmazem}
                abrirCriar={abrirCriarMaterial}
                alternarFavorito={acoesMateriais.alternarFavorito}
                adicionarPeca={adicionarPecaMaterial}
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } } }}>
              <CardPerdas
                mostrar={mostrarPerdas}
                setMostrar={setMostrarPerdas}
                materialPerdido={hook.materialPerdido}
                setMaterialPerdido={hook.setMaterialPerdido}
                tempoPerdido={hook.tempoPerdido}
                setTempoPerdido={hook.setTempoPerdido}
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } } }}>
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
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } } }}>
              <CardCustosFixos
                mostrar={mostrarCustosFixos}
                setMostrar={setMostrarCustosFixos}
                insumosFixos={hook.insumosFixos}
                setInsumosFixos={hook.setInsumosFixos}
                cobrarInsumosFixos={hook.cobrarInsumosFixos}
                setCobrarInsumosFixos={hook.setCobrarInsumosFixos}
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } } }}>
              <CardProducao
                quantidade={hook.quantidade} setQuantidade={hook.setQuantidade}
                pecasPorMesa={hook.pecasPorMesa} setPecasPorMesa={hook.setPecasPorMesa}
                tempo={hook.tempo} setTempo={hook.setTempo}
                modoEntrada={hook.modoEntrada}
                potencia={hook.potencia} setPotencia={hook.setPotencia}
                precoKwh={hook.precoKwh} setPrecoKwh={(v) => { hook.setPrecoKwh(v); config.definirCustoEnergia(v); }}
                custoEnergia={hook.calculo.custoEnergia / 100}
                cobrarEnergia={hook.cobrarEnergia} setCobrarEnergia={hook.setCobrarEnergia}
                posProcesso={hook.itensPosProcesso} setPosProcesso={hook.setItensPosProcesso}
                impressoras={impressoras}
                idImpressoraSelecionada={hook.impressoraSelecionadaId}
                aoSelecionarImpressora={aoSelecionarImpressora}
                aoDetectarTarifa={hook.detectarTarifa}
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } } }}>
              <CardModelagem
                tempoModelagem={hook.tempoModelagem}
                setTempoModelagem={hook.setTempoModelagem}
                valorHoraModelagem={hook.valorHoraModelagem}
                setValorHoraModelagem={hook.setValorHoraModelagem}
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } } }}>
              <CardOperacional
                maoDeObra={hook.maoDeObra} setMaoDeObra={(v) => { hook.setMaoDeObra(v); config.definirHoraOperador(v); }}
                margem={hook.margem} setMargem={(v) => { hook.setMargem(v); config.definirMargemLucro(v); }}
                depreciacao={hook.depreciacaoHora}
                cobrarDesgaste={hook.cobrarDesgaste} setCobrarDesgaste={hook.setCobrarDesgaste}
                cobrarMaoDeObra={hook.cobrarMaoDeObra} setCobrarMaoDeObra={hook.setCobrarMaoDeObra}
                anosVidaUtil={anosVidaUtil} setAnosVidaUtil={setAnosVidaUtil}
                tempo={hook.tempo}
                quantidade={hook.quantidade}
                tempoSetup={hook.tempoSetup} 
                setTempoSetup={hook.setTempoSetup}
                aplicarTemplate={hook.aplicarTemplate}
              />
            </motion.div>

            <motion.div variants={{ hidden: { opacity: 0, y: 30, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } } }}>
              <CardLogistica
                perfis={hook.perfisMarketplace} perfilAtivo={hook.perfilAtivo} setPerfilAtivo={hook.setPerfilAtivo}
                taxaEcommerce={hook.taxaEcommerce} setTaxaEcommerce={hook.setTaxaEcommerce}
                taxaFixa={hook.taxaFixa} setTaxaFixa={hook.setTaxaFixa}
                frete={hook.frete} setFrete={hook.setFrete}
                abrirPerfis={abrirModalCanais}
                cobrarLogistica={hook.cobrarLogistica}
                setCobrarLogistica={hook.setCobrarLogistica}
              />
            </motion.div>


          </motion.div>

          <motion.div 
            variants={{
              hidden: { opacity: 0, x: 20 },
              visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 30, delay: 0.2 } }
            }}
            className="xl:col-span-4 h-auto xl:h-full xl:sticky xl:top-0 flex flex-col justify-start xl:justify-center items-center py-8 overflow-y-visible xl:overflow-y-auto scrollbar-hide"
          >
            <PainelResultados
              calculo={hook.calculo}
              dadosPizza={hook.dadosGraficoPizza}
              aba={abaResultado} setAba={setAbaResultado}
              salvarProjeto={confirmarSalvarProjeto}
              gerarPdf={() => {
                const toastId = toast.loading("Gerando visualização de impressão...");
                const url = obterUrlLinkMagico() + "&p=1";

                const oldIframe = document.getElementById('print-iframe');
                if (oldIframe) oldIframe.remove();

                const iframe = document.createElement('iframe');
                iframe.id = 'print-iframe';
                // Usando dimensões reais fora da tela para não quebrar o layout responsivo no PDF
                iframe.style.position = 'fixed';
                iframe.style.left = '-9999px';
                iframe.style.top = '0';
                iframe.style.width = '1024px'; // Forçar largura desktop para media queries
                iframe.style.height = '100vh';
                iframe.style.opacity = '0';
                iframe.style.border = 'none';
                iframe.src = url;
                
                iframe.onload = () => {
                  toast.dismiss(toastId);
                };
                
                document.body.appendChild(iframe);
              }}
              gerarLinkMagico={gerarLinkMagico}
              obterUrlLinkMagico={obterUrlLinkMagico}
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
              aoSugerirPrecoIA={hook.sugerirPrecoIA}
              descontoVolume={hook.descontoVolume}
              setDescontoVolume={hook.setDescontoVolume}
              precoAlvoCentavos={hook.precoAlvoCentavos}
              setPrecoAlvoCentavos={hook.setPrecoAlvoCentavos}
              explicacaoIA={hook.explicacaoIA}
            />
          </motion.div>

          {/* Modais Refatorados */}
          <ModalConfiguracoes
            aberto={modalConfigAberto}
            aoFechar={() => setModalConfigAberto(false)}
            eProOuSuperior={eProOuSuperior}
            config={config}
            hook={hook}
            aoSalvar={async () => {
              config.definirCustoEnergia(hook.precoKwh);
              config.definirHoraOperador(hook.maoDeObra);
              config.definirHoraMaquina(hook.depreciacaoHora);
              config.definirMargemLucro(hook.margem);
              if (usuario?.uid) {
                await config.salvarNoD1(usuario.uid);
                setModalConfigAberto(false);
                toast.success("Motores de custeio sincronizados!");
              }
            }}
            aoClicarPaywall={() => {
              setRecursoPaywall("Orçamento PDF White-label");
              setModalConfigAberto(false);
              setModalPaywallAberto(true);
            }}
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

          <ModalHistorico 
            aberto={modalHistoricoAberto} 
            aoFechar={() => setModalHistoricoAberto(false)} 
            historico={hook.historico} 
            aoSalvar={(nome) => hook.salvarSnapshot(nome, nomeProjeto, descricaoProjeto, clienteProjetoId)} 
            aoCarregar={(v) => { 
              hook.carregarSnapshot(v); 
              if (v.configuracoes?.nomeProjeto) setNomeProjeto(v.configuracoes.nomeProjeto);
              if (v.configuracoes?.descricaoProjeto) setDescricaoProjeto(v.configuracoes.descricaoProjeto);
              if (v.configuracoes?.clienteProjetoId) {
                setClienteProjetoId(v.configuracoes.clienteProjetoId);
                const clienteEncontrado = (estadoClientes.clientes || []).find((c: any) => c.id === v.configuracoes.clienteProjetoId);
                if (clienteEncontrado) {
                  setBuscaClienteSeletor(clienteEncontrado.nome);
                }
              } else {
                setClienteProjetoId("");
                setBuscaClienteSeletor("");
              }
              setModalHistoricoAberto(false); 
            }} 
            aoRemover={hook.removerSnapshot} 
          />

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
                    onChange={(e) => config.definirIdentidadeEstudio(e.target.value, config.sloganEstudio, config.logoEstudio)}
                    className="w-full h-14 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-borda-sutil dark:border-white/5 focus:border-sky-500/40 outline-none font-black text-xs text-zinc-900 dark:text-white transition-all shadow-inner placeholder:text-zinc-500 dark:placeholder:text-zinc-700"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-sky-400/80">Slogan / Frase de Rodapé</label>
                  <input
                    type="text"
                    placeholder="Ex: Impressão 3D de alta precisão"
                    value={config.sloganEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, e.target.value, config.logoEstudio)}
                    className="w-full h-14 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-borda-sutil dark:border-white/5 focus:border-sky-500/40 outline-none font-black text-xs text-zinc-900 dark:text-white transition-all shadow-inner placeholder:text-zinc-500 dark:placeholder:text-zinc-700"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="block text-[10px] font-black uppercase tracking-wider text-sky-400/80">URL da Logo (Opcional)</label>
                  <input
                    type="url"
                    placeholder="https://exemplo.com/logo.png"
                    value={config.logoEstudio}
                    onChange={(e) => config.definirIdentidadeEstudio(config.nomeEstudio, config.sloganEstudio, e.target.value)}
                    className="w-full h-14 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-900/50 border border-borda-sutil dark:border-white/5 focus:border-sky-500/40 outline-none font-black text-xs text-zinc-900 dark:text-white transition-all shadow-inner placeholder:text-zinc-500 dark:placeholder:text-zinc-700"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-zinc-100 dark:bg-zinc-950/60 border border-borda-sutil dark:border-zinc-800/50 flex flex-col gap-1.5 mt-2">
                  <span className="text-[9px] font-black uppercase text-sky-400/60 border-b border-dashed border-zinc-800/50 pb-2 mb-1 tracking-wider">
                    Pré-Visualização do Documento
                  </span>
                  <div className="flex items-center gap-3 mt-1">
                    {config.logoEstudio && (
                      <img src={config.logoEstudio} alt="Logo" className="max-h-8 w-auto object-contain rounded" />
                    )}
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-sm font-black text-white truncate">
                        {config.nomeEstudio || "Seu Estúdio"}
                      </span>
                      <span className="text-[10px] font-bold text-zinc-400/80 italic truncate">
                        {config.sloganEstudio || "Seu slogan aqui"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    onClick={() => {
                      const url = obterUrlLinkMagico() + "&p=1";
                      window.open(url, "_blank");
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

          <ModalEnviarEmailOrcamento
            aberto={modalEmailAberto}
            aoFechar={() => setModalEmailAberto(false)}
            linkMagico={hook.urlLinkMagicoGerado}
            nomeProjeto={nomeProjeto || "Peça 3D"}
            valorTotal={hook.resultados?.venda.totalCotacaoFormatado || "R$ 0,00"}
          />

          <ModalUpgradePaywall
            aberto={modalPaywallAberto}
            aoFechar={() => setModalPaywallAberto(false)}
            recurso={recursoPaywall}
            aoFazerUpgrade={() => {
              window.location.href = "/dashboard";
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
