import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Scan, AlertTriangle, Trash2, X, PackageSearch, Database, Plus, Search, LayoutGrid, List } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import Modal from "../../components/ui/Modal"; // Componente Unificado
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";
import ConfirmModal from "../../components/ui/ConfirmModal";
import api from "../../utils/api"; // Configured API instance

// LÓGICA E STORE (Zustand)
import { useFilaments, useFilamentMutations } from "../../features/filamentos/logic/filamentQueries";

// COMPONENTES DA FUNCIONALIDADE (FILAMENTOS)
import StatusFilamentos from "../../features/filamentos/components/StatusFilamentos";
import SessaoFilamentos from "../../features/filamentos/components/SessaoFilamentos";
import ModalFilamento from "../../features/filamentos/components/ModalFilamento.jsx";
import ModalBaixaRapida from "../../features/filamentos/components/ModalBaixaRapida.jsx";
import ModalRegistrarFalha from '../../features/filamentos/components/ModalRegistrarFalha';


// NOVOS COMPONENTES (FILTROS)
import { getColorFamily } from "../../utils/colorUtils";
import FilamentFilters from "../../features/filamentos/components/FilamentFilters";

const VIEW_MODE_KEY = "printlog_filaments_view";
const DEFAULT_VIEW_MODE = "grid";

export default function FilamentosPage() {
  const [busca, setBusca] = useState("");
  const deferredBusca = useDeferredValue(busca);

  // const { temp, humidity, loading: weatherLoading } = useLocalWeather();
  const temp = 25; // Default/Mock value
  const humidity = 50; // Default/Mock value
  const weatherLoading = false;
  const { data: filaments = [], isLoading: loading } = useFilaments();
  const { saveFilament, deleteFilament, updateWeight } = useFilamentMutations();

  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || DEFAULT_VIEW_MODE);
  const [groupBy, setGroupBy] = useState("material"); // 'material' | 'color'
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
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });



  // Fetch Failures Stats
  const [failureStats, setFailureStats] = useState({ totalWeight: 0, totalCost: 0 });
  const fetchFailures = useCallback(() => {
    api.get('/failures')
      .then(res => {
        if (res.data?.stats) setFailureStats(res.data.stats);
      })
      .catch(err => console.error("Erro ao buscar falhas:", err));
  }, []);

  useEffect(() => {
    fetchFailures();
  }, [fetchFailures]);

  // Fetch automatico via React Query

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_KEY, viewMode);
  }, [viewMode]);

  // PROCESSAMENTO DE DADOS
  const { grupos, stats, lowStockCount, availableBrands, availableMaterials } = useMemo(() => {
    const termo = deferredBusca.toLowerCase().trim();
    const listaOriginal = Array.isArray(filaments) ? filaments : [];

    // 1. Extrair Metadados (Para filtros)
    const allBrands = [...new Set(listaOriginal.map(f => f.marca).filter(Boolean))];
    const allMaterials = [...new Set(listaOriginal.map(f => f.material).filter(Boolean))];

    // 2. Filtragem Complexa
    const filtrados = listaOriginal.filter(f => {
      // Busca Textual
      const nome = (f.nome || "").toLowerCase();
      const material = (f.material || "").toLowerCase();
      const marca = (f.marca || "").toLowerCase();
      const matchesSearch = nome.includes(termo) || material.includes(termo) || marca.includes(termo);

      if (!matchesSearch) return false;

      // Filtro Status (Baixo Estoque)
      if (filters.lowStock) {
        const total = Math.max(1, Number(f.peso_total) || 1000);
        const ratio = (f.peso_atual || 0) / total;
        if (ratio > 0.2 && f.peso_atual >= 150) return false;
      }

      // Filtro Materiais
      if (filters.materials.length > 0 && !filters.materials.includes(f.material)) return false;

      // Filtro Marcas
      if (filters.brands.length > 0 && !filters.brands.includes(f.marca)) return false;

      return true;
    });

    let totalG = 0;
    let valorTotalAcumulado = 0;
    let lowStock = 0;

    listaOriginal.forEach(f => {
      const atual = Number(f.peso_atual) || 0;
      const total = Math.max(1, Number(f.peso_total) || 1000);
      const preco = Number(f.preco) || 0;
      totalG += atual;
      valorTotalAcumulado += (preco / total) * atual;
      if ((atual / total) <= 0.2 || atual < 150) lowStock++;
    });

    // 3. Agrupamento Dinâmico (Color Intelligence vs Material)
    const map = filtrados.reduce((acc, f) => {
      let groupKey = "OUTROS";

      if (groupBy === 'material') {
        groupKey = (f.material || "OUTROS").toUpperCase().trim();
      } else if (groupBy === 'color') {
        groupKey = getColorFamily(f.cor_hex);
      }

      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(f);
      return acc;
    }, {});

    return {
      grupos: map,
      lowStockCount: lowStock,
      stats: { valorTotal: valorTotalAcumulado, pesoKg: totalG / 1000 },
      availableBrands: allBrands,
      availableMaterials: allMaterials
    };
  }, [filaments, deferredBusca, filters, groupBy]);

  // HANDLERS MEMOIZADOS (Performance)
  const handleEdit = useCallback((item) => {
    setItemEdicao(item);
    setModalAberto(true);
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
    setConfirmacaoExclusao({ aberta: false, item: null });
  }, []);

  const acoes = useMemo(() => ({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onConsume: setItemConsumo
  }), [handleEdit, handleDelete]);

  const aoSalvarFilamento = async (dados) => {
    try {
      await saveFilament(dados);
      fecharModais();
    } catch (_e) {
      // Erro tratado pela mutation
    }
  };

  const aoConfirmarExclusao = async () => {
    const { item } = confirmacaoExclusao;
    if (!item) return;
    try {
      await deleteFilament(item.id);
    } catch (_e) {
      // Erro tratado pela mutation
    } finally {
      fecharModais();
    }
  };

  const extraControls = (
    <div className="flex items-center gap-4">
      {/* Botão Desperdício */}
      <Button
        variant="danger"
        size="md"
        className="bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20 hover:border-rose-500/40"
        onClick={() => setModalFalhaAberto(true)}
        title="Registrar Desperdício"
        icon={Trash2}
      />
    </div>
  );

  const novoButton = (
    <Button
      onClick={() => { setItemEdicao(null); setModalAberto(true); }}
      variant="danger"
      icon={Plus}
      data-tour="filament-add-btn"
    >
      Novo
    </Button>
  );

  return (
    <ManagementLayout>
      <div className="p-8 xl:p-12 max-w-[1600px] mx-auto w-full space-y-8 animate-in fade-in duration-500">

        <PageHeader
          title="Meus Filamentos"
          subtitle="Gestão de Estoque e Materiais"
          searchQuery={busca}
          onSearchChange={setBusca}
          placeholder="BUSCAR MATERIAL..."
          extraControls={extraControls}
          actionButton={novoButton}
        />

        <div className="space-y-8">
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
              groupBy={groupBy}
              setGroupBy={setGroupBy}
              availableBrands={availableBrands}
              availableMaterials={availableMaterials}
            />
          </div>

          {Object.entries(grupos).length > 0 ? (
            <div className="space-y-8 pb-12">
              {Object.entries(grupos).map(([tipo, items]) => (
                <SessaoFilamentos
                  key={tipo}
                  tipo={tipo}
                  items={items}
                  viewMode={viewMode}
                  currentHumidity={humidity}
                  acoes={acoes}
                />
              ))}
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
        <ModalRegistrarFalha aberto={modalFalhaAberto} aoFechar={fecharModais} aoSalvar={fetchFailures} />

        {/* --- POPUP DE CONFIRMAÇÃO DE EXCLUSÃO (UNIFICADO) --- */}
        {/* --- POPUP DE CONFIRMAÇÃO DE EXCLUSÃO (UNIFICADO) --- */}
        <ConfirmModal
          isOpen={confirmacaoExclusao.aberta}
          onClose={fecharModais}
          onConfirm={aoConfirmarExclusao}
          title="Excluir Material?"
          message={
            <span>
              Você está prestes a remover permanentemente o material <br />
              <span className="text-zinc-100 font-bold uppercase tracking-tight">"{confirmacaoExclusao.item?.nome}"</span>
            </span>
          }
          description="Atenção: Esta ação não pode ser desfeita e os dados históricos vinculados a este lote serão afetados."
          confirmText="Confirmar Exclusão"
          isDestructive
        />
      </div>
    </ManagementLayout>
  );
}

