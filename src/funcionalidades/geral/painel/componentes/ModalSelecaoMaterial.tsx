import { useState } from "react";
import { motion } from "framer-motion";
import { X, Search, Star, Settings } from "lucide-react";
import { Dialogo } from "@/compartilhado/componentes";
import { Carretel, GarrafaResina } from "@/compartilhado/componentes";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

/**
 * Interface para as propriedades do ModalSelecaoMaterial.
 */
interface PropriedadesModalSelecaoMaterial {
  aberto: boolean;
  aoFechar: () => void;
  materiais: any[];
  aoSelecionarMaterial: (material: any) => void;
}

/**
 * Modal para seleção de material para reposição.
 */
export function ModalSelecaoMaterial({ 
  aberto, 
  aoFechar, 
  materiais, 
  aoSelecionarMaterial 
}: PropriedadesModalSelecaoMaterial) {
  const [termoBusca, definirTermoBusca] = useState("");
  const [filtroTipo, definirFiltroTipo] = useState<'TODOS' | 'FDM' | 'SLA' | 'FAV'>('TODOS');

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

  const materiaisFiltrados = materiais.filter(m => {
    const busca = `${m.fabricante} ${m.nome} ${m.cor} ${m.tipo}`.toLowerCase().includes(termoBusca.toLowerCase());
    const filtro = filtroTipo === 'TODOS' ? true : 
                  filtroTipo === 'FAV' ? m.favorito : 
                  m.tipo === filtroTipo;
    return busca && filtro;
  });

  return (
    <Dialogo
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="ARMAZÉM DE MATERIAIS"
      larguraMax="max-w-6xl"
      esconderCabecalho
    >
      <div className="flex flex-col h-[700px] bg-[#09090b] text-white">
        {/* CABEÇALHO */}
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-400">ARMAZÉM DE MATERIAIS</h3>
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
            
            <div className="flex items-center gap-2 pr-2">
              {[
                { id: 'TODOS', label: 'TUDO' },
                { id: 'FDM', label: 'FILAMENTO' },
                { id: 'SLA', label: 'RESINA' },
                { id: 'FAV', label: '★' }
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => definirFiltroTipo(f.id as any)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    filtroTipo === f.id 
                    ? "bg-[#00a3ff] text-white shadow-[0_0_20px_rgba(0,163,255,0.4)]" 
                    : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GRID DE MATERIAIS */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
          <motion.div 
            initial="oculto"
            animate="visivel"
            variants={containerAnimacao}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {materiaisFiltrados.map(m => {
              const unidade = m.tipo === 'SLA' ? 'ml' : 'g';
              const porcentagem = Math.round(Math.min(100, (m.pesoRestanteGramas / m.pesoGramas) * 100));
              
              return (
                <motion.button
                  variants={itemAnimacao}
                  key={m.id}
                  onClick={() => aoSelecionarMaterial(m)}
                  className="group relative p-4 rounded-2xl border border-white/10 bg-[#121214] hover:bg-[#18181b] transition-all text-left flex items-center gap-5 h-28 overflow-hidden shadow-2xl"
                >
                  <div className="shrink-0 w-16 h-16 flex items-center justify-center">
                    {m.tipo === 'SLA' ? (
                      <GarrafaResina cor={m.cor} tamanho={42} porcentagem={porcentagem} />
                    ) : (
                      <Carretel cor={m.cor} tamanho={48} porcentagem={porcentagem} />
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between h-full py-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-white leading-none">
                          {m.nome}
                        </h4>
                        <p className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter mt-1">
                          {m.fabricante} • {m.tipoMaterial}
                        </p>
                      </div>
                      {m.favorito && <Star size={10} className="text-zinc-600 group-hover:text-amber-500 transition-colors" />}
                    </div>

                    <div className="flex items-end justify-between">
                      <div>
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest block mb-0.5">SALDO</span>
                        <span className="text-[10px] font-black text-white uppercase tabular-nums">
                          {m.pesoRestanteGramas}{unidade}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-black text-[#00ffcc] tabular-nums tracking-tighter">
                          R$ {centavosParaReais(m.precoCentavos / (m.pesoGramas / 1000)).split("R$")[1]}
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
            {materiaisFiltrados.length} ITENS ENCONTRADOS
          </span>
        </div>
      </div>
    </Dialogo>
  );
}
