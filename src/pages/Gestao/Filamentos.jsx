import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { PackageSearch, Plus } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import api from "../../utils/api";

// LÓGICA E STORE (Zustand)
import { useFilaments, useFilamentMutations } from "../../features/filamentos/logic/filamentQueries";

// COMPONENTES DA FUNCIONALIDADE (FILAMENTOS)
import StatusFilamentos from "../../features/filamentos/components/StatusFilamentos";
import { VirtualRack } from "../../features/filamentos/components/VirtualRack";
import ModalFilamento from "../../features/filamentos/components/ModalFilamento.jsx";
import ModalBaixaRapida from "../../features/filamentos/components/ModalBaixaRapida.jsx";
import ModalHistoricoFilamento from "../../features/filamentos/components/ModalHistoricoFilamento.jsx";
import ModalRegistrarFalha from '../../features/filamentos/components/ModalRegistrarFalha';
import ModalExcluirFilamento from '../../features/filamentos/components/ModalExcluirFilamento';

// NOVOS COMPONENTES (FILTROS)
import { normalizeString } from "../../utils/stringUtils";
import FilamentFilters from "../../features/filamentos/components/FilamentFilters";

import { useLocalWeather } from "../../hooks/useLocalWeather";

const VIEW_MODE_KEY = "printlog_filaments_view";
const DEFAULT_VIEW_MODE = "grid";

export default function FilamentosPage() {
  const [busca, setBusca] = useState("");
  const deferredBusca = useDeferredValue(busca);

  const { temp, humidity, loading: weatherLoading } = useLocalWeather();

  const { data: filaments = [], isLoading: loading } = useFilaments();
  const { saveFilament, deleteFilament, isSaving } = useFilamentMutations();

  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || DEFAULT_VIEW_MODE);

  const [filters, setFilters] = useState({
    lowStock: false,
    materials: [],
    brands: []
  });

  // Estados de Controle de Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  const [itemConsumo, setItemConsumo] = useState(null);
  const [modalFalhaAberto, setModalFalhaAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

  // Fetch Failures Stats
  const [failureStats, setFailureStats] = useState({ totalWeight: 0, totalCost: 0 });
  const fetchFailures = useCallback(() => {
    api.get('/failures')
      .then(res => {
        if (res.data?.stats) setFailureStats(res.data.stats);
      })
      .catch(err => {
        console.error("Erro ao buscar falhas:", err);
        if (err.response?.data) {
          console.error("Detalhes do erro backend:", err.response.data);
        }
      });
  }, []);

  useEffect(() => {
    fetchFailures();
  }, [fetchFailures]);

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // 1. Pre-processamento (Memoized) - Gera string de busca indexada
  const searchableFilaments = useMemo(() => {
    const list = Array.isArray(filaments) ? filaments : [];
    return list.map(f => ({
      ...f,
      // Cria uma "row" virtual de busca
      _searchStr: normalizeString(`${f.nome || ""} ${f.material || ""} ${f.marca || ""}`)
    }));
  }, [filaments]);

  // 2. PROCESSAMENTO DE DADOS (Filtragem e Agrupamento)
  const { grupos, stats, lowStockCount, availableBrands, availableMaterials } = useMemo(() => {
    const termo = normalizeString(deferredBusca);

    // 2.1 Extrair Metadados (usando a lista processada)
    const allBrands = [...new Set(searchableFilaments.map(f => f.marca).filter(Boolean))];
    const allMaterials = [...new Set(searchableFilaments.map(f => f.material).filter(Boolean))];

    // 2.2 Filtragem Otimizada
    const filtrados = searchableFilaments.filter(f => {
      // Busca direta na string pré-processada (O(1) vs O(Regex))
      const matchesSearch = !termo || f._searchStr.includes(termo);

      if (!matchesSearch) return false;

      if (filters.lowStock) {
        const total = Math.max(1, Number(f.peso_total) || 1000);
        const ratio = (f.peso_atual || 0) / total;
        if (ratio > 0.2 && f.peso_atual >= 150) return false;
      }

      if (filters.materials.length > 0 && !filters.materials.includes(f.material)) return false;
      if (filters.brands.length > 0 && !filters.brands.includes(f.marca)) return false;

      return true;
    });

    let totalG = 0;
    let valorTotalAcumulado = 0;
    let lowStock = 0;

    // Loop na lista original/completa para stats globais? 
    // O código original fazia loop na "listaOriginal" (agora searchableFilaments) para calcular lowStockCount GLOBAL e stats GLOBAIS?
    // Vamos verificar o código original:
    // "listaOriginal.forEach(f => { ... })" -> Sim, era na lista completa.

    searchableFilaments.forEach(f => {
      const atual = Number(f.peso_atual) || 0;
      const total = Math.max(1, Number(f.peso_total) || 1000);
      const preco = Number(f.preco) || 0;
      totalG += atual;
      valorTotalAcumulado += (preco / total) * atual;
      if ((atual / total) <= 0.2 || atual < 150) lowStock++;
    });

    const map = filtrados.reduce((acc, item) => {
      const mat = item.material || "SEM MATERIAL";
      if (!acc[mat]) acc[mat] = [];
      acc[mat].push(item);
      return acc;
    }, {});

    const sortedMap = Object.keys(map).sort().reduce((obj, key) => {
      obj[key] = map[key];
      return obj;
    }, {});

    return {
      grupos: sortedMap,
      lowStockCount: lowStock,
      stats: { valorTotal: valorTotalAcumulado, pesoKg: totalG / 1000 },
      availableBrands: allBrands,
      availableMaterials: allMaterials
    };
  }, [searchableFilaments, deferredBusca, filters]);

  // HANDLERS
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

  const acoes = useMemo(() => ({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onConsume: setItemConsumo,
    onDuplicate: handleDuplicate,
    onHistory: handleHistory
  }), [handleEdit, handleDelete, handleDuplicate, handleHistory]);

  const aoSalvarFilamento = async (dados) => {
    try {
      await saveFilament(dados);
      fecharModais();
    } catch (_e) { }
  };

  const aoConfirmarExclusao = async () => {
    const { item } = confirmacaoExclusao;
    if (!item) return;
    try {
      await deleteFilament(item.id);
    } catch (_e) { } finally {
      fecharModais();
    }
  };

  const extraControls = null;

  const novoButton = (
    <Button
      onClick={() => { setItemEdicao(null); setModalAberto(true); }}
      variant="secondary"
      className="bg-zinc-800/80 hover:bg-zinc-800 text-zinc-200 border border-white/10 shadow-lg hover:shadow-xl hover:shadow-zinc-900/50 hover:border-white/20"
      icon={Plus}
      data-tour="filament-add-btn"
    >
      Novo
    </Button>
  );

  return (
    <ManagementLayout>

      <PageHeader
        title="Meus Carretéis"
        subtitle="Gerencie seu estoque de filamentos de forma simples"
        accentColor="text-rose-500"
        searchQuery={busca}
        onSearchChange={setBusca}
        placeholder="BUSCAR NO ESTOQUE..."
        extraControls={extraControls}
        actionButton={novoButton}
      />

      <div className="space-y-6">
        <div>
          <StatusFilamentos
            totalWeight={stats.pesoKg}
            lowStockCount={lowStockCount}
            valorTotal={stats.valorTotal}
            weather={{ temp, humidity, loading: weatherLoading }}
            failureStats={failureStats}
          />
        </div>

        <div>
          <FilamentFilters
            filters={filters}
            setFilters={setFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            availableBrands={availableBrands}
            availableMaterials={availableMaterials}
          />
        </div>

        {Object.entries(grupos).length > 0 ? (
          <div className="pb-6">
            {/* VIRTUAL RACK - New Visual Component */}
            <VirtualRack
              groupedFilaments={grupos}
              currentHumidity={humidity}
              currentTemperature={temp}
              acoes={acoes}
              viewMode={viewMode}
            />
          </div>
        ) : (
          !loading && (
            <EmptyState
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

      <ModalExcluirFilamento
        aberto={confirmacaoExclusao.aberta}
        aoFechar={fecharModais}
        aoConfirmar={aoConfirmarExclusao}
        item={confirmacaoExclusao.item}
        isLoading={isSaving}
      />
    </ManagementLayout>
  );
}
