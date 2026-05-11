import { useState } from "react";
import { motion } from "framer-motion";
import { X, Search, Star, Settings, Package } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

/**
 * Interface para as propriedades do ModalSelecaoInsumo.
 */
interface PropriedadesModalSelecaoInsumo {
  aberto: boolean;
  aoFechar: () => void;
  insumos: any[];
  aoSelecionarInsumo: (insumo: any) => void;
}

/**
 * Modal para seleção de insumo para reposição.
 */
export function ModalSelecaoInsumo({ 
  aberto, 
  aoFechar, 
  insumos, 
  aoSelecionarInsumo 
}: PropriedadesModalSelecaoInsumo) {
  const [termoBusca, definirTermoBusca] = useState("");
  const [filtroCategoria, definirFiltroCategoria] = useState<string>('TODOS');

  const itemAnimacao = {
    oculto: { y: 30, opacity: 0, scale: 0.9 },
    visivel: { 
      y: 0, 
      opacity: 1, 
      scale: 1,
      transition: { type: "spring" as const, stiffness: 400, damping: 30 }
    }
  };

  const containerAnimacao = {
    visivel: {
      transition: { staggerChildren: 0.04 }
    }
  };

  const insumosFiltrados = insumos.filter(i => {
    const busca = i.nome.toLowerCase().includes(termoBusca.toLowerCase());
    const categoria = filtroCategoria === 'TODOS' ? true : i.categoria === filtroCategoria;
    return busca && categoria;
  });

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="ARMAZÉM DE INSUMOS"
      larguraMax="max-w-6xl"
      esconderCabecalho
    >
      <div className="flex flex-col h-[700px] bg-[#09090b] text-white">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">ARMAZÉM DE INSUMOS</h3>
          <button 
            onClick={aoFechar}
            className="p-2 hover:bg-white/5 rounded-lg transition-all text-zinc-500 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTROLES (BUSCA + FILTROS) */}
        <div className="p-6">
          <div className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 p-2 rounded-2xl h-14">
            <div className="flex-1 flex items-center gap-3 pl-4">
              <Search size={18} className="text-zinc-500" />
              <input 
                type="text" 
                placeholder="PESQUISAR..."
                className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-[0.2em] w-full placeholder:text-zinc-700"
                value={termoBusca}
                onChange={(e) => definirTermoBusca(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 pr-2 overflow-x-auto scrollbar-hide">
              {[
                { id: 'TODOS', label: 'TUDO' },
                { id: 'Limpeza', label: 'LIMPEZA' },
                { id: 'Embalagem', label: 'EMBALAGEM' },
                { id: 'Fixação', label: 'FIXAÇÃO' },
                { id: 'Eletrônica', label: 'ELETRÔNICA' },
                { id: 'Acabamento', label: 'ACABAMENTO' },
                { id: 'Geral', label: 'GERAL' },
                { id: 'Outros', label: 'OUTROS' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => definirFiltroCategoria(f.id)}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap flex-shrink-0 ${
                    filtroCategoria === f.id 
                    ? "bg-[#00a3ff] text-white shadow-[0_0_20px_rgba(0,163,255,0.3)]" 
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID DE INSUMOS */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
          <motion.div 
            initial="oculto"
            animate="visivel"
            variants={containerAnimacao}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {insumosFiltrados.map(i => {
              return (
                <motion.button
                  variants={itemAnimacao}
                  key={i.id}
                  onClick={() => aoSelecionarInsumo(i)}
                  className="group relative p-4 rounded-2xl border border-white/10 bg-[#121214] hover:bg-[#18181b] transition-all text-left flex items-center gap-5 h-28 overflow-hidden shadow-2xl"
                >
                  <div className="shrink-0 w-16 h-16 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800/50 flex items-center justify-center text-zinc-500 group-hover:bg-[#00a3ff]/20 group-hover:text-[#00a3ff] transition-all duration-500 border border-white/5">
                      <Package size={28} />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-white leading-none">
                          {i.nome}
                        </h4>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter mt-1">
                          {i.categoria || 'Consumível'}
                        </p>
                      </div>
                      {i.favorito && <Star size={10} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-0.5">SALDO</span>
                        <span className="text-[10px] font-black text-white uppercase tabular-nums">
                          {i.quantidadeAtual} {i.unidadeMedida}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-[#00ffcc] tabular-nums tracking-tighter">
                          R$ {centavosParaReais(i.custoMedioUnidade).split("R$")[1]}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </div>

        {/* RODAPÉ */}
        <div className="p-4 border-t border-white/5 bg-zinc-900/20 flex items-center gap-2">
          <Settings size={14} className="text-[#00a3ff] animate-spin-slow" />
          <span className="text-[9px] font-black uppercase tracking-widest text-[#00a3ff]">
            {insumosFiltrados.length} ITENS ENCONTRADOS
          </span>
        </div>
      </div>
    </Dialogo>
  );
}
