import React, { useState, useMemo } from "react";
import { Search, Check, Layers, Package, CheckCircle2 } from "lucide-react";
import { useFilamentos } from "../logic/consultasFilamento";
import VisualizacaoCarretel from "./VisualizacaoCarretel";
import Modal from "../../../components/ui/Modal";
import { normalizeString } from "../../../utils/stringUtils";

export default function ModalSelecaoFilamento({ aberto, aoFechar, aoConfirmar }) {
    const { data: filamentos = [] } = useFilamentos();
    const [termoBusca, setTermoBusca] = useState("");
    const [idsSelecionados, setIdsSelecionados] = useState([]);
    const [filtroMaterial, setFiltroMaterial] = useState("Todos");

    // Extrair materiais únicos
    const materiais = useMemo(() => {
        const unicos = new Set(filamentos.map(f => f.material).filter(Boolean));
        return ["Todos", ...Array.from(unicos).sort()];
    }, [filamentos]);

    // Filtrar filamentos
    const filamentosFiltrados = useMemo(() => {
        return filamentos.filter(f => {
            const termo = normalizeString(termoBusca);
            const correspondeBusca = !termo || (
                normalizeString(f.nome).includes(termo) ||
                normalizeString(f.marca).includes(termo) ||
                normalizeString(f.material).includes(termo)
            );
            const correspondeMaterial = filtroMaterial === "Todos" || f.material === filtroMaterial;

            return correspondeBusca && correspondeMaterial;
        });
    }, [filamentos, termoBusca, filtroMaterial]);

    // Alternar seleção
    const alternarSelecao = (id) => {
        setIdsSelecionados(anterior =>
            anterior.includes(id)
                ? anterior.filter(item => item !== id)
                : [...anterior, id]
        );
    };

    const manipularConfirmar = () => {
        const itensSelecionados = filamentos.filter(f => idsSelecionados.includes(f.id));
        aoConfirmar(itensSelecionados);
        aoFechar();
        setIdsSelecionados([]); // Limpa após confirmar
    };

    // CONTEÚDO DO RODAPÉ
    const conteudoRodape = (
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-3">
                <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">
                    Selecionados:
                </span>
                <span className="px-3 py-1 rounded-full bg-zinc-800 text-[11px] font-mono font-bold text-zinc-200">
                    {idsSelecionados.length}
                </span>
            </div>

            <div className="flex gap-3">
                <button
                    onClick={aoFechar}
                    className="px-6 h-12 rounded-xl border border-zinc-800 text-[11px] font-black uppercase tracking-wider text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50 transition-all"
                >
                    Cancelar
                </button>
                <button
                    onClick={() => {
                        aoConfirmar([{ id: 'manual', nome: 'Manual', material: 'PLA', marca: 'Genérico', cor_hex: '#ffffff' }]);
                        aoFechar();
                    }}
                    className="px-6 h-12 rounded-xl border border-zinc-700 bg-zinc-800/50 text-[11px] font-black uppercase tracking-wider text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700/50 transition-all flex items-center gap-2"
                >
                    <span className="w-2 h-2 rounded-full bg-zinc-500" />
                    Manual
                </button>
                <button
                    onClick={manipularConfirmar}
                    disabled={idsSelecionados.length === 0}
                    className="px-8 h-12 rounded-xl bg-sky-500 text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-sky-500/20 hover:bg-sky-400 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                >
                    <CheckCircle2 size={16} />
                    Confirmar Seleção
                </button>
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={aberto}
            onClose={aoFechar}
            title="Seleção de Materiais"
            subtitle="Escolha as cores que farão parte desta impressão"
            icon={Layers}
            footer={conteudoRodape}
            maxWidth="max-w-4xl"
            padding="p-0"
            color="sky"
        >
            <div className="flex flex-col h-full">
                {/* BARRA DE BUSCA & FILTROS - STICKY */}
                <div className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20 flex flex-col">
                    <div className="px-8 pt-4 pb-2 relative">
                        <Search className="absolute left-12 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nome, material ou marca..."
                            className="w-full h-12 pl-12 pr-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-[13px] font-bold text-zinc-200 placeholder:text-zinc-600 outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/20 transition-all uppercase"
                            value={termoBusca}
                            onChange={e => setTermoBusca(e.target.value)}
                            autoFocus
                        />
                    </div>

                    {/* FILTROS */}
                    <div className="px-8 pb-4 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                        {materiais.map(mat => (
                            <button
                                key={mat}
                                onClick={() => setFiltroMaterial(mat)}
                                className={`
                                    px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all whitespace-nowrap
                                    ${filtroMaterial === mat
                                        ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_10px_rgba(14,165,233,0.2)]"
                                        : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"}`}
                            >
                                {mat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* GRADE DE CONTEÚDO */}
                <div className="p-8 pb-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filamentosFiltrados.map(item => {
                            const estaSelecionado = idsSelecionados.includes(item.id);
                            const capacidade = Math.max(1, Number(item.peso_total) || 1000);
                            const atual = Math.max(0, Number(item.peso_atual) || 0);
                            const porcentagem = Math.round((atual / capacidade) * 100);

                            return (
                                <button
                                    key={item.id}
                                    onClick={() => alternarSelecao(item.id)}
                                    className={`relative group flex flex-col items-center p-6 rounded-[2rem] border transition-all duration-300
                                        ${estaSelecionado
                                            ? "bg-zinc-950 border-sky-500/50 shadow-[0_0_30px_-5px_rgba(14,165,233,0.3)] scale-[1.02]"
                                            : "bg-zinc-950 border-zinc-800/50 hover:border-zinc-700 hover:bg-zinc-900/30"}`}
                                >

                                    {/* CARRETEL CENTRAL */}
                                    <div className="py-2 transition-transform duration-300 group-hover:scale-110">
                                        <VisualizacaoCarretel cor={item.cor_hex || "#333"} porcentagem={porcentagem} tamanho={110} />
                                    </div>

                                    {/* INFO - INFERIOR */}
                                    <div className="mt-4 flex flex-col items-center gap-2 w-full">
                                        <h4 className={`text-sm font-black uppercase text-center tracking-wider truncate w-full transition-colors
                                            ${estaSelecionado ? "text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" : "text-zinc-300 group-hover:text-white"}`}>
                                            {item.cor_nome || item.nome}
                                        </h4>

                                        {/* BADGE */}
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-300
                                            ${estaSelecionado
                                                ? "bg-zinc-900 border-sky-500/30 text-sky-200 shadow-sm"
                                                : "bg-zinc-900/50 border-zinc-800 text-zinc-500 group-hover:border-zinc-700/80 group-hover:bg-zinc-900"
                                            }`}>
                                            <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                                                {item.material}
                                            </span>
                                            <div className={`w-px h-2.5 ${estaSelecionado ? "bg-sky-500/30" : "bg-zinc-800"}`} />
                                            <span className="text-[10px] font-bold font-mono leading-none">
                                                {Math.round(atual)}g
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {filamentosFiltrados.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-zinc-500 gap-4 opacity-50">
                            <Package size={48} strokeWidth={1} />
                            <p className="text-xs font-bold uppercase tracking-widest">Nenhum material encontrado</p>
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
}
