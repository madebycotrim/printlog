import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Scan, AlertTriangle, Trash2, X } from "lucide-react"; // Importei ícones extras
// LAYOUT E COMPONENTES GLOBAIS
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
// LÓGICA E STORE (Zustand)
import { useFilamentStore } from "../features/filamentos/logic/filaments.js";
import { useLocalWeather } from "../hooks/useLocalWeather";
// COMPONENTES DA FUNCIONALIDADE (FILAMENTOS)
import StatusFilamentos from "../features/filamentos/components/statusFilamentos";
import FilamentHeader from "../features/filamentos/components/header";
import SessaoFilamentos from "../features/filamentos/components/sessaoFilamentos";
import ModalFilamento from "../features/filamentos/components/modalFilamento.jsx";
import ModalBaixaRapida from "../features/filamentos/components/modalBaixaEstoque.jsx";

const VIEW_MODE_KEY = "printlog_filaments_view";
const DEFAULT_VIEW_MODE = "grid";

export default function FilamentosPage() {
  const [larguraSidebar, setLarguraSidebar] = useState(68);
  const [busca, setBusca] = useState("");
  const deferredBusca = useDeferredValue(busca);

  const { temp, humidity, loading: weatherLoading } = useLocalWeather();
  const { filaments, fetchFilaments, saveFilament, deleteFilament, loading } = useFilamentStore();

  const [viewMode, setViewMode] = useState(() => localStorage.getItem(VIEW_MODE_KEY) || DEFAULT_VIEW_MODE);
  
  // Estados de Controle de Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  const [itemConsumo, setItemConsumo] = useState(null);
  
  // NOVO: Estados para o Modal de Exclusão
  const [confirmacaoExclusao, setConfirmacaoExclusao] = useState({ aberta: false, item: null });

  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });

  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        await fetchFilaments();
      } catch (error) {
        if (isMounted) showToast("Erro ao carregar os filamentos.", "error");
      }
    };
    loadData();
    return () => { isMounted = false; };
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

    Object.keys(map).forEach(key => map[key].sort((a, b) => (a.nome || "").localeCompare(b.nome || "")));

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
    setConfirmacaoExclusao({ aberta: false, item: null }); // Fecha modal de exclusão
  }, []);

  const aoSalvarFilamento = async (dados) => {
    try {
      const isEdicao = !!(dados.id || itemEdicao?.id);
      await saveFilament(dados);
      fecharModais();
      showToast(isEdicao ? "Alterações salvas!" : "Novo material adicionado!");
    } catch (e) {
      showToast("Tivemos um problema ao salvar.", "error");
    }
  };

  // Gatilho que abre o modal de confirmação
  const handleOpenDeleteModal = (id) => {
    const item = filaments.find(f => f.id === id);
    if (item) setConfirmacaoExclusao({ aberta: true, item });
  };

  // Execução real da exclusão
  const aoConfirmarExclusao = async () => {
    const { item } = confirmacaoExclusao;
    if (!item) return;

    try {
      await deleteFilament(item.id);
      showToast("Material removido com sucesso.");
    } catch (e) {
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
        className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out"
        style={{ marginLeft: `${larguraSidebar}px` }}
      >
        {/* FUNDO DECORATIVO */}
        <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 opacity-[0.1]" style={{
            backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
          }} />
        </div>

        <FilamentHeader
          busca={busca}
          setBusca={setBusca}
          viewMode={viewMode}
          setViewMode={setViewMode}
          onAddClick={() => { setItemEdicao(null); setModalAberto(true); }}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 xl:p-12 relative z-10 scroll-smooth">
          <div className="max-w-[1600px] mx-auto space-y-16">
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <StatusFilamentos
                totalWeight={stats.pesoKg}
                lowStockCount={lowStockCount}
                valorTotal={stats.valorTotal}
                weather={{ temp, humidity, loading: weatherLoading }}
              />
            </div>

            {Object.entries(grupos).length > 0 ? (
              <div className="space-y-24 pb-40 animate-in fade-in slide-in-from-bottom-6 duration-1000">
                {Object.entries(grupos).map(([tipo, items]) => (
                  <SessaoFilamentos
                    key={tipo}
                    tipo={tipo}
                    items={items}
                    viewMode={viewMode}
                    currentHumidity={humidity}
                    acoes={{
                      onEdit: (item) => { setItemEdicao(item); setModalAberto(true); },
                      onDelete: handleOpenDeleteModal, // Alterado aqui
                      onConsume: setItemConsumo
                    }}
                  />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10">
                   <Scan size={48} strokeWidth={1.2} className="text-sky-500/40" />
                </div>
              )
            )}
          </div>
        </div>

        {/* --- MODAIS --- */}
        
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

        {/* NOVO: Modal de Confirmação de Exclusão Customizado */}
        {confirmacaoExclusao.aberta && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8">
                <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-red-500/10 mx-auto">
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
                
                <h3 className="text-xl font-bold text-center text-zinc-100 mb-2">
                  Excluir Material?
                </h3>
                
                <p className="text-center text-zinc-400 text-sm leading-relaxed">
                  Você está prestes a remover <span className="text-zinc-200 font-semibold">"{confirmacaoExclusao.item?.nome}"</span>. 
                  Essa ação é permanente e não poderá ser desfeita.
                </p>
              </div>

              <div className="flex gap-3 p-6 bg-zinc-900/50 border-t border-zinc-800">
                <button
                  onClick={fecharModais}
                  className="flex-1 px-6 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold uppercase tracking-widest transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={aoConfirmarExclusao}
                  className="flex-1 px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-red-900/20 flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
