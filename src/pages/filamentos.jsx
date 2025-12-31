import React, { useState, useEffect, useMemo, useDeferredValue, useCallback } from "react";
import { Scan } from "lucide-react";
// LAYOUT E COMPONENTES GLOBAIS
import MainSidebar from "../layouts/mainSidebar";
import Toast from "../components/Toast";
// LÓGICA E STORE (Zustand)
import { useFilamentStore } from "../features/filamentos/logic/filaments.js";
import { useLocalWeather } from "../hooks/useLocalWeather";
// COMPONENTES DA FEATURE (FILAMENTOS)
import StatusFilamentos from "../features/filamentos/components/statusFilamentos";
import FilamentHeader from "../features/filamentos/components/header";
import SessaoFilamentos from "../features/filamentos/components/sessaoFilamentos";
import ModalFilamento from "../features/filamentos/components/modalFilamento.jsx";
import ModalBaixaRapida from "../features/filamentos/components/modalBaixaEstoque.jsx";

export default function FilamentosPage() {
  // 1. Estados de UI e Sidebar
  const [larguraSidebar, setLarguraSidebar] = useState(68);
  const [busca, setBusca] = useState("");
  const deferredBusca = useDeferredValue(busca);

  // Hooks de Dados
  const { temp, humidity, loading: weatherLoading } = useLocalWeather();
  const { filaments, fetchFilaments, saveFilament, deleteFilament, loading } = useFilamentStore();

  // Estados de Controle de View e Modais
  const [viewMode, setViewMode] = useState(() => localStorage.getItem("printlog_filaments_view") || "grid");
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEdicao, setItemEdicao] = useState(null);
  const [itemConsumo, setItemConsumo] = useState(null);

  // Sistema de Notificação (Toast)
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });
  const showToast = useCallback((message, type = 'success') => {
    setToast({ visible: true, message, type });
  }, []);

  // Carregamento Inicial (Garante que os dados venham do banco ao montar a página)
  useEffect(() => {
    fetchFilaments();
  }, [fetchFilaments]);

  // Persistência do modo de visualização
  useEffect(() => {
    localStorage.setItem("printlog_filaments_view", viewMode);
  }, [viewMode]);

  // 2. INTELIGÊNCIA DE DADOS (Cálculos de Negócio)
  const { grupos, stats, lowStockCount } = useMemo(() => {
    const termo = deferredBusca.toLowerCase().trim();

    // Lista segura para evitar erros caso filaments esteja indefinido
    const listaOriginal = Array.isArray(filaments) ? filaments : [];

    // Filtra por Nome, Material ou Marca
    const filtrados = listaOriginal.filter(f =>
      (f.nome || "").toLowerCase().includes(termo) ||
      (f.material || "").toLowerCase().includes(termo) ||
      (f.marca || "").toLowerCase().includes(termo)
    );

    // Soma de massa total disponível em gramas
    const totalG = listaOriginal.reduce((acc, curr) => acc + (Number(curr.peso_atual) || 0), 0);

    // Cálculo do valor financeiro imobilizado (Custo por grama * gramas restantes)
    const valorTotal = listaOriginal.reduce((acc, curr) => {
      const atual = Number(curr.peso_atual) || 0;
      const total = Math.max(1, Number(curr.peso_total) || 1000);
      const preco = Number(curr.preco) || 0;
      const custoPorGrama = preco / total;
      return acc + (custoPorGrama * atual);
    }, 0);

    // Contagem de itens com estoque crítico (<= 20% OU < 150g)
    const lowStock = listaOriginal.filter(f => {
      const atual = Number(f.peso_atual) || 0;
      const total = Math.max(1, Number(f.peso_total) || 1000);
      const pct = (atual / total) * 100;
      return pct <= 20 || atual < 150;
    }).length;

    // Agrupamento por Material (PLA, ABS, PETG...)
    const map = {};
    filtrados
      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
      .forEach(f => {
        const materialKey = (f.material || "OUTROS").toUpperCase().trim();
        if (!map[materialKey]) map[materialKey] = [];
        map[materialKey].push(f);
      });

    return {
      grupos: map,
      lowStockCount: lowStock,
      stats: { valorTotal, pesoKg: totalG / 1000 }
    };
  }, [filaments, deferredBusca]);

  // 3. AÇÕES DE PERSISTÊNCIA
  const aoSalvarFilamento = async (dados) => {
    try {
      await saveFilament(dados);
      setModalAberto(false);
      setItemEdicao(null);
      setItemConsumo(null); // Fecha modal de baixa se estiver salvando por lá
      showToast(dados.id ? "Material atualizado com sucesso!" : "Novo material adicionado!");
    } catch (e) {
      showToast("Não foi possível salvar os dados no servidor.", "error");
    }
  };

  const aoDeletarFilamento = async (id) => {
    if (!id) return;
    if (window.confirm("Deseja remover este filamento permanentemente do seu estoque?")) {
      try {
        await deleteFilament(id);
        showToast("Material removido com sucesso.");
      } catch (e) {
        showToast("Erro ao tentar excluir o material.", "error");
      }
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

      <main className="flex-1 flex flex-col relative transition-all duration-300 ease-in-out" style={{ marginLeft: `${larguraSidebar}px` }}>
        {/* BACKGROUND DECORATIVO */}
        <div className="absolute inset-x-0 top-0 h-[600px] z-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute inset-0 opacity-[0.1]" style={{
            backgroundImage: `linear-gradient(to right, #52525b 1px, transparent 1px), linear-gradient(to bottom, #52525b 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent)'
          }} />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1600px] h-full">
            <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-sky-500/30 via-transparent to-transparent" />
          </div>
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

            {/* Dash de Métricas */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <StatusFilamentos
                totalWeight={stats.pesoKg}
                lowStockCount={lowStockCount}
                valorTotal={stats.valorTotal}
                weather={{ temp, humidity, loading: weatherLoading }}
              />
            </div>

            {/* Listagem Agrupada por Material */}
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
                      onDelete: aoDeletarFilamento,
                      onConsume: setItemConsumo
                    }}
                  />
                ))}
              </div>
            ) : (
              !loading && (
                <div className="py-24 flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-[2rem] bg-zinc-900/10">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-sky-500/10 blur-2xl rounded-full" />
                    <Scan size={48} strokeWidth={1.2} className="text-sky-500/40 relative z-10" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-zinc-300 text-xs font-bold uppercase tracking-[0.2em]">
                      Nenhum material encontrado
                    </h3>
                    <p className="text-zinc-600 text-[10px] uppercase mt-2 tracking-widest">
                      {busca ? "Tente ajustar os termos da sua pesquisa" : "Cadastre seu primeiro filamento no botão superior"}
                    </p>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        {/* MODAIS - Lógica Centralizada */}
        <ModalFilamento
          aberto={modalAberto}
          aoFechar={() => { setModalAberto(false); setItemEdicao(null); }}
          aoSalvar={aoSalvarFilamento}
          dadosIniciais={itemEdicao}
        />

        <ModalBaixaRapida
          aberto={!!itemConsumo}
          aoFechar={() => setItemConsumo(null)}
          item={itemConsumo}
          aoSalvar={aoSalvarFilamento}
        />
      </main>
    </div>
  );
}