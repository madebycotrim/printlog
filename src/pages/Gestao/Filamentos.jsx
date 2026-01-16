import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Scan, AlertTriangle, Trash2, X, PackageSearch, Database, Plus, Search, LayoutGrid, List } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import ManagementLayout from "../../layouts/ManagementLayout";
import PageHeader from "../../components/ui/PageHeader";
import Popup from "../../components/Popup"; // Componente Unificado
import api from "../../utils/api"; // Configured API instance

// LÓGICA E STORE (Zustand)
import { useFilamentStore } from "../../features/filamentos/logic/filaments.js";

// COMPONENTES DA FUNCIONALIDADE (FILAMENTOS)
import StatusFilamentos from "../../features/filamentos/components/StatusFilamentos";
import SessaoFilamentos from "../../features/filamentos/components/SessaoFilamentos";
import ModalFilamento from "../../features/filamentos/components/ModalFilamento.jsx";
import ModalBaixaRapida from "../../features/filamentos/components/ModalBaixaRapida.jsx";
import ModalRegistrarFalha from '../../features/filamentos/components/ModalRegistrarFalha';
import { useToastStore } from "../../stores/toastStore";

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
  const { filaments, fetchFilaments, saveFilament, deleteFilament, loading } = useFilamentStore();

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

  const { addToast } = useToastStore();

  const showToast = useCallback((message, type = 'success') => {
    addToast(message, type);
  }, [addToast]);

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

  useEffect(() => {
    fetchFilaments().catch(() => showToast("Erro ao carregar os filamentos.", "error"));
  }, [fetchFilaments, showToast]);

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
      const isEdicao = !!(dados.id || itemEdicao?.id);
      await saveFilament(dados);
      fecharModais();
      showToast(isEdicao ? "Alterações salvas!" : "Novo material adicionado!");
    } catch (_e) {
      showToast("Tivemos um problema ao salvar.", "error");
    }
  };

  const aoConfirmarExclusao = async () => {
    const { item } = confirmacaoExclusao;
    if (!item) return;
    try {
      await deleteFilament(item.id);
      showToast("Material removido com sucesso.");
    } catch (_e) {
      showToast("Erro ao excluir o material.", "error");
    } finally {
      fecharModais();
    }
  };

  const extraControls = (
    <div className="flex items-center gap-4">
      {/* Botão Desperdício */}
      <button onClick={() => setModalFalhaAberto(true)} className="group relative h-11 w-11 flex items-center justify-center rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 transition-all duration-300 active:scale-95" title="Registrar Desperdício">
        <Trash2 size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
      </button>
    </div>
  );

  const novoButton = (
    <button
      onClick={() => { setItemEdicao(null); setModalAberto(true); }}
      className="group relative h-11 px-6 overflow-hidden bg-rose-600 hover:bg-rose-500 rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-rose-900/40 flex items-center gap-3 text-white"
    >
      <Plus size={16} strokeWidth={3} />
      <span className="text-[10px] font-black uppercase tracking-[0.15em]">Novo</span>
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
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
              <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800/60 rounded-[3rem] bg-zinc-950/40/5 backdrop-blur-sm">
                <PackageSearch size={48} strokeWidth={1} className="mb-4 text-zinc-700" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600">Nenhum material encontrado</p>
              </div>
            )
          )}
        </div>

        {/* --- MODAIS DE NEGOCIO --- */}
        <ModalFilamento aberto={modalAberto} aoFechar={fecharModais} aoSalvar={aoSalvarFilamento} dadosIniciais={itemEdicao} />
        <ModalBaixaRapida aberto={!!itemConsumo} aoFechar={fecharModais} item={itemConsumo} aoSalvar={aoSalvarFilamento} />
        <ModalRegistrarFalha aberto={modalFalhaAberto} aoFechar={fecharModais} aoSalvar={fetchFailures} />

        {/* --- POPUP DE CONFIRMAÇÃO DE EXCLUSÃO (UNIFICADO) --- */}
        <Popup
          isOpen={confirmacaoExclusao.aberta}
          onClose={fecharModais}
          title="Excluir Material?"
          subtitle="Gestão de Insumos"
          icon={AlertTriangle}
          footer={
            <div className="flex gap-3 w-full">
              <button onClick={fecharModais} className="flex-1 h-12 rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white">
                Cancelar
              </button>
              <button onClick={aoConfirmarExclusao} className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2">
                <Trash2 size={16} /> Confirmar Exclusão
              </button>
            </div>
          }
        >
          <div className="p-8 text-center space-y-4">
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              Você está prestes a remover permanentemente o material <br />
              <span className="text-zinc-100 font-bold uppercase tracking-tight">"{confirmacaoExclusao.item?.nome}"</span>
            </p>
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
              <p className="text-[10px] text-rose-500/80 font-black uppercase tracking-widest">
                Atenção: Esta ação não pode ser desfeita e os dados históricos vinculados a este lote serão afetados.
              </p>
            </div>
          </div>
        </Popup>
      </div>
    </ManagementLayout>
  );
}

