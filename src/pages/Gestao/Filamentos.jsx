import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Scan, AlertTriangle, Trash2, X, PackageSearch, Database, Plus, Search, LayoutGrid, List } from "lucide-react";

// LAYOUT E COMPONENTES GLOBAIS
import MainSidebar from "../../layouts/mainSidebar";
import Toast from "../../components/Toast";
import Popup from "../../components/Popup"; // Componente Unificado
import api from "../../utils/api"; // Configured API instance

// LÃ“GICA E STORE (Zustand)
import { useFilamentStore } from "../../features/filamentos/logic/filaments.js";


// COMPONENTES DA FUNCIONALIDADE (FILAMENTOS)
import StatusFilamentos from "../../features/filamentos/components/StatusFilamentos";
import SessaoFilamentos from "../../features/filamentos/components/SessaoFilamentos";
import ModalFilamento from "../../features/filamentos/components/ModalFilamento.jsx";
import ModalBaixaRapida from "../../features/filamentos/components/ModalBaixaRapida.jsx";
import ModalRegistrarFalha from '../../features/filamentos/components/ModalRegistrarFalha';

const VIEW_MODE_KEY = "printlog_filaments_view";
const DEFAULT_VIEW_MODE = "grid";

export default function FilamentosPage() {
  const [larguraSidebar, setLarguraSidebar] = useState(68);
  const [busca, setBusca] = useState("");
  const deferredBusca = useDeferredValue(busca);

  // const { temp, humidity, loading: weatherLoading } = useLocalWeather();
  const temp = 25; // Default/Mock value
  const humidity = 50; // Default/Mock value
  const weatherLoading = false;
  const { filaments, fetchFilaments, saveFilament, deleteFilament, loading } = useFilamentStore();

  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || DEFAULT_VIEW_MODE);

  // Estados de Controle de Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  const [itemConsumo, setItemConsumo] = useState(null);
  const [modalFalhaAberto, setModalFalhaAberto] = useState(false);
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

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
  const { grupos, stats, lowStockCount } = useMemo(() => {
    const termo = deferredBusca.toLowerCase().trim();
    const listaOriginal = Array.isArray(filaments) ? filaments : [];

    const filtrados = listaOriginal.filter(f => {
      const nome = (f.nome || "").toLowerCase();
      const material = (f.material || "").toLowerCase();
      const marca = (f.marca || "").toLowerCase();
      return nome.includes(termo) || material.includes(termo) || marca.includes(termo);
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

    const map = filtrados.reduce((acc, f) => {
      const materialKey = (f.material || "OUTROS").toUpperCase().trim();
      if (!acc[materialKey]) acc[materialKey] = [];
      acc[materialKey].push(f);
      return acc;
    }, {});

    return {
      grupos: map,
      lowStockCount: lowStock,
      stats: { valorTotal: valorTotalAcumulado, pesoKg: totalG / 1000 }
    };
  }, [filaments, deferredBusca]);

  // HANDLERS
  const fecharModais = useCallback(() => {
    setModalAberto(false);
    setItemEdicao(null);
    setItemConsumo(null);
    setModalFalhaAberto(false);
    setConfirmacaoExclusao({ aberta: false, item: null });
  }, []);

  const aoSalvarFilamento = async (dados) => {
    try {
      const isEdicao = !!(dados.id || itemEdicao?.id);
      await saveFilament(dados);
      fecharModais();
      showToast(isEdicao ? "AlteraÃ§Ãµes salvas!" : "Novo material adicionado!");
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

  return (
    <div className="flex h-screen w-full bg-zinc-950 text-zinc-200 font-sans antialiased overflow-hidden">
      <MainSidebar onCollapseChange={(collapsed) => setLarguraSidebar(collapsed ? 68 : 256)} />

      {toast.visible && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        />
      )}

      <main
        className="flex-1 flex flex-col relative overflow-y-auto custom-scrollbar"
        style={{ marginLeft: `${larguraSidebar}px` }}
      >
        {/* FUNDO DECORATIVO (Igual Dashboard) */}
        <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
          }} />

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
            <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-rose-500/30 via-transparent to-transparent" />
          </div>
        </div>

        {/* CONTEÃšDO PRINCIPAL */}
        <div className="relative z-10 p-8 xl:p-12 max-w-[1600px] mx-auto w-full">

          {/* Header unificado (Estilo Dashboard) */}
          <div className="mb-12 animate-fade-in-up">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">
                  Meus Filamentos
                </h1>
                <p className="text-sm text-zinc-500 capitalize">
                  GestÃ£o de Estoque e Materiais
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Barra de Busca */}
                <div className="relative group hidden md:block">
                  <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${busca ? 'text-rose-400' : 'text-zinc-600'}`}>
                    <Search size={14} strokeWidth={3} />
                  </div>
                  <input
                    className="
                                    w-64 bg-zinc-950/40/40 border border-zinc-800/50 rounded-xl py-2.5 pl-11 pr-10 
                                    text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                                    focus:border-rose-500/50 focus:bg-zinc-950/40/80 focus:ring-4 focus:ring-rose-500/10 
                                    placeholder:text-zinc-700 placeholder:text-[9px]
                                "
                    placeholder="BUSCAR MATERIAL..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                  />
                  {busca && (
                    <button
                      onClick={() => setBusca("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-rose-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-zinc-900/50 border border-zinc-800/50 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'grid' ? 'bg-rose-500/20 text-rose-400' : 'text-zinc-600 hover:text-zinc-200'}`}
                  >
                    <LayoutGrid size={16} strokeWidth={viewMode === 'grid' ? 2.5 : 2} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all duration-300 ${viewMode === 'list' ? 'bg-rose-500/20 text-rose-400' : 'text-zinc-600 hover:text-zinc-200'}`}
                  >
                    <List size={16} strokeWidth={viewMode === 'list' ? 2.5 : 2} />
                  </button>
                </div>

                {/* BotÃ£o DesperdÃ­cio */}
                <button
                  onClick={() => setModalFalhaAberto(true)}
                  className="
                                group relative h-11 w-11 flex items-center justify-center rounded-xl 
                                bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40
                                transition-all duration-300 active:scale-95
                            "
                  title="Registrar DesperdÃ­cio"
                >
                  <Trash2 size={18} className="text-rose-500 group-hover:scale-110 transition-transform" />
                </button>

                {/* BotÃ£o Novo Filamento */}
                <button
                  onClick={() => { setItemEdicao(null); setModalAberto(true); }}
                  className="
                                group relative h-11 px-6 overflow-hidden bg-rose-600 hover:bg-rose-500 
                                rounded-xl transition-all duration-300 active:scale-95 shadow-lg shadow-rose-900/40
                                flex items-center gap-3 text-white
                            "
                >
                  <Plus size={16} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em]">
                    Novo
                  </span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </button>
              </div>
            </div>

            {/* Busca Mobile */}
            <div className="mt-4 md:hidden relative group">
              <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-all duration-300 ${busca ? 'text-rose-400' : 'text-zinc-600'}`}>
                <Search size={14} strokeWidth={3} />
              </div>
              <input
                className="
                            w-full bg-zinc-950/40/40 border border-zinc-800/50 rounded-xl py-2.5 pl-11 pr-10 
                            text-[11px] text-zinc-200 outline-none transition-all font-bold uppercase tracking-widest 
                            focus:border-rose-500/50 focus:bg-zinc-950/40/80 focus:ring-4 focus:ring-rose-500/10 
                            placeholder:text-zinc-700 placeholder:text-[9px]
                        "
                placeholder="BUSCAR MATERIAL..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>
          </div>

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

            {Object.entries(grupos).length > 0 ? (
              <div className="space-y-8 pb-12">
                {Object.entries(grupos).map(([tipo, items]) => (
                  <SessaoFilamentos
                    key={tipo}
                    tipo={tipo}
                    items={items}
                    viewMode={viewMode}
                    currentHumidity={humidity}
                    acoes={{
                      onEdit: (item) => { setItemEdicao(item); setModalAberto(true); },
                      onDelete: (id) => setConfirmacaoExclusao({ aberta: true, item: filaments.find(f => f.id === id) }),
                      onConsume: setItemConsumo
                    }}
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
        </div>

        {/* --- MODAIS DE NEGÃ“CIO --- */}

        <ModalFilamento
          aberto={modalAberto}
          aoFechar={fecharModais}
          aoSalvar={aoSalvarFilamento}
          dadosIniciais={itemEdicao}
        />

        <ModalBaixaRapida
          aberto={!!itemConsumo}
          aoFechar={fecharModais}
          item={itemConsumo}
          aoSalvar={aoSalvarFilamento}
        />

        <ModalRegistrarFalha
          aberto={modalFalhaAberto}
          aoFechar={fecharModais}
          aoSalvar={fetchFailures}
        />

        {/* --- POPUP DE CONFIRMAÃ‡ÃƒO DE EXCLUSÃƒO (UNIFICADO) --- */}
        <Popup
          isOpen={confirmacaoExclusao.aberta}
          onClose={fecharModais}
          title="Excluir Material?"
          subtitle="GestÃ£o de Insumos"
          icon={AlertTriangle}
          footer={
            <div className="flex gap-3 w-full">
              <button
                onClick={fecharModais}
                className="flex-1 h-12 rounded-xl bg-zinc-950/40 border border-zinc-800 text-zinc-500 text-[10px] font-black uppercase tracking-widest hover:text-white"
              >
                Cancelar
              </button>
              <button
                onClick={aoConfirmarExclusao}
                className="flex-1 h-12 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-rose-900/20 flex items-center justify-center gap-2"
              >
                <Trash2 size={16} /> Confirmar ExclusÃ£o
              </button>
            </div>
          }
        >
          <div className="p-8 text-center space-y-4">
            <p className="text-zinc-400 text-sm font-medium leading-relaxed">
              VocÃª estÃ¡ prestes a remover permanentemente o material <br />
              <span className="text-zinc-100 font-bold uppercase tracking-tight">
                "{confirmacaoExclusao.item?.nome}"
              </span>
            </p>
            <div className="p-4 rounded-2xl bg-rose-500/5 border border-rose-500/10">
              <p className="text-[10px] text-rose-500/80 font-black uppercase tracking-widest">
                AtenÃ§Ã£o: Esta aÃ§Ã£o nÃ£o pode ser desfeita e os dados histÃ³ricos vinculados a este lote serÃ£o afetados.
              </p>
            </div>
          </div>
        </Popup>

      </main>
    </div>
  );
}

