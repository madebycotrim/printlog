import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { PackageSearch, Plus, ScanBarcode } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import EstadoVazio from "../../components/ui/EstadoVazio";
import Button from "../../components/ui/Button";
import api from "../../utils/api";
import { useToastStore } from '../../stores/toastStore';

// LÓGICA E STORE (Zustand)
import { useFilamentos, useMutacoesFilamento } from "../../features/filamentos/logic/consultasFilamento";
import { MATERIAIS_RESINA_FLAT, MATERIAIS_FDM_FLAT } from "../../features/filamentos/logic/constantes";
import { useScannerStore } from '../../stores/scannerStore';

// COMPONENTES DA FUNCIONALIDADE (FILAMENTOS)
import StatusFilamentos from "../../features/filamentos/components/StatusFilamentos";
import { CartaoFilamento } from "../../features/filamentos/components/CardFilamento";
import { LinhaFilamento } from "../../features/filamentos/components/LinhaFilamento";
import ModalFilamento from "../../features/filamentos/components/ModalFilamento.jsx";
import ModalBaixaRapida from "../../features/filamentos/components/ModalBaixaRapida.jsx";
import ModalHistoricoFilamento from "../../features/filamentos/components/ModalHistoricoFilamento.jsx";
import ModalRegistrarFalha from '../../features/filamentos/components/ModalRegistrarFalha';
import ModalExcluirFilamento from '../../features/filamentos/components/ModalExcluirFilamento';
import ModalEtiqueta from '../../features/filamentos/components/ModalEtiqueta';

// NOVOS COMPONENTES (COMPARTILHADOS)
import { VirtualShelves } from "../../components/materials/VirtualShelves";

// FILTROS
import { normalizeString } from "../../utils/stringUtils";
import FiltrosFilamento from "../../features/filamentos/components/FiltrosFilamento";

import { useLocalWeather } from "../../hooks/useLocalWeather";

const VIEW_MODE_KEY = "printlog_filaments_view";
const DEFAULT_VIEW_MODE = "grid";

export default function FilamentosPage() {
  const [busca, setBusca] = useState("");
  const deferredBusca = useDeferredValue(busca);

  const { temp, humidity, loading: weatherLoading } = useLocalWeather();

  const { data: filaments = [], isLoading: loading } = useFilamentos();
  const { salvarFilamento, excluirFilamento, registrarHistorico, salvando } = useMutacoesFilamento();

  const [modoVisualizacao, setModoVisualizacao] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || DEFAULT_VIEW_MODE);

  const [filtros, setFiltros] = useState({
    estoqueBaixo: false,
    materials: [],
    brands: [],
    sortOption: 'name' // 'name', 'quantity_asc', 'quantity_desc', 'oldest', 'newest'
  });

  const { addToast } = useToastStore();

  const [activeTab, setActiveTab] = useState(() => {
    const saved = localStorage.getItem('printlog_filaments_active_tab');
    return ['all', 'FDM', 'SLA'].includes(saved) ? saved : 'all';
  });

  useEffect(() => {
    localStorage.setItem('printlog_filaments_active_tab', activeTab);
  }, [activeTab]);

  // Estados de Controle de Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  const [itemConsumo, setItemConsumo] = useState(null);
  const [modalFalhaAberto, setModalFalhaAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });
  const [itemEtiqueta, setItemEtiqueta] = useState(null);

  // Blink State (Global Store Integration)
  const { highlightedItem, clearHighlight, openScanner } = useScannerStore();

  // Local Blink State (driven by global effect)
  const [highlightedItemId, setHighlightedItemId] = useState(null);

  useEffect(() => {
    if (highlightedItem && highlightedItem.type === 'filament') {
      setHighlightedItemId(highlightedItem.id);
      setBusca(filaments.find(f => f.id === highlightedItem.id)?.nome || ""); // Filter logic

      const timer = setTimeout(() => {
        setHighlightedItemId(null);
        clearHighlight(); // Clear global after animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightedItem, filaments, clearHighlight]);

  // Fetch Failures Stats
  const [failureStats, setFailureStats] = useState({ totalWeight: 0, totalCost: 0 });
  const fetchFailures = useCallback(() => {
    api.get('/failures')
      .then(res => {
        if (res.data?.stats) setFailureStats(res.data.stats);
      })
      .catch(err => {
        console.error("Erro ao buscar falhas:", err);
      });
  }, []);

  useEffect(() => {
    fetchFailures();
  }, [fetchFailures]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, modoVisualizacao);
  }, [modoVisualizacao]);

  // 1. Pre-processamento (Memoized) - Gera string de busca indexada
  const searchableFilaments = useMemo(() => {
    return filaments.map(f => ({
      ...f,
      _searchStr: normalizeString(`${f.nome || ""} ${f.material || ""} ${f.marca || ""}`)
    }));
  }, [filaments]);

  // 2. PROCESSAMENTO DE DADOS (Filtragem e Agrupamento)
  const { grupos, stats, lowStockCount, availableBrands, availableMaterials } = useMemo(() => {
    const termo = normalizeString(deferredBusca);

    // 2.1 Pré-processamento de Tipo (SLA vs FDM)
    const itemsWithTypes = searchableFilaments.map(f => {
      const mat = (f.material || "").trim();
      const tipo = (f.tipo || "").toUpperCase();
      const isKnownResin =
        tipo === 'SLA' ||
        tipo === 'RESINA' ||
        MATERIAIS_RESINA_FLAT.includes(mat) ||
        MATERIAIS_RESINA_FLAT.some(r => mat.toLowerCase().includes(r.toLowerCase())) ||
        mat.toLowerCase().includes('resina') ||
        mat.toLowerCase().includes('resin');

      return { ...f, isKnownResin };
    });

    // 2.2 Filtragem por TAB (Contexto Principal)
    const tabFiltered = itemsWithTypes.filter(f => {
      if (activeTab === 'FDM' && f.isKnownResin) return false;
      if (activeTab === 'SLA' && !f.isKnownResin) return false;
      return true;
    });

    // 2.3 Extrair Metadados do CONTEXTO ATUAL (Tab)
    const contextBrands = [...new Set(tabFiltered.map(f => f.marca).filter(Boolean))];
    const contextMaterials = [...new Set(tabFiltered.map(f => f.material).filter(Boolean))];

    // 2.4 Filtragem Final (Busca + Chips)
    const filtrados = tabFiltered.filter(f => {
      // Busca
      const matchesSearch = !termo || f._searchStr.includes(termo);
      if (!matchesSearch) return false;

      // Baixo Estoque
      if (filtros.estoqueBaixo) {
        const parseNum = (val) => {
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return Number(val.replace(',', '.')) || 0;
          return 0;
        };
        const total = Math.max(1, parseNum(f.peso_total) || 1000);
        const atual = parseNum(f.peso_atual);
        const ratio = atual / total;
        // Agora usamos < 20% OU < 150g(or ml)
        const isLowStock = ratio <= 0.20 || atual < 150;
        if (!isLowStock) return false;
      }

      // Filtros de Marca/Material
      if (filtros.materials?.length > 0 && !filtros.materials.includes(f.material)) return false;
      if (filtros.brands?.length > 0 && !filtros.brands.includes(f.marca)) return false;

      return true;
    });

    // 2.5 Ordenação
    const itemsOrdenados = [...filtrados].sort((a, b) => {
      switch (filtros.sortOption) {
        case 'quantity_asc': // Menos Restante (Prioridade para acabar)
          return (Number(a.peso_atual) || 0) - (Number(b.peso_atual) || 0);
        case 'quantity_desc': // Mais Cheio
          return (Number(b.peso_atual) || 0) - (Number(a.peso_atual) || 0);
        case 'oldest': // Mais Antigo (FIFO)
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'newest': // Mais Novo
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'name': // Nome A-Z
        default:
          return (a.nome || "").localeCompare(b.nome || "");
      }
    });

    // 2.6 Estatísticas (Contexto Filtrado)
    let totalG = 0;
    let valorTotalAcumulado = 0;
    let lowStock = 0;

    itemsOrdenados.forEach(f => {
      const atual = Number(f.peso_atual) || 0;
      const total = Math.max(1, Number(f.peso_total) || 1000);
      const preco = Number(f.preco) || 0;
      totalG += atual;
      valorTotalAcumulado += (preco / total) * atual;
      if ((atual / total) <= 0.2 || atual < 150) lowStock++;
    });

    // 2.7 Agrupamento
    const map = itemsOrdenados.reduce((acc, item) => {
      const mat = item.material || "SEM MATERIAL";
      if (!acc[mat]) acc[mat] = [];
      acc[mat].push(item);
      return acc;
    }, {});

    // Ordenar os GRUPOS
    const sortedMap = Object.keys(map).sort((a, b) => {
      const aIsFDM = MATERIAIS_FDM_FLAT.includes(a);
      const bIsFDM = MATERIAIS_FDM_FLAT.includes(b);

      if (aIsFDM && !bIsFDM) return -1;
      if (!aIsFDM && bIsFDM) return 1;
      return a.localeCompare(b);
    }).reduce((obj, key) => {
      obj[key] = map[key];
      return obj;
    }, {});

    return {
      grupos: sortedMap,
      lowStockCount: lowStock,
      stats: { valorTotal: valorTotalAcumulado, pesoKg: totalG / 1000 },
      availableBrands: contextBrands,
      availableMaterials: contextMaterials
    };
  }, [searchableFilaments, deferredBusca, filtros, activeTab]);

  /* --- HANDLERS --- */
  const handleEdit = useCallback((item) => {
    setItemEdicao(item);
    setModalAberto(true);
  }, []);

  const handleDuplicate = useCallback((item) => {
    const { id, created_at, ...rest } = item;
    const newItem = {
      ...rest,
      nome: `${item.nome} (Cópia)`,
      peso_atual: item.peso_total,
      lockedType: true // Prevent type change on duplicate
    };
    setItemEdicao(newItem);
    setModalAberto(true);
  }, []);

  const handleHistory = useCallback((item) => {
    setItemEdicao(item);
    setModalHistoricoAberto(true);
  }, []);

  const handleDelete = useCallback((id) => {
    const item = filaments.find(f => f.id === id);
    if (item) setConfirmacaoExclusao({ aberta: true, item });
  }, [filaments]);

  const fecharModais = useCallback(() => {
    setModalAberto(false);
    setItemEdicao(null);
    setItemConsumo(null);
    setModalFalhaAberto(false);
    setModalHistoricoAberto(false);
    setConfirmacaoExclusao({ aberta: false, item: null });
  }, []);

  const aoSalvarFilamento = async (dados) => {
    try {
      return await salvarFilamento(dados);
      // fecharModais(); // Let components verify saving state if needed
    } catch (_e) { }
  };

  const handleQuickDry = useCallback(async (item) => {
    try {
      await api.patch(`/filaments/${item.id}`, {
        data_secagem: new Date().toISOString()
      });

      await salvarFilamento({
        ...item,
        data_secagem: new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao secar rápido:", error);
      addToast("Erro ao registrar secagem.", 'error');
    }
  }, [salvarFilamento, addToast]);

  const aoConfirmarExclusao = async () => {
    const { item } = confirmacaoExclusao;
    if (!item) return;
    try {
      await excluirFilamento(item.id);
    } catch (_e) { } finally {
      fecharModais();
    }
  };

  const acoes = useMemo(() => ({
    aoEditar: handleEdit,
    aoExcluir: handleDelete,
    aoConsumir: setItemConsumo,
    aoDuplicar: handleDuplicate,
    aoVerHistorico: handleHistory,
    aoImprimirEtiqueta: setItemEtiqueta,
    aoSecar: handleQuickDry
  }), [handleEdit, handleDelete, handleDuplicate, handleHistory, handleQuickDry]);

  /* TABS CONTROL */
  const extraControls = (
    <div className="flex bg-zinc-900/50 p-1 h-11 rounded-2xl border border-zinc-800/50 items-center">
      {['all', 'FDM', 'SLA'].map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`px-4 h-full text-[10px] font-bold uppercase rounded-xl transition-all flex items-center ${activeTab === tab
            ? 'bg-zinc-800 text-white shadow-sm'
            : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          {tab === 'all' ? 'Todos' : tab}
        </button>
      ))}
    </div>
  );

  const novoButton = (
    <div className="flex items-center gap-2">
      <Button
        onClick={openScanner}
        variant="secondary"
        size="icon"
        className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-zinc-900/50 hover:border-white/20 w-11 h-11 rounded-2xl"
        icon={ScanBarcode}
      />
      <Button
        onClick={() => {
          const defaultType = activeTab === 'SLA' ? 'SLA' : 'FDM';

          setItemEdicao({ tipo: defaultType });
          setModalAberto(true);
        }}
        variant="secondary"
        className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-zinc-900/50 hover:border-white/20 h-11 rounded-2xl px-6"
        icon={Plus}
        data-tour="filament-add-btn"
      >
        Novo
      </Button>
    </div>
  );

  return (
    <ManagementLayout>
      <PageHeader
        title="Meus Materiais"
        subtitle="Gerencie seu estoque de filamentos e resinas"
        accentColor="text-rose-500"
        searchQuery={busca}
        onSearchChange={setBusca}
        placeholder="BUSCAR MATERIAL..."
        extraControls={extraControls}
        actionButton={novoButton}
      />

      <div className="space-y-6">
        <StatusFilamentos
          pesoTotal={stats.pesoKg}
          contagemEstoqueBaixo={lowStockCount}
          valorTotal={stats.valorTotal}
          weatherData={{ temp, humidity, loading: weatherLoading }}
          estatisticasFalhas={failureStats}
        />

        <FiltrosFilamento
          filtros={filtros}
          setFiltros={setFiltros}
          modoVisualizacao={modoVisualizacao}
          setModoVisualizacao={setModoVisualizacao}
          marcasDisponiveis={availableBrands}
          materiaisDisponiveis={availableMaterials}
        />

        {Object.entries(grupos).length > 0 ? (
          <div className="pb-6">
            <VirtualShelves
              groups={grupos}
              viewMode={modoVisualizacao}
              onAdd={(groupMaterial) => {
                setItemEdicao({ material: groupMaterial });
                setModalAberto(true);
              }}
              renderItem={(item) => modoVisualizacao === 'grid' ? (
                <CartaoFilamento
                  item={item}
                  umidadeAtual={humidity}
                  temperaturaAtual={temp}
                  aoEditar={acoes.aoEditar}
                  aoExcluir={acoes.aoExcluir}
                  aoConsumir={acoes.aoConsumir}
                  aoDuplicar={acoes.aoDuplicar}
                  aoVerHistorico={acoes.aoVerHistorico}
                  aoImprimirEtiqueta={acoes.aoImprimirEtiqueta}
                  aoSecar={acoes.aoSecar}
                  highlightedItemId={highlightedItemId}
                />
              ) : (
                <LinhaFilamento
                  item={item}
                  umidadeAtual={humidity}
                  temperaturaAtual={temp}
                  aoEditar={acoes.aoEditar}
                  aoExcluir={acoes.aoExcluir}
                  aoConsumir={acoes.aoConsumir}
                  aoDuplicar={acoes.aoDuplicar}
                  aoVerHistorico={acoes.aoVerHistorico}
                  aoImprimirEtiqueta={acoes.aoImprimirEtiqueta}
                  highlightedItemId={highlightedItemId}
                />
              )}
            />
          </div>
        ) : (
          !loading && (
            <EstadoVazio
              title="Nenhum material encontrado"
              description="Tente ajustar os filtros ou adicione um novo material."
              icon={PackageSearch}
            />
          )
        )}
      </div>

      {/* --- MODAIS DE NEGOCIO --- */}
      <ModalFilamento aberto={modalAberto} aoFechar={fecharModais} aoSalvar={aoSalvarFilamento} dadosIniciais={itemEdicao} />
      <ModalBaixaRapida aberto={!!itemConsumo} aoFechar={fecharModais} item={itemConsumo} aoSalvar={aoSalvarFilamento} />
      <ModalHistoricoFilamento aberto={modalHistoricoAberto} aoFechar={fecharModais} item={itemEdicao} />
      <ModalRegistrarFalha aberto={modalFalhaAberto} aoFechar={fecharModais} aoSalvar={fetchFailures} />
      <ModalEtiqueta isOpen={!!itemEtiqueta} onClose={() => setItemEtiqueta(null)} item={itemEtiqueta} />

      <ModalExcluirFilamento
        aberto={confirmacaoExclusao.aberta}
        aoFechar={fecharModais}
        aoConfirmar={aoConfirmarExclusao}
        item={confirmacaoExclusao.item}
        carregando={salvando}
      />
    </ManagementLayout>
  );
}
