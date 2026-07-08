import { useState, useEffect, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Brush } from "lucide-react";
import { ItemPosProcesso } from "../tipos";
import { InputBancario } from "@/compartilhado/componentes/ui";
import { centavosParaReais } from "@/compartilhado/utilitarios/formatadores";

interface CardPosProcessoProps {
  posProcesso: ItemPosProcesso[];
  setPosProcesso: (v: ItemPosProcesso[]) => void;
  maoDeObraHoraCentavos: number;
  cobrarMaoDeObra: boolean;
  quantidade: number;
  modoEntrada?: 'unitario' | 'lote' | 'projeto';
  mostrar: boolean;
  setMostrar: (v: boolean) => void;
}

export const CardPosProcesso = memo(function CardPosProcesso({
  posProcesso, setPosProcesso, maoDeObraHoraCentavos, cobrarMaoDeObra, quantidade, modoEntrada = 'lote', mostrar, setMostrar
}: CardPosProcessoProps) {
  
  const textoModo = modoEntrada === 'unitario' ? 'Unidade' : modoEntrada === 'projeto' ? 'Projeto' : 'Lote';
  const temPosProcesso = posProcesso.length > 0;

  // Mantém o painel aberto caso haja valor configurado
  useEffect(() => {
    if (posProcesso.length > 0) {
      setMostrar(true);
    }
  }, [posProcesso]);

  const calcularCustoTotalPosProcesso = () => {
    return posProcesso.reduce((t, i) => {
      const custoTempoObra = cobrarMaoDeObra ? (i.tempoMinutos * (maoDeObraHoraCentavos / 60)) : 0;
      return t + custoTempoObra + i.custoMaterialCentavos;
    }, 0) * quantidade;
  };

  const adicionarOpcao = (nome: string, tempo: number, material: number) => {
    setPosProcesso([...posProcesso, { 
      id: crypto.randomUUID(), 
      nome, 
      tempoMinutos: tempo, 
      custoMaterialCentavos: material 
    }]);
  };

  return (
    <div className="flex flex-col my-6">
      <div className="p-4 rounded-xl bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 flex items-center justify-between shadow-[0_4px_20px_-10px_rgba(244,63,94,0.15)] transition-all z-10 relative">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center text-rose-400 shadow-inner shrink-0">
            <Brush size={16} className={`${posProcesso.length > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400">Deseja adicionar acabamento e pintura?</span>
            <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">Lixamento, Primer, Pintura e Verniz</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            const novoEstado = !mostrar;
            setMostrar(novoEstado);
            if (!novoEstado) {
              setPosProcesso([]); // Limpa se fechar
            }
          }}
          className={`px-3 py-1.5 rounded-lg font-black uppercase text-[9px] tracking-widest transition-all border shrink-0 ${mostrar
            ? "bg-rose-500 text-white border-rose-600 shadow-sm shadow-rose-500/30 hover:bg-rose-600"
            : "bg-card text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-500/40 border-borda-sutil shadow-sm"
            }`}
        >
          {mostrar ? "Ocultar" : "Adicionar"}
        </button>
      </div>

      <AnimatePresence>
        {mostrar && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="p-6 pt-8 rounded-b-xl bg-[linear-gradient(to_bottom,transparent_12px,var(--bg-card)_12px)] shadow-sm space-y-4 -mt-3 z-0 relative overflow-hidden border-x border-b border-borda-sutil"
          >
            {/* Quininhas para preencher o gap dos cantos arredondados */}
            <div className="absolute top-0 left-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_100%_0%,transparent_12px,var(--bg-card)_12px)] z-[-1]" />
            <div className="absolute top-0 right-0 w-[12px] h-[12px] bg-[radial-gradient(circle_at_0%_0%,transparent_12px,var(--bg-card)_12px)] z-[-1]" />

            <div className="flex items-center justify-between pb-3 border-b border-borda-sutil mb-4">
              <div className="flex items-center gap-3">
                <Brush size={16} className="text-rose-400" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-rose-500">Gestão de Pós-Processamento</h3>
              </div>
              <div className="flex flex-col items-end">
                 <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Custo Adicional ({textoModo})</span>
                 <div className="flex items-baseline gap-1">
                   <span className="text-xs font-black text-muted-foreground">R$</span>
                   <span className="text-lg font-black text-rose-600 dark:text-rose-400 tracking-tight leading-none">
                     {(calcularCustoTotalPosProcesso() / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                   </span>
                 </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              <button onClick={() => adicionarOpcao("Lixamento", 15, 0)} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-borda-sutil text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500/30 transition-all">+ Lixamento</button>
              <button onClick={() => adicionarOpcao("Primer", 10, 250)} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-borda-sutil text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500/30 transition-all">+ Primer</button>
              <button onClick={() => adicionarOpcao("Pintura Básica", 30, 500)} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-borda-sutil text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500/30 transition-all">+ Pintura Básica</button>
              <button onClick={() => adicionarOpcao("Pintura Detalhada", 120, 1500)} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-borda-sutil text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500/30 transition-all">+ Pintura Detalhada</button>
              <button onClick={() => adicionarOpcao("Verniz", 5, 200)} className="px-3 py-1.5 rounded-lg bg-muted/40 border border-borda-sutil text-[10px] font-bold text-zinc-600 dark:text-zinc-400 hover:text-rose-500 hover:border-rose-500/30 transition-all">+ Verniz</button>
              <button onClick={() => adicionarOpcao("Personalizado", 0, 0)} className="px-3 py-1.5 rounded-lg border border-dashed border-zinc-300 dark:border-zinc-700 text-[10px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-all">+ Outro</button>
            </div>

            {posProcesso.length === 0 ? (
              <div className="w-full border border-dashed border-borda-sutil rounded-2xl flex flex-col items-center justify-center p-8 text-center bg-transparent opacity-60">
                <Brush size={24} className="text-zinc-300 dark:text-zinc-700 mb-3" />
                <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest leading-relaxed">Nenhum acabamento<br/>extra aplicado na peça</span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Cabecalho Tabela */}
                <div className="flex items-center gap-3 px-2 mb-1">
                   <div className="flex-1"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">Processo</span></div>
                   <div className="w-24"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center block">Tempo (Min)</span></div>
                   <div className="w-24"><span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest text-center block">Custo Fixo (R$)</span></div>
                   <div className="w-8"></div>
                </div>

                {posProcesso.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-muted/20 dark:bg-white/[0.02] border border-borda-sutil rounded-xl group animate-in slide-in-from-right-2 duration-300">
                    <div className="flex-1 min-w-[120px]">
                      <input
                        type="text"
                        value={item.nome}
                        placeholder="Nome do processo..."
                        onChange={(e) => {
                          const novaLista = [...posProcesso];
                          novaLista[index].nome = e.target.value;
                          setPosProcesso(novaLista);
                        }}
                        className="w-full bg-transparent border-0 border-b border-transparent hover:border-borda-sutil text-[12px] font-black uppercase tracking-tight text-primary dark:text-white outline-none focus:border-rose-500 py-1 transition-colors px-1"
                      />
                    </div>

                    <div className="flex items-center gap-1 w-24 bg-white dark:bg-zinc-900 border border-borda-sutil rounded-lg px-2 focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={item.tempoMinutos || ""}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          const novaLista = [...posProcesso];
                          novaLista[index].tempoMinutos = isNaN(v) ? 0 : v;
                          setPosProcesso(novaLista);
                        }}
                        className="w-full bg-transparent border-0 text-[12px] font-bold text-center text-primary dark:text-white outline-none py-1.5"
                      />
                      <span className="text-[9px] font-bold text-zinc-400">min</span>
                    </div>

                    <div className="flex items-center gap-1 w-24 bg-white dark:bg-zinc-900 border border-borda-sutil rounded-lg px-2 focus-within:border-rose-500/50 focus-within:ring-2 focus-within:ring-rose-500/20 transition-all">
                      <span className="text-[9px] font-bold text-zinc-400">R$</span>
                      <InputBancario
                        placeholder="0.00"
                        value={item.custoMaterialCentavos === 0 ? "" : item.custoMaterialCentavos / 100}
                        onChange={(e) => {
                          const v = e.target.value;
                          const novaLista = [...posProcesso];
                          novaLista[index].custoMaterialCentavos = v === "" ? 0 : Math.round(Number(v) * 100);
                          setPosProcesso(novaLista);
                        }}
                        className="w-full bg-transparent border-0 text-[12px] font-bold text-center text-primary dark:text-white outline-none py-1.5"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setPosProcesso(posProcesso.filter(i => i.id !== item.id))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
